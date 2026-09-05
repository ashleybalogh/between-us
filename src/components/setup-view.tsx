import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/game-store";
import { MODE_LIST, modeInfo, type Mode } from "@/lib/modes";
import { cn } from "@/lib/utils";

/**
 * Tier 0. Choosing the mode is the first act of it rather than a menu that
 * happens before it — agreeing out loud where the night is going belongs
 * beside the limits and the stop word, not on a splash screen.
 */
function ModeChoice({ onPick }: { onPick: (mode: Mode) => void }) {
  const setScreen = useGameStore((state) => state.setScreen);

  return (
    <>
      <p className="text-center text-sm leading-relaxed text-muted">
        Say it out loud and agree before you pick.
      </p>

      <div className="flex flex-1 flex-col justify-center gap-3 py-8">
        {MODE_LIST.map((id) => {
          const mode = modeInfo(id);
          return (
            <button
              key={mode.id}
              type="button"
              disabled={!mode.playable}
              onClick={() => onPick(mode.id)}
              className={cn(
                "rounded-xl bg-raised px-5 py-5 text-left shadow-[var(--shadow-border)] transition-[transform,box-shadow,opacity] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
                "hover:shadow-[var(--shadow-border-hover)] active:not-disabled:scale-[0.98] disabled:opacity-40",
              )}
            >
              <span className="font-display block text-3xl italic leading-none text-fg">
                {mode.label}
              </span>
              <span className="mt-2 block text-sm text-muted">{mode.blurb}</span>
              {!mode.playable ? (
                <span className="mt-2 block text-[11px] uppercase tracking-[0.18em] text-faint">
                  Deck not finished
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <p className="pb-2 text-center text-sm leading-relaxed text-faint">
        Connection ending in Heat is a good night. Heat is not the upgrade. It skips the part most
        couples actually need.
      </p>

      <Button variant="ghost" size="md" className="w-full" onClick={() => setScreen("home")}>
        Back
      </Button>
    </>
  );
}

export function SetupView() {
  const game = useGameStore((state) => state.game);
  const startGame = useGameStore((state) => state.startGame);
  const advanceSetup = useGameStore((state) => state.advanceSetup);
  const setScreen = useGameStore((state) => state.setScreen);

  const choosing = !game || game.phase !== "setup";

  return (
    <div className="flex min-h-dvh flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="stagger-in mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="pt-6 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-muted">
            Before anything is dealt
          </p>
          <h1 className="font-display mt-4 text-5xl italic leading-none text-fg">
            {choosing ? "Where is tonight going?" : "Agree on this first"}
          </h1>
        </header>

        {choosing ? (
          <div className="flex flex-1 flex-col pt-8">
            <ModeChoice onPick={startGame} />
          </div>
        ) : (
          <>
            <div className="flex flex-1 items-center py-8">
              <p className="font-display mx-auto max-w-sm text-center text-3xl italic leading-snug text-fg">
                {game.current?.text}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-center gap-2 pb-2" aria-hidden>
                {game.setupQueue.map((id, index) => (
                  <span
                    key={id}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-colors duration-[var(--motion-quick)]",
                      index <= game.setupIndex ? "bg-accent" : "bg-border-strong",
                    )}
                  />
                ))}
              </div>
              <Button size="xl" className="w-full" onClick={advanceSetup}>
                {game.setupIndex + 1 >= game.setupQueue.length ? "Start" : "Agreed"}
              </Button>
              <Button
                size="md"
                variant="ghost"
                className="w-full"
                onClick={() => setScreen("home")}
              >
                Not tonight
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
