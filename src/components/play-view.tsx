import { useEffect, useState } from "react";
import { PlayingCard } from "@/components/playing-card";
import { Button } from "@/components/ui/button";
import { DebugPanel } from "@/components/debug-panel";
import { ExploreVerdictPanel } from "@/components/explore-verdict";
import {
  NEGOTIATION_CARD_ID,
  PLAY_TIERS,
  playable,
  type CardKind,
  type Tier,
} from "@/lib/cards";
import { currentBeats, displayName, possess, useGameStore } from "@/lib/game-store";
import { gateFor, type Mode } from "@/lib/modes";
import { cn } from "@/lib/utils";

function tap(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* some browsers throw */
  }
}

/** The ramp, quietly. Four marks, filling as the night escalates. */
function TierRail({ tier, played, mode }: { tier: Tier; played: number; mode: Mode }) {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-hidden>
      {PLAY_TIERS.map((step) => (
        <span
          key={step}
          className={cn(
            "h-0.5 rounded-full transition-all duration-[var(--motion-fast)] ease-[var(--ease-out)]",
            step < tier && "w-6 bg-accent",
            step === tier && "w-10 bg-accent/60",
            step > tier && "w-6 bg-border-strong",
          )}
        />
      ))}
      <span
        className={cn(
          "h-0.5 w-3 rounded-full transition-colors duration-[var(--motion-fast)]",
          tier >= 4 ? "bg-accent" : "bg-border-strong",
        )}
      />
      <span className="sr-only">
        Tier {tier}, {played} of {gateFor(mode)} played
      </span>
    </div>
  );
}

