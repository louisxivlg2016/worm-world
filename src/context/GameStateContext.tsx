import { createContext, useContext, useState, type ReactNode } from "react";

interface GameStateValue {
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
}

const GameStateContext = createContext<GameStateValue>({
  isPlaying: false,
  setIsPlaying: () => {},
});

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <GameStateContext.Provider value={{ isPlaying, setIsPlaying }}>
      {children}
    </GameStateContext.Provider>
  );
}

export const useGameState = () => useContext(GameStateContext);
