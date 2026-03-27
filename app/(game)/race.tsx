import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useGameState } from "@/context/GameStateContext";
import { getStorage } from "@/services/StorageService";

export default function RaceScreen() {
  const router = useRouter();
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
    <View style={{ flex: 1, backgroundColor: "#2a1205" }}>
      {/* Full screen background image */}
      <View style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        // @ts-ignore
        backgroundImage: "url(/course-bg.jpg)",
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#5a3a2a",
      } as any} />

      {/* Bottom buttons overlay */}
      <View style={{
        position: "absolute", bottom: 80, left: 0, right: 0,
        alignItems: "center", gap: 12, padding: 20,
      }}>
        <Pressable
          onPress={handlePlay}
          style={{
            paddingVertical: 16, paddingHorizontal: 60,
            borderRadius: 50, borderCurve: "continuous",
            backgroundColor: "#4CAF50",
            boxShadow: "0 4px 20px rgba(76,175,80,0.6)",
          }}
        >
          <Text style={{ color: "white", fontSize: 22, fontWeight: "900", letterSpacing: 5 }}>
            Jouer
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace("/")}
          style={{ paddingVertical: 8 }}
        >
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>✕ Fermer</Text>
        </Pressable>
      </View>
    </View>
  );
}
