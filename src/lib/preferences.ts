import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Device-local preferences. Separate from the exclusions store, whose schema is
 * deliberately nothing but a list of ids.
 */
type Preferences = {
  /**
   * Whether there is a toy in the house. Default off.
   *
   * Off: the stretch dares that reference one are suppressed, because with
   * nothing in the house they are dud cards that waste a draw, and the two
   * explore cards asking whether it is wanted at all stay live.
   *
   * On: that reverses. The dares deal, and the question stops being asked
   * because it has been answered.
   */
  toysInHouse: boolean;
  /** Draw-rule instrumentation on the play screen. Off by default. */
  debugOverlay: boolean;
  setToysInHouse: (value: boolean) => void;
  setDebugOverlay: (value: boolean) => void;
};

export const usePreferences = create<Preferences>()(
  persist(
    (set) => ({
      toysInHouse: false,
      debugOverlay: false,
      setToysInHouse: (value) => set({ toysInHouse: value }),
      setDebugOverlay: (value) => set({ debugOverlay: value }),
    }),
    { name: "between-us-preferences", version: 1 },
  ),
);

export function toysInHouse(): boolean {
  return usePreferences.getState().toysInHouse;
}
