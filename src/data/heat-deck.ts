import { buildDeck, type RawCard } from "@/lib/cards";

const RAW: RawCard[] = [
  // ─── TIER 0 · SETUP ────────────────────────────────────────────────
  // Dealt in order, every time. Thirty seconds that make the rest work.
  { kind: "setup", audience: "both", tier: 0, text: "Name one thing that's off the table tonight. One each." },
  { kind: "setup", audience: "both", tier: 0, text: "Pick the word that stops everything. Say it now, out loud, both of you." },
  { kind: "setup", audience: "both", tier: 0, text: "Swap any card you don't want. You get a new one." },
  { kind: "setup", audience: "both", tier: 0, text: "Photos tonight, yes or no? If yes: whose phone, and when do they get deleted?" },
  { kind: "setup", audience: "both", tier: 0, text: "Say one thing you want tonight. One each." },

  // ─── TIER 1 · WARM ─────────────────────────────────────────────────
  { kind: "truth", audience: "both", tier: 1, text: "What's something small I do that turns you on more than I realize?" },
  { kind: "truth", audience: "both", tier: 1, text: "When were you most turned on with me recently? What did it?" },
  { kind: "truth", audience: "both", tier: 1, text: "What's the hottest thing I've ever said to you?" },
  { kind: "truth", audience: "both", tier: 1, text: "What do I do that makes you feel the most wanted?" },
  { kind: "truth", audience: "both", tier: 1, text: "What do you pretend to like less than you do?" },
  { kind: "truth", audience: "both", tier: 1, text: "What's one thing I could say in the moment that would get you further into it instantly?" },
  { kind: "truth", audience: "both", tier: 1, text: "Do you like being told what to do, or being made to ask for it?" },
  { kind: "truth", audience: "both", tier: 1, text: "What's a thing we used to do that we've quietly stopped doing?" },
  { kind: "truth", audience: "both", tier: 1, text: "What part of you gets less attention than you want?" },
  { kind: "truth", audience: "both", tier: 1, text: "What works about the way I start things? What doesn't?" },

  { kind: "gratitude", audience: "both", tier: 1, text: "Name something they did for you this week that had nothing to do with sex, and say why it mattered." },

  { kind: "dare", audience: "him", tier: 1, text: "Rub her feet for two minutes. Look at her while you do it." },
  { kind: "dare", audience: "her", tier: 1, text: "Sit behind him and work his shoulders and neck for two minutes." },
  { kind: "dare", audience: "him", tier: 1, text: "Kiss only her neck and collarbones for ninety seconds." },
  { kind: "dare", audience: "her", tier: 1, text: "Kiss only his neck and jaw for ninety seconds." },
  { kind: "dare", audience: "him", tier: 1, text: "Trace your fingers over her for two minutes — anywhere except where she wants them." },
  { kind: "dare", audience: "her", tier: 1, text: "Run your hands over him for two minutes. Everywhere except his cock." },
  { kind: "dare", audience: "him", tier: 1, text: "Hold her face and kiss her for a full minute. Nothing else moves." },
  { kind: "dare", audience: "both", tier: 1, text: "Undress each other one item at a time, alternating. Neither of you touches your own clothes." },
  { kind: "dare", audience: "him", tier: 1, text: "Kiss your way down her spine and stop at the base of it." },
  { kind: "dare", audience: "both", tier: 1, text: "Lie behind them, hands on their hips, and just breathe on their neck for a minute." },

  // ─── TIER 2 · OPEN ─────────────────────────────────────────────────
  {
    kind: "truth", audience: "both", tier: 2,
    text: "What's something you've wanted to ask for and held back on? What stopped you?",
    followUp: "Listener: don't answer yours yet. Say back what you heard, and say whether they were right to worry.",
  },
  { kind: "truth", audience: "both", tier: 2, text: "When do you feel most submissive with me? What puts you there?" },
  { kind: "truth", audience: "both", tier: 2, text: "When I take control, what part of it gets you?" },
  { kind: "truth", audience: "both", tier: 2, text: "What's the difference, for you, between wanting to be taken care of and wanting to be used?" },
  { kind: "truth", audience: "both", tier: 2, text: "What's something I've done that you still think about weeks later?" },
  { kind: "truth", audience: "both", tier: 2, text: "What are you curious about but not sure you want?" },
  {
    kind: "truth", audience: "both", tier: 2,
    text: "Where's your line between hot and too far, and how would I know I'd crossed it?",
    followUp: "Listener: repeat the tell back to them so they know you've got it.",
  },
  { kind: "truth", audience: "both", tier: 2, text: "What's one thing you want me to do more often?" },

  { kind: "dare", audience: "her", tier: 2, text: "Give one instruction. He follows it exactly, for as long as you say." },
  { kind: "dare", audience: "her", tier: 2, text: "Pick one: his mouth, his hands, or his voice. That's all you get for three minutes — and all he's allowed to use." },
  { kind: "dare", audience: "both", tier: 2, text: "Whoever drew this gives one command. It stands until the next card." },
  { kind: "dare", audience: "him", tier: 2, text: "Tell her three things you're going to do to her. Then make her wait." },
  { kind: "dare", audience: "her", tier: 2, text: "Tell him three things you want, in the order you want them." },
  { kind: "dare", audience: "him", tier: 2, text: "Blindfold her. Use only your mouth for two minutes. Her hands stay off you." },
  { kind: "dare", audience: "her", tier: 2, text: "Blindfold him. Use only your hands for two minutes." },
  { kind: "dare", audience: "him", tier: 2, text: "Pin her wrists above her head and keep them there while you kiss her." },
  { kind: "dare", audience: "both", tier: 2, text: "For the next three cards, her hands stay wherever he puts them." },
  { kind: "dare", audience: "him", tier: 2, text: "Bind her wrists loosely with a tie. The second she wants them free, they're free." },
  { kind: "dare", audience: "him", tier: 2, text: "Hand lightly on her throat while you kiss her. Look at her face first." },
  { kind: "dare", audience: "him", tier: 2, text: "Two or three firm spanks, then leave your hand on the same spot." },
  { kind: "dare", audience: "him", tier: 2, text: "Make her kneel and wait, hands on her thighs, until you say she can move." },
  { kind: "dare", audience: "him", tier: 2, text: "Tell her exactly what you like about how she's taking it. Specific. Not general." },
  { kind: "dare", audience: "him", tier: 2, text: "Whisper \"good girl\" every single time she does what you asked." },
  { kind: "dare", audience: "her", tier: 2, text: "Say the thing out loud that you'd normally only think." },
  { kind: "dare", audience: "both", tier: 2, text: "Mirror. He undresses her from behind. She watches." },
  { kind: "dare", audience: "both", tier: 2, text: "Touch yourselves, facing each other, sixty seconds. Your hand or theirs, you pick." },
  { kind: "dare", audience: "him", tier: 2, text: "Get her close. Stop. Kiss her. Make her wait." },
  { kind: "dare", audience: "her", tier: 2, text: "Get him close, stop, and make him ask." },
  { kind: "dare", audience: "her", tier: 2, text: "Kiss and use your mouth on his chest, stomach and thighs for two minutes. No further until he says." },
  {
    kind: "dare", audience: "both", tier: 2,
    text: "One photo. Whoever's in it picks the shot and the phone. It gets deleted together before the night ends — or it doesn't get taken.",
  },

  // ─── TIER 3 · DEEP ─────────────────────────────────────────────────
  // Mid-scene truths. Short by design — nobody answers a paragraph-length
  // question at this point in the night. One breath each.
  { kind: "truth", audience: "both", tier: 3, text: "Right now. What do you want more of?" },
  { kind: "truth", audience: "both", tier: 3, text: "What were you hoping I'd do tonight that I haven't yet?" },
  { kind: "truth", audience: "both", tier: 3, text: "What's going through your head right now?" },
  { kind: "truth", audience: "both", tier: 3, text: "Is there something you're close to asking for? Ask it." },
  { kind: "truth", audience: "both", tier: 3, text: "More, or slower? Tell me the true answer, not the generous one." },
  { kind: "truth", audience: "both", tier: 3, text: "How close are we to the thing you'd want me to stop at?" },
  { kind: "truth", audience: "both", tier: 3, text: "What do you want to still be thinking about tomorrow?" },
  { kind: "truth", audience: "him", tier: 3, text: "What's the thing you're not saying because you think it's too much?" },
  { kind: "truth", audience: "her", tier: 3, text: "What do you want to hear right now? Say the exact words." },

  {
    kind: "dare", audience: "her", tier: 3,
    text: "For the next ten minutes, ask for every single thing you want. Nothing happens unless you ask for it.",
  },
  { kind: "dare", audience: "him", tier: 3, text: "Make her ask out loud, in full sentences, before you fuck her." },
  { kind: "dare", audience: "him", tier: 3, text: "Edge her twice. She asks properly before there's a third." },
  { kind: "dare", audience: "him", tier: 3, text: "Hand on her throat. She doesn't come until you say she can." },
  { kind: "dare", audience: "her", tier: 3, text: "Sit on his face and stay there until he's finished with you." },
  { kind: "dare", audience: "her", tier: 3, text: "Ride his mouth slowly while he holds your hips exactly where he wants them." },
  { kind: "dare", audience: "her", tier: 3, text: "Use only your mouth on him until he tells you to stop." },
  { kind: "dare", audience: "her", tier: 3, text: "Stay on your knees and ask for the next thing you want." },
  { kind: "dare", audience: "him", tier: 3, text: "Feed her your cock with her head off the edge of the bed. Slow. Watch her the whole time." },
  { kind: "dare", audience: "him", tier: 3, text: "Bend her over and make her wait sixty seconds without looking back." },
  { kind: "dare", audience: "him", tier: 3, text: "Fuck her from behind with your fist in her hair, telling her she's a good girl the whole time." },
  { kind: "dare", audience: "him", tier: 3, text: "Face down, ass up, your hand on the back of her neck while you fuck her." },
  { kind: "dare", audience: "him", tier: 3, text: "Three to five spanks, counted out loud. She says thank you at the end." },
  { kind: "dare", audience: "both", tier: 3, text: "Nothing between her legs for the next three cards." },
  { kind: "dare", audience: "him", tier: 3, text: "Tell her exactly what she earned it for, then fuck her." },

  // ─── TIER 4 · CLOSE ────────────────────────────────────────────────
  // The part your original deck was missing entirely.
  { kind: "close", audience: "both", tier: 4, text: "Stay touching for five minutes. No phones, no getting up, no tidying." },
  { kind: "close", audience: "both", tier: 4, text: "Each name one thing from tonight you want again." },
  { kind: "close", audience: "both", tier: 4, text: "Each name one thing that landed better than you expected — and one thing that was closer to the edge than you let on." },
  { kind: "close", audience: "him", tier: 4, text: "Tell her what you were thinking while you were watching her." },
  { kind: "close", audience: "her", tier: 4, text: "Tell him what you were thinking while he was watching you." },
  { kind: "close", audience: "both", tier: 4, text: "If either of you used the stop word tonight, talk about it now — and thank them for using it." },
  { kind: "close", audience: "both", tier: 4, text: "Handle the photos the way you agreed at the start. Now, not tomorrow." },
  { kind: "close", audience: "both", tier: 4, text: "Say one thing you're grateful for about them that has nothing to do with sex." },
];

export const HEAT_DECK = buildDeck(RAW, "heat");
