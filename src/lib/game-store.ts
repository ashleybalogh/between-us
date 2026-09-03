import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STARTER_DECK } from "@/data/starter-deck";
import {
  drawCard,
  shuffle,
  type CardKind,
  type PlayerId,
  type PromptCard,
} from "@/lib/cards";

export type Screen = "home" | "play" | "deck";
export type PlayPhase = "choose" | "reveal" | "empty" | "over";

export type HistoryEntry = {
  player: PlayerId;
  kind: CardKind;
  cardId: string;
  text: string;
  action: "done" | "pass";
};

export type GameState = {
  phase: PlayPhase;
  turn: PlayerId;
  himPass: boolean;
  herPass: boolean;
  cards: PromptCard[];
  remainingIds: string[];
  current: PromptCard | null;
  emptyKind: CardKind | null;
  history: HistoryEntry[];
};

type GameStore = {
  hydrated: boolean;
  screen: Screen;
  names: Record<PlayerId, string>;
  customCards: PromptCard[] | null;
  game: GameState | null;
  setHydrated: (value: boolean) => void;
  setScreen: (screen: Screen) => void;
  setName: (player: PlayerId, name: string) => void;
  activeDeck: () => PromptCard[];
  setCustomCards: (cards: PromptCard[] | null) => void;
  startGame: () => void;
  pickKind: (kind: CardKind) => "ok" | "empty";
  completeCard: () => void;
  passCard: () => "ok" | "spent";
  reshuffleKind: (kind: CardKind) => void;
  endGame: () => void;
  continueHome: () => void;
};

const SAVE_VERSION = 1;

function otherPlayer(player: PlayerId): PlayerId {
  return player === "him" ? "her" : "him";
}

function freshGame(cards: PromptCard[]): GameState {
  return {
    phase: "choose",
    turn: Math.random() < 0.5 ? "him" : "her",
    himPass: true,
    herPass: true,
    cards,
    remainingIds: shuffle(cards.map((card) => card.id)),
    current: null,
    emptyKind: null,
    history: [],
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      screen: "home",
      names: { him: "Him", her: "Her" },
      customCards: null,
      game: null,
      setHydrated: (value) => set({ hydrated: value }),
      setScreen: (screen) => set({ screen }),
      setName: (player, name) =>
        set((state) => ({
          names: { ...state.names, [player]: name.slice(0, 18) },
        })),
      activeDeck: () => get().customCards ?? STARTER_DECK,
      setCustomCards: (cards) => set({ customCards: cards }),
      startGame: () => {
        const deck = get().activeDeck();
        if (!deck.length) return;
        set({ game: freshGame(deck), screen: "play" });
      },
      pickKind: (kind) => {
        const game = get().game;
        if (!game || game.phase === "over") return "empty";
        const drawn = drawCard(game.cards, game.remainingIds, kind, game.turn);
        if (!drawn) {
          set({ game: { ...game, phase: "empty", emptyKind: kind, current: null } });
          return "empty";
        }
        set({
          game: {
            ...game,
            phase: "reveal",
            current: drawn.card,
            remainingIds: drawn.remainingIds,
            emptyKind: null,
          },
        });
        return "ok";
      },
      completeCard: () => {
        const game = get().game;
        if (!game?.current) return;
        const entry: HistoryEntry = {
          player: game.turn,
          kind: game.current.kind,
          cardId: game.current.id,
          text: game.current.text,
          action: "done",
        };
        const remainingPlayable = game.remainingIds.some((id) => {
          const card = game.cards.find((item) => item.id === id);
          return Boolean(card);
        });
        set({
          game: {
            ...game,
            phase: remainingPlayable ? "choose" : "over",
            turn: otherPlayer(game.turn),
            current: null,
            emptyKind: null,
            history: [...game.history, entry],
          },
        });
      },
      passCard: () => {
        const game = get().game;
        if (!game?.current) return "spent";
        const canPass = game.turn === "him" ? game.himPass : game.herPass;
        if (!canPass) return "spent";
        const entry: HistoryEntry = {
          player: game.turn,
          kind: game.current.kind,
          cardId: game.current.id,
          text: game.current.text,
          action: "pass",
        };
        set({
          game: {
            ...game,
            phase: "choose",
            turn: otherPlayer(game.turn),
            current: null,
            emptyKind: null,
            himPass: game.turn === "him" ? false : game.himPass,
            herPass: game.turn === "her" ? false : game.herPass,
            history: [...game.history, entry],
          },
        });
        return "ok";
      },
      reshuffleKind: (kind) => {
        const game = get().game;
        if (!game) return;
        const used = new Set(game.history.map((entry) => entry.cardId));
        const extras = game.cards
          .filter((card) => card.kind === kind && !used.has(card.id) && !game.remainingIds.includes(card.id))
          .map((card) => card.id);
        // If every matching card was already drawn, put the kind back in from the full snapshot minus still-remaining others.
        const kindIds = game.cards.filter((card) => card.kind === kind).map((card) => card.id);
        const withoutKind = game.remainingIds.filter((id) => {
          const card = game.cards.find((item) => item.id === id);
          return card?.kind !== kind;
        });
        const restock = kindIds.length ? shuffle(kindIds) : extras;
        set({
          game: {
            ...game,
            remainingIds: [...withoutKind, ...restock],
            phase: "choose",
            current: null,
            emptyKind: null,
          },
        });
      },
      endGame: () => {
        const game = get().game;
        if (!game) {
          set({ screen: "home" });
          return;
        }
        set({ game: { ...game, phase: "over", current: null }, screen: "play" });
      },
      continueHome: () => set({ screen: "home" }),
    }),
    {
      name: "between-us-v1",
      version: SAVE_VERSION,
      partialize: (state) => ({
        names: state.names,
        customCards: state.customCards,
        game: state.game,
        screen: state.screen === "play" ? "play" : "home",
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

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
