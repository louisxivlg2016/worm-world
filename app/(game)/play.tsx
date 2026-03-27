import { useCallback } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import GamePlay from "@/expo/GamePlay";
import { useGameState } from "@/context/GameStateContext";
import { getEventByMode } from "@/config/events";

export default function PlayScreen() {
  const router = useRouter();
  const { playerName, playerSkin, roomSlug, roomId, gameMode, seed, handleDeath, handleEventWin, setIsPlaying } = useGameState();

  const event = getEventByMode(gameMode);

  const onDeath = useCallback((score: number, length: number, coins: number, kills: number) => {
    handleDeath(score, length, coins, kills);
    router.replace("/(game)/dead");
  }, [handleDeath, router]);

  const onWin = useCallback(() => {
    if (event) handleEventWin(event.unlockKey);
    if (gameMode === 'race') {
      setIsPlaying(false);
      router.replace("/(game)/race-win");
    } else {
      router.replace("/(game)/event-win");
    }
  }, [event, handleEventWin, gameMode, setIsPlaying, router]);

  const onBack = useCallback(() => {
    setIsPlaying(false);
    router.back();
  }, [setIsPlaying, router]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <GamePlay
        playerName={playerName}
        playerSkin={JSON.stringify(playerSkin)}
        roomSlug={roomSlug}
        roomId={roomId}
        gameMode={gameMode}
        seed={seed}
        onDeath={onDeath}
        onWin={(event || gameMode === 'race') ? onWin : undefined}
        onBack={onBack}
        dom={{ style: { flex: 1, width: "100%", height: "100%" } }}
      />
    </View>
  );
}
