"use dom";

import { COURSE_IMG } from "./courseBase64";

interface RacePageProps {
  onPlay?: () => void;
  onClose?: () => void;
  playerColors?: string;
  dom?: import("expo/dom").DOMProps;
}

const BOT_COLORS = [
  ["#ff3366", "#ff6b9d", "#cc0044", "#ff3366"],
  ["#00ccff", "#0088ff", "#0055cc", "#00ccff"],
  ["#7cff00", "#44cc00", "#228800", "#7cff00"],
  ["#ff6b35", "#ffaa00", "#cc4400", "#ff6b35"],
  ["#cc33ff", "#8833ff", "#6600cc", "#cc33ff"],
];

const BOT_PROGRESS = [0, 18, 32, 55, 10]; // % along track

function Worm({ colors, x, y, segments = 8, size = 8 }: { colors: string[]; x: number; y: number; segments?: number; size?: number }) {
  const segs = [];
  for (let i = segments - 1; i >= 0; i--) {
    segs.push(
      <div key={i} style={{
        position: "absolute",
        left: x - i * (size + 2),
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: colors[i % colors.length],
        boxShadow: i === 0 ? "0 2px 4px rgba(0,0,0,0.3)" : "none",
        zIndex: segments - i,
      }} />
    );
  }
  // Eyes on head
  segs.push(
    <div key="eye1" style={{ position: "absolute", left: x + 1, top: y - size / 2 + 1, width: 4, height: 4, borderRadius: "50%", backgroundColor: "white", zIndex: segments + 1 }} />,
    <div key="eye2" style={{ position: "absolute", left: x + 1, top: y + size / 2 - 5, width: 4, height: 4, borderRadius: "50%", backgroundColor: "white", zIndex: segments + 1 }} />,
    <div key="pupil1" style={{ position: "absolute", left: x + 2, top: y - size / 2 + 2, width: 2, height: 2, borderRadius: "50%", backgroundColor: "#111", zIndex: segments + 2 }} />,
    <div key="pupil2" style={{ position: "absolute", left: x + 2, top: y + size / 2 - 4, width: 2, height: 2, borderRadius: "50%", backgroundColor: "#111", zIndex: segments + 2 }} />,
  );
  return <>{segs}</>;
}

export default function RacePage({ onPlay, onClose, playerColors }: RacePageProps) {
  let pColors = ["#ff3366", "#ff6b35", "#ffd700", "#7cff00"];
  try { if (playerColors) pColors = JSON.parse(playerColors); } catch {}

  return (
    <div style={{
      width: "100vw", height: "100vh",
      position: "fixed", top: 0, left: 0,
      background: "#3a1a0a",
      zIndex: 9999,
      overflow: "hidden",
    }}>
      {/* Background image */}
      <img
        src={COURSE_IMG}
        style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
      />

      {/* Worms on tracks */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
        {/* Player worm - track 1 (top) */}
        <Worm colors={pColors} x={120} y={Math.floor(100 * 0.37)} segments={6} size={10} />

        {/* Bot worms on tracks 2-5 */}
        {BOT_COLORS.map((colors, i) => {
          const trackY = Math.floor(100 * (0.445 + i * 0.113));
          const progressX = 80 + (BOT_PROGRESS[i] / 100) * 600;
          return (
            <Worm key={i} colors={colors} x={progressX} y={trackY} segments={6 + i * 2} size={9} />
          );
        })}
      </div>

      {/* Bottom buttons */}
      <div style={{
        position: "absolute", bottom: 20, left: 0, right: 0,
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
