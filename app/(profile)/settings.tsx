import { useState } from "react";
import { View, Text, Pressable, Alert, StyleSheet, ScrollView, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, spacing } from "@/expo/theme";
import { getStorage } from "@/services/StorageService";
import { allLanguages } from "@/i18n";

export default function SettingsSheet() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 600;
  const [currentLang, setCurrentLang] = useState(i18n.language?.split("-")[0] || "fr");

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, isDesktop && { maxWidth: 600, alignSelf: "center", width: "100%" }]}
    >
      <Text style={styles.title}>{t("settings")}</Text>

      {/* Language */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("language")}</Text>
        <View style={styles.langGrid}>
          {Object.entries(allLanguages).map(([code, name]) => (
            <Pressable
              key={code}
              onPress={() => handleChangeLang(code)}
              style={[
                styles.langBtn,
                currentLang === code && styles.langBtnActive,
              ]}
            >
              <Text style={[
                styles.langText,
                currentLang === code && styles.langTextActive,
              ]}>
                {name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("resetData")}</Text>
        <Pressable onPress={handleReset} style={styles.dangerBtn}>
          <Text style={styles.dangerBtnText}>{t("resetData")}</Text>
        </Pressable>
        <Text style={styles.warning}>{t("resetWarning")}</Text>
      </View>

      <Pressable onPress={() => router.back()} style={styles.closeBtn}>
        <Text style={styles.closeBtnText}>{t("close")}</Text>
      </Pressable>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
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
  langGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  langBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderCurve: "continuous",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  langBtnActive: {
    backgroundColor: "rgba(255,215,0,0.15)",
    borderColor: "rgba(255,215,0,0.4)",
  },
  langText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  langTextActive: {
    color: colors.gold,
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
