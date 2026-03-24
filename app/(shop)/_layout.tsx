import { Stack } from "expo-router";
import { colors } from "@/expo/theme";

export default function ShopLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        headerBlurEffect: "none",
        contentStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Shop" }} />
      <Stack.Screen
        name="buy-confirm"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.35],
          sheetGrabberVisible: true,
          contentStyle: { backgroundColor: "transparent" },
          title: "Confirmer",
        }}
      />
    </Stack>
  );
}
