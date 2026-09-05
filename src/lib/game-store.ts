import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CLOSE_CARDS,
  COOLDOWN_EVERY,
  MAX_EXPLORE_PER_NIGHT,
  NEGOTIATION_CARD_ID,
  TIER_GATE,
  addressed,
  beatsFor,
  byTier,
  draw,
  other,
  playable,
  shuffle,
  type Beat,
  type CardKind,
  type ExploreVerdict,
  type PlayerId,
  type PromptCard,
  type Tier,
} from "@/lib/cards";
import { excludedIds, useExclusions } from "@/lib/exclusions";
import { poolFor, toySuppressed, type Mode } from "@/lib/modes";
import { toysInHouse } from "@/lib/preferences";

export type Screen = "home" | "setup" | "play" | "settings";

/**
 * setup     walking the tier-0 cards, in order, before anything is dealt
 * choose    the player picks truth or dare
 * reveal    a card is face up, being played out one beat at a time
 * gratitude a tier transition; dealt, never chosen
 * explore   a tier transition; dealt, never chosen, ends in a joint verdict
 * cooldown  the landing between intense tier-3 cards; dealt, never swapped
 * close     tier 4, landing the night
 * over      done
 */
export type Phase =
  | "setup"
  | "choose"
  | "reveal"
  | "gratitude"
  | "explore"
  | "cooldown"
  | "close"
  | "over";

export type HistoryEntry = {
  player: PlayerId;
  kind: CardKind;
  tier: Tier;
  cardId: string;
  text: string;
  action: "played" | "swapped";
};

export type GameState = {
  mode: Mode;
  phase: Phase;
  tier: Tier;
  turn: PlayerId;
  cards: PromptCard[];
  remainingIds: string[];
  setupQueue: string[];
  setupIndex: number;
  closeQueue: string[];
  closeIndex: number;
  current: PromptCard | null;
  /** Index into `beatsFor(current, turn)`. */
  beat: number;
  /** A swap already happened on this card; the replacement is not swappable. */
  swapUsed: boolean;
  /** Cards played at the current tier. Rule 2 gates on this. */
  playedInTier: number;
  /** Explore cards dealt this night. Capped at MAX_EXPLORE_PER_NIGHT. */
  exploreDealt: number;
  /** Both verdicts are in on the explore card currently face up. */
  exploreResolved: boolean;
  /**
   * A joint "tonight" verdict, waiting for tier 3. Carries the text of the
   * explore card that produced it so the negotiation dare knows what it is
   * negotiating. Discarded with the game — a "tonight" is consent for tonight.
   */
  pendingTonight: { sourceText: string } | null;
  /** Set while the negotiation dare is face up, so it can show its subject. */
  tonightSource: string | null;
  /** Where a cooldown hands back to: the player, or the close. */
  afterCooldown: "turn" | "close";
  history: HistoryEntry[];
};

type GameStore = {
  hydrated: boolean;
  screen: Screen;
  names: Record<PlayerId, string>;
  game: GameState | null;
  setHydrated: (value: boolean) => void;
  setScreen: (screen: Screen) => void;
  setName: (player: PlayerId, name: string) => void;
  startGame: (mode: Mode) => void;
  advanceSetup: () => void;
  pickKind: (kind: CardKind) => "ok" | "empty";
  nextBeat: () => void;
  swapCard: () => "ok" | "used" | "unavailable";
  /** Both verdicts at once. Order is turn-player first, partner second. */
  resolveExplore: (mine: ExploreVerdict, theirs: ExploreVerdict) => void;
  /** Anything ambiguous — backgrounding, dismissal — resolves to not-tonight. */
  abandonExplore: () => void;
  endGame: () => void;
  leaveGame: () => void;
};

const SAVE_VERSION = 3;

