"use dom";

import { COURSE_IMG } from "./courseBase64";

interface RacePageProps {
  onPlay?: () => void;
  onClose?: () => void;
  onPlayLabel?: string;
  onCloseLabel?: string;
  playerColors?: string;
  playerScore?: number;
  dom?: import("expo/dom").DOMProps;
}

const BOT_COLORS = [
  ["#00ccff", "#0088ff", "#0055cc", "#00ccff"],
  ["#7cff00", "#44cc00", "#228800", "#7cff00"],
  ["#cc33ff", "#8833ff", "#6600cc", "#cc33ff"],
];

// Track Y positions as % of image height (measured from the image)
const TRACK_Y = [32, 42, 52, 62, 72.5];
const TRACK_START_X = 30; // % from left where tracks begin

function WormOnTrack({ colors, trackY, progress, segCount }: {
  colors: string[]; trackY: number; progress: number; segCount: number;
}) {
  const size = 22;
  const gap = size + 4;
  return (
    <div style={{
      position: "absolute",
      top: `${trackY}%`,
      left: `${TRACK_START_X + progress * 0.5}%`,
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

export default function RacePage({ onPlay, onClose, onPlayLabel, onCloseLabel, playerColors, playerScore = 0 }: RacePageProps) {
  let pColors = ["#ff3366", "#ff6b35", "#ffd700", "#7cff00"];
  try { if (playerColors) pColors = JSON.parse(playerColors); } catch {}

  // Player progress as % (0-100), score 500 = 100%
  const playerProgress = Math.min((playerScore / 500) * 100, 100);

  // Bots stay at 0 until player has played, then randomize behind player
  const botProgress = playerScore > 0
    ? [
        Math.min(playerProgress * 0.7 + Math.random() * 10, 95),
        Math.min(playerProgress * 0.5 + Math.random() * 15, 90),
        Math.min(playerProgress * 0.3 + Math.random() * 10, 85),
      ]
    : [0, 0, 0];

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

      {/* Worms on tracks — position based on score */}
      <WormOnTrack colors={pColors} trackY={TRACK_Y[0]} progress={playerProgress} segCount={5 + Math.floor(playerProgress / 15)} />
      <WormOnTrack colors={BOT_COLORS[0]} trackY={TRACK_Y[1]} progress={botProgress[0]} segCount={5 + Math.floor(botProgress[0] / 15)} />
      <WormOnTrack colors={BOT_COLORS[1]} trackY={TRACK_Y[2]} progress={botProgress[1]} segCount={5 + Math.floor(botProgress[1] / 15)} />
      <WormOnTrack colors={BOT_COLORS[2]} trackY={TRACK_Y[3]} progress={botProgress[2]} segCount={5 + Math.floor(botProgress[2] / 15)} />

      {/* Red X close button — positioned over the X in the image (top right) */}
      <div
        onClick={() => onClose?.()}
        style={{
          position: "absolute", top: "3%", right: "1%",
          width: "5%", height: "9%",
          cursor: "pointer",
          zIndex: 10,
        }}
      />

      {/* Green "Jouer" button — positioned over the Jouer button in the image (bottom center) */}
      <div
        onClick={() => onPlay?.()}
        style={{
          position: "absolute", bottom: "3%", left: "50%",
          transform: "translateX(-50%)",
          width: "20%", height: "8%",
          cursor: "pointer",
          zIndex: 10,
        }}
      />
    </div>
  );
}
