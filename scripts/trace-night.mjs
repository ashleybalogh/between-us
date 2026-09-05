/**
 * Print one night card by card, with the source deck of every card.
 *
 * Exists because "I played a whole night and never saw anything spicy" is a
 * report about content distribution that looks like an engine bug, and the
 * fastest way to tell them apart is to read the night back.
 *
 *   npm run trace              heat, dare every time
 *   npm run trace connection   connection, dare every time
 *   npm run trace heat truth   heat, truth every time
 */
import { createServer } from "vite";
import { resolve } from "node:path";

globalThis.localStorage = {
  _d: new Map(),
  getItem(k) { return this._d.has(k) ? this._d.get(k) : null; },
  setItem(k, v) { this._d.set(k, String(v)); },
  removeItem(k) { this._d.delete(k); },
};

const root = resolve(import.meta.dirname, "..");
const server = await createServer({
  root, configFile: resolve(root, "vite.config.ts"),
  server: { middlewareMode: true }, logLevel: "silent",
});

try {
  const { useGameStore } = await server.ssrLoadModule("/src/lib/game-store.ts");
  const S = () => useGameStore.getState();

  const mode = process.argv[2] === "connection" ? "connection" : "heat";
  const pick = process.argv[3] === "truth" ? "truth" : "dare";
  const other = pick === "truth" ? "dare" : "truth";
  console.log(`
${mode}, picking ${pick} every time`);

  S().startGame(mode);
  let guard = 0;
  while (S().game.phase === "setup" && guard++ < 20) S().advanceSetup();

  const seen = [];
  guard = 0;
  while (S().game.phase !== "over" && guard++ < 400) {
    const g = S().game;
    if (g.phase === "choose") {
      // Only fall back if the tier has none of the chosen kind left.
      if (S().pickKind(pick) === "empty") S().pickKind(other);
      continue;
    }
    if (g.phase === "explore") {
      S().resolveExplore("not-tonight", "not-tonight");
      S().nextBeat();
      continue;
    }
    if (g.current && S().game.beat === 0) {
      const src = g.current.id.split("-")[0];
      seen.push({ tier: g.tier, kind: g.current.kind, deck: src, text: g.current.text.slice(0, 62) });
    }
    S().nextBeat();
  }

  let lastTier = -1;
  for (const row of seen) {
    if (row.tier !== lastTier) {
      console.log(`\n──── TIER ${row.tier} ────`);
      lastTier = row.tier;
    }
    console.log(`  [${row.deck.padEnd(7)} ${row.kind.padEnd(9)}] ${row.text}`);
  }

  const byDeck = {};
  for (const row of seen) {
    if (row.kind !== "dare") continue;
    byDeck[row.deck] = (byDeck[row.deck] ?? 0) + 1;
  }
  console.log("\nDares dealt by source deck:", byDeck);
  console.log("Tiers reached:", [...new Set(seen.map((r) => r.tier))].join(", "));
} finally {
  await server.close();
}
