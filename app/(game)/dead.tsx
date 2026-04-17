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

  const isRace = gameMode === "race";

  // Save race progress
  if (isRace && deathInfo?.score) {
    try { getStorage().setItem("lastRaceScore", String(deathInfo.score)); } catch {}
  }

  const retry = () => {
    startGame(playerName, playerSkin, gameMode, roomSlug, roomId, seed);
    router.replace({ pathname: "/(game)/play", params: { mode: gameMode } });
  };

  const backToMenu = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    } else {
      router.dismissAll();
    }
  };

  return (
    <View style={{
      flex: 1, backgroundColor: colors.surface, padding: spacing.xl,
      alignItems: "center", justifyContent: "center", gap: spacing.lg,
    }}>
      {isRace ? (
        <>
          <Text style={{ fontSize: 60 }}>😔</Text>
          <Text style={{ color: colors.danger, fontSize: 24, fontWeight: "900", textAlign: "center" }}>
            {t("raceLost")}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: "center", maxWidth: 300 }}>
            {t("raceLostMsg")}
          </Text>
          <Text selectable style={{ color: colors.gold, fontSize: 20, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
            {t("score")}: {deathInfo?.score?.toLocaleString() ?? 0} / 500
          </Text>
        </>
      ) : (
        <>
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
        </>
      )}

      {!isRace && (
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
      )}

      <Pressable
        onPress={backToMenu}
        style={{
          width: "100%", paddingVertical: 14, borderRadius: 50, borderCurve: "continuous",
          backgroundColor: isRace ? "#ff3366" : "transparent",
          borderWidth: isRace ? 0 : 2, borderColor: "rgba(255,255,255,0.3)", alignItems: "center",
          boxShadow: isRace ? "0 6px 25px rgba(255,51,102,0.4)" : "none",
        }}
      >
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: isRace ? "900" : "600" }}>
          {t("back")}
        </Text>
      </Pressable>
    </View>
  );
}
