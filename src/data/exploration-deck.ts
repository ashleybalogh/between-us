import { buildDeck, type RawCard } from "@/lib/cards";

/**
 * EXPLORATION SUPPLEMENT
 *
 * The heat deck describes what you already do. This one opens doors.
 *
 * The `explore` kind is the point. An explore card never asks anyone to do
 * something — it asks what they'd want, and ends in a decision:
 *
 *   NOT FOR ME   — off the list. Never dealt again. No discussion owed.
 *   NOT TONIGHT  — stays live. Can be dealt again another night.
 *   TONIGHT      — moves to the top of the tier-3 queue for this session.
 *
 * That third outcome is the only way an explore card turns into an act, and
 * it takes both people choosing it. Everything else parks the idea intact.
 * A door that stays open is a better result than a yes extracted at 11pm.
 *
 * Deal one explore card at each tier transition in Heat mode, the way
 * gratitude cards are dealt. Never more than two in a night.
 */

const RAW: RawCard[] = [
  // ─── TIER 0 · adds to heat setup ──────────────────────────────────
  {
    kind: "setup", audience: "both", tier: 0,
    text: "Anything either of you marked NOT FOR ME on a past night stays off the table tonight. Nobody has to remember why.",
  },

  // ─── TIER 2 · EXPLORE · what we already do, dialed ────────────────
  {
    kind: "explore", audience: "both", tier: 2,
    text: "Praise or degradation — which one actually gets you there? Be honest even if the answer isn't the one you've been performing.",
    followUp: "Whoever answered: give one line you'd want said, in the exact words.",
  },
  {
    kind: "explore", audience: "both", tier: 2,
    text: "Of everything we already do — the hand on your throat, being told to wait, being spanked, being made to ask — which one do you want harder, and which one do you want softer?",
  },
  {
    kind: "explore", audience: "both", tier: 2,
    text: "When you're told to wait, what's happening in your head? Is the waiting the good part, or the price of the good part?",
  },
  {
    kind: "explore", audience: "both", tier: 2,
    text: "Is there something we do that you go along with more than you want it? Saying so costs nothing and it comes straight off the list.",
    followUp: "Listener: thank them, and don't ask them to justify it. Not tonight, not tomorrow.",
  },
  {
    kind: "explore", audience: "both", tier: 2,
    text: "What's the difference for you between being taken and being served? Which one have we been doing more of?",
  },

  // ─── TIER 2 · EXPLORE · adjacent territory ────────────────────────
  {
    kind: "explore", audience: "both", tier: 2,
    text: "A rule that outlives tonight: something you have to do, or aren't allowed to do, until tomorrow morning. Interesting or not?",
  },
  {
    kind: "explore", audience: "both", tier: 2,
    text: "Being told in the morning what's happening that night, and carrying it around all day. Yes or no?",
  },
  {
    kind: "explore", audience: "both", tier: 2,
    text: "Earplugs or headphones on top of the blindfold — you can't hear me either. Hot or too much?",
  },
  {
    kind: "explore", audience: "both", tier: 2,
    text: "Playing someone other than ourselves — strangers who just met, a scenario with a story we both stay inside. Fun, or embarrassing?",
  },
  {
    kind: "explore", audience: "both", tier: 2,
    text: "Resisting on purpose — you fight it, you're not supposed to win. Does that do anything for either of you?",
  },
  {
    kind: "explore", audience: "both", tier: 2,
    text: "Marks that are still there in the morning. Where's the line — nowhere, somewhere covered, anywhere?",
  },
  {
    kind: "explore", audience: "both", tier: 2,
    text: "There's nothing in the house. If there were — something for her, used by either of us — is that something you want, or not for you?",
    followUp: "If it's a yes from both: neither of you buys it alone. That's a decision you make together, sober, another day.",
  },
  {
    kind: "explore", audience: "both", tier: 2,
    text: "If we did get something: is it hotter if he's the one using it on you, or if he only gets to watch?",
  },
  {
    kind: "explore", audience: "both", tier: 2,
    text: "The roles swapped for one night — whoever usually gives the instruction takes it instead. Curious, or not for you?",
  },

  // ─── TIER 3 · the negotiation that happens right before ───────────
  {
    kind: "dare", audience: "both", tier: 3,
    text: "Whoever's on the receiving end of the next card: name the one thing you'd want noticed before you ever had to use the stop word.",
  },
  {
    kind: "dare", audience: "both", tier: 3,
    text: "Take whatever came up TONIGHT on an explore card. Agree on where it starts, where it stops, and who calls it. Then do the first ten percent of it and nothing more.",
  },
  {
    kind: "dare", audience: "him", tier: 3,
    text: "Ask her to rate it out loud while it's happening — more, same, or stop. Change what you're doing on the answer, every time.",
  },
  {
    kind: "dare", audience: "her", tier: 3,
    text: "Tell him what to do next, in detail, while he's already doing something else. He switches on your word.",
  },

  // ─── TIER 3 · COOLDOWN ────────────────────────────────────────────
  // Dealt automatically, never picked. See COOLDOWN_EVERY in cards.ts.
  // These are the landing between intense cards, not the end of the night.
  { kind: "cooldown", audience: "both", tier: 3, text: "Two minutes holding each other. No talking, no moving on yet." },
  { kind: "cooldown", audience: "him", tier: 3, text: "Hold her face, look at her, and tell her she did well. Be specific about what." },
  { kind: "cooldown", audience: "him", tier: 3, text: "Ask her what felt best. Wait for the real answer — don't fill the silence." },
  { kind: "cooldown", audience: "her", tier: 3, text: "Rest your head on him and just breathe for a minute. He doesn't get to do anything with that." },
  { kind: "cooldown", audience: "him", tier: 3, text: "Water, then hands on her, nothing asked of her for sixty seconds." },
  { kind: "cooldown", audience: "her", tier: 3, text: "Tell him one thing from the last few minutes you want again." },
  { kind: "cooldown", audience: "both", tier: 3, text: "Look at each other for thirty seconds before anything else happens." },

  // ─── TIER 4 · CLOSE · intensity-specific ──────────────────────────
  {
    kind: "close", audience: "both", tier: 4,
    text: "Water, blanket, and nothing expected of either of you for ten minutes. Whoever was on top gets looked after too.",
  },
  {
    kind: "close", audience: "both", tier: 4,
    text: "One thing that worked, one thing that didn't. Both of you, both halves. Not a review — just the two sentences.",
  },
  {
    kind: "close", audience: "both", tier: 4,
    text: "Anything that came up tonight and turned out to be not for you: say so now, while it's clear. It comes off the list permanently.",
  },
  {
    kind: "close", audience: "both", tier: 4,
    text: "If the words used tonight were rough, say the true version now. Out loud, in your own voice.",
  },
  {
    kind: "close", audience: "both", tier: 4,
    text: "Set a reminder for tomorrow evening to ask each other how tonight sat. Actually set it — the answer at 9pm tomorrow is different from the answer now.",
  },
];

export const EXPLORATION_DECK = buildDeck(RAW, "explore");

/**
 * DEMOTED TO stretch-deck.ts
 *
 * Three category-probes were cut: sensation, display, and "name something new."
 * They asked you to generate an answer from a blank page, which is the one
 * thing people can't do. The named, concrete versions live in the stretch deck
 * as ordinary dares — you find out by reacting to a specific thing, not by
 * inventing one.
 *
 * What stays here is the short list where doing it cold is genuinely a bad
 * idea: marks that last past the night, rules that outlive it, resistance,
 * roleplay, role reversal, sensory removal, and the dial cards about what
 * you already do.
 */
