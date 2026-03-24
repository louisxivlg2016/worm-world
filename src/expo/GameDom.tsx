"use dom";

import App from "@/App";

interface GameDomProps {
  onHaptic?: (type: string) => void;
  onShare?: (text: string) => void;
  onPlaySound?: (name: string) => void;
  onScheduleNotification?: (title: string, body: string, seconds: number) => void;
  onGameStateChange?: (playing: boolean) => void;
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
    <div id="game-root" style={{ position: "relative", width: "100%", height: "100%" }}>
      <style>{`
        #game-root [style*="position: fixed"],
        #game-root [style*="position:fixed"] {
          position: absolute !important;
        }
        #game-root canvas[style*="position: fixed"],
        #game-root canvas[style*="position:fixed"] {
          position: absolute !important;
        }
      `}</style>
      <App />
    </div>
  );
}
