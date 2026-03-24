import { useCallback } from "react";
import { View } from "react-native";
import GameDom from "@/expo/GameDom";
import { useGameState } from "@/context/GameStateContext";
import {
  lightImpact, mediumImpact, heavyImpact,
  success, error as errorHaptic, selection,
} from "@/expo/haptics";
import { playSound } from "@/expo/audio";
import { shareText } from "@/expo/share";
import { scheduleNotification } from "@/expo/notifications";

export default function GameScreen() {
  const { setIsPlaying } = useGameState();

  const handleHaptic = useCallback((type: string) => {
    const map: Record<string, () => void> = {
      light: lightImpact, medium: mediumImpact, heavy: heavyImpact,
      success, error: errorHaptic, selection,
    };
    (map[type] ?? lightImpact)();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0e3a5c" }}>
      <GameDom
        onHaptic={handleHaptic}
        onShare={useCallback((t: string) => shareText(t), [])}
        onPlaySound={useCallback((n: string) => playSound(n), [])}
        onScheduleNotification={useCallback((t: string, b: string, s: number) => scheduleNotification(t, b, s), [])}
        onGameStateChange={useCallback((p: boolean) => setIsPlaying(p), [setIsPlaying])}
        dom={{ style: { flex: 1, width: "100%", height: "100%" } }}
      />
    </View>
  );
}
