"use dom";

import { COURSE_IMG } from "./courseBase64";

interface RacePageProps {
  onPlay?: () => void;
  onClose?: () => void;
  playerColors?: string;
  dom?: import("expo/dom").DOMProps;
}

const BOT_COLORS = [
  ["#00ccff", "#0088ff", "#0055cc", "#00ccff"],
  ["#7cff00", "#44cc00", "#228800", "#7cff00"],
  ["#ff6b35", "#ffaa00", "#cc4400", "#ff6b35"],
  ["#cc33ff", "#8833ff", "#6600cc", "#cc33ff"],
];

// Track Y positions as % of image height (measured from the image)
const TRACK_Y = [34, 43.5, 53, 62.5, 72];

function WormOnTrack({ colors, trackY, progress, segCount }: {
  colors: string[]; trackY: number; progress: number; segCount: number;
}) {
  const size = 22;
  const gap = size + 4;
  return (
    <div style={{
      position: "absolute",
      top: `${trackY}%`,
      left: `${8 + progress * 0.55}%`,
      transform: "translateY(-50%)",
      display: "flex",
      flexDirection: "row-reverse",
      alignItems: "center",
    }}>
      {/* Head with eyes */}
      <div style={{
        width: size, height: size, borderRadius: "50%",
        backgroundColor: colors[0],
        position: "relative",
        boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
        zIndex: 10,
        flexShrink: 0,
      }}>
        <div style={{ position: "absolute", top: 3, right: 3, width: 7, height: 7, borderRadius: "50%", backgroundColor: "white" }} />
        <div style={{ position: "absolute", bottom: 3, right: 3, width: 7, height: 7, borderRadius: "50%", backgroundColor: "white" }} />
        <div style={{ position: "absolute", top: 5, right: 4, width: 4, height: 4, borderRadius: "50%", backgroundColor: "#111" }} />
        <div style={{ position: "absolute", bottom: 5, right: 4, width: 4, height: 4, borderRadius: "50%", backgroundColor: "#111" }} />
      </div>
      {/* Body segments */}
      {Array.from({ length: segCount }).map((_, i) => (
        <div key={i} style={{
          width: size - 2, height: size - 2, borderRadius: "50%",
          backgroundColor: colors[(i + 1) % colors.length],
          marginRight: -6,
          boxShadow: "inset 0 -3px 4px rgba(0,0,0,0.15), inset 0 2px 3px rgba(255,255,255,0.15)",
          flexShrink: 0,
          zIndex: segCount - i,
        }} />
      ))}
    </div>
  );
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
      <img
        src={COURSE_IMG}
        style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
      />

      {/* Player worm - track 1 */}
      <WormOnTrack colors={pColors} trackY={TRACK_Y[0]} progress={0} segCount={8} />

      {/* Bot worms - tracks 2-5 */}
      <WormOnTrack colors={BOT_COLORS[0]} trackY={TRACK_Y[1]} progress={20} segCount={10} />
      <WormOnTrack colors={BOT_COLORS[1]} trackY={TRACK_Y[2]} progress={35} segCount={12} />
      <WormOnTrack colors={BOT_COLORS[2]} trackY={TRACK_Y[3]} progress={55} segCount={14} />
      <WormOnTrack colors={BOT_COLORS[3]} trackY={TRACK_Y[4]} progress={10} segCount={9} />

      {/* Buttons */}
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
