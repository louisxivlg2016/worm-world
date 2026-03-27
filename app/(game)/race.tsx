import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useGameState } from "@/context/GameStateContext";
import { colors, spacing } from "@/expo/theme";
import { getStorage } from "@/services/StorageService";

const AI_RACERS = [
  { name: "Flash", emoji: "⚡", color: "#ff3366" },
  { name: "Gogo", emoji: "🏎️", color: "#00ccff" },
  { name: "Turbo", emoji: "🚀", color: "#7cff00" },
  { name: "Zoom", emoji: "💨", color: "#ff6b35" },
  { name: "Roulie", emoji: "🐍", color: "#cc33ff" },
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

  const contentWidth = isDesktop ? 500 : width - 32;

  return (
    <View style={{ flex: 1, backgroundColor: "#2a1205" }}>
      {/* Background image via CSS */}
      <View style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        opacity: 0.4,
        // @ts-ignore web-only
        backgroundImage: "url(/course-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      } as any} />

      <View style={{
        flex: 1, alignItems: "center", justifyContent: "center",
        padding: spacing.lg,
      }}>
        <View style={{
          width: contentWidth, maxWidth: 500,
          backgroundColor: "rgba(80,40,20,0.85)", borderRadius: 20, borderCurve: "continuous",
          padding: spacing.lg, gap: spacing.sm,
          borderWidth: 2, borderColor: "rgba(255,215,0,0.3)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}>
          {/* Header */}
          <Text style={{ fontSize: 36, textAlign: "center" }}>🏁</Text>
          <Text style={{
            color: "#ffd700", fontSize: 22, fontWeight: "900", textAlign: "center",
            letterSpacing: 2,
          }}>
            Grand Prix
          </Text>
          <Text style={{
            color: "rgba(255,255,255,0.6)", fontSize: 13, textAlign: "center",
            marginBottom: spacing.sm,
          }}>
            Mange pour avancer ! Premier à 500 points gagne.
          </Text>

          {/* Player lane */}
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 10,
            backgroundColor: "rgba(255,215,0,0.15)", borderRadius: 12, borderCurve: "continuous",
            padding: 10, borderWidth: 1, borderColor: "rgba(255,215,0,0.3)",
          }}>
            <Text style={{ fontSize: 18 }}>⭐</Text>
            <View style={{
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: activeSkin.colors[0],
              borderWidth: 2, borderColor: "#ffd700",
            }} />
            <Text style={{ color: "#ffd700", fontWeight: "700", fontSize: 14, flex: 1 }}>
              {playerName}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>0 pts</Text>
            <Text style={{ fontSize: 16 }}>🏆</Text>
          </View>

          {/* AI lanes */}
          {AI_RACERS.map((racer, i) => (
            <View key={racer.name} style={{
              flexDirection: "row", alignItems: "center", gap: 10,
              backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, borderCurve: "continuous",
              padding: 10,
            }}>
              <Text style={{ fontSize: 18 }}>{racer.emoji}</Text>
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: racer.color,
                borderWidth: 2, borderColor: "rgba(255,255,255,0.2)",
              }} />
              <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "600", fontSize: 14, flex: 1 }}>
                {racer.name}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>0 pts</Text>
              {i < 2 && <Text style={{ fontSize: 14 }}>{i === 0 ? "🥈" : "🥉"}</Text>}
            </View>
          ))}

          {/* Rewards */}
          <View style={{
            backgroundColor: "rgba(255,215,0,0.1)", borderRadius: 10, borderCurve: "continuous",
            padding: 10, marginTop: 4,
          }}>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textAlign: "center" }}>
              🥇 100 🪙  ·  🥈 50 🪙  ·  🥉 25 🪙
            </Text>
          </View>

          {/* PLAY button */}
          <Pressable
            onPress={handlePlay}
            style={{
              paddingVertical: 16, borderRadius: 50, borderCurve: "continuous",
              backgroundColor: "#228B22", alignItems: "center", marginTop: spacing.sm,
              boxShadow: "0 6px 25px rgba(34,139,34,0.5)",
            }}
          >
            <Text style={{ color: "white", fontSize: 20, fontWeight: "900", letterSpacing: 4 }}>
              JOUER
            </Text>
          </Pressable>

          {/* Close */}
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={{ alignItems: "center", paddingVertical: 8 }}>
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>✕ Fermer</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
