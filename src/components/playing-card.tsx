import { useEffect, useState } from "react";
import type { CardKind, PromptCard } from "@/lib/cards";
import { cn } from "@/lib/utils";

type PlayingCardProps = {
  card: PromptCard | null;
  kind?: CardKind;
  flipped: boolean;
  playerLabel: string;
};

export function PlayingCard({ card, kind, flipped, playerLabel }: PlayingCardProps) {
  const shownKind = card?.kind ?? kind ?? "truth";
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [card?.id]);

  return (
    <div
      className={cn("playing-scene w-full max-w-xs mx-auto", flipped && entered && "is-flipped")}
    >
      <div className="playing-plane">
        <div className="playing-face playing-back p-3">
          <div className="playing-face-inner px-6 py-8">
            <p className="text-2xs font-medium uppercase tracking-mark text-muted">
              Between Us
            </p>
            <div className="flex flex-col items-center gap-3">
              <span className="font-display text-5xl italic text-fg">us</span>
              <span className="h-px w-10 bg-border-strong" />
            </div>
            <p className="text-2xs uppercase tracking-widest text-faint">Private deck</p>
          </div>
        </div>
        <div className="playing-face playing-front p-3">
          <div className="playing-face-inner px-6 py-7">
            <div className="flex items-center justify-between">
              <p className="text-2xs font-medium uppercase tracking-mark text-card-muted">
                {shownKind}
              </p>
              <p className="text-2xs font-medium uppercase tracking-widest text-card-muted">
                {playerLabel}
              </p>
            </div>
            <p className="font-display my-auto text-center text-card-prompt leading-snug italic text-card-fg">
              {card?.text ?? "Choose truth or dare."}
            </p>
            <p className="text-center text-2xs uppercase tracking-widest text-card-muted">
              Between Us
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
