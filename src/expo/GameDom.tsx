"use dom";

// Import everything the old main.tsx loaded
import "@/i18n";
import "@/styles.css";
import { AppInner } from "@/App";
import { PlatformProvider } from "@/platform/PlatformContext";
import { AuthProvider } from "@/context/AuthContext";

interface GameDomProps {
  onHaptic?: (type: string) => void;
  onShare?: (text: string) => void;
  onPlaySound?: (name: string) => void;
  onScheduleNotification?: (title: string, body: string, seconds: number) => void;
  onGameStateChange?: (playing: boolean) => void;
  dom?: import("expo/dom").DOMProps;
}

declare global {
  interface Window {
    __nativeBridge?: {
      haptic: (type: string) => void;
      share: (text: string) => void;
      playSound: (name: string) => void;
      scheduleNotification: (title: string, body: string, seconds: number) => void;
      gameStateChange: (playing: boolean) => void;
    };
    __expoTabBarHeight?: number;
  }
}

export default function GameDom({ onHaptic, onShare, onPlaySound, onScheduleNotification, onGameStateChange }: GameDomProps) {
  if (typeof window !== "undefined") {
    window.__nativeBridge = {
      haptic: onHaptic ?? (() => {}),
      share: onShare ?? (() => {}),
      playSound: onPlaySound ?? (() => {}),
      scheduleNotification: onScheduleNotification ?? (() => {}),
      gameStateChange: onGameStateChange ?? (() => {}),
    };
  }

  return (
    <PlatformProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </PlatformProvider>
  );
}
