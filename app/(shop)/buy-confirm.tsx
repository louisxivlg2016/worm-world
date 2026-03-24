import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing } from "@/expo/theme";
import { getStorage } from "@/services/StorageService";

export default function BuyConfirmSheet() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    price: string;
    flag: string;
    headType: string;
    bodyStyle: string;
    colors: string;
  }>();

  const price = parseInt(params.price ?? "0", 10);
  const currentCoins = (() => {
    try {
      return parseInt(getStorage().getItem("playerCoins") ?? "0", 10) || 0;
    } catch {
      return 0;
    }
  })();
  const canAfford = currentCoins >= price;

  const handleConfirm = () => {
    if (!canAfford) return;
    try {
      const storage = getStorage();
      const newBalance = currentCoins - price;
      storage.setItem("playerCoins", String(newBalance));

      const skinData = {
        colors: JSON.parse(params.colors ?? "[]"),
        headType: params.headType ?? "default",
        bodyStyle: params.bodyStyle ?? "circles",
        flag: params.flag ?? null,
      };
      storage.setItem("currentSkin", JSON.stringify(skinData));
    } catch (e) {
      console.error("Failed to save skin:", e);
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmer l'achat</Text>

      {price > 0 ? (
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Coût</Text>
          <Text style={styles.priceValue}>{price} {"\u{1FA99}"}</Text>
        </View>
      ) : (
        <Text style={styles.freeText}>Gratuit !</Text>
      )}

      {price > 0 && (
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Solde actuel</Text>
          <Text style={[styles.balanceValue, !canAfford && styles.balanceInsufficient]}>
            {currentCoins} {"\u{1FA99}"}
          </Text>
        </View>
      )}

      {!canAfford && price > 0 && (
        <Text style={styles.errorText}>Solde insuffisant</Text>
      )}

      <View style={styles.btnRow}>
        <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>
        <Pressable
          onPress={handleConfirm}
          style={[styles.confirmBtn, !canAfford && price > 0 && styles.confirmBtnDisabled]}
        >
          <Text style={styles.confirmText}>Confirmer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  priceLabel: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  priceValue: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  freeText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: "700",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  balanceLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  balanceValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  balanceInsufficient: {
    color: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  btnRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: 30,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  cancelText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 15,
  },
  confirmBtn: {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: 30,
    borderCurve: "continuous",
    backgroundColor: colors.primary,
    boxShadow: "0 4px 12px rgba(124,58,237,0.4)",
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
});
