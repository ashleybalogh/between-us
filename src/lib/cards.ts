export type PlayerId = "him" | "her";

export type CardKind =
  | "setup"
  | "truth"
  | "dare"
  | "gratitude"
  | "explore"
  | "cooldown"
  | "close";

export type Audience = "both" | "him" | "her";

/**
 * 0  setup     dealt first, in order, always
 * 1  warm      low disclosure / low contact
 * 2  open      real disclosure / real contact
 * 3  deep      the cards that only work once you're already there
 * 4  close     landing the night
 */
export type Tier = 0 | 1 | 2 | 3 | 4;

export interface PromptCard {
  id: string;
  kind: CardKind;
  audience: Audience;
  tier: Tier;
  text: string;
  /** Both partners answer, asker second. Default true for truths. */
  reciprocal?: boolean;
  /** Listener beat. Shown after the answer, before the next draw. */
  followUp?: string;
}

export type RawCard = Omit<PromptCard, "id">;

export const buildDeck = (raw: RawCard[], slug: string): PromptCard[] =>
  raw.map((card, i) => ({
    reciprocal: card.kind === "truth" ? true : undefined,
    ...card,
    id: `${slug}-t${card.tier}-${card.kind}-${i}`,
  }));

/**
 * Draw rules (the part that matters more than the card text):
 *
 * 1. Deal every tier-0 card first, in array order, before the game starts.
 * 2. Tier N+1 does not unlock until at least `gate` cards from tier N have
 *    been played. Suggested gate: 6.
 * 3. Never deal down a tier once unlocked, except on a swap.
 * 4. Any card can be swapped once by the person it names. A swap deals a
 *    replacement from the same tier and costs nothing.
 * 5. The night ends on tier 4. Deal 3-4 close cards; don't let the app
 *    just run out of cards.
 */
export const TIER_GATE = 6;

/** Outcome of an `explore` card. Only "not-for-me" outlives the night. */
export type ExploreVerdict = "not-for-me" | "not-tonight" | "tonight";

/** The id of the tier-3 dare a joint "tonight" verdict queues. */
export const NEGOTIATION_CARD_ID = "explore-t3-dare-16";

/**
 * Explore cards:
 *  - dealt, never chosen (like gratitude), at tier transitions in Heat mode
 *  - max two per night, never in tier 1 or tier 4
 *  - "not-for-me" from EITHER partner removes the card permanently
 *  - "tonight" requires BOTH; it queues the negotiation dare at the top of tier 3
 *  - "not-tonight" is the default and returns the card to the pool
 */
export const MAX_EXPLORE_PER_NIGHT = 2;

/**
 * Cooldown cards are dealt automatically inside tier 3 — never picked, never
 * swapped. One after every COOLDOWN_EVERY tier-3 cards, and one unconditionally
 * before the tier 3 -> 4 transition.
 *
 * They are the landing between intense cards, not the end of the night. Tier 4
 * close cards still run separately.
 */
export const COOLDOWN_EVERY = 3;

/** Tier 4 deals this many close cards, then the night is over. */
export const CLOSE_CARDS = 4;

/** The tiers a player actually chooses truth-or-dare on. */
export const PLAY_TIERS: Tier[] = [1, 2, 3];

export type TierIndex = Record<Tier, PromptCard[]>;

export function byTier(cards: PromptCard[]): TierIndex {
  const index: TierIndex = { 0: [], 1: [], 2: [], 3: [], 4: [] };
  for (const card of cards) index[card.tier].push(card);
  return index;
}

export function other(player: PlayerId): PlayerId {
  return player === "him" ? "her" : "him";
}

/** A card is dealable to a player when it is addressed to them or to both. */
export function addressed(card: PromptCard, player: PlayerId): boolean {
  return card.audience === "both" || card.audience === player;
}

export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = next[i];
    const b = next[j];
    if (a === undefined || b === undefined) continue;
    next[i] = b;
    next[j] = a;
  }
  return next;
}

/**
 * Rule 2 and 3 live here: the pool is the current tier only, never lower and
 * never higher. `exclude` carries the card being swapped away from, so a swap
 * cannot hand back the card it replaced.
 */
