export type PlayerId = "him" | "her";
export type CardKind = "truth" | "dare";
export type CardAudience = "both" | "him" | "her";

export type PromptCard = {
  id: string;
  kind: CardKind;
  audience: CardAudience;
  text: string;
};

export type ParseResult = {
  cards: PromptCard[];
  errors: string[];
};

const KIND_WORDS: Record<string, CardKind> = {
  truth: "truth",
  truths: "truth",
  t: "truth",
  dare: "dare",
  dares: "dare",
  d: "dare",
};

const AUDIENCE_WORDS: Record<string, CardAudience> = {
  him: "him",
  his: "him",
  her: "her",
  hers: "her",
  both: "both",
};

function slugId(kind: CardKind, audience: CardAudience, text: string, index: number) {
  const key = `${kind}-${audience}-${text}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48);
  return `${key}-${index}`;
}

function cleanPrompt(raw: string) {
  return raw
    .replace(/^[\s>*-]+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .replace(/^["“”']+|["“”']+$/g, "")
    .trim();
}

function parseHeading(line: string): { kind: CardKind; audience: CardAudience } | null {
  const stripped = line.replace(/^#+\s*/, "").replace(/[:\-–—]+$/, "").trim();
  if (!stripped) return null;
  const parts = stripped.toLowerCase().split(/\s+/);
  if (parts.length === 0 || parts.length > 3) return null;

  let audience: CardAudience = "both";
  let kindToken = parts[0];
  if (parts.length >= 2 && parts[0] && parts[0] in AUDIENCE_WORDS) {
    audience = AUDIENCE_WORDS[parts[0]] ?? "both";
    kindToken = parts[1] ?? "";
  }
  const kind = KIND_WORDS[kindToken ?? ""];
  if (!kind) return null;
  if (parts.length === 3) return null;
  return { kind, audience };
}

function parsePrefixedLine(line: string): PromptCard | null {
  const pipe = line.split("|").map((part) => part.trim());
  if (pipe.length === 2 || pipe.length === 3) {
    if (pipe.length === 2) {
      const kind = KIND_WORDS[pipe[0]?.toLowerCase() ?? ""];
      const text = cleanPrompt(pipe[1] ?? "");
      if (kind && text) {
        return { id: "tmp", kind, audience: "both", text };
      }
    } else {
      const audience = AUDIENCE_WORDS[pipe[0]?.toLowerCase() ?? ""];
      const kind = KIND_WORDS[pipe[1]?.toLowerCase() ?? ""];
      const text = cleanPrompt(pipe[2] ?? "");
      if (audience && kind && text) {
        return { id: "tmp", kind, audience, text };
      }
    }
  }

  const match = line.match(
    /^(?:\[)?\s*(him|her|his|hers|both)?\s*(truths?|dares?|t|d)\s*(?:\])?\s*[:\-–—]\s+(.+)$/i,
  );
  if (!match) return null;
  const audience = match[1] ? (AUDIENCE_WORDS[match[1].toLowerCase()] ?? "both") : "both";
  const kind = KIND_WORDS[match[2]?.toLowerCase() ?? ""];
  const text = cleanPrompt(match[3] ?? "");
  if (!kind || !text) return null;
  return { id: "tmp", kind, audience, text };
}

function fromUnknown(value: unknown, sink: PromptCard[]) {
  if (!value || typeof value !== "object") return;
  const row = value as Record<string, unknown>;
  const text = cleanPrompt(String(row.text ?? row.prompt ?? row.card ?? ""));
  if (!text) return;
  const kindRaw = String(row.kind ?? row.type ?? "").toLowerCase();
  const kind = KIND_WORDS[kindRaw];
  if (!kind) return;
  const audienceRaw = String(row.audience ?? row.for ?? row.player ?? "both").toLowerCase();
  const audience = AUDIENCE_WORDS[audienceRaw] ?? "both";
  sink.push({ id: "tmp", kind, audience, text });
}

function parseJsonDeck(input: string): PromptCard[] | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
  try {
    const data = JSON.parse(trimmed) as unknown;
    const cards: PromptCard[] = [];
    if (Array.isArray(data)) {
      for (const item of data) {
        if (typeof item === "string") continue;
        fromUnknown(item, cards);
      }
    } else if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      if (Array.isArray(obj.cards)) {
        for (const item of obj.cards) fromUnknown(item, cards);
      }
      if (Array.isArray(obj.truths)) {
        for (const item of obj.truths) {
          if (typeof item === "string") {
            const text = cleanPrompt(item);
            if (text) cards.push({ id: "tmp", kind: "truth", audience: "both", text });
          } else {
            fromUnknown({ ...(item as object), kind: "truth" }, cards);
          }
        }
      }
      if (Array.isArray(obj.dares)) {
        for (const item of obj.dares) {
          if (typeof item === "string") {
            const text = cleanPrompt(item);
            if (text) cards.push({ id: "tmp", kind: "dare", audience: "both", text });
          } else {
            fromUnknown({ ...(item as object), kind: "dare" }, cards);
          }
        }
      }
    }
    return cards.length ? cards : [];
  } catch {
    return null;
  }
}

export function parseDeck(input: string): ParseResult {
  const jsonCards = parseJsonDeck(input);
  if (jsonCards) {
    return { cards: finalizeCards(jsonCards), errors: jsonCards.length ? [] : ["No cards found in that JSON."] };
  }

  const errors: string[] = [];
  const draft: PromptCard[] = [];
  let context: { kind: CardKind; audience: CardAudience } = { kind: "truth", audience: "both" };

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
    draft.push({ id: "tmp", kind: context.kind, audience: context.audience, text });
  }

  const cards = finalizeCards(draft);
  if (!cards.length) {
    errors.push("No cards found. Start a section with TRUTH or DARE, then one prompt per line.");
  }
  return { cards, errors };
}

function finalizeCards(draft: PromptCard[]) {
  const seen = new Set<string>();
  const cards: PromptCard[] = [];
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
      text,
    });
  });
  return cards;
}

export function serializeDeck(cards: PromptCard[]) {
  const groups: Array<{ title: string; match: (card: PromptCard) => boolean }> = [
    { title: "TRUTH", match: (card) => card.kind === "truth" && card.audience === "both" },
    { title: "DARE", match: (card) => card.kind === "dare" && card.audience === "both" },
    { title: "HIM TRUTH", match: (card) => card.kind === "truth" && card.audience === "him" },
    { title: "HER TRUTH", match: (card) => card.kind === "truth" && card.audience === "her" },
    { title: "HIM DARE", match: (card) => card.kind === "dare" && card.audience === "him" },
    { title: "HER DARE", match: (card) => card.kind === "dare" && card.audience === "her" },
  ];

  const blocks: string[] = [];
  for (const group of groups) {
    const rows = cards.filter(group.match).map((card) => card.text);
    if (!rows.length) continue;
    blocks.push(`${group.title}\n${rows.join("\n")}`);
  }
  return blocks.join("\n\n");
}

export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = next[i];
    const b = next[j];
    if (a === undefined || b === undefined) continue;
    next[i] = b;
    next[j] = a;
  }
  return next;
}

export function matchingIds(
  cards: PromptCard[],
  remainingIds: string[],
  kind: CardKind,
  player: PlayerId,
) {
  const byId = new Map(cards.map((card) => [card.id, card]));
  return remainingIds.filter((id) => {
    const card = byId.get(id);
    if (!card) return false;
    if (card.kind !== kind) return false;
    return card.audience === "both" || card.audience === player;
  });
}

export function drawCard(
  cards: PromptCard[],
  remainingIds: string[],
  kind: CardKind,
  player: PlayerId,
): { card: PromptCard; remainingIds: string[] } | null {
  const pool = matchingIds(cards, remainingIds, kind, player);
  if (!pool.length) return null;
  const [picked] = shuffle(pool);
  if (!picked) return null;
  const card = cards.find((item) => item.id === picked);
  if (!card) return null;
  return {
    card,
    remainingIds: remainingIds.filter((id) => id !== picked),
  };
}

export function deckStats(cards: PromptCard[]) {
  return {
    total: cards.length,
    truths: cards.filter((card) => card.kind === "truth").length,
    dares: cards.filter((card) => card.kind === "dare").length,
    him: cards.filter((card) => card.audience === "him").length,
    her: cards.filter((card) => card.audience === "her").length,
    both: cards.filter((card) => card.audience === "both").length,
  };
}

export const DECK_FORMAT_EXAMPLE = `TRUTH
What's a memory of us you replay when you're alone?
When did you first know this was different?

DARE
Hold eye contact for thirty seconds without talking.
Kiss me the way you would if we had just met.

HIM TRUTH
Tell her the first thing you noticed about her that you still think about.

HER DARE
Take his face in your hands and tell him one thing you're proud of him for.`;
