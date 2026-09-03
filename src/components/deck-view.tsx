import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DECK_FORMAT_EXAMPLE, deckStats, parseDeck, serializeDeck } from "@/lib/cards";
import { useGameStore } from "@/lib/game-store";
import { STARTER_DECK } from "@/data/starter-deck";

export function DeckView() {
  const customCards = useGameStore((state) => state.customCards);
  const setCustomCards = useGameStore((state) => state.setCustomCards);
  const setScreen = useGameStore((state) => state.setScreen);
  const active = customCards ?? STARTER_DECK;
  const [draft, setDraft] = useState(() => serializeDeck(active));
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const preview = useMemo(() => parseDeck(draft), [draft]);
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

  return (
    <div className="flex min-h-dvh flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setScreen("home")}
            className="h-11 px-1 text-sm text-muted transition-colors duration-[var(--motion-quick)] hover:text-fg"
          >
            Back
          </button>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">Deck</p>
          <span className="w-12" />
        </header>

        <div className="pt-4">
          <h1 className="font-display text-4xl italic text-fg">Your cards</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Paste a list anytime. Headings pick the pile: TRUTH, DARE, HIM TRUTH, HER DARE.
            One prompt per line. JSON works too.
          </p>
          <p className="mt-3 text-sm tabular-nums text-fg">
            {stats.total} in play · {stats.truths} truth · {stats.dares} dare
            {usingCustom ? " · custom" : " · starter"}
          </p>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          <Textarea
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setMessage(null);
            }}
            spellCheck={false}
            className="min-h-64 flex-1 font-sans"
            aria-label="Card list"
            placeholder={DECK_FORMAT_EXAMPLE}
          />
          <p className="mt-2 text-xs tabular-nums text-faint">
            Preview {previewStats.total} cards
            {preview.errors[0] ? ` · ${preview.errors[0]}` : ""}
          </p>
        </div>

        {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}

        <div className="mt-4 flex flex-col gap-3">
          <Button size="lg" className="w-full" onClick={loadDeck}>
            Load into game
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={copyDeck}>
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" onClick={restoreStarter}>
              Starter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