function KindButton({
  kind,
  remaining,
  onPick,
}: {
  kind: CardKind;
  remaining: number;
  onPick: (kind: CardKind) => void;
}) {
  return (
    <button
      type="button"
      disabled={!remaining}
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
  const nextBeat = useGameStore((state) => state.nextBeat);
  const swapCard = useGameStore((state) => state.swapCard);
  const endGame = useGameStore((state) => state.endGame);
  const setScreen = useGameStore((state) => state.setScreen);
  const [flipped, setFlipped] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const faceUp =
    game?.phase === "reveal" ||
    game?.phase === "gratitude" ||
    game?.phase === "explore" ||
    game?.phase === "cooldown" ||
    game?.phase === "close";

  useEffect(() => {
    if (!faceUp || !game?.current) {
      setFlipped(false);
      return;
    }
    setFlipped(false);
    const timer = window.setTimeout(() => {
      setFlipped(true);
      tap(14);
    }, 160);
    return () => window.clearTimeout(timer);
  }, [game?.current?.id, faceUp]);

  useEffect(() => {
    setNote(null);
  }, [game?.current?.id, game?.phase]);

  if (!game) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <Button onClick={() => setScreen("home")}>Back</Button>
      </div>
    );
  }

  const beats = currentBeats(game);
  const beat = beats[game.beat] ?? null;
  const truthLeft = playable(game.cards, game.remainingIds, {
    tier: game.tier,
    kind: "truth",
    player: game.turn,
  }).length;
  const dareLeft = playable(game.cards, game.remainingIds, {
    tier: game.tier,
    kind: "dare",
    player: game.turn,
  }).length;

  const speaker = beat?.speaker ?? game.turn;
  const headline =
    game.phase === "gratitude" || game.phase === "explore"
      ? "Both of you"
      : game.phase === "close"
        ? "Together"
        : displayName(names, speaker);

  function onPick(kind: CardKind) {
    const result = pickKind(kind);
    if (result === "empty") {
      setNote(`No ${kind} cards left at this depth. Take the other one.`);
      return;
    }
    tap(10);
  }

  function onSwap() {
    const result = swapCard();
    if (result === "unavailable") {
      setNote("Nothing left at this depth to swap for.");
      return;
    }
    if (result === "used") {
      setNote("One swap per card.");
      return;
    }
    tap(20);
  }

  function onNext() {
    tap(10);
    nextBeat();
  }

  const lastBeat = game.phase === "reveal" && game.beat + 1 >= beats.length;

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
            {game.phase === "over" ? "That's the night" : `${possess(names, game.turn)} turn`}
          </p>
          <button
            type="button"
            onClick={endGame}
            className="h-11 px-1 text-sm text-muted transition-colors duration-[var(--motion-quick)] hover:text-fg"
          >
            End
          </button>
        </header>

        {game.phase !== "over" ? (
          <div className="pt-3">
            <TierRail tier={game.tier} played={game.playedInTier} mode={game.mode} />
          </div>
        ) : null}

        <div className="flex flex-1 flex-col pt-4">
          {game.phase === "over" ? (
            <OverPanel />
          ) : (
            <>
              <p className="font-display text-center text-4xl italic leading-none text-fg">
                {headline}
              </p>
              <p className="mt-2 min-h-10 text-center text-sm leading-relaxed text-muted">
                {game.phase === "choose" && (note ?? "Truth or dare.")}
                {game.phase === "gratitude" && "This one is dealt, not chosen."}
                {game.phase === "explore" &&
                  "Nobody is doing anything. This one only asks what you'd want."}
                {game.phase === "cooldown" && "Not a card to get through. Take the time."}
                {game.phase === "close" && "Landing it."}
                {game.phase === "reveal" &&
                  (note ??
                    beat?.instruction ??
                    (game.beat === 1
                      ? "Now your turn to answer."
                      : game.current?.kind === "dare"
                        ? "Do the thing."
                        : "You answer first."))}
              </p>

              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6">
                <PlayingCard
                  card={game.current}
                  flipped={faceUp && flipped}
                  playerLabel={headline}
                />
                {game.tonightSource && game.current?.id === NEGOTIATION_CARD_ID ? (
                  <p className="max-w-xs text-center text-sm leading-relaxed text-faint">
                    The one you both said tonight to: {game.tonightSource}
                  </p>
                ) : null}
              </div>
            </>
          )}
        </div>

        {game.phase === "choose" ? (
          <div className="flex gap-3">
            <KindButton kind="truth" remaining={truthLeft} onPick={onPick} />
            <KindButton kind="dare" remaining={dareLeft} onPick={onPick} />
          </div>
        ) : null}

        {game.phase === "reveal" ? (
          <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full" onClick={onNext}>
              {lastBeat ? "Done" : "Next"}
            </Button>
            {game.beat === 0 ? (
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={onSwap}
                disabled={game.swapUsed}
              >
                {game.swapUsed ? "Swap used" : "Swap this card"}
              </Button>
            ) : null}
          </div>
        ) : null}

        {game.phase === "explore" ? <ExploreVerdictPanel /> : null}

        {game.phase === "gratitude" || game.phase === "cooldown" || game.phase === "close" ? (
          <Button size="xl" className="w-full" onClick={onNext}>
            {game.phase === "close" && game.closeIndex + 1 >= game.closeQueue.length
              ? "That's the night"
              : "Next"}
          </Button>
        ) : null}

        <DebugPanel />

        {game.phase === "over" ? (
          <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full" onClick={() => setScreen("setup")}>
              Another night
            </Button>
            <Button size="lg" variant="outline" className="w-full" onClick={() => setScreen("home")}>
              Home
            </Button>
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

  const played = game.history.filter((entry) => entry.action === "played").length;
  const deepest = game.history.reduce((max, entry) => Math.max(max, entry.tier), 0);
  const swaps = game.history.filter((entry) => entry.action === "swapped");
  const himSwaps = swaps.filter((entry) => entry.player === "him").length;
  const herSwaps = swaps.filter((entry) => entry.player === "her").length;

  return (
    <div className="stagger-in flex flex-1 flex-col items-center justify-center text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted">
        {game.mode === "heat" ? "Heat" : "Connection"}
      </p>
      <h2 className="font-display mt-4 text-5xl italic text-fg">That's the night.</h2>
      <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
        {played} card{played === 1 ? "" : "s"} played
        {deepest >= 4 ? ", all the way to the close" : `, deepest was tier ${deepest}`}.
      </p>
      {swaps.length ? (
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-faint">
          {himSwaps ? `${displayName(names, "him")} swapped ${himSwaps}. ` : ""}
          {herSwaps ? `${displayName(names, "her")} swapped ${herSwaps}.` : ""}
        </p>
      ) : (
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-faint">Neither of you swapped.</p>
      )}
    </div>
  );
}
