import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useExclusions } from "@/lib/exclusions";
import { useGameStore } from "@/lib/game-store";
import { usePreferences } from "@/lib/preferences";
import { cn } from "@/lib/utils";

function Toggle({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 rounded-xl bg-raised px-4 py-4 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)]"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-fg">{label}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted">{detail}</span>
      </span>
      <span
        className={cn(
          "mt-0.5 h-6 w-10 shrink-0 rounded-full p-0.5 transition-colors duration-[var(--motion-quick)]",
          checked ? "bg-accent" : "bg-border-strong",
        )}
      >
        <span
          className={cn(
            "block h-5 w-5 rounded-full transition-transform duration-[var(--motion-quick)] ease-[var(--ease-out)]",
            checked ? "translate-x-4 bg-accent-fg" : "translate-x-0 bg-fg/70",
          )}
        />
      </span>
    </button>
  );
}

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
  const toysInHouse = usePreferences((state) => state.toysInHouse);
  const setToysInHouse = usePreferences((state) => state.setToysInHouse);
  const debugOverlay = usePreferences((state) => state.debugOverlay);
  const setDebugOverlay = usePreferences((state) => state.setDebugOverlay);
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
          <Toggle
            label="There's a toy in the house"
            detail="Off, the cards that need one stay out of the deck and the ones asking whether you want one stay in. On, that swaps around."
            checked={toysInHouse}
            onChange={setToysInHouse}
          />

          <Toggle
            label="Show the draw counters"
            detail="Tier, cards picked against the gate, and what's left in the pool. For working out why a night felt fast or slow."
            checked={debugOverlay}
            onChange={setDebugOverlay}
          />

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
