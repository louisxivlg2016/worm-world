import { View, Text, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useGameState } from "@/context/GameStateContext";
import { colors, spacing } from "@/expo/theme";
import { getStorage } from "@/services/StorageService";

const AI_RACERS = [
  { name: "Flash", emoji: "⚡" },
  { name: "Gogo", emoji: "🏎️" },
  { name: "Turbo", emoji: "🚀" },
  { name: "Zoom", emoji: "💨" },
  { name: "Roulie", emoji: "🐍" },
];

export default function RaceScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 600;
  const { startGame, playerSkin, customSkin } = useGameState();

  const playerName = (() => {
    try { return getStorage().getItem("playerName") || "Joueur"; } catch { return "Joueur"; }
  })();

  const activeSkin = customSkin ?? playerSkin;

  const handlePlay = () => {
    startGame(playerName, activeSkin, "race" as any);
    router.push("/(game)/play");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#3a1a0a" }}
      contentContainerStyle={{
        alignItems: "center", padding: spacing.lg, gap: spacing.md,
        maxWidth: isDesktop ? 500 : undefined,
        alignSelf: isDesktop ? "center" : undefined,
        width: isDesktop ? "100%" : undefined,
      }}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Header */}
      <Text style={{ fontSize: 40, marginTop: spacing.md }}>🏁</Text>
      <Text style={{
        color: "#ffd700", fontSize: 24, fontWeight: "900", textAlign: "center",
        letterSpacing: 2,
      }}>
        Grand Prix
      </Text>
      <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, textAlign: "center", maxWidth: 300 }}>
        Mange pour avancer ! Premier à 500 points gagne la course.
      </Text>

      {/* Racers list */}
      <View style={{
        width: "100%", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 16,
        borderCurve: "continuous", padding: spacing.md, gap: 6,
        borderWidth: 1, borderColor: "rgba(255,215,0,0.2)",
      }}>
        {/* Player */}
        <View style={{
          flexDirection: "row", alignItems: "center", gap: spacing.sm,
          backgroundColor: "rgba(255,215,0,0.15)", borderRadius: 12, borderCurve: "continuous",
          padding: 12, borderWidth: 1, borderColor: "rgba(255,215,0,0.3)",
        }}>
          <Text style={{ fontSize: 20 }}>⭐</Text>
          <View style={{
            backgroundColor: activeSkin.colors[0], width: 32, height: 32, borderRadius: 16,
            borderWidth: 2, borderColor: "#ffd700",
          }} />
          <Text style={{ color: "#ffd700", fontWeight: "700", fontSize: 16, flex: 1 }}>
            {playerName}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>0 pts</Text>
          <Text style={{ fontSize: 18 }}>🏆</Text>
        </View>

        {/* AI racers */}
        {AI_RACERS.map((racer, i) => (
          <View key={racer.name} style={{
            flexDirection: "row", alignItems: "center", gap: spacing.sm,
            backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, borderCurve: "continuous",
            padding: 12,
          }}>
            <Text style={{ fontSize: 20 }}>{racer.emoji}</Text>
            <View style={{
              backgroundColor: ["#ff3366", "#00ccff", "#7cff00", "#ff6b35", "#cc33ff"][i],
              width: 32, height: 32, borderRadius: 16,
              borderWidth: 2, borderColor: "rgba(255,255,255,0.2)",
            }} />
            <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "600", fontSize: 15, flex: 1 }}>
              {racer.name}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>0 pts</Text>
            <Text style={{ fontSize: 16 }}>
              {i === 0 ? "🥈" : i === 1 ? "🥉" : ""}
            </Text>
          </View>
        ))}
      </View>

      {/* Rewards info */}
      <View style={{
        width: "100%", backgroundColor: "rgba(255,215,0,0.1)", borderRadius: 12,
        borderCurve: "continuous", padding: spacing.md,
        borderWidth: 1, borderColor: "rgba(255,215,0,0.2)",
      }}>
        <Text style={{ color: "#ffd700", fontWeight: "700", fontSize: 14, marginBottom: 4 }}>
          Récompenses
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
          🥇 1er — 100 🪙  ·  🥈 2ème — 50 🪙  ·  🥉 3ème — 25 🪙
        </Text>
      </View>

      {/* Play button */}
      <Pressable
        onPress={handlePlay}
        style={{
          width: "100%", paddingVertical: 18, borderRadius: 50, borderCurve: "continuous",
          backgroundColor: "#228B22", alignItems: "center",
          boxShadow: "0 6px 25px rgba(34,139,34,0.5)",
        }}
      >
        <Text style={{ color: "white", fontSize: 22, fontWeight: "900", letterSpacing: 4 }}>
          JOUER
        </Text>
      </Pressable>

      {/* Back */}
      <Pressable onPress={() => router.back()} style={{ paddingVertical: 12 }}>
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Retour</Text>
      </Pressable>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}
