import { useCallback } from "react";
import { View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import GamePlay from "@/expo/GamePlay";
import { useGameState } from "@/context/GameStateContext";
import { getEventByMode } from "@/config/events";
import type { GameMode } from "@/types/game";

export default function PlayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { playerName, playerSkin, roomSlug, roomId, gameMode: ctxGameMode, seed, handleDeath, handleEventWin, setIsPlaying } = useGameState();

  // Use route param if available, otherwise context
  const gameMode = (params.mode as GameMode) || ctxGameMode || "ffa";
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
        playerName={playerName || "Player"}
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
