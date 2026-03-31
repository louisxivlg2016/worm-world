import { Stack } from "expo-router";
import { colors } from "@/expo/theme";

export default function ProfileLayout() {
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
      <Stack.Screen name="index" options={{ title: "Profile" }} />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </Stack>
  );
}
