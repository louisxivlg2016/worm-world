import { Tabs } from "expo-router/tabs";
import { Text } from "react-native";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { usePathname, useRouter } from "expo-router";
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
  const pathname = usePathname();
  const router = useRouter();

  console.log('[Tabs] current pathname:', pathname);
  console.log('[Tabs] router:', typeof router, Object.keys(router));

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
      screenListeners={{
        tabPress: (e) => {
          console.log('[Tabs] tabPress event:', e.target, e.type);
        },
        focus: (e) => {
          console.log('[Tabs] focus event:', e.target);
        },
      }}
    >
      <Tabs.Screen
        name="(game)"
        listeners={{ tabPress: () => console.log('[Tab] PRESSED: (game)') }}
        options={{
          title: "Play",
          href: "/(game)",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🎮</Text>,
          tabBarItemStyle: { display: "flex" },
        }}
      />
      <Tabs.Screen
        name="(shop)"
        listeners={{ tabPress: () => console.log('[Tab] PRESSED: (shop)') }}
        options={{
          title: "Shop",
          href: "/(shop)",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🛒</Text>,
          tabBarItemStyle: { display: "flex" },
        }}
      />
      <Tabs.Screen
        name="(lobby)"
        listeners={{ tabPress: () => console.log('[Tab] PRESSED: (lobby)') }}
        options={{
          title: "Multi",
          href: "/(lobby)",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👥</Text>,
          tabBarItemStyle: { display: "flex" },
        }}
      />
      <Tabs.Screen
        name="(profile)"
        listeners={{ tabPress: () => console.log('[Tab] PRESSED: (profile)') }}
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
