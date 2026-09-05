import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ExploreVerdict, PlayerId } from "@/lib/cards";
import { displayName, useGameStore } from "@/lib/game-store";

const CHOICES: { id: ExploreVerdict; label: string }[] = [
  { id: "not-for-me", label: "Not for me" },
  { id: "not-tonight", label: "Not tonight" },
  { id: "tonight", label: "Tonight" },
];

const OUTCOME: Record<ExploreVerdict, string> = {
  "not-for-me": "Off the list. It will not come up again, and nobody owes an explanation.",
  "not-tonight": "Parked. It stays on the list for another night.",
  tonight: "Both of you. It comes back at tier three, and you agree the shape of it first.",
};

type Step = "first" | "handoff" | "second" | "revealed";

/**
 * The three-way verdict on an explore card.
 *
 * The whole design constraint is rule 2: neither answer may be visible until
 * both are in. So the first two verdicts live in refs and never reach the
 * render tree — they are copied into state only at the reveal. A second answer
 * given after seeing the first is not an independent answer, and an explore
 * card whose answers are not independent is worse than no card.
 *
 * Rule 3: anything ambiguous is not-tonight. Backgrounding the app abandons
 * the card, which returns it to the pool and changes nothing.
 */
export function ExploreVerdictPanel() {
  const game = useGameStore((state) => state.game);
  const names = useGameStore((state) => state.names);
  const resolveExplore = useGameStore((state) => state.resolveExplore);
  const abandonExplore = useGameStore((state) => state.abandonExplore);
  const nextBeat = useGameStore((state) => state.nextBeat);

  const first = useRef<ExploreVerdict | null>(null);
  const second = useRef<ExploreVerdict | null>(null);
  const [step, setStep] = useState<Step>("first");
  const [shown, setShown] = useState<{ first: ExploreVerdict; second: ExploreVerdict } | null>(
    null,
  );

  const cardId = game?.current?.id ?? null;

  useEffect(() => {
    first.current = null;
    second.current = null;
    setShown(null);
    setStep("first");
  }, [cardId]);

  // Rule 3. Deliberately not an unmount cleanup: StrictMode's double-mount
  // would fire it on a perfectly live card.
  useEffect(() => {
    function onHide() {
      if (document.visibilityState !== "hidden") return;
      if (first.current !== null && second.current !== null) return;
      abandonExplore();
    }
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [abandonExplore]);

  if (!game?.current) return null;

  const firstPlayer: PlayerId = game.turn;
  const secondPlayer: PlayerId = game.turn === "him" ? "her" : "him";

  function choose(verdict: ExploreVerdict) {
    if (step === "first") {
      first.current = verdict;
      setStep("handoff");
      return;
    }
    if (step === "second") {
      second.current = verdict;
      resolveExplore(first.current ?? "not-tonight", verdict);
      setShown({ first: first.current ?? "not-tonight", second: verdict });
      setStep("revealed");
    }
  }

  if (step === "handoff") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-center text-sm leading-relaxed text-muted">
          Locked in. Hand the phone to {displayName(names, secondPlayer)} without saying anything.
        </p>
        <Button size="xl" className="w-full" onClick={() => setStep("second")}>
          I have it
        </Button>
      </div>
    );
  }

  if (step === "revealed" && shown) {
    const joint =
      shown.first === "not-for-me" || shown.second === "not-for-me"
        ? "not-for-me"
        : shown.first === "tonight" && shown.second === "tonight"
          ? "tonight"
          : "not-tonight";

    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { player: firstPlayer, verdict: shown.first },
            { player: secondPlayer, verdict: shown.second },
          ].map((row) => (
            <div key={row.player} className="rounded-lg bg-raised px-3 py-3 text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
                {displayName(names, row.player)}
              </p>
              <p className="mt-1 text-sm text-fg">
                {CHOICES.find((choice) => choice.id === row.verdict)?.label}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm leading-relaxed text-muted">{OUTCOME[joint]}</p>

        {game.current.followUp ? (
          <p className="text-center text-sm leading-relaxed text-faint">{game.current.followUp}</p>
        ) : null}

        <Button size="xl" className="w-full" onClick={nextBeat}>
          Carry on
        </Button>
      </div>
    );
  }

  const who = step === "first" ? firstPlayer : secondPlayer;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-sm leading-relaxed text-muted">
        {displayName(names, who)}, answer for yourself. Don&apos;t say it out loud.
      </p>
      {/* Equal weight on purpose. Tonight is not the natural next step. */}
      <div className="grid grid-cols-3 gap-2">
        {CHOICES.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => choose(choice.id)}
            className="min-h-16 rounded-xl bg-raised px-2 py-3 text-sm leading-tight text-fg shadow-[var(--shadow-border)] transition-[transform,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:shadow-[var(--shadow-border-hover)] active:scale-[0.96]"
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}
