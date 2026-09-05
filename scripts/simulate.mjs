/**
 * Headless playthroughs of the real store. Asserts the draw rules hold across
 * many nights and both extreme strategies (always truth / always dare).
 */
import { createServer } from "vite";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

// zustand/persist reaches for localStorage on import.
globalThis.window = { addEventListener() {} };
globalThis.localStorage = {
  _d: new Map(),
  getItem(k) {
    return this._d.has(k) ? this._d.get(k) : null;
  },
  setItem(k, v) {
    this._d.set(k, String(v));
  },
  removeItem(k) {
    this._d.delete(k);
  },
};
globalThis.window.localStorage = globalThis.localStorage;

const server = await createServer({
  root,
  configFile: resolve(root, "vite.config.ts"),
  server: { middlewareMode: true },
  logLevel: "silent",
});

const failures = [];
function check(cond, msg) {
  if (!cond) failures.push(msg);
}

try {
  const { useGameStore } = await server.ssrLoadModule("/src/lib/game-store.ts");
  const { TIER_GATE, beatsFor } = await server.ssrLoadModule("/src/lib/cards.ts");



  const summaries = [];

  for (const strategy of ["truth", "dare", "mixed"]) {
    for (let run = 0; run < 40; run += 1) {
      const s = () => useGameStore.getState();
      s().startGame("connection");

      let guard = 0;
      while (s().game.phase === "setup" && guard++ < 20) s().advanceSetup();
      check(guard < 20, `${strategy}: setup never finished`);

      let tierSeen = s().game.tier;
      const perTier = {};
      let cards = 0;
      let swaps = 0;
      guard = 0;

      while (s().game.phase !== "over" && guard++ < 500) {
        const g = s().game;

        check(g.tier >= tierSeen, `${strategy}: tier went down ${tierSeen} -> ${g.tier}`);
        tierSeen = g.tier;

        if (g.phase === "choose") {
          const want =
            strategy === "mixed" ? (Math.random() < 0.5 ? "truth" : "dare") : strategy;
          const alt = want === "truth" ? "dare" : "truth";
          if (s().pickKind(want) === "empty") {
            check(
              s().pickKind(alt) !== "empty",
              `${strategy}: both kinds dry at tier ${g.tier} before the gate`,
            );
          }
          continue;
        }

        if (g.phase === "reveal") {
          // Exercise the swap on roughly a fifth of cards.
          if (g.beat === 0 && !g.swapUsed && Math.random() < 0.2) {
            const before = s().game.current.id;
            const r = s().swapCard();
            if (r === "ok") {
              swaps += 1;
              const after = s().game.current;
              check(after.id !== before, `${strategy}: swap returned the same card`);
              check(
                after.tier === g.tier,
                `${strategy}: swap dealt tier ${after.tier} at tier ${g.tier}`,
              );
              check(
                s().swapCard() === "used",
                `${strategy}: replacement card was swappable again`,
              );
            }
          }
          const card = s().game.current;
          const expected = beatsFor(card, s().game.turn).length;
          if (card.kind === "truth" && card.reciprocal !== false) {
            check(expected >= 2, `${strategy}: reciprocal truth had ${expected} beat(s)`);
          }
          const tierNow = s().game.tier;
          s().nextBeat();
          if (s().game.tier === tierNow && s().game.phase !== "reveal") cards += 1;
          if (s().game.phase !== "reveal") {
            perTier[tierNow] = (perTier[tierNow] ?? 0) + 1;
          }
          continue;
        }

        // gratitude and close both advance on the same action
        s().nextBeat();
      }

      check(guard < 500, `${strategy}: night never ended`);
      check(s().game.phase === "over", `${strategy}: ended in ${s().game.phase}`);

      const hist = s().game.history;
      const closes = hist.filter((h) => h.action === "played" && h.kind === "close").length;
      const grats = hist.filter((h) => h.action === "played" && h.kind === "gratitude").length;
      const deepest = hist.reduce((m, h) => Math.max(m, h.tier), 0);
      check(deepest === 4, `${strategy}: deepest tier was ${deepest}, expected 4`);

      for (const [tier, played] of Object.entries(perTier)) {
        if (Number(tier) >= 1 && Number(tier) <= 3) {
          check(
            played >= 1,
            `${strategy}: tier ${tier} played ${played}`,
          );
        }
      }

      if (run === 0) {
        summaries.push({
          strategy,
          cardsPlayed: hist.filter((h) => h.action === "played").length,
          swapsTaken: swaps,
          gratitudeDealt: grats,
          closeDealt: closes,
          tier1: perTier[1] ?? 0,
          tier2: perTier[2] ?? 0,
          tier3: perTier[3] ?? 0,
          gate: TIER_GATE,
        });
      }
    }
  }

  /* ------------------------------------------------------------------ *
   * Explore expansion
   *
   * The verdict rules are the part with real consequences, so each one gets
   * an explicit case rather than riding on the random playthroughs above.
   * ------------------------------------------------------------------ */

  const { useExclusions } = await server.ssrLoadModule("/src/lib/exclusions.ts");
  const { MAX_EXPLORE_PER_NIGHT } = await server.ssrLoadModule("/src/lib/cards.ts");

  const S = () => useGameStore.getState();

  /** Deal forward until the predicate holds, or give up. */
  function runUntil(predicate, limit = 400) {
    let guard = 0;
    while (!predicate(S().game) && S().game.phase !== "over" && guard++ < limit) {
      const g = S().game;
      if (g.phase === "setup") {
        S().advanceSetup();
      } else if (g.phase === "choose") {
        if (S().pickKind("truth") === "empty") S().pickKind("dare");
      } else if (g.phase === "explore") {
        return; // caller decides
      } else {
        S().nextBeat();
      }
    }
  }

  const atExplore = (g) => g && g.phase === "explore";

  // 1. not-for-me from either partner wins, even against a tonight.
  useExclusions.getState().clearAll();
  S().startGame("heat");
  runUntil(atExplore);
  check(atExplore(S().game), "explore: never reached an explore card in heat");
  const excludedCard = S().game.current.id;
  S().resolveExplore("not-for-me", "tonight");
  check(
    useExclusions.getState().excludedCardIds.includes(excludedCard),
    "explore: not-for-me did not exclude the card",
  );
  check(
    S().game.pendingTonight === null,
    "explore: a tonight from one partner queued the negotiation anyway",
  );

  // 2. An excluded card is gone from every mode, on a fresh start.
  for (const mode of ["heat", "connection"]) {
    S().startGame(mode);
    check(
      !S().game.cards.some((c) => c.id === excludedCard),
      `explore: excluded card still dealt in ${mode}`,
    );
  }
  check(
    globalThis.localStorage.getItem("between-us-exclusions") !== null,
    "explore: exclusions were not written to storage, so they die on restart",
  );

  // 3. Never a third explore card in one night.
  useExclusions.getState().clearAll();
  S().startGame("heat");
  let seen = 0;
  let guard = 0;
  while (S().game.phase !== "over" && guard++ < 600) {
    const g = S().game;
    if (g.phase === "setup") S().advanceSetup();
    else if (g.phase === "choose") {
      if (S().pickKind("truth") === "empty") S().pickKind("dare");
    } else if (g.phase === "explore") {
      seen += 1;
      S().resolveExplore("not-tonight", "not-tonight");
      S().nextBeat();
    } else S().nextBeat();
  }
  check(
    seen <= MAX_EXPLORE_PER_NIGHT,
    `explore: ${seen} explore cards dealt, cap is ${MAX_EXPLORE_PER_NIGHT}`,
  );

  // 4. Abandoning mid-verdict resolves to not-tonight and changes nothing.
  useExclusions.getState().clearAll();
  S().startGame("heat");
  runUntil(atExplore);
  const abandoned = S().game.current.id;
  S().abandonExplore();
  check(S().game.phase !== "explore", "explore: abandon left the verdict on screen");
  check(
    S().game.remainingIds.includes(abandoned),
    "explore: abandon did not return the card to the pool",
  );
  check(
    useExclusions.getState().excludedCardIds.length === 0,
    "explore: abandon excluded a card",
  );
  check(S().game.pendingTonight === null, "explore: abandon queued a negotiation");

  // 5. A tonight that never reaches tier 3 leaves nothing behind.
  useExclusions.getState().clearAll();
  S().startGame("heat");
  runUntil(atExplore);
  check(S().game.tier === 2, `explore: first explore landed at tier ${S().game.tier}, expected 2`);
  S().resolveExplore("tonight", "tonight");
  check(S().game.pendingTonight !== null, "explore: joint tonight did not queue anything");
  S().endGame();
  S().startGame("heat");
  check(
    S().game.pendingTonight === null,
    "explore: a tonight survived into the next night",
  );
  check(
    useExclusions.getState().excludedCardIds.length === 0,
    "explore: a tonight verdict was persisted as an exclusion",
  );

  // 6. A joint tonight does queue the negotiation dare once tier 3 arrives.
  useExclusions.getState().clearAll();
  S().startGame("heat");
  runUntil(atExplore);
  const source = S().game.current.text;
  S().resolveExplore("tonight", "tonight");
  S().nextBeat();
  let sawNegotiation = false;
  guard = 0;
  while (S().game.phase !== "over" && guard++ < 600) {
    const g = S().game;
    if (g.current?.id === "explore-t3-dare-16" && g.phase === "reveal") {
      sawNegotiation = true;
      check(g.tier === 3, `explore: negotiation dealt at tier ${g.tier}`);
      check(
        g.tonightSource === source,
        "explore: negotiation card lost the text of what it is negotiating",
      );
    }
    if (g.phase === "setup") S().advanceSetup();
    else if (g.phase === "choose") {
      if (S().pickKind("truth") === "empty") S().pickKind("dare");
    } else if (g.phase === "explore") {
      S().resolveExplore("not-tonight", "not-tonight");
      S().nextBeat();
    } else S().nextBeat();
  }
  check(sawNegotiation, "explore: joint tonight never produced the negotiation dare at tier 3");
  console.log("Explore cases: exclusion, persistence, two-per-night cap, abandon,");
  console.log("discarded tonight, and the tier-3 negotiation queue — all exercised.");

  /* ------------------------------------------------------------------ *
   * Toy flag and composition assertions
   * ------------------------------------------------------------------ */

  const { usePreferences } = await server.ssrLoadModule("/src/lib/preferences.ts");
  const { poolFor, toySuppressed, MODE_LIST } = await server.ssrLoadModule("/src/lib/modes.ts");

  const TOY_DARES = ["stretch-t2-dare-19", "stretch-t2-dare-20", "stretch-t2-dare-21"];
  const TOY_QUESTIONS = ["explore-t2-explore-12", "explore-t2-explore-13"];

  // Both sides of the flag name real cards. Ids encode array position, so this
  // is the check that fails when a card is inserted above one of them.
  {
    const heat = poolFor("heat");
    for (const id of [...TOY_DARES, ...TOY_QUESTIONS]) {
      const card = heat.find((c) => c.id === id);
      check(Boolean(card), `toys: ${id} is not in the heat pool at all`);
      if (card) {
        check(
          /\bit\b|nothing in the house|did get something/i.test(card.text),
          `toys: ${id} does not read like a toy card — "${card.text.slice(0, 50)}"`,
        );
      }
    }
  }

  // Off (the default): the dares are out, the questions are in.
  useExclusions.getState().clearAll();
  usePreferences.getState().setToysInHouse(false);
  {
    check(
      toySuppressed(false).size === TOY_DARES.length,
      "toys: flag off should suppress exactly the dares",
    );
    S().startGame("heat");
    const ids = new Set(S().game.cards.map((c) => c.id));
    for (const id of TOY_DARES) check(!ids.has(id), `toys: ${id} dealt with no toy in the house`);
    for (const id of TOY_QUESTIONS) check(ids.has(id), `toys: ${id} suppressed when it should ask`);
  }

  // On: that reverses. The question has been answered, so it stops being asked.
  usePreferences.getState().setToysInHouse(true);
  {
    S().startGame("heat");
    const ids = new Set(S().game.cards.map((c) => c.id));
    for (const id of TOY_DARES) check(ids.has(id), `toys: ${id} still suppressed with the flag on`);
    for (const id of TOY_QUESTIONS) check(!ids.has(id), `toys: ${id} still asked with the flag on`);
  }

  // The flag never touches Connection, which composes neither deck.
  {
    for (const flag of [false, true]) {
      usePreferences.getState().setToysInHouse(flag);
      S().startGame("connection");
      const ids = new Set(S().game.cards.map((c) => c.id));
      for (const id of [...TOY_DARES, ...TOY_QUESTIONS]) {
        check(!ids.has(id), `toys: ${id} reached connection mode`);
      }
    }
  }
  usePreferences.getState().setToysInHouse(false);

  // Stretch actually composes. This is the regression that started the brief:
  // the deck existed and no mode listed it, so 38 dares never dealt.
  {
    const heat = poolFor("heat");
    for (const tier of [2, 3]) {
      const fromStretch = heat.filter(
        (c) => c.id.startsWith("stretch-") && c.tier === tier,
      ).length;
      check(fromStretch > 0, `composition: no stretch cards at heat tier ${tier}`);
    }
    const dares2 = heat.filter((c) => c.tier === 2 && c.kind === "dare").length;
    check(dares2 >= 40, `composition: heat tier 2 has ${dares2} dares — stretch is not composing`);

    for (const mode of MODE_LIST) {
      for (const tier of [1, 2, 3]) {
        const at = poolFor(mode).filter((c) => c.tier === tier);
        check(
          at.some((c) => c.kind === "truth") && at.some((c) => c.kind === "dare"),
          `composition: ${mode} tier ${tier} is missing a whole kind`,
        );
      }
    }
  }

  console.log("Toy flag: suppresses one side or the other, never reaches Connection, and both");
  console.log("id lists still resolve. Stretch confirmed composing into heat tiers 2 and 3.\n");



  useExclusions.getState().clearAll();

  /* ------------------------------------------------------------------ *
   * Cooldown
   * ------------------------------------------------------------------ */

  const { COOLDOWN_EVERY } = await server.ssrLoadModule("/src/lib/cards.ts");

  for (let run = 0; run < 25; run += 1) {
    useExclusions.getState().clearAll();
    S().startGame("heat");

    const cooldowns = [];
    let sawCloseAfterCooldown = false;
    let lastWasCooldown = false;
    let steps = 0;

    while (S().game.phase !== "over" && steps++ < 800) {
      const g = S().game;

      if (g.phase === "close" && !sawCloseAfterCooldown) {
        check(lastWasCooldown, "cooldown: tier 4 was entered without a cooldown before it");
        sawCloseAfterCooldown = true;
      }
      lastWasCooldown = g.phase === "cooldown";

      if (g.phase === "setup") {
        S().advanceSetup();
      } else if (g.phase === "choose") {
        if (S().pickKind("truth") === "empty") S().pickKind("dare");
      } else if (g.phase === "explore") {
        S().resolveExplore("not-tonight", "not-tonight");
        S().nextBeat();
      } else if (g.phase === "cooldown") {
        cooldowns.push({ tier: g.tier, at: g.playedInTier, then: g.afterCooldown });
        check(g.tier === 3, `cooldown: dealt at tier ${g.tier}, tier 3 only`);
        check(
          S().swapCard() === "unavailable",
          "cooldown: swap was offered on a cooldown card",
        );
        S().nextBeat();
      } else {
        S().nextBeat();
      }
    }

    check(cooldowns.length > 0, "cooldown: a whole heat night dealt none");
    check(sawCloseAfterCooldown, "cooldown: never reached the close");

    const midNight = cooldowns.filter((c) => c.then === "turn");
    const outgoing = cooldowns.filter((c) => c.then === "close");
    check(outgoing.length === 1, `cooldown: ${outgoing.length} exit cooldowns, expected 1`);
    for (const c of midNight) {
      check(
        c.at % COOLDOWN_EVERY === 0,
        `cooldown: mid-tier cooldown at ${c.at} cards, not a multiple of ${COOLDOWN_EVERY}`,
      );
    }
    // Cooldowns must not advance the counter that schedules them, or they
    // would chain. Every recorded counter value is distinct for that reason.
    const counters = midNight.map((c) => c.at);
    check(
      new Set(counters).size === counters.length,
      "cooldown: two cooldowns fired on the same counter value — they are chaining",
    );

    const cooldownHistory = S().game.history.filter((h) => h.kind === "cooldown");
    for (const entry of cooldownHistory) {
      check(entry.tier === 3, `cooldown: a tier-${entry.tier} cooldown reached the history`);
    }
  }

  // A cooldown lands before tier 4 even when the tier ran dry after one card.
  useExclusions.getState().clearAll();
  S().startGame("heat");
  {
    let steps = 0;
    while (
      steps++ < 800 &&
      !(S().game.tier === 3 && S().game.phase === "choose") &&
      S().game.phase !== "over"
    ) {
      const g = S().game;
      if (g.phase === "setup") S().advanceSetup();
      else if (g.phase === "choose") {
        if (S().pickKind("truth") === "empty") S().pickKind("dare");
      } else if (g.phase === "explore") {
        S().resolveExplore("not-tonight", "not-tonight");
        S().nextBeat();
      } else S().nextBeat();
    }
    check(S().game.tier === 3, "cooldown: could not reach tier 3 to set up the dry-tier case");

    const g = S().game;
    const byId = new Map(g.cards.map((c) => [c.id, c]));
    const oneDare = g.remainingIds.find((id) => {
      const c = byId.get(id);
      return c && c.tier === 3 && c.kind === "dare" && c.audience === "both";
    });
    const trimmed = g.remainingIds.filter((id) => {
      const c = byId.get(id);
      if (!c) return false;
      if (c.tier === 3 && (c.kind === "truth" || c.kind === "dare")) return id === oneDare;
      return true;
    });
    useGameStore.setState({ game: { ...g, remainingIds: trimmed, playedInTier: 0 } });

    check(S().pickKind("dare") === "ok", "cooldown: dry-tier setup could not deal its one dare");
    let guard = 0;
    while (S().game.phase === "reveal" && guard++ < 6) S().nextBeat();

    check(
      S().game.phase === "cooldown",
      `cooldown: one card into a dry tier 3 went to ${S().game.phase}, not a cooldown`,
    );
    check(
      S().game.playedInTier === 1,
      `cooldown: exit cooldown fired at ${S().game.playedInTier} cards, expected 1`,
    );
    check(
      S().game.afterCooldown === "close",
      "cooldown: the dry-tier cooldown did not hand off to the close",
    );
  }

  console.log("Cooldown cases: tier-3 only, every " + COOLDOWN_EVERY + " cards, one on the way");
  console.log("out, no chaining, not swappable, and one even on a tier that ran dry early.\n");

  console.log("120 nights simulated (40 truth-only, 40 dare-only, 40 mixed)\n");
  console.table(summaries);
  if (failures.length) {
    console.log(`\n${failures.length} assertion failure(s):`);
    for (const f of [...new Set(failures)].slice(0, 20)) console.log("  - " + f);
    process.exitCode = 1;
  } else {
    console.log("\nAll invariants held: tier never descends, swaps stay in tier and cap at one,");
    console.log("reciprocal truths run two beats, every night reaches the tier-4 close, and");
    console.log("every explore rule above behaved as specified.");
  }
} finally {
  await server.close();
}
