import { useEffect, useState } from "react";
import { PlayingCard } from "@/components/playing-card";
import { Button } from "@/components/ui/button";
import { matchingIds, type CardKind } from "@/lib/cards";
import { displayName, possess, useGameStore } from "@/lib/game-store";
import { cn } from "@/lib/utils";

function tap(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* some browsers throw */
  }
}

function PassTickets() {
  const game = useGameStore((state) => state.game);
  const names = useGameStore((state) => state.names);
  if (!game) return null;

  const tickets = [
    { id: "him" as const, remaining: game.himPass },
    { id: "her" as const, remaining: game.herPass },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {tickets.map((ticket) => {
        const active = game.turn === ticket.id && game.phase !== "over";
        return (
          <div
            key={ticket.id}
            className={cn(
              "pass-ticket rounded-lg px-3 py-3 transition-[opacity,box-shadow] duration-[var(--motion-fast)] ease-[var(--ease-out)]",
              active ? "bg-raised" : "bg-transparent",
              !ticket.remaining && "opacity-40",
            )}
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
              {displayName(names, ticket.id)}
            </p>
            <p className="mt-1 text-sm text-fg">
              {ticket.remaining ? "Pass still in hand" : "Pass spent"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function KindButton({
  kind,
  disabled,
  remaining,
  onPick,
}: {
  kind: CardKind;
  disabled: boolean;
  remaining: number;
  onPick: (kind: CardKind) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onPick(kind)}
      className="flex min-h-24 flex-1 flex-col items-center justify-center rounded-xl bg-raised px-4 py-5 shadow-[var(--shadow-border)] transition-[transform,box-shadow,opacity] duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:shadow-[var(--shadow-border-hover)] active:not-disabled:scale-[0.96] disabled:opacity-40"
    >
      <span className="font-display text-3xl italic leading-none text-fg">{kind}</span>
      <span className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted tabular-nums">
        {remaining} left
      </span>
    </button>
  );
}

export function PlayView() {
  const game = useGameStore((state) => state.game);
  const names = useGameStore((state) => state.names);
  const pickKind = useGameStore((state) => state.pickKind);
  const completeCard = useGameStore((state) => state.completeCard);
  const passCard = useGameStore((state) => state.passCard);
  const reshuffleKind = useGameStore((state) => state.reshuffleKind);
  const endGame = useGameStore((state) => state.endGame);
  const startGame = useGameStore((state) => state.startGame);
  const setScreen = useGameStore((state) => state.setScreen);
  const [flipped, setFlipped] = useState(false);
  const [passNote, setPassNote] = useState<string | null>(null);

  useEffect(() => {
    if (game?.phase !== "reveal" || !game.current) {
      setFlipped(false);
      return;
    }
    setFlipped(false);
    const timer = window.setTimeout(() => {
      setFlipped(true);
      tap(14);
    }, 160);
    return () => window.clearTimeout(timer);
  }, [game?.current?.id, game?.phase]);

  if (!game) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <Button onClick={() => setScreen("home")}>Back</Button>
      </div>
    );
  }

  const playerName = displayName(names, game.turn);
  const playerPossess = possess(names, game.turn);
  const canPass = game.turn === "him" ? game.himPass : game.herPass;
  const truthLeft = matchingIds(game.cards, game.remainingIds, "truth", game.turn).length;
  const dareLeft = matchingIds(game.cards, game.remainingIds, "dare", game.turn).length;

  function onPick(kind: CardKind) {
    setPassNote(null);
    pickKind(kind);
  }

  function onPass() {
    const result = passCard();
    if (result === "spent") {
      setPassNote("That pass is already gone.");
      return;
    }
    tap(20);
    setPassNote(null);
  }

  function onDone() {
    tap(10);
    setPassNote(null);
    completeCard();
  }

  return (
    <div className="flex min-h-dvh flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setScreen("home")}
            className="h-11 px-1 text-sm text-muted transition-colors duration-[var(--motion-quick)] hover:text-fg"
          >
            Close
          </button>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
            {game.phase === "over" ? "Game over" : `${playerPossess} turn`}
          </p>
          <button
            type="button"
            onClick={endGame}
            className="h-11 px-1 text-sm text-muted transition-colors duration-[var(--motion-quick)] hover:text-fg"
          >
            End
          </button>
        </header>

        <div className="flex flex-1 flex-col pt-4">
          {game.phase === "over" ? (
            <OverPanel />
          ) : (
            <>
              <p className="font-display text-center text-4xl italic leading-none text-fg">
                {playerName}
              </p>
              <p className="mt-2 text-center text-sm text-muted">
                {game.phase === "choose" && "Truth, dare, or sit this one out with a pass later."}
                {game.phase === "reveal" && (game.current?.kind === "dare" ? "Do the thing." : "Answer honestly.")}
                {game.phase === "empty" && "That pile is empty."}
              </p>

              <div className="flex flex-1 items-center py-6">
                <PlayingCard
                  card={game.current}
                  kind={game.current?.kind ?? game.emptyKind ?? undefined}
                  flipped={game.phase === "reveal" && flipped}
                  playerLabel={playerName}
                />
              </div>
            </>
          )}
        </div>

        {game.phase === "choose" ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <KindButton kind="truth" remaining={truthLeft} disabled={!truthLeft} onPick={onPick} />
              <KindButton kind="dare" remaining={dareLeft} disabled={!dareLeft} onPick={onPick} />
            </div>
            {!truthLeft && !dareLeft ? (
              <Button variant="outline" className="w-full" onClick={() => reshuffleKind("truth")}>
                Reshuffle
              </Button>
            ) : null}
          </div>
        ) : null}

        {game.phase === "reveal" ? (
          <div className="flex flex-col gap-3">
            {passNote ? <p className="text-center text-sm text-muted">{passNote}</p> : null}
            <Button size="lg" className="w-full" onClick={onDone}>
              Done
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={onPass}
              disabled={!canPass}
            >
              {canPass ? "Use pass" : "Pass already used"}
            </Button>
          </div>
        ) : null}

        {game.phase === "empty" ? (
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              className="w-full"
              onClick={() => game.emptyKind && reshuffleKind(game.emptyKind)}
            >
              Reshuffle {game.emptyKind ?? "deck"}
            </Button>
            <Button size="lg" variant="outline" className="w-full" onClick={() => setScreen("home")}>
              Back
            </Button>
          </div>
        ) : null}

        {game.phase === "over" ? (
          <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full" onClick={startGame}>
              Play again
            </Button>
            <Button size="lg" variant="outline" className="w-full" onClick={() => setScreen("home")}>
              Home
            </Button>
          </div>
        ) : null}

        {game.phase !== "over" ? (
          <div className="mt-4">
            <PassTickets />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OverPanel() {
  const game = useGameStore((state) => state.game);
  const names = useGameStore((state) => state.names);
  if (!game) return null;
  const done = game.history.filter((entry) => entry.action === "done").length;
  const himPassed = game.history.some((entry) => entry.player === "him" && entry.action === "pass");
  const herPassed = game.history.some((entry) => entry.player === "her" && entry.action === "pass");

  return (
    <div className="stagger-in flex flex-1 flex-col items-center justify-center text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted">Session</p>
      <h2 className="font-display mt-4 text-5xl italic text-fg">That's the deck.</h2>
      <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
        {done} card{done === 1 ? "" : "s"} played.
        {himPassed ? ` ${displayName(names, "him")} used a pass.` : ""}
        {herPassed ? ` ${displayName(names, "her")} used a pass.` : ""}
        {!himPassed && !herPassed ? " Neither of you spent a pass." : ""}
      </p>
    </div>
  );
}
