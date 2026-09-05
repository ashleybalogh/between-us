import { buildDeck, type RawCard } from "@/lib/cards";

/**
 * STRETCH DARES
 *
 * These are dares, not explore cards. They go in the normal shuffle and get
 * declined by the swap button like anything else. No verdict, no negotiation,
 * no both-of-you-agree step.
 *
 * They're novel relative to the heat deck — things not already in your
 * repertoire — but small enough that finding out in the moment is the point.
 * That's the part of truth or dare worth keeping: the card you wouldn't have
 * picked, that you do anyway, that tells you something.
 *
 * Explore cards are now reserved for the short list where doing it cold is a
 * genuinely bad idea: marks that last, rules that outlive the night, resistance
 * play, roleplay, anything with a real injury path. See notes at the bottom of
 * exploration-deck.ts for which of those got demoted to here.
 */

const RAW: RawCard[] = [
  // ─── TIER 2 · SENSATION ───────────────────────────────────────────
  { kind: "dare", audience: "him", tier: 2, text: "Ice cube in your mouth. Nipples first, then work down. It's done when it's melted." },
  { kind: "dare", audience: "him", tier: 2, text: "Alternate: something soft over her skin, then your nails. She says which one she wants more of, and you give her that one." },
  { kind: "dare", audience: "him", tier: 2, text: "Bite her — shoulder, thigh, the side of her ass. Hard enough that she makes a noise, not hard enough to leave anything." },
  { kind: "dare", audience: "her", tier: 2, text: "Use your teeth on him somewhere you never have." },
  { kind: "dare", audience: "him", tier: 2, text: "Back of a hairbrush instead of your hand. Five over her panties, then pull them down and use your hand on the same skin." },
  { kind: "dare", audience: "him", tier: 2, text: "Only your breath and your mouth, no hands at all, for three minutes. Hands behind your back if you can't manage it." },

  // ─── TIER 2 · WHAT SHE'S BEEN READING ─────────────────────────────
  {
    kind: "dare", audience: "her", tier: 2,
    text: "Open whatever you've been reading. Find a paragraph. Read it out loud to him, all the way through, no skipping.",
  },
  {
    kind: "dare", audience: "both", tier: 2,
    text: "She picks a scene from something she's been reading and describes it out loud. Then do whatever part of it works in this room.",
  },
  {
    kind: "dare", audience: "her", tier: 2,
    text: "Describe a scene you've read that stayed with you. Not the plot — the specific thing in it that got you.",
  },
  {
    kind: "dare", audience: "her", tier: 2,
    text: "Say the thing out loud that you've only ever read. In your own words, to his face.",
  },

  // ─── TIER 2 · VERBAL ──────────────────────────────────────────────
  { kind: "dare", audience: "him", tier: 2, text: "Tell her the filthiest true thing you've thought about her this week. When you thought it and where you were." },
  { kind: "dare", audience: "her", tier: 2, text: "Narrate what you want him to do while he's doing it. Don't stop talking, and don't get shy halfway through." },
  { kind: "dare", audience: "her", tier: 2, text: "Tell him what you think about when you're on your own." },
  { kind: "dare", audience: "him", tier: 2, text: "Describe out loud exactly what you're going to do to her, in order, while you do none of it yet." },

  // ─── TIER 2 · POSITION & PLACE ────────────────────────────────────
  { kind: "dare", audience: "both", tier: 2, text: "Not the bed. Kitchen counter, hallway floor, against the door — whoever drew this picks." },
  { kind: "dare", audience: "both", tier: 2, text: "Shower. He washes her first, all of her, properly, before anything else happens." },
  { kind: "dare", audience: "him", tier: 2, text: "Her against the wall, standing, your hand where you want it." },
  { kind: "dare", audience: "her", tier: 2, text: "Straddle him fully clothed and grind on him until he asks you to take something off." },
  { kind: "dare", audience: "him", tier: 2, text: "Eat her out with her still dressed. Pull her panties aside instead of taking anything off." },

  // ─── TIER 2 · TOYS (skip if there's nothing in the house) ─────────
  { kind: "dare", audience: "her", tier: 2, text: "Use it while he watches. Your hand or his on it — you pick. He doesn't get to touch himself either way." },
  { kind: "dare", audience: "him", tier: 2, text: "You hold it. You decide where it goes, how hard, how long. She doesn't get a say." },
  { kind: "dare", audience: "him", tier: 2, text: "Use it on her while you're kissing her. Stop the second before she comes." },

  // ─── TIER 3 · ─────────────────────────────────────────────────────
  { kind: "dare", audience: "both", tier: 3, text: "Sixty-nine, her on top. Whoever gives up first loses and the winner picks what happens next." },
  { kind: "dare", audience: "her", tier: 3, text: "Ride him facing away. He holds your hips and sets the pace, not you." },
  { kind: "dare", audience: "her", tier: 3, text: "On top, but he holds your wrists down the whole time." },
  { kind: "dare", audience: "him", tier: 3, text: "Tie her hands to the headboard with something soft. She tells you when she wants them down." },
  { kind: "dare", audience: "him", tier: 3, text: "Come on her. She picks where before you start." },
  { kind: "dare", audience: "him", tier: 3, text: "She doesn't come until the third time she asks, and she has to ask differently each time." },
  { kind: "dare", audience: "him", tier: 3, text: "Your fingers in her mouth while you're fucking her." },
  { kind: "dare", audience: "him", tier: 3, text: "Make her count out loud, and start over every time she loses track." },
  { kind: "dare", audience: "her", tier: 3, text: "Suck him off with him still dressed. He undoes the minimum." },
  { kind: "dare", audience: "him", tier: 3, text: "Hold her right at the edge for a full minute before you let her come." },
  { kind: "dare", audience: "both", tier: 3, text: "Whoever drew this doesn't get to touch the other one at all for the next two cards. Only give instructions." },
  { kind: "dare", audience: "him", tier: 3, text: "Watch her finish. She decides whose hand does it — yours guided by her, or her own. Your other hand stays off you." },
  { kind: "dare", audience: "her", tier: 3, text: "Tell him you want it, then keep asking every time he stops." },
  { kind: "dare", audience: "him", tier: 3, text: "Turn the lights all the way up. Look at her the whole time and tell her what you're seeing." },

  // ─── TIER 3 · ANTICIPATION ────────────────────────────────────────
  { kind: "dare", audience: "him", tier: 3, text: "Tell her one thing that's happening before the night is over. Then don't do it yet." },
  { kind: "dare", audience: "her", tier: 3, text: "Tell him one thing you want that he has to earn. Say what earns it." },
];

export const STRETCH_DECK = buildDeck(RAW, "stretch");
