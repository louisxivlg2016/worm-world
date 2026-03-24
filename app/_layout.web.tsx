import { Link, Slot, usePathname } from "expo-router";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/expo/theme";
import { GameStateProvider, useGameState } from "@/context/GameStateContext";

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
  { href: "/shop", icon: "🛒", label: "Shop", match: (pathname: string) => pathname === "/shop" || pathname.startsWith("/(shop)") || pathname === "/buy-confirm" },
  { href: "/lobby", icon: "👥", label: "Multi", match: (pathname: string) => pathname === "/lobby" || pathname.startsWith("/(lobby)") },
  { href: "/profile", icon: "👤", label: "Profile", match: (pathname: string) => pathname === "/profile" || pathname.startsWith("/(profile)") || pathname === "/settings" },
] as const;

export default function RootLayout() {
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

  return (
    <View style={styles.page}>
      <View style={styles.content}>
        <Slot />
      </View>

      {!isPlaying && (
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const active = tab.match(pathname);

            return (
              <Link key={tab.href} href={tab.href} asChild>
                <Pressable style={styles.tabButton}>
                  <Text style={[styles.tabIcon, active ? styles.tabIconActive : styles.tabIconInactive]}>
                    {tab.icon}
                  </Text>
                  <Text style={[styles.tabLabel, active ? styles.tabLabelActive : styles.tabLabelInactive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              </Link>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingBottom: 8,
    paddingTop: 8,
    height: 64,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 4,
  },
  tabIcon: {
    fontSize: 22,
  },
  tabIconActive: {
    color: colors.primary,
  },
  tabIconInactive: {
    color: colors.textSecondary,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: colors.primary,
  },
  tabLabelInactive: {
    color: colors.textSecondary,
  },
});
