import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useGameState } from "@/context/GameStateContext";
import { getEventByMode } from "@/config/events";
import { colors, spacing } from "@/expo/theme";

export default function EventWinScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { gameMode } = useGameState();
  const event = getEventByMode(gameMode);

  return (
    <View style={{
      flex: 1, backgroundColor: colors.surface, padding: spacing.xl,
      alignItems: "center", justifyContent: "center", gap: spacing.lg,
    }}>
      <Text style={{ fontSize: 80 }}>{event?.emoji ?? "🎉"}</Text>

      <Text style={{ color: colors.gold, fontSize: 24, fontWeight: "900", textAlign: "center" }}>
        {event?.winTitle ?? t("eventWin")}
      </Text>

      <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: "center", maxWidth: 300 }}>
        {event?.winMessage ?? t("eventWinMsg")}
      </Text>

      <Pressable
        onPress={() => router.dismissAll()}
        style={{
          width: "100%", paddingVertical: 16, borderRadius: 50, borderCurve: "continuous",
          backgroundColor: "#ff3366", alignItems: "center",
          boxShadow: "0 6px 25px rgba(255,51,102,0.4)",
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "900" }}>OK</Text>
      </Pressable>
    </View>
  );
}
