import { View, Text, Pressable, Image, StyleSheet } from "react-native";
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
    <View style={styles.container}>
      <Image
        source={require("../../assets/course-bg.jpg")}
        style={styles.bgImage}
      />

      <View style={styles.buttons}>
        <Pressable onPress={handlePlay} style={styles.playBtn}>
          <Text style={styles.playText}>Jouer</Text>
        </Pressable>

        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace("/")}
          style={styles.closeBtn}
        >
          <Text style={styles.closeText}>✕ Fermer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3a1a0a",
  },
  bgImage: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
  },
  buttons: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 12,
    padding: 20,
  },
  playBtn: {
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 50,
    borderCurve: "continuous",
    backgroundColor: "#4CAF50",
    boxShadow: "0 4px 20px rgba(76,175,80,0.6)",
  },
  playText: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 5,
  },
  closeBtn: {
    paddingVertical: 8,
  },
  closeText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
  },
});
