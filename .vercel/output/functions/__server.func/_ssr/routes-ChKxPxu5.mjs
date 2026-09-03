import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-ChKxPxu5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,box-shadow,color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] select-none", {
	variants: {
		variant: {
			solid: "bg-accent text-accent-fg shadow-[var(--shadow-border)] hover:opacity-95",
			outline: "bg-transparent text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] hover:bg-raised/60",
			ghost: "bg-transparent text-muted hover:text-fg hover:bg-raised/70",
			danger: "bg-transparent text-muted shadow-[var(--shadow-border)] hover:text-fg"
		},
		size: {
			sm: "h-10 rounded-md px-3.5 text-sm",
			md: "h-12 rounded-lg px-5 text-sm",
			lg: "h-14 rounded-xl px-6 text-base",
			xl: "h-16 rounded-xl px-6 text-base tracking-wide"
		}
	},
	defaultVariants: {
		variant: "solid",
		size: "md"
	}
});
function Button({ className, variant, size, asChild = false, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		type: asChild ? void 0 : type,
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("w-full min-h-48 resize-y rounded-lg bg-raised px-4 py-3.5 text-sm leading-relaxed text-fg placeholder:text-faint shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:shadow-[var(--shadow-border-hover)]", className),
		...props
	});
}
var KIND_WORDS = {
	truth: "truth",
	truths: "truth",
	t: "truth",
	dare: "dare",
	dares: "dare",
	d: "dare"
};
var AUDIENCE_WORDS = {
	him: "him",
	his: "him",
	her: "her",
	hers: "her",
	both: "both"
};
function slugId(kind, audience, text, index) {
	return `${`${kind}-${audience}-${text}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48)}-${index}`;
}
function cleanPrompt(raw) {
	return raw.replace(/^[\s>*-]+/, "").replace(/^\d+[.)]\s+/, "").replace(/^["“”']+|["“”']+$/g, "").trim();
}
function parseHeading(line) {
	const stripped = line.replace(/^#+\s*/, "").replace(/[:\-–—]+$/, "").trim();
	if (!stripped) return null;
	const parts = stripped.toLowerCase().split(/\s+/);
	if (parts.length === 0 || parts.length > 3) return null;
	let audience = "both";
	let kindToken = parts[0];
	if (parts.length >= 2 && parts[0] && parts[0] in AUDIENCE_WORDS) {
		audience = AUDIENCE_WORDS[parts[0]] ?? "both";
		kindToken = parts[1] ?? "";
	}
	const kind = KIND_WORDS[kindToken ?? ""];
	if (!kind) return null;
	if (parts.length === 3) return null;
	return {
		kind,
		audience
	};
}
function parsePrefixedLine(line) {
	const pipe = line.split("|").map((part) => part.trim());
	if (pipe.length === 2 || pipe.length === 3) {
		if (pipe.length === 2) {
			const kind = KIND_WORDS[pipe[0]?.toLowerCase() ?? ""];
			const text = cleanPrompt(pipe[1] ?? "");
			if (kind && text) return {
				id: "tmp",
				kind,
				audience: "both",
				text
			};
		} else {
			const audience = AUDIENCE_WORDS[pipe[0]?.toLowerCase() ?? ""];
			const kind = KIND_WORDS[pipe[1]?.toLowerCase() ?? ""];
			const text = cleanPrompt(pipe[2] ?? "");
			if (audience && kind && text) return {
				id: "tmp",
				kind,
				audience,
				text
			};
		}
	}
	const match = line.match(/^(?:\[)?\s*(him|her|his|hers|both)?\s*(truths?|dares?|t|d)\s*(?:\])?\s*[:\-–—]\s+(.+)$/i);
	if (!match) return null;
	const audience = match[1] ? AUDIENCE_WORDS[match[1].toLowerCase()] ?? "both" : "both";
	const kind = KIND_WORDS[match[2]?.toLowerCase() ?? ""];
	const text = cleanPrompt(match[3] ?? "");
	if (!kind || !text) return null;
	return {
		id: "tmp",
		kind,
		audience,
		text
	};
}
function fromUnknown(value, sink) {
	if (!value || typeof value !== "object") return;
	const row = value;
	const text = cleanPrompt(String(row.text ?? row.prompt ?? row.card ?? ""));
	if (!text) return;
	const kind = KIND_WORDS[String(row.kind ?? row.type ?? "").toLowerCase()];
	if (!kind) return;
	const audience = AUDIENCE_WORDS[String(row.audience ?? row.for ?? row.player ?? "both").toLowerCase()] ?? "both";
	sink.push({
		id: "tmp",
		kind,
		audience,
		text
	});
}
function parseJsonDeck(input) {
	const trimmed = input.trim();
	if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
	try {
		const data = JSON.parse(trimmed);
		const cards = [];
		if (Array.isArray(data)) for (const item of data) {
			if (typeof item === "string") continue;
			fromUnknown(item, cards);
		}
		else if (data && typeof data === "object") {
			const obj = data;
			if (Array.isArray(obj.cards)) for (const item of obj.cards) fromUnknown(item, cards);
			if (Array.isArray(obj.truths)) for (const item of obj.truths) if (typeof item === "string") {
				const text = cleanPrompt(item);
				if (text) cards.push({
					id: "tmp",
					kind: "truth",
					audience: "both",
					text
				});
			} else fromUnknown({
				...item,
				kind: "truth"
			}, cards);
			if (Array.isArray(obj.dares)) for (const item of obj.dares) if (typeof item === "string") {
				const text = cleanPrompt(item);
				if (text) cards.push({
					id: "tmp",
					kind: "dare",
					audience: "both",
					text
				});
			} else fromUnknown({
				...item,
				kind: "dare"
			}, cards);
		}
		return cards.length ? cards : [];
	} catch {
		return null;
	}
}
function parseDeck(input) {
	const jsonCards = parseJsonDeck(input);
	if (jsonCards) return {
		cards: finalizeCards(jsonCards),
		errors: jsonCards.length ? [] : ["No cards found in that JSON."]
	};
	const errors = [];
	const draft = [];
	let context = {
		kind: "truth",
		audience: "both"
	};
	for (const rawLine of input.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line) continue;
		if (line.startsWith("//")) continue;
		const heading = parseHeading(line);
		if (heading) {
			context = heading;
			continue;
		}
		const prefixed = parsePrefixedLine(line);
		if (prefixed) {
			draft.push(prefixed);
			continue;
		}
		if (line.startsWith("#")) continue;
		const text = cleanPrompt(line);
		if (!text) continue;
		draft.push({
			id: "tmp",
			kind: context.kind,
			audience: context.audience,
			text
		});
	}
	const cards = finalizeCards(draft);
	if (!cards.length) errors.push("No cards found. Start a section with TRUTH or DARE, then one prompt per line.");
	return {
		cards,
		errors
	};
}
function finalizeCards(draft) {
	const seen = /* @__PURE__ */ new Set();
	const cards = [];
	draft.forEach((card, index) => {
		const text = cleanPrompt(card.text);
		if (!text) return;
		const key = `${card.kind}|${card.audience}|${text.toLowerCase()}`;
		if (seen.has(key)) return;
		seen.add(key);
		cards.push({
			id: slugId(card.kind, card.audience, text, index),
			kind: card.kind,
			audience: card.audience,
			text
		});
	});
	return cards;
}
function serializeDeck(cards) {
	const groups = [
		{
			title: "TRUTH",
			match: (card) => card.kind === "truth" && card.audience === "both"
		},
		{
			title: "DARE",
			match: (card) => card.kind === "dare" && card.audience === "both"
		},
		{
			title: "HIM TRUTH",
			match: (card) => card.kind === "truth" && card.audience === "him"
		},
		{
			title: "HER TRUTH",
			match: (card) => card.kind === "truth" && card.audience === "her"
		},
		{
			title: "HIM DARE",
			match: (card) => card.kind === "dare" && card.audience === "him"
		},
		{
			title: "HER DARE",
			match: (card) => card.kind === "dare" && card.audience === "her"
		}
	];
	const blocks = [];
	for (const group of groups) {
		const rows = cards.filter(group.match).map((card) => card.text);
		if (!rows.length) continue;
		blocks.push(`${group.title}\n${rows.join("\n")}`);
	}
	return blocks.join("\n\n");
}
function shuffle(items) {
	const next = [...items];
	for (let i = next.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		const a = next[i];
		const b = next[j];
		if (a === void 0 || b === void 0) continue;
		next[i] = b;
		next[j] = a;
	}
	return next;
}
function matchingIds(cards, remainingIds, kind, player) {
	const byId = new Map(cards.map((card) => [card.id, card]));
	return remainingIds.filter((id) => {
		const card = byId.get(id);
		if (!card) return false;
		if (card.kind !== kind) return false;
		return card.audience === "both" || card.audience === player;
	});
}
function drawCard(cards, remainingIds, kind, player) {
	const pool = matchingIds(cards, remainingIds, kind, player);
	if (!pool.length) return null;
	const [picked] = shuffle(pool);
	if (!picked) return null;
	const card = cards.find((item) => item.id === picked);
	if (!card) return null;
	return {
		card,
		remainingIds: remainingIds.filter((id) => id !== picked)
	};
}
function deckStats(cards) {
	return {
		total: cards.length,
		truths: cards.filter((card) => card.kind === "truth").length,
		dares: cards.filter((card) => card.kind === "dare").length,
		him: cards.filter((card) => card.audience === "him").length,
		her: cards.filter((card) => card.audience === "her").length,
		both: cards.filter((card) => card.audience === "both").length
	};
}
var DECK_FORMAT_EXAMPLE = `TRUTH
What's a memory of us you replay when you're alone?
When did you first know this was different?

