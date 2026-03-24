import { View, Text, Pressable, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing } from "@/expo/theme";
import { getStorage } from "@/services/StorageService";

export default function SettingsSheet() {
  const router = useRouter();

  const handleReset = () => {
    Alert.alert(
      "Supprimer les données",
      "Supprimer toutes les données ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            try {
              const storage = getStorage();
              storage.removeItem("playerStats");
              storage.removeItem("playerCoins");
              storage.removeItem("currentSkin");
            } catch (e) {
              console.error("Failed to reset data:", e);
            }
            router.back();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paramètres</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Données</Text>
        <Pressable onPress={handleReset} style={styles.dangerBtn}>
          <Text style={styles.dangerBtnText}>Réinitialiser les données</Text>
        </Pressable>
        <Text style={styles.warning}>
          Supprime les statistiques, pièces et costumes débloqués.
        </Text>
      </View>

      <Pressable onPress={() => router.back()} style={styles.closeBtn}>
        <Text style={styles.closeBtnText}>Fermer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginTop: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dangerBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: colors.danger,
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(255,51,102,0.3)",
  },
  dangerBtnText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
  warning: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
  closeBtn: {
    paddingVertical: 14,
    borderRadius: 30,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    marginTop: "auto",
  },
  closeBtnText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 16,
  },
});
