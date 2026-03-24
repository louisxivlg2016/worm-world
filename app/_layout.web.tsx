import { useEffect } from "react";
import { Slot, usePathname, useRouter } from "expo-router";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { colors } from "@/expo/theme";
import { GameStateProvider, useGameState } from "@/context/GameStateContext";
import { spacetimeService } from "@/services/SpacetimeService";

const appTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    primary: colors.primary,
    border: "rgba(255,255,255,0.1)",
    notification: colors.danger,
  },
};

const tabs = [
  { href: "/", icon: "🎮", label: "Play", match: (pathname: string) => pathname === "/" || pathname.startsWith("/(game)") },
  { href: "/shop", icon: "🛒", label: "Shop", match: (p: string) => p === "/shop" || p.startsWith("/(shop)") || p.startsWith("/buy") },
  { href: "/lobby", icon: "👥", label: "Multi", match: (p: string) => p === "/lobby" || p.startsWith("/(lobby)") || p === "/multi" },
  { href: "/profile", icon: "👤", label: "Profile", match: (p: string) => p === "/profile" || p.startsWith("/(profile)") || p === "/settings" },
] as const;

export default function RootLayout() {
  // Connect to SpacetimeDB on app start
  useEffect(() => {
    spacetimeService.connect().then(() => {
      console.log("[App/Web] SpacetimeDB connected");
    }).catch((err) => {
      console.error("[App/Web] SpacetimeDB connection failed:", err);
    });
  }, []);

  return (
    <ThemeProvider value={appTheme}>
      <GameStateProvider>
        <WebLayout />
      </GameStateProvider>
    </ThemeProvider>
  );
}

function WebLayout() {
  const pathname = usePathname();
  const { isPlaying } = useGameState();
  const router = useRouter();

  return (
    <>
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: isPlaying ? 0 : 64,
        overflow: "hidden", background: colors.background,
        // contain: paint creates a new stacking/containing context — position:fixed children stay inside
        contain: "paint layout" as any,
      }}>
        <div style={{ width: "100%", height: "100%", position: "relative", overflow: "auto" }}>
          <Slot />
        </div>
      </div>

      {!isPlaying && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, height: 64,
          display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-around",
          background: colors.surface, borderTop: "1px solid rgba(255,255,255,0.1)",
          zIndex: 9999,
        }}>
          {tabs.map((tab) => {
            const active = tab.match(pathname);
            return (
              <div
                key={tab.href}
                onClick={(e) => { e.preventDefault(); router.push(tab.href as any); }}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: 2, padding: "4px 0",
                  cursor: "pointer", color: active ? colors.primary : colors.textSecondary,
                }}
              >
                <span style={{ fontSize: 22 }}>{tab.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 500 }}>{tab.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

