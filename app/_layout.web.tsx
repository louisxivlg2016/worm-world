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
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🎮</Text>,
          tabBarItemStyle: { display: "flex" },
        }}
      />
      <Tabs.Screen
        name="(shop)"
        options={{
          title: "Shop",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🛒</Text>,
          tabBarItemStyle: { display: "flex" },
        }}
      />
      <Tabs.Screen
        name="(lobby)"
        options={{
          title: "Multi",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👥</Text>,
          tabBarItemStyle: { display: "flex" },
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text>,
          tabBarItemStyle: { display: "flex" },
        }}
      />
    </Tabs>
  );
}
