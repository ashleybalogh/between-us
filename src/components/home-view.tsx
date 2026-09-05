import { Button } from "@/components/ui/button";
import { displayName, useGameStore } from "@/lib/game-store";
import type { PlayerId } from "@/lib/cards";

function NameField({ player }: { player: PlayerId }) {
  const value = useGameStore((state) => state.names[player]);
  const setName = useGameStore((state) => state.setName);
  const label = player === "him" ? "Him" : "Her";

  return (
    <label className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
        {label}
      </span>
      <input
        value={value}
        maxLength={18}
        autoCapitalize="words"
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => setName(player, event.target.value)}
        className="h-12 w-full rounded-lg bg-raised px-3 text-center text-sm text-fg shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] placeholder:text-faint focus-visible:shadow-[var(--shadow-border-hover)]"
        placeholder={label}
        aria-label={`${label}'s name`}
      />
    </label>
  );
}

export function HomeView() {
  const game = useGameStore((state) => state.game);
  const names = useGameStore((state) => state.names);
  const setScreen = useGameStore((state) => state.setScreen);
  const inProgress = Boolean(game && game.phase !== "over");

  return (
    <div className="flex min-h-dvh flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="stagger-in mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <header className="pt-8 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-muted">
            Two players
          </p>
          <h1 className="font-display mt-5 text-6xl italic leading-none tracking-tight text-fg">
            Between Us
          </h1>
          <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-muted">
            A deck that starts easy and does not stay there.
          </p>
        </header>

        <div className="mt-12 flex gap-3">
          <NameField player="him" />
          <NameField player="her" />
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {inProgress && game ? (
            <Button
              size="xl"
              className="w-full"
              onClick={() => setScreen(game.phase === "setup" ? "setup" : "play")}
            >
              Continue · {displayName(names, game.turn)}
            </Button>
          ) : null}
          <Button
            size="xl"
            variant={inProgress ? "outline" : "solid"}
            className="w-full"
            onClick={() => setScreen("setup")}
          >
            {inProgress ? "New night" : "Begin"}
          </Button>
          <Button size="md" variant="ghost" className="w-full" onClick={() => setScreen("settings")}>
            Settings
          </Button>
        </div>

        <ul className="mt-8 space-y-2 pb-4 text-center text-sm leading-relaxed text-faint">
          <li>Turns alternate. Truth or dare, your pick.</li>
          <li>Both of you answer every truth.</li>
          <li>Any card can be swapped once, free.</li>
        </ul>
      </div>
    </div>
  );
}
