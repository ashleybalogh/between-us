import { useEffect } from "react";
import { DeckView } from "@/components/deck-view";
import { HomeView } from "@/components/home-view";
import { PlayView } from "@/components/play-view";
import { useGameStore } from "@/lib/game-store";

export function BetweenUsApp() {
  const screen = useGameStore((state) => state.screen);

  useEffect(() => {
    const finish = () => useGameStore.getState().setHydrated(true);
    const unsub = useGameStore.persist.onFinishHydration(finish);
    if (useGameStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  return (
    <div className="table-felt min-h-dvh text-fg">
      {screen === "home" ? <HomeView /> : null}
      {screen === "play" ? <PlayView /> : null}
      {screen === "deck" ? <DeckView /> : null}
    </div>
  );
}
