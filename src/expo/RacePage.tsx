"use dom";

import { COURSE_IMG } from "./courseBase64";

interface RacePageProps {
  onPlay?: () => void;
  onClose?: () => void;
  dom?: import("expo/dom").DOMProps;
}

export default function RacePage({ onPlay, onClose }: RacePageProps) {
  return (
    <div style={{
      width: "100vw", height: "100vh",
      position: "fixed", top: 0, left: 0,
      background: "#3a1a0a",
      zIndex: 9999,
    }}>
      <img
        src={COURSE_IMG}
        style={{
          width: "100%", height: "100%",
          objectFit: "fill", display: "block",
        }}
      />
      <div style={{
        position: "absolute", bottom: 30, left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
      }}>
        <button
          onClick={() => onPlay?.()}
          style={{
            padding: "14px 60px", borderRadius: 50, border: "none",
            backgroundColor: "#4CAF50", color: "white",
            fontSize: 22, fontWeight: 900, letterSpacing: 5,
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(76,175,80,0.6)",
          }}
        >
          Jouer
        </button>
        <button
          onClick={() => onClose?.()}
          style={{
            background: "none", border: "none",
            color: "rgba(255,255,255,0.5)", fontSize: 13,
            cursor: "pointer", padding: 8,
          }}
        >
          ✕ Fermer
        </button>
      </div>
    </div>
  );
}
