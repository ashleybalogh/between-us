import { buildDeck, type RawCard } from "@/lib/cards";

const RAW: RawCard[] = [
  // ─── TIER 0 · SETUP ────────────────────────────────────────────────
  { kind: "setup", audience: "both", tier: 0, text: "Phones face down and out of reach. Not on silent — out of reach." },
  { kind: "setup", audience: "both", tier: 0, text: "Either of you can pass on any card, once, with no reason given. A pass isn't a loss." },
  { kind: "setup", audience: "both", tier: 0, text: "Whoever answers second doesn't get to shorten their answer just because the first one was long." },

  // ─── TIER 1 · WARM ─────────────────────────────────────────────────
  { kind: "truth", audience: "both", tier: 1, text: "What's the best thing that happened to you this month that I don't know about?" },
  { kind: "truth", audience: "both", tier: 1, text: "Walk me through a completely free Tuesday. No obligations, no travel. What do you actually do with it?" },
  { kind: "truth", audience: "both", tier: 1, text: "What were you certain about at twenty that you'd argue against now?" },
  { kind: "truth", audience: "both", tier: 1, text: "Which of your parents are you more like, and how do you feel about that?" },
  { kind: "truth", audience: "both", tier: 1, text: "What's a small luxury you'd defend to the death?" },
  { kind: "truth", audience: "both", tier: 1, text: "What did you want to be at ten years old, and what did you like about it?" },
  { kind: "truth", audience: "both", tier: 1, text: "What are you noticeably better at than you were five years ago?" },
  { kind: "truth", audience: "both", tier: 1, text: "What's a song, smell, or food that drops you straight into a specific year of your life? Which year?" },
  { kind: "truth", audience: "both", tier: 1, text: "What's something you find beautiful that most people walk right past?" },
  { kind: "truth", audience: "both", tier: 1, text: "If it took one month instead of ten years, what would you learn?" },
  { kind: "truth", audience: "both", tier: 1, text: "What's the last thing that made you laugh so hard you couldn't get words out?" },
  { kind: "truth", audience: "both", tier: 1, text: "Where do you want to go next, and what's the first thing you'd do when you got there?" },

  { kind: "gratitude", audience: "both", tier: 1, text: "Name one thing they did this week that made your life easier. Say specifically what it saved you." },
  { kind: "gratitude", audience: "both", tier: 1, text: "Thank them for something they do so reliably that you've stopped noticing it." },

  { kind: "dare", audience: "both", tier: 1, text: "Hold eye contact for thirty seconds. No talking, no laughing it off." },
  { kind: "dare", audience: "both", tier: 1, text: "Tell them three things you noticed about them today. Not compliments — observations." },
  { kind: "dare", audience: "both", tier: 1, text: "Play a song that reminds you of them. Say why before it ends." },
  { kind: "dare", audience: "both", tier: 1, text: "Sit back to back. Each name one thing you're glad happened this week." },
  { kind: "dare", audience: "both", tier: 1, text: "Two-minute shoulder rub. Ask twice whether the pressure is right, and change it when they answer." },
  { kind: "dare", audience: "both", tier: 1, text: "Trace a word on their palm. They guess it." },
  { kind: "dare", audience: "both", tier: 1, text: "Describe them to an imaginary stranger in three sentences. Out loud, right now." },
  { kind: "dare", audience: "both", tier: 1, text: "Show them the photo on your phone that feels most like the two of you, and say what's in it that you love." },

  // ─── TIER 2 · OPEN ─────────────────────────────────────────────────
  {
    kind: "truth", audience: "both", tier: 2,
    text: "When in the last year were you most proud of yourself? Did I know at the time?",
    followUp: "Listener: if you didn't know, say what you'd have done differently if you had.",
  },
  { kind: "truth", audience: "both", tier: 2, text: "What do you need more of from me this month? Be concrete enough that I could start tomorrow." , followUp: "Listener: repeat back what you heard, in your own words, before you answer yours." },
  { kind: "truth", audience: "both", tier: 2, text: "What's a question you've wanted to ask me and haven't? Ask it now." },
  { kind: "truth", audience: "both", tier: 2, text: "When do you feel most like yourself with me? When do you feel least?" },
  { kind: "truth", audience: "both", tier: 2, text: "What's something you want for yourself that has nothing to do with me or anyone else in this house?" },
  { kind: "truth", audience: "both", tier: 2, text: "What's a way you'd like to be taken care of that you never actually ask for?" },
  { kind: "truth", audience: "both", tier: 2, text: "What's a moment recently when you wanted me closer and didn't say so?" },
  { kind: "truth", audience: "both", tier: 2, text: "What do you think I get wrong about you?", followUp: "Listener: your only line here is \"tell me more.\" No defending, no correcting." },
  { kind: "truth", audience: "both", tier: 2, text: "What's something about your life you assumed would be settled by now?" },
  { kind: "truth", audience: "both", tier: 2, text: "What's a decision we made together that you'd make differently now?" },
  { kind: "truth", audience: "both", tier: 2, text: "What have you changed your mind about since we got together?" },
  { kind: "truth", audience: "both", tier: 2, text: "What's a habit of mine you'd quietly like less of?", followUp: "Listener: say thank you. That's the whole response. You can come back to it tomorrow." },
  { kind: "truth", audience: "him", tier: 2, text: "What's something she does that you find more attractive than she has any idea about?" },
  { kind: "truth", audience: "her", tier: 2, text: "What's a moment he thought was nothing that actually mattered a lot to you?" },

  { kind: "gratitude", audience: "both", tier: 2, text: "Tell them about a time you were proud of them and never said so." },
  { kind: "gratitude", audience: "both", tier: 2, text: "Name something they gave up for this family. Say that you know it cost them." },

  { kind: "dare", audience: "both", tier: 2, text: "Plan something on the spot that neither of you has ever done. Put an actual date on it before the next card." },
  { kind: "dare", audience: "both", tier: 2, text: "Whatever you just planned — book it, message someone about it, or set the reminder now. Out loud, so the other one hears it happen." },
  { kind: "dare", audience: "both", tier: 2, text: "Ask for something you want tonight. Plainly. No hedging, no joke at the end of the sentence." },
  { kind: "dare", audience: "both", tier: 2, text: "Show them with your hands exactly how you like to be held. Then hold them their way." },
  { kind: "dare", audience: "both", tier: 2, text: "Kiss them the way you would if you'd just met and weren't sure you were allowed." },
  { kind: "dare", audience: "both", tier: 2, text: "Slow-dance to one full song in this room. All the way to the end of the track." },
  { kind: "dare", audience: "both", tier: 2, text: "Whisper the thing you've been thinking all week and not saying." },
  { kind: "dare", audience: "him", tier: 2, text: "Take her hand, stand up, and tell her why you stay." },
  { kind: "dare", audience: "her", tier: 2, text: "Take his face in your hands and tell him one thing you're proud of him for." },

  // ─── TIER 3 · DEEP ─────────────────────────────────────────────────
  { kind: "truth", audience: "both", tier: 3, text: "What's a fear about us you've never said out loud?" },
  { kind: "truth", audience: "both", tier: 3, text: "What do you want the next ten years to feel like? Not look like — feel like." },
  { kind: "truth", audience: "both", tier: 3, text: "If I could understand one thing about your past that I don't, what should it be?" },
  { kind: "truth", audience: "both", tier: 3, text: "What's the closest you've come to giving up on something that mattered? What kept you in it?" },
  { kind: "truth", audience: "both", tier: 3, text: "What's the hardest thing you've ever forgiven me for?" },
  { kind: "truth", audience: "both", tier: 3, text: "What do you think I'd name as the hardest thing I've forgiven you for? Guess first, then I'll tell you." },
  { kind: "truth", audience: "both", tier: 3, text: "Tell me about a time you felt completely safe with me. What made it that?" },
  { kind: "truth", audience: "both", tier: 3, text: "What's something you've wanted forgiveness for and never asked for?" },
  { kind: "truth", audience: "both", tier: 3, text: "Where are we strongest right now, and where are we coasting?" },
  { kind: "truth", audience: "both", tier: 3, text: "What do you hope the people who love you say about you when you're not in the room?" },
  { kind: "truth", audience: "both", tier: 3, text: "What would you want me to know if we couldn't speak for a year?" },
  { kind: "truth", audience: "both", tier: 3, text: "What are you afraid of becoming?" },
  {
    kind: "truth", audience: "both", tier: 3,
    text: "Tell me something that's weighing on you and ask what I'd do about it.",
    followUp: "Listener: before you give advice, tell them how they seem to be feeling about it. Get that right first.",
  },

  { kind: "dare", audience: "both", tier: 3, text: "Hold their face and say the thing you're most afraid is too much to say." },
  { kind: "dare", audience: "both", tier: 3, text: "Say the sentence you'd say if you had one minute left. Both of you." },
  { kind: "dare", audience: "her", tier: 3, text: "Put his hand over your heart and say one sentence you completely mean." },
  { kind: "dare", audience: "both", tier: 3, text: "Say out loud the thing you've been avoiding saying. Then stop talking and let it sit." },
  { kind: "dare", audience: "both", tier: 3, text: "Apologise properly for something you never properly apologised for." },
  { kind: "dare", audience: "both", tier: 3, text: "Tell them the version of your future you're actually afraid of. Not the tidy one." },
  { kind: "dare", audience: "both", tier: 3, text: "Name one thing you've been carrying alone. Ask them to carry part of it, specifically." },
  { kind: "dare", audience: "both", tier: 3, text: "Tell them what you were like before them, honestly, including the part you're not proud of." },
  { kind: "dare", audience: "both", tier: 3, text: "Ask them for something you've assumed you weren't allowed to ask for." },
  { kind: "dare", audience: "him", tier: 3, text: "Tell her the thing you've never said because you thought it would worry her." },
  { kind: "dare", audience: "her", tier: 3, text: "Tell him what you need from him that you've been handling by yourself instead." },

  // ─── TIER 4 · CLOSE ────────────────────────────────────────────────
  { kind: "close", audience: "both", tier: 4, text: "Each name one moment from tonight you'll still be thinking about tomorrow." },
  { kind: "close", audience: "both", tier: 4, text: "Tell them one thing you learned about them tonight that you didn't know this morning." },
  { kind: "close", audience: "both", tier: 4, text: "One thing each of you is going to actually do differently this week because of something said tonight." },
  { kind: "close", audience: "both", tier: 4, text: "Say out loud what you want to happen next." },
  { kind: "close", audience: "both", tier: 4, text: "Lie down and stay touching for five minutes. Phones stay where they are." },
];

export const CONNECTION_DECK = buildDeck(RAW, "connection");
