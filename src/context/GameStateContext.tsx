import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { SKINS, type WormSkin, type GameMode } from "@/types/game";
import { getStorage } from "@/services/StorageService";
import { loadStats, saveStats } from "@/components/ProfileScreen";
import { normalizeFlagSkin } from "@/utils/flagSkin";

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

  // Per-event currencies (one currency per festival)
  eventGems: Record<string, number>;
  addEventGems: (eventId: string, amount: number) => void;
  unlockEventCostumeForEvent: (eventId: string, unlockKey: string, cost: number) => boolean;

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
      return saved ? normalizeFlagSkin(JSON.parse(saved)) : SKINS[0];
    } catch { return SKINS[0]; }
  });
  const [customSkin, setCustomSkin] = useState<WormSkin | null>(() => {
    try {
      const saved = getStorage().getItem("customSkin");
      return saved ? normalizeFlagSkin(JSON.parse(saved)) : null;
    } catch { return null; }
  });
  const [totalCoins, setTotalCoins] = useState(() => {
    const isLocal = typeof window !== "undefined" && (window.location?.hostname === "localhost" || window.location?.hostname === "127.0.0.1");
    if (isLocal) {
      getStorage().setItem("totalCoins", "90000000");
      return 90000000;
    }
    const saved = getStorage().getItem("totalCoins");
    if (!saved) {
      getStorage().setItem("totalCoins", "9000");
      return 9000;
    }
    return parseInt(saved, 10) || 0;
  });
  const [eventGems, setEventGems] = useState<Record<string, number>>(() => {
    try {
      const saved = getStorage().getItem("eventGems");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
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

  const addEventGems = useCallback((eventId: string, amount: number) => {
    setEventGems(prev => {
      const next = { ...prev, [eventId]: (prev[eventId] || 0) + amount };
      getStorage().setItem("eventGems", JSON.stringify(next));
      return next;
    });
  }, []);

  const unlockEventCostumeForEvent = useCallback((eventId: string, unlockKey: string, cost: number) => {
    let success = false;
    setEventGems(prev => {
      const bal = prev[eventId] || 0;
      if (bal < cost) return prev;
      const next = { ...prev, [eventId]: bal - cost };
      getStorage().setItem("eventGems", JSON.stringify(next));
      getStorage().setItem(unlockKey, "true");
      success = true;
      return next;
    });
    return success;
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
    // Award per-event gems if playing an event mode
    const isEvent = gameMode && !["ffa", "battle", "coins", "ctf", "race"].includes(gameMode);
    if (isEvent) {
      const gemReward = kills + Math.floor(score / 50);
      if (gemReward > 0) {
        setEventGems(prev => {
          const next = { ...prev, [gameMode]: (prev[gameMode] || 0) + gemReward };
          getStorage().setItem("eventGems", JSON.stringify(next));
          return next;
        });
      }
    }
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
    // Reaching the event milestone awards 50 gems of THIS event's currency
    const eventId = gameMode;
    if (eventId && !["ffa", "battle", "coins", "ctf", "race"].includes(eventId)) {
      setEventGems(prev => {
        const next = { ...prev, [eventId]: (prev[eventId] || 0) + 50 };
        getStorage().setItem("eventGems", JSON.stringify(next));
        return next;
      });
    }
    setWonEventUnlockKey(unlockKey);
    setIsPlaying(false);
  }, [gameMode]);

  const applySkin = useCallback((skin: WormSkin, cost: number) => {
    const normalizedSkin = normalizeFlagSkin(skin);
    spendCoins(cost);
    setCustomSkin(normalizedSkin);
    setPlayerSkin(normalizedSkin);
    getStorage().setItem("customSkin", JSON.stringify(normalizedSkin));
    getStorage().setItem("playerSkin", JSON.stringify(normalizedSkin));
  }, [spendCoins]);

  return (
    <GameStateContext.Provider value={{
      isPlaying, setIsPlaying,
      playerName, setPlayerName,
      playerSkin, setPlayerSkin,
      customSkin, setCustomSkin,
      totalCoins, addCoins, spendCoins,
      eventGems, addEventGems, unlockEventCostumeForEvent,
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
