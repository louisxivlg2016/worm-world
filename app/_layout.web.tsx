import { Tabs } from "expo-router/tabs";
import { Text, StyleSheet } from "react-native";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
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

export default function RootLayout() {
  return (
    <ThemeProvider value={appTheme}>
      <GameStateProvider>
        <TabsNavigator />
      </GameStateProvider>
    </ThemeProvider>
  );
}

function TabsNavigator() {
  const { isPlaying } = useGameState();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: "bottom",
        tabBarItemStyle: { display: "none" },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: "rgba(255,255,255,0.1)",
          display: isPlaying ? "none" : "flex",
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="(game)"
        options={{
          title: "Play",
          href: "/(game)",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🎮</Text>,
          tabBarItemStyle: { display: "flex" },
        }}
      />
      <Tabs.Screen
        name="(shop)"
        options={{
          title: "Shop",
          href: "/(shop)",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🛒</Text>,
          tabBarItemStyle: { display: "flex" },
        }}
      />
      <Tabs.Screen
        name="(lobby)"
        options={{
          title: "Multi",
          href: "/(lobby)",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👥</Text>,
          tabBarItemStyle: { display: "flex" },
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          href: "/(profile)",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text>,
          tabBarItemStyle: { display: "flex" },
        }}
      />
      {/* Hide sub-routes from tab bar */}
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="buy-confirm" options={{ href: null }} />
      <Tabs.Screen name="edit-username" options={{ href: null }} />
      <Tabs.Screen name="+not-found" options={{ href: null }} />
    </Tabs>
  );
}
