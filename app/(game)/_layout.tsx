import { Stack } from "expo-router";
import { colors } from "@/expo/theme";

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        headerBlurEffect: "none",
        contentStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Play" }} />
      <Stack.Screen
        name="edit-username"
        options={{
          title: "Edit Username",
          presentation: "formSheet",
          sheetAllowedDetents: [0.35],
          sheetGrabberVisible: true,
          sheetCornerRadius: 24,
        }}
      />
    </Stack>
  );
}
