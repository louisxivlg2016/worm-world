import { useState } from "react";
import { View, Text, Pressable, Alert, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, spacing } from "@/expo/theme";
import { getStorage } from "@/services/StorageService";

const allLanguages: Record<string, { name: string; flag: string }> = {
  fr: { name: "Français", flag: "🇫🇷" },
  en: { name: "English", flag: "🇬🇧" },
  es: { name: "Español", flag: "🇪🇸" },
  it: { name: "Italiano", flag: "🇮🇹" },
  ru: { name: "Русский", flag: "🇷🇺" },
  zh: { name: "中文", flag: "🇨🇳" },
  ar: { name: "العربية", flag: "🇸🇦" },
  hi: { name: "हिन्दी", flag: "🇮🇳" },
};

const FOOD_CIRCLE_COLORS = ["#ff3366", "#00ccff", "#7cff00", "#ff6b35", "#ffd700", "#cc33ff"];

export default function SettingsSheet() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 600;
  const [currentLang, setCurrentLang] = useState(i18n.language?.split("-")[0] || "fr");
  const [foodStyle, setFoodStyle] = useState(() => {
    try { return getStorage().getItem("foodStyle") || "images"; } catch { return "images"; }
  });

  const foodStyles = [
    { id: "images", icon: "🍔", label: t("foodImages") },
    { id: "circles", icon: "●", label: t("foodCircles") },
    { id: "emojis", icon: "😋", label: t("foodEmojis") },
  ];

  const handleFoodStyle = (style: string) => {
    setFoodStyle(style);
    try { getStorage().setItem("foodStyle", style); } catch {}
  };

  const handleChangeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLang(lang);
    try { getStorage().setItem("userLanguage", lang); } catch {}
  };

  const handleReset = () => {
    Alert.alert(
      t("resetData"),
      t("resetConfirm"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("confirm"),
          style: "destructive",
          onPress: () => {
            try {
              const storage = getStorage();
              storage.removeItem("playerStats");
              storage.removeItem("totalCoins");
              storage.removeItem("currentSkin");
              storage.removeItem("customSkin");
              storage.removeItem("playerSkin");
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        styles.container,
        isDesktop && { maxWidth: 500, alignSelf: "center", width: "100%" },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>⚙️</Text>
        <Text style={styles.title}>{t("settings")}</Text>
      </View>

      {/* Food style */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🍕 {t("foodStyleTitle")}</Text>
        <View style={styles.foodGrid}>
          {foodStyles.map((fs) => {
            const active = foodStyle === fs.id;
            return (
              <Pressable
                key={fs.id}
                onPress={() => handleFoodStyle(fs.id)}
                style={[styles.foodCard, active && styles.foodCardActive]}
              >
                <View style={styles.foodPreview}>
                  {fs.id === "images" && (
                    <Text style={{ fontSize: 28 }}>🍔🍕🍩</Text>
                  )}
                  {fs.id === "circles" && (
                    <View style={{ flexDirection: "row", gap: 4 }}>
                      {FOOD_CIRCLE_COLORS.slice(0, 4).map((c, i) => (
                        <View key={i} style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: c }} />
                      ))}
                    </View>
                  )}
                  {fs.id === "emojis" && (
                    <Text style={{ fontSize: 28 }}>🍖🍗🍌</Text>
                  )}
                </View>
                <Text style={[styles.foodLabel, active && { color: colors.gold }]}>
                  {fs.label}
                </Text>
                {active && <View style={styles.checkBadge}><Text style={{ fontSize: 12 }}>✓</Text></View>}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Language */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🌍 {t("language")}</Text>
        <View style={styles.langGrid}>
          {Object.entries(allLanguages).map(([code, { name, flag }]) => {
            const active = currentLang === code;
            return (
              <Pressable
                key={code}
                onPress={() => handleChangeLang(code)}
                style={[styles.langBtn, active && styles.langBtnActive]}
              >
                <Text style={{ fontSize: 20 }}>{flag}</Text>
                <Text style={[styles.langText, active && styles.langTextActive]}>
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Danger zone */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>⚠️ {t("resetData")}</Text>
        <Text style={styles.warning}>{t("resetWarning")}</Text>
        <Pressable onPress={handleReset} style={styles.dangerBtn}>
          <Text style={styles.dangerBtnText}>🗑 {t("resetData")}</Text>
        </Pressable>
      </View>

      {/* Back button */}
      <Pressable onPress={() => router.back()} style={styles.closeBtn}>
        <Text style={styles.closeBtnText}>← {t("close")}</Text>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    alignItems: "center",
    gap: 4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  headerIcon: {
    fontSize: 40,
  },
  title: {
    color: colors.gold,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    borderCurve: "continuous",
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  // Food style
  foodGrid: {
    flexDirection: "row",
    gap: 10,
  },
  foodCard: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderCurve: "continuous",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.08)",
  },
  foodCardActive: {
    backgroundColor: "rgba(255,215,0,0.1)",
    borderColor: "rgba(255,215,0,0.5)",
    boxShadow: "0 0 20px rgba(255,215,0,0.15)",
  },
  foodPreview: {
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  foodLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  checkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  // Language
  langGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  langBtnActive: {
    backgroundColor: "rgba(124,58,237,0.2)",
    borderColor: "rgba(124,58,237,0.5)",
    boxShadow: "0 0 12px rgba(124,58,237,0.2)",
  },
  langText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  langTextActive: {
    color: colors.text,
  },
  // Danger
  dangerBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    borderCurve: "continuous",
    backgroundColor: "rgba(255,51,102,0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(255,51,102,0.3)",
    alignItems: "center",
  },
  dangerBtnText: {
    color: colors.danger,
    fontWeight: "700",
    fontSize: 15,
  },
  warning: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  // Close
  closeBtn: {
    paddingVertical: 16,
    borderRadius: 50,
    borderCurve: "continuous",
    backgroundColor: "rgba(124,58,237,0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(124,58,237,0.4)",
    alignItems: "center",
    boxShadow: "0 4px 15px rgba(124,58,237,0.2)",
  },
  closeBtnText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 1,
  },
});
