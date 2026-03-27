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

  const contentWidth = isDesktop ? 500 : width - 24;

  return (
    <View style={{ flex: 1 }}>
      {/* Full screen background image */}
      <View style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        // @ts-ignore
        backgroundImage: "url(/course-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      } as any} />

      {/* Content overlay */}
      <View style={{
        flex: 1, alignItems: "center", justifyContent: "center",
        padding: 12,
      }}>
        {/* Main card */}
        <View style={{
          width: contentWidth, maxWidth: 500,
          borderRadius: 20, borderCurve: "continuous",
          overflow: "hidden",
          borderWidth: 3, borderColor: "rgba(255,215,0,0.5)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}>
          {/* Header banner */}
          <View style={{
            backgroundColor: "#c41e5c",
            paddingVertical: 14, alignItems: "center",
          }}>
            <Text style={{ fontSize: 28 }}>🏁🏆🏁</Text>
            <Text style={{
              color: "#ffd700", fontSize: 20, fontWeight: "900",
              letterSpacing: 3, textAlign: "center",
              textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
            }}>
              Grand Prix
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>
              Premier à 500 points gagne la course !
            </Text>
          </View>

          {/* Racers panel */}
          <View style={{
            backgroundColor: "rgba(60,30,50,0.92)",
            padding: 12, gap: 6,
          }}>
            {/* Player lane */}
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 8,
              backgroundColor: "rgba(255,215,0,0.12)",
              borderRadius: 10, borderCurve: "continuous", padding: 10,
              borderWidth: 1, borderColor: "rgba(255,215,0,0.3)",
            }}>
              <View style={{
                width: 30, height: 30, borderRadius: 15,
                backgroundColor: activeSkin.colors[0],
                borderWidth: 2, borderColor: "#ffd700",
              }} />
              <Text style={{ color: "#ffd700", fontWeight: "800", fontSize: 14 }}>
                {playerName}
              </Text>
              <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 6 }}>
                <View style={{ width: "0%", height: "100%", borderRadius: 4, backgroundColor: "#ffd700" }} />
              </View>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontVariant: ["tabular-nums"] }}>0m</Text>
              <Text style={{ fontSize: 16 }}>🏆</Text>
            </View>

            {/* AI lanes */}
            {AI_RACERS.map((racer, i) => {
              const fakeProgress = [0, 15, 30, 50, 8][i];
              return (
                <View key={racer.name} style={{
                  flexDirection: "row", alignItems: "center", gap: 8,
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderRadius: 10, borderCurve: "continuous", padding: 10,
                }}>
                  <View style={{
                    width: 30, height: 30, borderRadius: 15,
                    backgroundColor: racer.color,
                    borderWidth: 2, borderColor: "rgba(255,255,255,0.15)",
                  }} />
                  <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "600", fontSize: 13, width: 50 }}>
                    {racer.name}
                  </Text>
                  <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.08)", marginHorizontal: 4 }}>
                    <View style={{ width: `${fakeProgress}%`, height: "100%", borderRadius: 4, backgroundColor: racer.color, opacity: 0.7 } as any} />
                  </View>
                  <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontVariant: ["tabular-nums"] }}>
                    ~{(fakeProgress * 10).toLocaleString()}m
                  </Text>
                  {i < 3 && <Text style={{ fontSize: 14 }}>{["🥈", "🥉", ""][i]}</Text>}
                </View>
              );
            })}
          </View>

          {/* Rewards + checkered finish line */}
          <View style={{
            backgroundColor: "rgba(40,20,35,0.95)",
            padding: 12, gap: 10,
            // Checkered border at bottom
            borderTopWidth: 3,
            borderTopColor: "rgba(255,215,0,0.2)",
          }}>
            {/* Rewards */}
            <View style={{
              flexDirection: "row", justifyContent: "center", gap: 16,
            }}>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>🥇 100 🪙</Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>🥈 50 🪙</Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>🥉 25 🪙</Text>
            </View>

            {/* PLAY button */}
            <Pressable
              onPress={handlePlay}
              style={{
                paddingVertical: 16, borderRadius: 50, borderCurve: "continuous",
                backgroundColor: "#4CAF50", alignItems: "center",
                boxShadow: "0 4px 20px rgba(76,175,80,0.5)",
              }}
            >
              <Text style={{ color: "white", fontSize: 22, fontWeight: "900", letterSpacing: 5 }}>
                Jouer
              </Text>
            </Pressable>

            {/* Close */}
            <Pressable
              onPress={() => router.canGoBack() ? router.back() : router.replace("/")}
              style={{ alignItems: "center", paddingVertical: 4 }}
            >
              <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>✕ Fermer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
