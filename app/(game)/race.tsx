import { useCallback } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useGameState } from "@/context/GameStateContext";
import { getStorage } from "@/services/StorageService";
import RacePage from "@/expo/RacePage";

export default function RaceScreen() {
  const router = useRouter();
  const { startGame, playerSkin, customSkin } = useGameState();

  const playerName = (() => {
    try { return getStorage().getItem("playerName") || "Joueur"; } catch { return "Joueur"; }
  })();
  const activeSkin = customSkin ?? playerSkin;

  const handlePlay = useCallback(() => {
    startGame(playerName, activeSkin, "race" as any);
    router.push({ pathname: "/(game)/play", params: { mode: "race" } });
  }, [startGame, playerName, activeSkin, router]);

  const handleClose = useCallback(() => {
    router.canGoBack() ? router.back() : router.replace("/");
  }, [router]);

  return (
    <View style={{ flex: 1 }}>
      <RacePage
        onPlay={handlePlay}
        onClose={handleClose}
        playerColors={JSON.stringify(activeSkin.colors)}
        dom={{ style: { flex: 1, width: "100%", height: "100%" } }}
      />
    </View>
  );
}