export function playable(
  cards: PromptCard[],
  remainingIds: string[],
  opts: { tier: Tier; kind: CardKind; player: PlayerId; exclude?: string },
): PromptCard[] {
  const byId = new Map(cards.map((card) => [card.id, card]));
  const out: PromptCard[] = [];
  for (const id of remainingIds) {
    if (id === opts.exclude) continue;
    const card = byId.get(id);
    if (!card) continue;
    if (card.tier !== opts.tier) continue;
    if (card.kind !== opts.kind) continue;
    if (!addressed(card, opts.player)) continue;
    out.push(card);
  }
  return out;
}

export function draw(
  cards: PromptCard[],
  remainingIds: string[],
  opts: { tier: Tier; kind: CardKind; player: PlayerId; exclude?: string },
): PromptCard | null {
  const [picked] = shuffle(playable(cards, remainingIds, opts));
  return picked ?? null;
}

/**
 * The beats a single card is played in. A reciprocal truth is answered by the
 * partner first and the person who drew it second; a listener beat, when the
 * card carries one, lands after both answers and before the next draw.
 */
export type Beat = { speaker: PlayerId | null; instruction: string | null };

export function beatsFor(card: PromptCard, turn: PlayerId): Beat[] {
  const beats: Beat[] = [];
  if (card.kind === "truth" && card.reciprocal !== false) {
    beats.push({ speaker: other(turn), instruction: null });
    beats.push({ speaker: turn, instruction: null });
  } else {
    beats.push({ speaker: turn, instruction: null });
  }
  if (card.followUp) beats.push({ speaker: other(turn), instruction: card.followUp });
  return beats;
}

/* ------------------------------------------------------------------ *
 * Deck validation
 *
 * The gap that matters is a tier where one kind runs dry: a player who only
 * ever picks truth stops escalating and rides the tier instead. A tier needs
 * enough of BOTH kinds to carry the gate even if both players pick the same
 * one every turn.
 * ------------------------------------------------------------------ */

export type DeckProblem = { severity: "error" | "warn"; where: string; detail: string };

export function checkPool(pool: PromptCard[]): DeckProblem[] {
  const problems: DeckProblem[] = [];
  const tiers = byTier(pool);

  if (!tiers[0].length) {
    problems.push({ severity: "error", where: "tier 0", detail: "no setup cards to open on" });
  }

  for (const tier of PLAY_TIERS) {
    for (const kind of ["truth", "dare"] as const) {
      for (const player of ["him", "her"] as const) {
        const count = tiers[tier].filter(
          (card) => card.kind === kind && addressed(card, player),
        ).length;
        if (count === 0) {
          problems.push({
            severity: "error",
            where: `tier ${tier} / ${kind}`,
            detail: `nothing dealable to ${player} — picking ${kind} here dead-ends`,
          });
        } else if (count < TIER_GATE) {
          problems.push({
            severity: "warn",
            where: `tier ${tier} / ${kind}`,
            detail: `${count} for ${player}, gate is ${TIER_GATE} — a ${kind}-only player runs dry before the tier does`,
          });
        }
      }
    }
  }

  // Gratitude lands on a gate crossing between play tiers: 1 to 2 and 2 to 3.
  // The jump into tier 4 is the close, which has its own cards.
  const crossings = PLAY_TIERS.length - 1;
  const gratitude = pool.filter((card) => card.kind === "gratitude").length;
  if (gratitude < crossings) {
    problems.push({
      severity: "warn",
      where: "gratitude",
      detail: `${gratitude} cards for ${crossings} tier crossings`,
    });
  }

  const close = tiers[4].filter((card) => card.kind === "close").length;
  if (close < 3) {
    problems.push({
      severity: "error",
      where: "tier 4",
      detail: `${close} close cards, the night needs at least 3 to land`,
    });
  }

  return problems;
}

export function poolIsPlayable(pool: PromptCard[]): boolean {
  return !checkPool(pool).some((problem) => problem.severity === "error");
}

export function deckStats(pool: PromptCard[]) {
  const tiers = byTier(pool);
  return {
    total: pool.length,
    byTier: PLAY_TIERS.map((tier) => ({
      tier,
      truths: tiers[tier].filter((card) => card.kind === "truth").length,
      dares: tiers[tier].filter((card) => card.kind === "dare").length,
    })),
  };
}
