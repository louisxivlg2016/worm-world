import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useGameState } from "@/context/GameStateContext";
import { getStorage } from "@/services/StorageService";
import { colors, spacing } from "@/expo/theme";

export default function RaceWinScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { addCoins, deathInfo } = useGameState();

  // Save race score so the race screen shows progress
  const score = deathInfo?.score ?? 500;
  try { getStorage().setItem("lastRaceScore", String(score)); } catch {}

  const handleClaim = () => {
    addCoins(100);
    router.replace("/(game)/race");
  };

  return (
    <View style={{
      flex: 1, backgroundColor: colors.surface, padding: spacing.xl,
      alignItems: "center", justifyContent: "center", gap: spacing.lg,
    }}>
      <Text style={{ fontSize: 80 }}>🏆</Text>

      <Text style={{ color: colors.gold, fontSize: 28, fontWeight: "900", textAlign: "center" }}>
        {t("raceWin")}
      </Text>

      <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: "center", maxWidth: 300 }}>
        {t("raceWinMsg")} +100 🪙
      </Text>

      <Pressable
        onPress={handleClaim}
        style={{
          width: "100%", paddingVertical: 16, borderRadius: 50, borderCurve: "continuous",
          backgroundColor: "#228B22", alignItems: "center",
          boxShadow: "0 6px 25px rgba(34,139,34,0.4)",
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "900" }}>
          {t("raceClaim")} 🪙 100
        </Text>
      </Pressable>
    </View>
  );
}
