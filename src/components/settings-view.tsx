import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useExclusions } from "@/lib/exclusions";
import { useGameStore } from "@/lib/game-store";

/**
 * The only thing here is the reset.
 *
 * There is deliberately no list of excluded cards, no count, and no prompt
 * suggesting anything be revisited. An exclusion the app relitigates is not an
 * exclusion. The control exists because the list is theirs, not because using
 * it is a step anyone should be nudged toward.
 */
export function SettingsView() {
  const setScreen = useGameStore((state) => state.setScreen);
  const clearAll = useExclusions((state) => state.clearAll);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setScreen("home")}
            className="h-11 px-1 text-sm text-muted transition-colors duration-[var(--motion-quick)] hover:text-fg"
          >
            Back
          </button>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">Settings</p>
          <span className="h-11 w-10" aria-hidden />
        </header>

        <div className="flex flex-1 flex-col justify-center gap-5 py-10">
          <div>
            <h2 className="font-display text-3xl italic leading-none text-fg">Exclusions</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Cards either of you marked not for me never come up again. They are kept on this
              device only, and nothing about them is sent anywhere.
            </p>
          </div>

          {done ? (
            <p className="text-sm leading-relaxed text-faint">
              Cleared. Every card is back in the deck.
            </p>
          ) : confirming ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm leading-relaxed text-muted">
                This puts every excluded card back in the deck, including ones you may not want to
                see again. There is no undo.
              </p>
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  clearAll();
                  setConfirming(false);
                  setDone(true);
                }}
              >
                Yes, clear them
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => setConfirming(false)}
              >
                Keep them
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => setConfirming(true)}
            >
              Clear all exclusions
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
