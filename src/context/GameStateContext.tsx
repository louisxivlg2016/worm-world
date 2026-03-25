import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { SKINS, type WormSkin, type GameMode } from "@/types/game";
import { getStorage } from "@/services/StorageService";
import { loadStats, saveStats } from "@/components/ProfileScreen";

interface DeathInfo {
  score: number;
  length: number;
  coins: number;
  kills: number;
}

interface GameStateValue {
  // UI state
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;

  // Player
  playerName: string;
  setPlayerName: (n: string) => void;
  playerSkin: WormSkin;
  setPlayerSkin: (s: WormSkin) => void;
  customSkin: WormSkin | null;
  setCustomSkin: (s: WormSkin | null) => void;

  // Coins
  totalCoins: number;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => void;

  // Room/multiplayer
  roomSlug: string | undefined;
  roomId: string | undefined;
  gameMode: GameMode;
  seed: number | undefined;
  setRoomInfo: (slug?: string, id?: string, mode?: GameMode, seed?: number) => void;

  // Death
  deathInfo: DeathInfo | null;

  // Actions
  startGame: (name: string, skin: WormSkin, mode: GameMode, slug?: string, id?: string, seed?: number) => void;
  handleDeath: (score: number, length: number, coins: number, kills: number) => void;
  handleEventWin: (unlockKey: string) => void;
  applySkin: (skin: WormSkin, cost: number) => void;

  // Event win
  wonEventUnlockKey: string | null;
}

const GameStateContext = createContext<GameStateValue>({} as GameStateValue);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerSkin, setPlayerSkin] = useState<WormSkin>(() => {
    try {
      const saved = getStorage().getItem("playerSkin");
      return saved ? JSON.parse(saved) : SKINS[0];
    } catch { return SKINS[0]; }
  });
  const [customSkin, setCustomSkin] = useState<WormSkin | null>(() => {
    try {
      const saved = getStorage().getItem("customSkin");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [totalCoins, setTotalCoins] = useState(() => {
    const saved = getStorage().getItem("totalCoins");
    if (!saved) {
      getStorage().setItem("totalCoins", "500");
      return 500;
    }
    return parseInt(saved, 10) || 0;
  });
  const [roomSlug, setRoomSlug] = useState<string | undefined>();
  const [roomId, setRoomId] = useState<string | undefined>();
  const [gameMode, setGameMode] = useState<GameMode>("ffa");
  const [seed, setSeed] = useState<number | undefined>();
  const [deathInfo, setDeathInfo] = useState<DeathInfo | null>(null);
  const [wonEventUnlockKey, setWonEventUnlockKey] = useState<string | null>(null);
  const gameStartTimeRef = useRef(0);

  const addCoins = useCallback((amount: number) => {
    setTotalCoins(prev => {
      const next = prev + amount;
      getStorage().setItem("totalCoins", String(next));
      return next;
    });
  }, []);

  const spendCoins = useCallback((amount: number) => {
    setTotalCoins(prev => {
      const next = prev - amount;
      getStorage().setItem("totalCoins", String(next));
      return next;
    });
  }, []);

  const setRoomInfo = useCallback((slug?: string, id?: string, mode?: GameMode, s?: number) => {
    setRoomSlug(slug);
    setRoomId(id);
    if (mode) setGameMode(mode);
    setSeed(s);
  }, []);

  const startGame = useCallback((name: string, skin: WormSkin, mode: GameMode, slug?: string, id?: string, s?: number) => {
    setPlayerName(name);
    setPlayerSkin(skin);
    setRoomSlug(slug);
    setRoomId(id);
    setGameMode(mode);
    setSeed(s);
    gameStartTimeRef.current = Date.now();
    setIsPlaying(true);
  }, []);

  const handleDeath = useCallback((score: number, length: number, coins: number, kills: number) => {
    setDeathInfo({ score, length, coins, kills });
    addCoins(coins);
    const elapsed = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const stats = loadStats();
    stats.bestScore = Math.max(stats.bestScore, score);
    stats.bestTime = Math.max(stats.bestTime, elapsed);
    stats.kills += kills;
    stats.gamesPlayed++;
    stats.totalPlayTime += elapsed;
    saveStats(stats);
    setIsPlaying(false);
  }, [addCoins]);

  const handleEventWin = useCallback((unlockKey: string) => {
    getStorage().setItem(unlockKey, "true");
    setWonEventUnlockKey(unlockKey);
    setIsPlaying(false);
  }, []);

  const applySkin = useCallback((skin: WormSkin, cost: number) => {
    spendCoins(cost);
    setCustomSkin(skin);
    setPlayerSkin(skin);
    getStorage().setItem("customSkin", JSON.stringify(skin));
    getStorage().setItem("playerSkin", JSON.stringify(skin));
  }, [spendCoins]);

  return (
    <GameStateContext.Provider value={{
      isPlaying, setIsPlaying,
      playerName, setPlayerName,
      playerSkin, setPlayerSkin,
      customSkin, setCustomSkin,
      totalCoins, addCoins, spendCoins,
      roomSlug, roomId, gameMode, seed, setRoomInfo,
      deathInfo,
      startGame, handleDeath, handleEventWin, applySkin,
      wonEventUnlockKey,
    }}>
      {children}
    </GameStateContext.Provider>
  );
}

export const useGameState = () => useContext(GameStateContext);
