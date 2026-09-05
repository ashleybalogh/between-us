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
    2: [heat[2], stretch[2], exploration[2]],
    3: [heat[3], stretch[3], exploration[3]],
    4: [heat[4], connection[4], exploration[4]],
  },
};

/**
 * Cards a player must pick at a tier before the next one unlocks.
 *
 * Connection is anchored on Aron's procedure: 36 items in three sets of twelve
 * over about 45 minutes, with the escalation across sets doing the work. Ten
 * per tier is thirty picked cards, close to that shape. Six was reaching the
 * deep material before enough disclosure had accumulated to carry it.
 *
 * Heat stays at six. The gate is denominated in cards, and a dare costs far
 * more wall-clock time than answering a question, so six cards there is
 * already a longer tier than ten in Connection. Card count and elapsed time
 * are not the same currency.
 */
export const TIER_GATE: Record<Mode, number> = {
  connection: 10,
  heat: 6,
};

export function gateFor(mode: Mode): number {
  return TIER_GATE[mode];
}

const TIERS: Tier[] = [0, 1, 2, 3, 4];

/**
 * The toy flag, by card id.
 *
 * Listed by id rather than matched on text so that rewording a card cannot
 * silently change which cards these are. Ids encode array position, so
 * inserting a card above one of these renames it — which assertDecks catches
 * at boot rather than letting the wrong card get suppressed.
 */
const TOY_DARES = ["stretch-t2-dare-19", "stretch-t2-dare-20", "stretch-t2-dare-21"];
const TOY_QUESTIONS = ["explore-t2-explore-12", "explore-t2-explore-13"];

/** Cards the toy flag takes out of the deck, in whichever direction it is set. */
export function toySuppressed(toysInHouse: boolean): Set<string> {
  return new Set(toysInHouse ? TOY_QUESTIONS : TOY_DARES);
}

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
    playable: poolIsPlayable(pool, gateFor(mode)),
    problems: checkPool(pool, gateFor(mode)),
  };
}

export const MODE_LIST: Mode[] = ["connection", "heat"];

/**
 * Boot assertions. A composition mistake produces a thinner game rather than
 * an error, so it has to be asserted or it ships.
 *
 * The deploy workflow runs deck:check before building, so throwing here cannot
 * reach a deployed page — it fails the build instead, which is the point.
 */
function assertDecks(): void {
  const problems: string[] = [];
  const sources: [string, PromptCard[]][] = [
    ["connection", CONNECTION_DECK],
    ["heat", HEAT_DECK],
    ["exploration", EXPLORATION_DECK],
    ["stretch", STRETCH_DECK],
  ];

  // A deck that exists but is composed into no mode is dead content. This is
  // the check that catches a deck missing from the MODES table — the per-tier
  // checks below do not, because another deck covers for it.
  const dealt = new Set(MODE_LIST.flatMap((mode) => poolFor(mode)).map((card) => card.id));
  for (const [name, deck] of sources) {
    if (deck.length && !deck.some((card) => dealt.has(card.id))) {
      problems.push(`the ${name} deck is in the repo but no mode composes it — every one of its ${deck.length} cards is unreachable`);
    }
  }

  for (const mode of MODE_LIST) {
    for (const tier of [1, 2, 3] as Tier[]) {
      const slices = MODES[mode][tier];
      const pool = slices.flat();
      if (!pool.length) {
        problems.push(`${mode} tier ${tier} composes to an empty pool`);
        continue;
      }
      const carries = slices.some(
        (slice) =>
          slice.some((card) => card.kind === "truth") &&
          slice.some((card) => card.kind === "dare"),
      );
      if (!carries) {
        problems.push(
          `${mode} tier ${tier}: no single source deck contributes both a truth and a dare`,
        );
      }
    }
  }

  const known = new Set(sources.flatMap(([, deck]) => deck).map((card) => card.id));
  for (const id of [...TOY_DARES, ...TOY_QUESTIONS]) {
    if (!known.has(id)) {
      problems.push(`toy card id ${id} no longer resolves — a card was inserted above it`);
    }
  }

  if (problems.length) {
    throw new Error("Deck composition is broken:\n  - " + problems.join("\n  - "));
  }
}

assertDecks();
