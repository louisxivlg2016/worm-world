export interface NativeBridge {
  haptic: (type: string) => void;
  share: (text: string) => void;
  playSound: (name: string) => void;
  scheduleNotification: (title: string, body: string, seconds: number) => void;
}

/** Get the native bridge if available, otherwise return web fallbacks. */
export function getNativeBridge(): NativeBridge {
  if (typeof window !== "undefined" && window.__nativeBridge) {
    return window.__nativeBridge;
  }
  return {
    haptic: () => {},
    share: (text: string) => {
      if (typeof navigator !== "undefined" && navigator.share) {
        navigator.share({ text }).catch(() => {});
      }
    },
    playSound: () => {},
    scheduleNotification: () => {},
  };
}
