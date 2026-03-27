import { View, Text, Pressable, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { useGameState } from "@/context/GameStateContext";
import { getStorage } from "@/services/StorageService";

const courseBg = require("../../assets/course-bg.jpg");

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
    <ImageBackground source={courseBg} style={{ flex: 1, width: "100%", height: "100%" }} resizeMode="stretch">
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
    </ImageBackground>
  );
}
