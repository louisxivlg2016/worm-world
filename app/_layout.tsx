import { useEffect, useState } from "react";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { colors } from "@/expo/theme";
import { GameStateProvider, useGameState } from "@/context/GameStateContext";
import { GAME_EVENTS, isEventActive } from "@/config/events";
import { getStorage } from "@/services/StorageService";

let useFonts: ((fonts: Record<string, unknown>) => [boolean, Error | null]) | undefined;
let SplashScreen: { preventAutoHideAsync: () => void; hideAsync: () => void } | undefined;
let Bungee_400Regular: unknown;
let Fredoka_400Regular: unknown;

try {
  const expoFont = require("expo-font");
  useFonts = expoFont.useFonts;
} catch {}

try {
  const splash = require("expo-splash-screen");
  SplashScreen = splash;
} catch {}

try {
  const bungee = require("@expo-google-fonts/bungee");
  Bungee_400Regular = bungee.Bungee_400Regular;
} catch {}

try {
  const fredoka = require("@expo-google-fonts/fredoka");
  Fredoka_400Regular = fredoka.Fredoka_400Regular;
} catch {}

// Prevent splash from hiding until fonts loaded
SplashScreen?.preventAutoHideAsync?.()?.catch?.(() => {});

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
  let fontsLoaded = true;

  if (useFonts && (Bungee_400Regular || Fredoka_400Regular)) {
    const fonts: Record<string, unknown> = {};
    if (Bungee_400Regular) fonts.Bungee_400Regular = Bungee_400Regular;
    if (Fredoka_400Regular) fonts.Fredoka_400Regular = Fredoka_400Regular;
    const [loaded] = useFonts(fonts);
    fontsLoaded = loaded;
  }

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen?.hideAsync?.()?.catch?.(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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
  const [hasNewCostumes, setHasNewCostumes] = useState(false);
  const [hasRooms, setHasRooms] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        const { spacetimeService } = require("@/services/SpacetimeService");
        const rooms = spacetimeService.getRoomList();
        setHasRooms(rooms.length > 0);
      } catch {}

      try {
        const hasNew = GAME_EVENTS.some(
          (e) =>
            isEventActive(e) &&
            e.costumes.length > 0 &&
            getStorage().getItem(e.unlockKey) !== "true",
        );
        setHasNewCostumes(hasNew);
      } catch {}
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NativeTabs
      hidden={isPlaying}
      backgroundColor={colors.surface}
      tintColor={colors.primary}
    >
      <NativeTabs.Trigger
        name="(game)"
        contentStyle={{ backgroundColor: colors.background }}
      >
        <NativeTabs.Trigger.Icon
          sf={{ default: "gamecontroller", selected: "gamecontroller.fill" }}
          md="sports_esports"
        />
        <NativeTabs.Trigger.Label>Play</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="(shop)"
        contentStyle={{ backgroundColor: colors.background }}
      >
        <NativeTabs.Trigger.Icon
          sf={{ default: "cart", selected: "cart.fill" }}
          md="shopping_cart"
        />
        <NativeTabs.Trigger.Label>Shop</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Badge hidden={!hasNewCostumes}>
          NEW
        </NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="(lobby)"
        contentStyle={{ backgroundColor: colors.background }}
      >
        <NativeTabs.Trigger.Icon
          sf={{ default: "person.2", selected: "person.2.fill" }}
          md="groups"
        />
        <NativeTabs.Trigger.Label>Multi</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Badge hidden={!hasRooms}>
          {" "}
        </NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="(profile)"
        contentStyle={{ backgroundColor: colors.background }}
      >
        <NativeTabs.Trigger.Icon
          sf={{
            default: "person.crop.circle",
            selected: "person.crop.circle.fill",
          }}
          md="account_circle"
        />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
