import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing } from "@/expo/theme";
import { useGameState } from "@/context/GameStateContext";

export default function BuyConfirmSheet() {
  const router = useRouter();
  const { totalCoins, applySkin } = useGameState();
  const params = useLocalSearchParams<{
    price: string;
    flag: string;
    headType: string;
    bodyStyle: string;
    colors: string;
  }>();

  const price = parseInt(params.price ?? "0", 10);
  const canAfford = totalCoins >= price;

  const handleConfirm = () => {
    if (!canAfford && price > 0) return;
    const skinColors = (() => { try { return JSON.parse(params.colors ?? "[]"); } catch { return ["#888", "#999", "#888", "#999"]; } })();
    applySkin({
      colors: skinColors,
      eye: "#fff",
      name: "Custom",
      headType: params.headType as any,
      bodyStyle: (params.bodyStyle as any) ?? "circles",
      isFlag: !!(params.flag),
      bodyTexture: params.flag ? undefined : undefined,
    }, price);
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
            {totalCoins} 🪙
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
