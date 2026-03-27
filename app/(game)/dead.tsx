import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useGameState } from "@/context/GameStateContext";
import { getStorage } from "@/services/StorageService";
import { colors, spacing } from "@/expo/theme";

export default function DeadScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { deathInfo, playerName, playerSkin, gameMode, roomSlug, roomId, seed, startGame } = useGameState();

  // Save race progress
  if (gameMode === "race" && deathInfo?.score) {
    try { getStorage().setItem("lastRaceScore", String(deathInfo.score)); } catch {}
  }

  const retry = () => {
    startGame(playerName, playerSkin, gameMode, roomSlug, roomId, seed);
    router.replace("/(game)/play");
  };

  const backToMenu = () => {
    router.dismissAll();
  };

  return (
    <View style={{
      flex: 1, backgroundColor: colors.surface, padding: spacing.xl,
      alignItems: "center", justifyContent: "center", gap: spacing.lg,
    }}>
      <Text style={{ color: colors.danger, fontSize: 28, fontWeight: "900", letterSpacing: 3 }}>
        {t("gameOver")}
      </Text>

      <Text selectable style={{ color: colors.gold, fontSize: 48, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
        {deathInfo?.score?.toLocaleString() ?? 0}
      </Text>

      <View style={{ flexDirection: "row", gap: spacing.xl }}>
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t("length")}</Text>
          <Text selectable style={{ color: colors.text, fontSize: 20, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
            {deathInfo?.length ?? 0}
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>🪙</Text>
          <Text selectable style={{ color: colors.gold, fontSize: 20, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
            {deathInfo?.coins ?? 0}
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>💀</Text>
          <Text selectable style={{ color: colors.text, fontSize: 20, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
            {deathInfo?.kills ?? 0}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={retry}
        style={{
          width: "100%", paddingVertical: 16, borderRadius: 50, borderCurve: "continuous",
          backgroundColor: "#ff3366", alignItems: "center",
          boxShadow: "0 6px 25px rgba(255,51,102,0.4)",
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "900", letterSpacing: 3 }}>
          {t("retry")}
        </Text>
      </Pressable>

      <Pressable
        onPress={backToMenu}
        style={{
          width: "100%", paddingVertical: 14, borderRadius: 50, borderCurve: "continuous",
          borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", alignItems: "center",
        }}
      >
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>
          {t("back")}
        </Text>
      </Pressable>
    </View>
  );
}