function freshGame(mode: Mode): GameState {
  // A NOT FOR ME card is gone before the night starts, in every mode. The toy
  // flag takes out one side or the other of the same pair: with nothing in the
  // house the dares are duds, and with something in it the question is answered.
  const excluded = excludedIds();
  const suppressed = toySuppressed(toysInHouse());
  const cards = poolFor(mode).filter(
    (card) => !excluded.has(card.id) && !suppressed.has(card.id),
  );
  const tiers = byTier(cards);
  const setupQueue = tiers[0].map((card) => card.id);
  const first = cards.find((card) => card.id === setupQueue[0]) ?? null;

  return {
    mode,
    phase: setupQueue.length ? "setup" : "choose",
    tier: setupQueue.length ? 0 : 1,
    turn: Math.random() < 0.5 ? "him" : "her",
    cards,
    remainingIds: cards.filter((card) => card.tier !== 0).map((card) => card.id),
    setupQueue,
    setupIndex: 0,
    closeQueue: [],
    closeIndex: 0,
    current: first,
    beat: 0,
    swapUsed: false,
    playedInTier: 0,
    exploreDealt: 0,
    exploreResolved: false,
    pendingTonight: null,
    tonightSource: null,
    afterCooldown: "turn",
    history: [],
  };
}

function entryFor(card: PromptCard, player: PlayerId): HistoryEntry {
  return {
    player,
    kind: card.kind,
    tier: card.tier,
    cardId: card.id,
    text: card.text,
    action: "played",
  };
}

