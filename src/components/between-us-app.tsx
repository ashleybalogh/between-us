import { useEffect } from "react";
import { HomeView } from "@/components/home-view";
import { SetupView } from "@/components/setup-view";
import { SettingsView } from "@/components/settings-view";
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
      {screen === "setup" ? <SetupView /> : null}
      {screen === "settings" ? <SettingsView /> : null}
    </div>
  );
}
