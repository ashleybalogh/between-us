import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Cards someone marked NOT FOR ME.
 *
 * The whole schema is a list of ids. Deliberately not stored: who excluded
 * what, when, or how many times a card has come up. There is nothing here
 * worth analysing, and recording more would build a log neither of them asked
 * for. "Not tonight" is absent by design — it is the absence of a decision.
 *
 * Device-local. It is never synced, never sent anywhere, and never written to
 * the repo. A separate store from the game so that clearing or losing a night
 * in progress cannot touch it, and so it survives every future save-format
 * change to the game itself.
 */
type Exclusions = {
  excludedCardIds: string[];
  exclude: (cardId: string) => void;
  clearAll: () => void;
};

export const useExclusions = create<Exclusions>()(
  persist(
    (set) => ({
      excludedCardIds: [],
      exclude: (cardId) =>
        set((state) =>
          state.excludedCardIds.includes(cardId)
            ? state
            : { excludedCardIds: [...state.excludedCardIds, cardId] },
        ),
      clearAll: () => set({ excludedCardIds: [] }),
    }),
    { name: "between-us-exclusions", version: 1 },
  ),
);

/** Read the current exclusions outside React. */
export function excludedIds(): Set<string> {
  return new Set(useExclusions.getState().excludedCardIds);
}