/** Nothing left to choose from at this tier, for either player. */
function tierExhausted(game: GameState): boolean {
  for (const kind of ["truth", "dare"] as const) {
    for (const player of ["him", "her"] as const) {
      if (playable(game.cards, game.remainingIds, { tier: game.tier, kind, player }).length) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Back to the player. A joint "tonight" jumps the queue once tier 3 is
 * reached; everything else is an ordinary truth-or-dare pick.
 */
function nextTurn(game: GameState): GameState {
  const base: GameState = { ...game, beat: 0, swapUsed: false, exploreResolved: false };

  if (game.pendingTonight && game.tier === 3) {
    const card = game.cards.find((item) => item.id === NEGOTIATION_CARD_ID);
    if (card && game.remainingIds.includes(card.id)) {
      return {
        ...base,
        phase: "reveal",
        current: card,
        pendingTonight: null,
        tonightSource: game.pendingTonight.sourceText,
      };
    }
  }
  return { ...base, phase: "choose", current: null, tonightSource: null };
}

/**
 * Explore cards ride the same slot as gratitude: a tier crossing, before the
 * first card of the new tier. Two per night, and never at tier 1 (too early
 * for the conversation to be real) or tier 4 (the close covers this ground).
 *
 * The card's own tier is not matched against the current tier. Every explore
 * card is authored at tier 2 so that the composition table puts it in Heat's
 * tier-2 slice; the constraint that matters is when in the night it lands.
 */
function dealExplore(game: GameState): GameState | null {
  if (game.tier < 2 || game.tier > 3) return null;
  if (game.exploreDealt >= MAX_EXPLORE_PER_NIGHT) return null;

  const remaining = new Set(game.remainingIds);
  const [card] = shuffle(
    game.cards.filter((item) => item.kind === "explore" && remaining.has(item.id)),
  );
  if (!card) return null;

  return {
    ...game,
    phase: "explore",
    current: card,
    exploreDealt: game.exploreDealt + 1,
    exploreResolved: false,
    remainingIds: game.remainingIds.filter((id) => id !== card.id),
    beat: 0,
    swapUsed: false,
  };
}

/**
 * Cooldown cards land inside tier 3, never at a pick and never swappable:
 * one after every COOLDOWN_EVERY cards, and one on the way out of the tier.
 * They are the landing between intense cards, not the end of the night — the
 * tier-4 close still runs separately after them.
 */
function dealCooldown(game: GameState, then: "turn" | "close"): GameState | null {
  const remaining = new Set(game.remainingIds);
  const [card] = shuffle(
    game.cards.filter(
      (item) => item.kind === "cooldown" && remaining.has(item.id) && addressed(item, game.turn),
    ),
  );
  if (!card) return null;

  return {
    ...game,
    phase: "cooldown",
    current: card,
    afterCooldown: then,
    remainingIds: game.remainingIds.filter((id) => id !== card.id),
    beat: 0,
    swapUsed: false,
  };
}

/** Tier crossing: gratitude, then explore, then back to the player. */
function afterGratitude(game: GameState): GameState {
  return dealExplore(game) ?? nextTurn(game);
}

/**
 * Tier 4. Close cards are dealt in author order rather than shuffled — the
 * point is to land the night, and landing has a shape.
 */
function enterClose(game: GameState): GameState {
  const closeQueue = game.cards
    .filter((card) => card.tier === 4 && card.kind === "close")
    .slice(0, CLOSE_CARDS)
    .map((card) => card.id);

  if (!closeQueue.length) return { ...game, phase: "over", current: null };

  const first = game.cards.find((card) => card.id === closeQueue[0]) ?? null;
  return {
    ...game,
    tier: 4,
    phase: "close",
    closeQueue,
    closeIndex: 0,
    current: first,
    beat: 0,
    swapUsed: false,
  };
}

/**
 * Cross into the next tier. A gratitude card lands on the transition — dealt,
 * never chosen, because it is the one card people skip when given the option.
 * Preferring the entered tier's own gratitude card and falling back to any
 * remaining one keeps the beat even when a mode's tier slice has none.
 */
function enterTier(game: GameState, tier: Tier): GameState {
  const remaining = new Set(game.remainingIds);
  const gratitude =
    game.cards.find(
      (card) => card.kind === "gratitude" && card.tier === tier && remaining.has(card.id),
    ) ?? game.cards.find((card) => card.kind === "gratitude" && remaining.has(card.id));

  const base: GameState = { ...game, tier, playedInTier: 0, beat: 0, swapUsed: false };

  if (!gratitude) return afterGratitude(base);

  return {
    ...base,
    phase: "gratitude",
    current: gratitude,
    remainingIds: base.remainingIds.filter((id) => id !== gratitude.id),
  };
}

/** Where the game goes once a card is finished. Rule 2 and rule 5 live here. */
function advance(game: GameState): GameState {
  const gateMet = game.playedInTier >= TIER_GATE;
  const dryTier = tierExhausted(game);

  if (game.tier >= 3 && (gateMet || dryTier)) {
    return dealCooldown(game, "close") ?? enterClose(game);
  }
  if (game.tier < 3 && (gateMet || dryTier)) return enterTier(game, (game.tier + 1) as Tier);

  if (game.tier === 3 && game.playedInTier > 0 && game.playedInTier % COOLDOWN_EVERY === 0) {
    const cooled = dealCooldown(game, "turn");
    if (cooled) return cooled;
  }
  return nextTurn(game);
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      screen: "home",
      names: { him: "Him", her: "Her" },
      game: null,

      setHydrated: (value) => set({ hydrated: value }),
      setScreen: (screen) => set({ screen }),
      setName: (player, name) =>
        set((state) => ({ names: { ...state.names, [player]: name.slice(0, 18) } })),

      startGame: (mode) => set({ game: freshGame(mode), screen: "setup" }),

      advanceSetup: () => {
        const game = get().game;
        if (!game || game.phase !== "setup") return;
        const nextIndex = game.setupIndex + 1;

        if (nextIndex >= game.setupQueue.length) {
          set({
            game: { ...game, phase: "choose", tier: 1, setupIndex: nextIndex, current: null },
            screen: "play",
          });
          return;
        }

        const next = game.cards.find((card) => card.id === game.setupQueue[nextIndex]) ?? null;
        set({ game: { ...game, setupIndex: nextIndex, current: next } });
      },

      pickKind: (kind) => {
        const game = get().game;
        if (!game || game.phase !== "choose") return "empty";
        const card = draw(game.cards, game.remainingIds, {
          tier: game.tier,
          kind,
          player: game.turn,
        });
        if (!card) return "empty";
        set({ game: { ...game, phase: "reveal", current: card, beat: 0, swapUsed: false } });
        return "ok";
      },

      /**
       * Three rules, in priority order: NOT FOR ME is unilateral and permanent;
       * TONIGHT needs both; anything else is NOT TONIGHT, which returns the
       * card to the pool and leaves no trace.
       *
       * Explore cards never enter the history. An exclusion the app counts or
       * summarises is not an exclusion, and the cheapest way to guarantee that
       * is to never write the card down at all.
       */
      resolveExplore: (mine, theirs) => {
        const game = get().game;
        if (!game?.current || game.phase !== "explore" || game.exploreResolved) return;
        const card = game.current;

        if (mine === "not-for-me" || theirs === "not-for-me") {
          useExclusions.getState().exclude(card.id);
          set({ game: { ...game, exploreResolved: true } });
          return;
        }

        if (mine === "tonight" && theirs === "tonight") {
          set({
            game: { ...game, exploreResolved: true, pendingTonight: { sourceText: card.text } },
          });
          return;
        }

        set({
          game: {
            ...game,
            exploreResolved: true,
            remainingIds: [...game.remainingIds, card.id],
          },
        });
      },

      abandonExplore: () => {
        const game = get().game;
        if (!game?.current || game.phase !== "explore" || game.exploreResolved) return;
        set({
          game: nextTurn({
            ...game,
            remainingIds: [...game.remainingIds, game.current.id],
          }),
        });
      },

      nextBeat: () => {
        const game = get().game;
        if (!game?.current) return;
        const card = game.current;

        if (game.phase === "gratitude") {
          set({
            game: afterGratitude({
              ...game,
              history: [...game.history, entryFor(card, game.turn)],
            }),
          });
          return;
        }

        if (game.phase === "explore") {
          if (!game.exploreResolved) return;
          set({ game: nextTurn(game) });
          return;
        }

        if (game.phase === "cooldown") {
          const cooled = { ...game, history: [...game.history, entryFor(card, game.turn)] };
          set({ game: cooled.afterCooldown === "close" ? enterClose(cooled) : nextTurn(cooled) });
          return;
        }

        if (game.phase === "close") {
          const history = [...game.history, entryFor(card, game.turn)];
          const nextIndex = game.closeIndex + 1;
          if (nextIndex >= game.closeQueue.length) {
            set({ game: { ...game, phase: "over", current: null, history } });
            return;
          }
          const next = game.cards.find((item) => item.id === game.closeQueue[nextIndex]) ?? null;
          set({ game: { ...game, closeIndex: nextIndex, current: next, history } });
          return;
        }

        if (game.phase !== "reveal") return;

        const beats = beatsFor(card, game.turn);
        if (game.beat + 1 < beats.length) {
          set({ game: { ...game, beat: game.beat + 1 } });
          return;
        }

        set({
          game: advance({
            ...game,
            remainingIds: game.remainingIds.filter((id) => id !== card.id),
            playedInTier: game.playedInTier + 1,
            turn: other(game.turn),
            history: [...game.history, entryFor(card, game.turn)],
          }),
        });
      },

      /**
       * Rule 4, with one guard the rule does not state: the replacement is not
       * itself swappable. A swap costs nothing and does not advance the ramp,
       * so without a cap a player can idle at a tier indefinitely — the same
       * failure the tier floor exists to prevent, arriving from the other side.
       */
      swapCard: () => {
        const game = get().game;
        if (!game?.current || game.phase !== "reveal") return "unavailable";
        if (game.swapUsed || game.beat > 0) return "used";
        const card = game.current;

        const replacement = draw(game.cards, game.remainingIds, {
          tier: game.tier,
          kind: card.kind,
          player: game.turn,
          exclude: card.id,
        });
        if (!replacement) return "unavailable";

        set({
          game: {
            ...game,
            remainingIds: game.remainingIds.filter((id) => id !== card.id),
            current: replacement,
            beat: 0,
            swapUsed: true,
            history: [
              ...game.history,
              { ...entryFor(card, game.turn), action: "swapped" as const },
            ],
          },
        });
        return "ok";
      },

      endGame: () => {
        const game = get().game;
        if (!game) return;
        set({ game: { ...game, phase: "over", current: null } });
      },
      leaveGame: () => set({ screen: "home" }),
    }),
    {
      name: "between-us-v3",
      version: SAVE_VERSION,
      partialize: (state) => ({
        names: state.names,
        game: state.game,
        screen: state.screen === "home" ? "home" : state.screen,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

/** The beats of the card currently face up, or an empty list. */
export function currentBeats(game: GameState | null): Beat[] {
  if (!game?.current || game.phase !== "reveal") return [];
  return beatsFor(game.current, game.turn);
}

export function displayName(names: Record<PlayerId, string>, player: PlayerId) {
  const value = names[player].trim();
  if (value) return value;
  return player === "him" ? "Him" : "Her";
}

export function possess(names: Record<PlayerId, string>, player: PlayerId) {
  const name = displayName(names, player);
  if (name.toLowerCase() === "him") return "His";
  if (name.toLowerCase() === "her") return "Her";
  return name.endsWith("s") ? `${name}'` : `${name}'s`;
}
