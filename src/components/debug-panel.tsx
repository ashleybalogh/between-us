import { MAX_EXPLORE_PER_NIGHT, playable, type CardKind } from "@/lib/cards";
import { gateFor, surpriseFor } from "@/lib/modes";
import { useGameStore } from "@/lib/game-store";
import { usePreferences } from "@/lib/preferences";

const COUNTED: CardKind[] = ["truth", "dare"];

/**
 * Draw-rule instrumentation, off by default.
 *
 * Exists to answer "escalation feels off" with numbers instead of guesses. The
 * three things worth reading:
 *
 *  - `picked` is the gate counter. It counts only cards a player chose. Engine
 *    dealt cards — gratitude, explore, cooldown — do not touch it, and neither
 *    does a swap, so a swapped pair is one card played rather than two.
 *  - `left` is what remains at the current tier for whoever is on. When both
 *    kinds reach zero the tier advances early, which is the one path that
 *    shortens a night without the gate being met.
 *  - `dry in` counts how many more picks the thinner kind can supply.
 */
export function DebugPanel() {
  const on = usePreferences((state) => state.debugOverlay);
  const game = useGameStore((state) => state.game);
  if (!on || !game) return null;

  const counts = COUNTED.map((kind) => ({
    kind,
    mine: playable(game.cards, game.remainingIds, {
      tier: game.tier,
      kind,
      player: game.turn,
    }).length,
    theirs: playable(game.cards, game.remainingIds, {
      tier: game.tier,
      kind,
      player: game.turn === "him" ? "her" : "him",
    }).length,
  }));

  const thinnest = Math.min(...counts.map((row) => Math.max(row.mine, row.theirs)));
  const swaps = game.history.filter((entry) => entry.action === "swapped").length;

  return (
    <div className="mt-3 rounded-lg bg-raised/60 px-3 py-2 font-mono text-[10px] leading-relaxed text-faint">
      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
        <span>
          tier <span className="text-muted">{game.tier}</span>
        </span>
        <span>
          picked{" "}
          <span className="text-muted">
            {game.playedInTier}/{gateFor(game.mode)}
          </span>
        </span>
        <span>
          phase <span className="text-muted">{game.phase}</span>
        </span>
        <span>
          explore{" "}
          <span className="text-muted">
            {game.exploreDealt}/{MAX_EXPLORE_PER_NIGHT}
          </span>
        </span>
        <span>
          swaps <span className="text-muted">{swaps}</span>
        </span>
        {surpriseFor(game.mode) ? (
          <span>
            truths this tier <span className="text-muted">{game.truthsAtTier}</span>
          </span>
        ) : null}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
        {counts.map((row) => (
          <span key={row.kind}>
            {row.kind} left{" "}
            <span className="text-muted">
              {row.mine} / {row.theirs}
            </span>
          </span>
        ))}
        <span>
          dry in <span className="text-muted">{thinnest}</span>
        </span>
      </div>
      <p className="mt-1">
        picked counts chosen cards only; swaps and dealt cards do not advance it
      </p>
    </div>
  );
}