DARE
Hold eye contact for thirty seconds without talking.
Kiss me the way you would if we had just met.

HIM TRUTH
Tell her the first thing you noticed about her that you still think about.

HER DARE
Take his face in your hands and tell him one thing you're proud of him for.`;
var STARTER_DECK = [
	{
		kind: "truth",
		audience: "both",
		text: "What's a memory of us you replay when you're alone?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What's something I do that you never want me to stop?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "When did you first know this was different?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What's a fear you still haven't said out loud to me?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What do I do that makes you feel the most loved?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What's a small thing about me you noticed before I knew you were looking?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "If we had a whole free day with no phones, how would you spend it?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What's a compliment you've thought but never said?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What part of our ordinary life do you secretly love most?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What's something you want us to be braver about?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "When was the last time I surprised you?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What's a habit of mine you find quietly charming?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What would you want me to know if we couldn't talk for a month?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What's a dream of yours I don't ask about enough?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What's the kindest thing I've ever done that I probably forgot?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What do you need more of from me this month?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What's a song that feels like us, and why?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What's something from your past you wish I understood better?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "If you could relive one day of ours, which would you pick?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What's a version of us five years from now that you can actually see?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What do you pretend doesn't bother you?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "When do you feel most like yourself with me?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What's a question you've been afraid to ask me?"
	},
	{
		kind: "truth",
		audience: "both",
		text: "What's one thing you want us to start doing together?"
	},
	{
		kind: "dare",
		audience: "both",
		text: "Hold eye contact for thirty seconds without talking."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Tell me three things you like about my face, slowly."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Put on a song and slow-dance in this room for one track."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Kiss me the way you would if we had just met."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Write me a two-sentence note on your phone and read it aloud."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Let me pick your next photo pose and take it."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Describe our first date as if you were bragging to a stranger."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Give me a twenty-second shoulder massage."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Whisper a secret you've never told anyone else."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Let me style your hair however I want until the next round."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Count down from ten and kiss me at one."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Say something you want, in the most sincere voice you can manage."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Make up a nickname for me and use it until the game ends."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Sit back-to-back and tell me one thing you're grateful for."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Let me trace a letter on your palm. Guess what it is."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Hold my hand and tell me a plan for tomorrow."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Show me the photo on your phone that feels most like us."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Do my best impression, then tell me what you actually like about that habit."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Lean in and tell me one thing you noticed about me today."
	},
	{
		kind: "dare",
		audience: "both",
		text: "Set a thirty-second timer and talk only in compliments until it ends."
	},
	{
		kind: "truth",
		audience: "him",
		text: "Tell her the first thing you noticed about her that you still think about."
	},
	{
		kind: "truth",
		audience: "him",
		text: "What's something she does that you find more attractive than she realizes?"
	},
	{
		kind: "truth",
		audience: "her",
		text: "Tell him a moment he thought was small that actually meant a lot."
	},
	{
		kind: "truth",
		audience: "her",
		text: "What's something he does that makes you feel chosen?"
	},
	{
		kind: "dare",
		audience: "him",
		text: "Stand up, take her hand, and tell her why you stay."
	},
	{
		kind: "dare",
		audience: "him",
		text: "Kiss her forehead, then her cheek, then wait for her to ask for the next."
	},
	{
		kind: "dare",
		audience: "her",
		text: "Take his face in your hands and tell him one thing you're proud of him for."
	},
	{
		kind: "dare",
		audience: "her",
		text: "Put his hand over your heart and say one sentence you mean."
	}
].map((card, index) => ({
	...card,
	id: `starter-${card.kind}-${card.audience}-${index}`
}));
var SAVE_VERSION = 1;
function otherPlayer(player) {
	return player === "him" ? "her" : "him";
}
function freshGame(cards) {
	return {
		phase: "choose",
		turn: Math.random() < .5 ? "him" : "her",
		himPass: true,
		herPass: true,
		cards,
		remainingIds: shuffle(cards.map((card) => card.id)),
		current: null,
		emptyKind: null,
		history: []
	};
}
var useGameStore = create()(persist((set, get) => ({
	hydrated: false,
	screen: "home",
	names: {
		him: "Him",
		her: "Her"
	},
	customCards: null,
	game: null,
	setHydrated: (value) => set({ hydrated: value }),
	setScreen: (screen) => set({ screen }),
	setName: (player, name) => set((state) => ({ names: {
		...state.names,
		[player]: name.slice(0, 18)
	} })),
	activeDeck: () => get().customCards ?? STARTER_DECK,
	setCustomCards: (cards) => set({ customCards: cards }),
	startGame: () => {
		const deck = get().activeDeck();
		if (!deck.length) return;
		set({
			game: freshGame(deck),
			screen: "play"
		});
	},
	pickKind: (kind) => {
		const game = get().game;
		if (!game || game.phase === "over") return "empty";
		const drawn = drawCard(game.cards, game.remainingIds, kind, game.turn);
		if (!drawn) {
			set({ game: {
				...game,
				phase: "empty",
				emptyKind: kind,
				current: null
			} });
			return "empty";
		}
		set({ game: {
			...game,
			phase: "reveal",
			current: drawn.card,
			remainingIds: drawn.remainingIds,
			emptyKind: null
		} });
		return "ok";
	},
	completeCard: () => {
		const game = get().game;
		if (!game?.current) return;
		const entry = {
			player: game.turn,
			kind: game.current.kind,
			cardId: game.current.id,
			text: game.current.text,
			action: "done"
		};
		const remainingPlayable = game.remainingIds.some((id) => {
			const card = game.cards.find((item) => item.id === id);
			return Boolean(card);
		});
		set({ game: {
			...game,
			phase: remainingPlayable ? "choose" : "over",
			turn: otherPlayer(game.turn),
			current: null,
			emptyKind: null,
			history: [...game.history, entry]
		} });
	},
	passCard: () => {
		const game = get().game;
		if (!game?.current) return "spent";
		if (!(game.turn === "him" ? game.himPass : game.herPass)) return "spent";
		const entry = {
			player: game.turn,
			kind: game.current.kind,
			cardId: game.current.id,
			text: game.current.text,
			action: "pass"
		};
		set({ game: {
			...game,
			phase: "choose",
			turn: otherPlayer(game.turn),
			current: null,
			emptyKind: null,
			himPass: game.turn === "him" ? false : game.himPass,
			herPass: game.turn === "her" ? false : game.herPass,
			history: [...game.history, entry]
		} });
		return "ok";
	},
	reshuffleKind: (kind) => {
		const game = get().game;
		if (!game) return;
		const used = new Set(game.history.map((entry) => entry.cardId));
		const extras = game.cards.filter((card) => card.kind === kind && !used.has(card.id) && !game.remainingIds.includes(card.id)).map((card) => card.id);
		const kindIds = game.cards.filter((card) => card.kind === kind).map((card) => card.id);
		const withoutKind = game.remainingIds.filter((id) => {
			return game.cards.find((item) => item.id === id)?.kind !== kind;
		});
		const restock = kindIds.length ? shuffle(kindIds) : extras;
		set({ game: {
			...game,
			remainingIds: [...withoutKind, ...restock],
			phase: "choose",
			current: null,
			emptyKind: null
		} });
	},
	endGame: () => {
		const game = get().game;
		if (!game) {
			set({ screen: "home" });
			return;
		}
		set({
			game: {
				...game,
				phase: "over",
				current: null
			},
			screen: "play"
		});
	},
	continueHome: () => set({ screen: "home" })
}), {
	name: "between-us-v1",
	version: SAVE_VERSION,
	partialize: (state) => ({
		names: state.names,
		customCards: state.customCards,
		game: state.game,
		screen: state.screen === "play" ? "play" : "home"
	}),
	onRehydrateStorage: () => (state) => {
		state?.setHydrated(true);
	}
}));
function displayName(names, player) {
	const value = names[player].trim();
	if (value) return value;
	return player === "him" ? "Him" : "Her";
}
function possess(names, player) {
	const name = displayName(names, player);
	if (name.toLowerCase() === "him") return "His";
	if (name.toLowerCase() === "her") return "Her";
	return name.endsWith("s") ? `${name}'` : `${name}'s`;
}
function DeckView() {
	const customCards = useGameStore((state) => state.customCards);
	const setCustomCards = useGameStore((state) => state.setCustomCards);
	const setScreen = useGameStore((state) => state.setScreen);
	const active = customCards ?? STARTER_DECK;
	const [draft, setDraft] = (0, import_react.useState)(() => serializeDeck(active));
	const [message, setMessage] = (0, import_react.useState)(null);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const preview = (0, import_react.useMemo)(() => parseDeck(draft), [draft]);
	const stats = deckStats(active);
	const previewStats = deckStats(preview.cards);
	const usingCustom = Boolean(customCards);
	function loadDeck() {
		if (!preview.cards.length) {
			setMessage(preview.errors[0] ?? "Nothing to load.");
			return;
		}
		setCustomCards(preview.cards);
		setMessage(`Loaded ${preview.cards.length} cards. They shuffle in the next game.`);
	}
	function restoreStarter() {
		setCustomCards(null);
		const text = serializeDeck(STARTER_DECK);
		setDraft(text);
		setMessage("Starter deck restored.");
	}
	async function copyDeck() {
		try {
			await navigator.clipboard.writeText(serializeDeck(active));
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1600);
		} catch {
			setMessage("Clipboard is blocked on this device. Select the text and copy it.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex w-full max-w-md flex-1 flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-center justify-between",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setScreen("home"),
							className: "h-11 px-1 text-sm text-muted transition-colors duration-[var(--motion-quick)] hover:text-fg",
							children: "Back"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium uppercase tracking-[0.22em] text-muted",
							children: "Deck"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-12" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-4xl italic text-fg",
							children: "Your cards"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-muted",
							children: "Paste a list anytime. Headings pick the pile: TRUTH, DARE, HIM TRUTH, HER DARE. One prompt per line. JSON works too."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm tabular-nums text-fg",
							children: [
								stats.total,
								" in play · ",
								stats.truths,
								" truth · ",
								stats.dares,
								" dare",
								usingCustom ? " · custom" : " · starter"
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex min-h-0 flex-1 flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: draft,
						onChange: (event) => {
							setDraft(event.target.value);
							setMessage(null);
						},
						spellCheck: false,
						className: "min-h-64 flex-1 font-sans",
						"aria-label": "Card list",
						placeholder: DECK_FORMAT_EXAMPLE
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs tabular-nums text-faint",
						children: [
							"Preview ",
							previewStats.total,
							" cards",
							preview.errors[0] ? ` · ${preview.errors[0]}` : ""
						]
					})]
				}),
				message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: message
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						className: "w-full",
						onClick: loadDeck,
						children: "Load into game"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: copyDeck,
							children: copied ? "Copied" : "Copy"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: restoreStarter,
							children: "Starter"
						})]
					})]
				})
			]
		})
	});
}
function NameField({ player }) {
	const value = useGameStore((state) => state.names[player]);
	const setName = useGameStore((state) => state.setName);
	const label = player === "him" ? "Him" : "Her";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex min-w-0 flex-1 flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] font-medium uppercase tracking-[0.22em] text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			value,
			maxLength: 18,
			autoCapitalize: "words",
			autoComplete: "off",
			spellCheck: false,
			onChange: (event) => setName(player, event.target.value),
			className: "h-12 w-full rounded-lg bg-raised px-3 text-center text-sm text-fg shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] placeholder:text-faint focus-visible:shadow-[var(--shadow-border-hover)]",
			placeholder: label,
			"aria-label": `${label}'s name`
		})]
	});
}
function HomeView() {
	const game = useGameStore((state) => state.game);
	const names = useGameStore((state) => state.names);
	const startGame = useGameStore((state) => state.startGame);
	const setScreen = useGameStore((state) => state.setScreen);
	const inProgress = Boolean(game && game.phase !== "over");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "stagger-in mx-auto flex w-full max-w-md flex-1 flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "pt-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium uppercase tracking-[0.32em] text-muted",
							children: "Two players"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display mt-5 text-6xl italic leading-none tracking-tight text-fg",
							children: "Between Us"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-5 max-w-xs text-sm leading-relaxed text-muted",
							children: "A private truth or dare deck. One pass each. Your cards, if you bring them."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-12 flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NameField, { player: "him" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NameField, { player: "her" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-auto flex flex-col gap-3 pt-12",
					children: [
						inProgress && game ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "xl",
							className: "w-full",
							onClick: () => setScreen("play"),
							children: ["Continue · ", displayName(names, game.turn)]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "xl",
							variant: inProgress ? "outline" : "solid",
							className: "w-full",
							onClick: startGame,
							children: inProgress ? "New game" : "Play"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "md",
							variant: "ghost",
							className: "w-full",
							onClick: () => setScreen("deck"),
							children: "Deck"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-8 space-y-2 pb-4 text-center text-sm leading-relaxed text-faint",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Turns alternate. Draw truth or dare." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Each player holds one pass for the whole game." })]
				})
			]
		})
	});
}
function PlayingCard({ card, kind, flipped, playerLabel }) {
	const shownKind = card?.kind ?? kind ?? "truth";
	const [entered, setEntered] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const frame = requestAnimationFrame(() => setEntered(true));
		return () => cancelAnimationFrame(frame);
	}, [card?.id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("playing-scene w-full max-w-xs mx-auto", flipped && entered && "is-flipped"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "playing-plane",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "playing-face playing-back p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "playing-face-inner px-6 py-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xs font-medium uppercase tracking-mark text-muted",
							children: "Between Us"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-5xl italic text-fg",
								children: "us"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-10 bg-border-strong" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xs uppercase tracking-widest text-faint",
							children: "Private deck"
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "playing-face playing-front p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "playing-face-inner px-6 py-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xs font-medium uppercase tracking-mark text-card-muted",
								children: shownKind
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xs font-medium uppercase tracking-widest text-card-muted",
								children: playerLabel
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display my-auto text-center text-card-prompt leading-snug italic text-card-fg",
							children: card?.text ?? "Choose truth or dare."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-2xs uppercase tracking-widest text-card-muted",
							children: "Between Us"
						})
					]
				})
			})]
		})
	});
}
function tap(ms = 12) {
	try {
		navigator.vibrate?.(ms);
	} catch {}
}
function PassTickets() {
	const game = useGameStore((state) => state.game);
	const names = useGameStore((state) => state.names);
	if (!game) return null;
	const tickets = [{
		id: "him",
		remaining: game.himPass
	}, {
		id: "her",
		remaining: game.herPass
	}];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3",
		children: tickets.map((ticket) => {
			const active = game.turn === ticket.id && game.phase !== "over";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("pass-ticket rounded-lg px-3 py-3 transition-[opacity,box-shadow] duration-[var(--motion-fast)] ease-[var(--ease-out)]", active ? "bg-raised" : "bg-transparent", !ticket.remaining && "opacity-40"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] font-medium uppercase tracking-[0.2em] text-muted",
					children: displayName(names, ticket.id)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-fg",
					children: ticket.remaining ? "Pass still in hand" : "Pass spent"
				})]
			}, ticket.id);
		})
	});
}
function KindButton({ kind, disabled, remaining, onPick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		disabled,
		onClick: () => onPick(kind),
		className: "flex min-h-24 flex-1 flex-col items-center justify-center rounded-xl bg-raised px-4 py-5 shadow-[var(--shadow-border)] transition-[transform,box-shadow,opacity] duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:shadow-[var(--shadow-border-hover)] active:not-disabled:scale-[0.96] disabled:opacity-40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-display text-3xl italic leading-none text-fg",
			children: kind
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "mt-2 text-[11px] uppercase tracking-[0.18em] text-muted tabular-nums",
			children: [remaining, " left"]
		})]
	});
}
function PlayView() {
	const game = useGameStore((state) => state.game);
	const names = useGameStore((state) => state.names);
	const pickKind = useGameStore((state) => state.pickKind);
	const completeCard = useGameStore((state) => state.completeCard);
	const passCard = useGameStore((state) => state.passCard);
	const reshuffleKind = useGameStore((state) => state.reshuffleKind);
	const endGame = useGameStore((state) => state.endGame);
	const startGame = useGameStore((state) => state.startGame);
	const setScreen = useGameStore((state) => state.setScreen);
	const [flipped, setFlipped] = (0, import_react.useState)(false);
	const [passNote, setPassNote] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (game?.phase !== "reveal" || !game.current) {
			setFlipped(false);
			return;
		}
		setFlipped(false);
		const timer = window.setTimeout(() => {
			setFlipped(true);
			tap(14);
		}, 160);
		return () => window.clearTimeout(timer);
	}, [game?.current?.id, game?.phase]);
	if (!game) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => setScreen("home"),
			children: "Back"
		})
	});
	const playerName = displayName(names, game.turn);
	const playerPossess = possess(names, game.turn);
	const canPass = game.turn === "him" ? game.himPass : game.herPass;
	const truthLeft = matchingIds(game.cards, game.remainingIds, "truth", game.turn).length;
	const dareLeft = matchingIds(game.cards, game.remainingIds, "dare", game.turn).length;
	function onPick(kind) {
		setPassNote(null);
		pickKind(kind);
	}
	function onPass() {
		if (passCard() === "spent") {
			setPassNote("That pass is already gone.");
			return;
		}
		tap(20);
		setPassNote(null);
	}
	function onDone() {
		tap(10);
		setPassNote(null);
		completeCard();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex w-full max-w-md flex-1 flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-center justify-between gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setScreen("home"),
							className: "h-11 px-1 text-sm text-muted transition-colors duration-[var(--motion-quick)] hover:text-fg",
							children: "Close"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium uppercase tracking-[0.22em] text-muted",
							children: game.phase === "over" ? "Game over" : `${playerPossess} turn`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: endGame,
							className: "h-11 px-1 text-sm text-muted transition-colors duration-[var(--motion-quick)] hover:text-fg",
							children: "End"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-1 flex-col pt-4",
					children: game.phase === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverPanel, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-center text-4xl italic leading-none text-fg",
							children: playerName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-center text-sm text-muted",
							children: [
								game.phase === "choose" && "Truth, dare, or sit this one out with a pass later.",
								game.phase === "reveal" && (game.current?.kind === "dare" ? "Do the thing." : "Answer honestly."),
								game.phase === "empty" && "That pile is empty."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-1 items-center py-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayingCard, {
								card: game.current,
								kind: game.current?.kind ?? game.emptyKind ?? void 0,
								flipped: game.phase === "reveal" && flipped,
								playerLabel: playerName
							})
						})
					] })
				}),
				game.phase === "choose" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindButton, {
							kind: "truth",
							remaining: truthLeft,
							disabled: !truthLeft,
							onPick
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindButton, {
							kind: "dare",
							remaining: dareLeft,
							disabled: !dareLeft,
							onPick
						})]
					}), !truthLeft && !dareLeft ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "w-full",
						onClick: () => reshuffleKind("truth"),
						children: "Reshuffle"
					}) : null]
				}) : null,
				game.phase === "reveal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [
						passNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-sm text-muted",
							children: passNote
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							className: "w-full",
							onClick: onDone,
							children: "Done"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							variant: "outline",
							className: "w-full",
							onClick: onPass,
							disabled: !canPass,
							children: canPass ? "Use pass" : "Pass already used"
						})
					]
				}) : null,
				game.phase === "empty" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "lg",
						className: "w-full",
						onClick: () => game.emptyKind && reshuffleKind(game.emptyKind),
						children: ["Reshuffle ", game.emptyKind ?? "deck"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						variant: "outline",
						className: "w-full",
						onClick: () => setScreen("home"),
						children: "Back"
					})]
				}) : null,
				game.phase === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						className: "w-full",
						onClick: startGame,
						children: "Play again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						variant: "outline",
						className: "w-full",
						onClick: () => setScreen("home"),
						children: "Home"
					})]
				}) : null,
				game.phase !== "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PassTickets, {})
				}) : null
			]
		})
	});
}
function OverPanel() {
	const game = useGameStore((state) => state.game);
	const names = useGameStore((state) => state.names);
	if (!game) return null;
	const done = game.history.filter((entry) => entry.action === "done").length;
	const himPassed = game.history.some((entry) => entry.player === "him" && entry.action === "pass");
	const herPassed = game.history.some((entry) => entry.player === "her" && entry.action === "pass");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "stagger-in flex flex-1 flex-col items-center justify-center text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-medium uppercase tracking-[0.28em] text-muted",
				children: "Session"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display mt-4 text-5xl italic text-fg",
				children: "That's the deck."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-5 max-w-xs text-sm leading-relaxed text-muted",
				children: [
					done,
					" card",
					done === 1 ? "" : "s",
					" played.",
					himPassed ? ` ${displayName(names, "him")} used a pass.` : "",
					herPassed ? ` ${displayName(names, "her")} used a pass.` : "",
					!himPassed && !herPassed ? " Neither of you spent a pass." : ""
				]
			})
		]
	});
}
function BetweenUsApp() {
	const screen = useGameStore((state) => state.screen);
	const hydrated = useGameStore((state) => state.hydrated);
	(0, import_react.useEffect)(() => {
		const finish = () => useGameStore.getState().setHydrated(true);
		const unsub = useGameStore.persist.onFinishHydration(finish);
		if (useGameStore.persist.hasHydrated()) finish();
		return unsub;
	}, []);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "table-felt flex min-h-dvh items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-3xl italic text-fg",
			children: "Between Us"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "table-felt min-h-dvh text-fg",
		children: [
			screen === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeView, {}) : null,
			screen === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayView, {}) : null,
			screen === "deck" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeckView, {}) : null
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BetweenUsApp, {});
}
//#endregion
export { Home as component };
