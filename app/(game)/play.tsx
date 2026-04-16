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
    // Play collision sound — try Web Audio first, fall back to HTMLAudio
    let played = false;
    try {
      const ctx = (window as any).__audioCtx as AudioContext | undefined;
      const buffer = (window as any).__chocBuffer as AudioBuffer | undefined;
      if (ctx && buffer) {
        if (ctx.state === "suspended") ctx.resume();
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        let vol = 0.6;
        try { const v = localStorage.getItem("sfxVolume"); if (v) vol = parseFloat(v); } catch {}
        gain.gain.value = vol;
        source.connect(gain).connect(ctx.destination);
        source.start(0);
        played = true;
      }
    } catch {}
    if (!played) {
      try {
        const sfx = (window as any).__chocSfx as HTMLAudioElement | undefined;
        if (sfx) {
          sfx.currentTime = 0;
          sfx.play().catch(() => {});
        } else {
          new Audio("/choc.mp3").play().catch(() => {});
        }
      } catch {}
    }
    setTimeout(() => {
      handleDeath(score, length, coins, kills);
      router.replace("/(game)/dead");
    }, 800);
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
