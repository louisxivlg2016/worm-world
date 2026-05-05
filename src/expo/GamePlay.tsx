"use dom";

import "@/i18n";
import "@/styles.css";
import { GameCanvas } from "@/components/GameCanvas";
import type { WormSkin, GameMode } from "@/types/game";
import { normalizeFlagSkin } from "@/utils/flagSkin";

interface GamePlayProps {
  playerName: string;
  playerSkin: string; // JSON stringified WormSkin
  roomSlug?: string;
  roomId?: string;
  gameMode: string;
  seed?: number;
  onDeath?: (score: number, length: number, coins: number, kills: number) => void;
  onWin?: () => void;
  onBack?: () => void;
  dom?: import("expo/dom").DOMProps;
}

export default function GamePlay({
  playerName, playerSkin, roomSlug, roomId, gameMode, seed,
  onDeath, onWin, onBack,
}: GamePlayProps) {
  let skin: WormSkin;
  try { skin = normalizeFlagSkin(JSON.parse(playerSkin)); } catch { skin = { colors: ["#ff3366", "#ff6b35", "#ffd700", "#7cff00"], eye: "#fff" }; }

  return (
    <GameCanvas
      playerName={playerName}
      playerSkin={skin}
      roomSlug={roomSlug}
      roomId={roomId}
      gameMode={gameMode as GameMode}
      seed={seed}
      onDeath={(s, l, c, k) => onDeath?.(s, l, c, k)}
      onWin={() => onWin?.()}
      onBack={() => onBack?.()}
    />
  );
}
