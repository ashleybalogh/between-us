/**
 * Deck validator. Run with `npm run deck:check`.
 *
 * The gap worth catching automatically is a tier where one kind runs dry —
 * a tier 3 that is all dares means a player who only ever picks truth stops
 * escalating and rides the tier instead. That is invisible when you are
 * reading a deck file top to bottom and obvious to a counter.
 *
 * It loads the mode table through Vite so the "@/" alias and the TypeScript
 * resolve exactly as they do in the app, and reports against the same
 * checkPool the home screen uses to decide whether a mode is offerable.
 */
import { createServer } from "vite";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

const server = await createServer({
  root,
  configFile: resolve(root, "vite.config.ts"),
  server: { middlewareMode: true },
  logLevel: "silent",
});

try {
  const { MODE_LIST, modeInfo, poolFor } = await server.ssrLoadModule("/src/lib/modes.ts");
  let failed = false;

  for (const id of MODE_LIST) {
    const mode = modeInfo(id);
    const pool = poolFor(id);

    console.log(
      `\n${mode.label} — ${pool.length} cards — ${mode.playable ? "playable" : "NOT PLAYABLE"}`,
    );

    for (const tier of [1, 2, 3]) {
      const at = pool.filter((card) => card.tier === tier);
      const truths = at.filter((card) => card.kind === "truth").length;
      const dares = at.filter((card) => card.kind === "dare").length;
      console.log(
        `  tier ${tier}   ${String(truths).padStart(2)} truth   ${String(dares).padStart(2)} dare`,
      );
    }

    const explore = pool.filter((card) => card.kind === "explore").length;
    const gratitude = pool.filter((card) => card.kind === "gratitude").length;
    const close = pool.filter((card) => card.kind === "close").length;
    console.log(`  dealt     ${explore} explore   ${gratitude} gratitude   ${close} close`);

    for (const problem of mode.problems) {
      if (problem.severity === "error") failed = true;
      const tag = problem.severity === "error" ? "ERROR" : "warn ";
      console.log(`  ${tag}  ${problem.where}: ${problem.detail}`);
    }
  }

  console.log("");
  if (failed) {
    console.log("A mode above cannot be dealt. It stays disabled on the home screen.");
    process.exitCode = 1;
  } else {
    console.log("Every mode deals.");
  }
} finally {
  await server.close();
}
