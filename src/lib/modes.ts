import { byTier, checkPool, poolIsPlayable, type PromptCard, type Tier } from "@/lib/cards";
import { CONNECTION_DECK } from "@/data/connection-deck";
import { HEAT_DECK } from "@/data/heat-deck";
import { EXPLORATION_DECK } from "@/data/exploration-deck";
import { STRETCH_DECK } from "@/data/stretch-deck";

export type Mode = "connection" | "heat";

const connection = byTier(CONNECTION_DECK);
const heat = byTier(HEAT_DECK);
const exploration = byTier(EXPLORATION_DECK);
const stretch = byTier(STRETCH_DECK);

/**
 * The blend is a lookup, not an algorithm. Each entry names the tier slices
 * that make up that tier for that mode, and the pool is their concatenation.
 * There is deliberately no runtime weighting or balancing between decks: if a
 * mode needs different proportions, that is an edit to this table.
 *
 * Heat does not open on its own tier 1. This deck's tier 1 is already a tier-2
 * question in absolute terms, so starting there is starting mid-ramp — the
 * exact failure the tiering exists to fix. Heat's warm tier is drawn from both
 * decks, and its close keeps one connection card so the night lands somewhere
 * other than where it peaked.
 *
 * Exploration and stretch are supplements to Heat, not modes of their own.
 * Exploration carries the explore cards plus a tier-0 line and its own close;
 * stretch is ordinary dares that ride the normal shuffle. Connection receives
 * neither.
 */
const MODES: Record<Mode, Record<Tier, PromptCard[][]>> = {
  connection: {
    0: [connection[0]],
    1: [connection[1]],
    2: [connection[2]],
    3: [connection[3]],
    4: [connection[4]],
  },
  heat: {
    0: [heat[0], exploration[0]],
    1: [connection[1], heat[1]],
    2: [heat[2], exploration[2], stretch[2]],
    3: [heat[3], exploration[3], stretch[3]],
    4: [heat[4], connection[4], exploration[4]],
  },
};

const TIERS: Tier[] = [0, 1, 2, 3, 4];

export function poolFor(mode: Mode): PromptCard[] {
  return TIERS.flatMap((tier) => MODES[mode][tier].flat());
}

export type ModeInfo = {
  id: Mode;
  label: string;
  blurb: string;
  playable: boolean;
  problems: ReturnType<typeof checkPool>;
};

export function modeInfo(mode: Mode): ModeInfo {
  const pool = poolFor(mode);
  return {
    id: mode,
    label: mode === "connection" ? "Connection" : "Heat",
    blurb:
      mode === "connection"
        ? "The long ramp. Ends where it should."
        : "Same ramp, further along. Not the upgrade.",
    playable: poolIsPlayable(pool),
    problems: checkPool(pool),
  };
}

export const MODE_LIST: Mode[] = ["connection", "heat"];
