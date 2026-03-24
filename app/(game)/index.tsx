import { useCallback } from "react";
import { View, StyleSheet, Platform } from "react-native";
import GameDom from "@/expo/GameDom";
import { useGameState } from "@/context/GameStateContext";
import {
  lightImpact,
  mediumImpact,
  heavyImpact,
  success,
  error as errorHaptic,
  selection,
} from "@/expo/haptics";
import { playSound } from "@/expo/audio";
import { shareText } from "@/expo/share";
import { scheduleNotification } from "@/expo/notifications";

// Conditional imports for native-only APIs
let useKeepAwake: (() => void) | undefined;
let lockAsync: ((orientation: number) => Promise<void>) | undefined;
let LANDSCAPE: number | undefined;

try {
  const keepAwake = require("expo-keep-awake");
  useKeepAwake = keepAwake.useKeepAwake;
} catch {}

try {
  const orientation = require("expo-screen-orientation");
  lockAsync = orientation.lockAsync;
  LANDSCAPE = orientation.OrientationLock.LANDSCAPE;
} catch {}

export default function GameScreen() {
  const { setIsPlaying } = useGameState();

  // Keep screen awake during gameplay
  try {
    useKeepAwake?.();
  } catch {}

  // Lock to landscape on native
  const lockLandscape = useCallback(async () => {
    if (Platform.OS === "web") return;
    try {
      if (lockAsync && LANDSCAPE !== undefined) {
        await lockAsync(LANDSCAPE);
      }
    } catch {}
  }, []);

  // Lock on mount
  lockLandscape().catch(() => {});

  const handleHaptic = useCallback((type: string) => {
    switch (type) {
      case "light":
        lightImpact();
        break;
      case "medium":
        mediumImpact();
        break;
      case "heavy":
        heavyImpact();
        break;
      case "success":
        success();
        break;
      case "error":
        errorHaptic();
        break;
      case "selection":
        selection();
        break;
      default:
        lightImpact();
    }
  }, []);

  const handlePlaySound = useCallback((name: string) => {
    playSound(name);
  }, []);

  const handleShare = useCallback((text: string) => {
    shareText(text);
  }, []);

  const handleScheduleNotification = useCallback(
    (title: string, body: string, seconds: number) => {
      scheduleNotification(title, body, seconds);
    },
    [],
  );

  const handleGameStateChange = useCallback(
    (playing: boolean) => {
      setIsPlaying(playing);
    },
    [setIsPlaying],
  );

  return (
    <View style={styles.container}>
      <GameDom
        onHaptic={handleHaptic}
        onShare={handleShare}
        onPlaySound={handlePlaySound}
        onScheduleNotification={handleScheduleNotification}
        onGameStateChange={handleGameStateChange}
        dom={{ style: { flex: 1, width: "100%", height: "100%" } }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
