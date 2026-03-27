import { Stack } from "expo-router";
import { colors } from "@/expo/theme";

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="race" />
      <Stack.Screen name="play" options={{ gestureEnabled: false }} />
      <Stack.Screen
        name="dead"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.5, 0.75],
          sheetGrabberVisible: true,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
      <Stack.Screen
        name="event-win"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.5],
          sheetGrabberVisible: true,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
      <Stack.Screen
        name="race-win"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.5],
          sheetGrabberVisible: true,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
      <Stack.Screen
        name="edit-username"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.35],
          sheetGrabberVisible: true,
        }}
      />
    </Stack>
  );
}
