import { useState } from "react";
import { View, Text, Pressable, Alert, ScrollView, Image, StyleSheet, useWindowDimensions } from "react-native";
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

// Food packs with their items
const FOOD_PACKS = [
  {
    id: "classic",
    name: "Classique",
    icon: "🍔",
    items: ["/food/burger.png", "/food/pizza.png", "/food/donut.png", "/food/hot-dog.png", "/food/muffin.png", "/food/sushi.png"],
    free: true,
  },
  {
    id: "fruits",
    name: "Fruits",
    icon: "🍓",
    items: ["/food/fraise.png", "/food/banane.png", "/food/pomme.png", "/food/gateau.png", "/food/susette.png", "/food/poulet.png"],
    free: true,
  },
  {
    id: "circles",
    name: "Cercles",
    icon: "●",
    items: [],
    free: true,
    isCircles: true,
  },
  {
    id: "emojis",
    name: "Emojis",
    icon: "😋",
    items: [],
    free: true,
    isEmojis: true,
  },
];

const CIRCLE_COLORS = ["#ff3366", "#00ccff", "#7cff00", "#ff6b35", "#ffd700", "#cc33ff", "#ff69b4", "#00ff88"];
const EMOJI_FOOD = ["🍖", "🍗", "🍕", "🍔", "🍩", "🍓", "🍌", "🍎", "🍣", "🌭", "🧁", "🍰"];

export default function SettingsPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 600;
  const [tab, setTab] = useState<"settings" | "food">("settings");
  const [currentLang, setCurrentLang] = useState(i18n.language?.split("-")[0] || "fr");
  const [foodStyle, setFoodStyle] = useState(() => {
    try { return getStorage().getItem("foodStyle") || "classic"; } catch { return "classic"; }
  });

  const handleFoodStyle = (packId: string) => {
    setFoodStyle(packId);
    // Map pack id to engine food style
    const styleMap: Record<string, string> = { classic: "images", fruits: "images", circles: "circles", emojis: "emojis" };
    try {
      getStorage().setItem("foodStyle", styleMap[packId] || "images");
      getStorage().setItem("foodPack", packId);
    } catch {}
  };

  const handleChangeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLang(lang);
    try { getStorage().setItem("userLanguage", lang); } catch {}
  };

  const handleReset = () => {
    if (typeof window !== "undefined") {
      if (!window.confirm(t("resetConfirm"))) return;
      try {
        const storage = getStorage();
        storage.removeItem("playerStats");
        storage.removeItem("totalCoins");
        storage.removeItem("currentSkin");
        storage.removeItem("customSkin");
        storage.removeItem("playerSkin");
      } catch {}
      window.location.href = "/";
      return;
    }
    Alert.alert(t("resetData"), t("resetConfirm"), [
      { text: t("cancel"), style: "cancel" },
      { text: t("confirm"), style: "destructive", onPress: () => {
        try {
          const storage = getStorage();
          storage.removeItem("playerStats");
          storage.removeItem("totalCoins");
          storage.removeItem("currentSkin");
          storage.removeItem("customSkin");
          storage.removeItem("playerSkin");
        } catch {}
        router.back();
      }},
    ]);
  };

  const goBack = () => {
    if (typeof window !== "undefined") window.location.href = "/";
    else router.back();
  };

  const selectedPack = FOOD_PACKS.find((p) => p.id === foodStyle) || FOOD_PACKS[0];

  return (
    <View style={{ flex: 1, height: "100%" as any, backgroundColor: colors.background }}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => setTab("settings")}
          style={[styles.tab, tab === "settings" && styles.tabActive]}
        >
          <Text style={{ fontSize: 22 }}>⚙️</Text>
          <Text style={[styles.tabText, tab === "settings" && styles.tabTextActive]}>{t("settings")}</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("food")}
          style={[styles.tab, tab === "food" && styles.tabActive]}
        >
          <Text style={{ fontSize: 22 }}>🍕</Text>
          <Text style={[styles.tabText, tab === "food" && styles.tabTextActive]}>{t("foodStyleTitle")}</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable onPress={goBack}>
          <Image source={require("../assets/close-red-btn.png")} style={{ width: 50, height: 50 }} />
        </Pressable>
      </View>

      {tab === "settings" ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.container,
            isDesktop && { maxWidth: 500, alignSelf: "center", width: "100%" },
          ]}
        >
          {/* Language */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>🌍 {t("language")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(allLanguages).map(([code, { name, flag }]) => {
                const active = currentLang === code;
                return (
                  <Pressable
                    key={code}
                    onPress={() => handleChangeLang(code)}
                    style={[styles.langBtn, active && styles.langBtnActive]}
                  >
                    <Text style={{ fontSize: 20 }}>{flag}</Text>
                    <Text style={[styles.langText, active && { color: colors.text }]}>{name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Danger zone */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>⚠️ {t("resetData")}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t("resetWarning")}</Text>
            <Pressable onPress={handleReset} style={styles.dangerBtn}>
              <Text style={{ color: colors.danger, fontWeight: "700", fontSize: 15 }}>🗑 {t("resetData")}</Text>
            </Pressable>
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      ) : (
        /* Food tab — full screen image */
        <Image
          source={{ uri: "/food-preview.jpg" }}
          style={{ flex: 1, width: "100%" as any, height: "100%" as any }}
          resizeMode="cover"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  // Tab bar
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  tab: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 12, borderCurve: "continuous",
  },
  tabActive: {
    backgroundColor: "rgba(255,215,0,0.12)",
  },
  tabText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: colors.gold },
  // Cards
  card: {
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, borderCurve: "continuous",
    padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  // Language
  langBtn: {
    flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 12, borderCurve: "continuous", backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.08)",
  },
  langBtnActive: { backgroundColor: "rgba(124,58,237,0.2)", borderColor: "rgba(124,58,237,0.5)" },
  langText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
  // Danger
  dangerBtn: {
    paddingVertical: 14, borderRadius: 14, borderCurve: "continuous",
    backgroundColor: "rgba(255,51,102,0.15)", borderWidth: 1.5, borderColor: "rgba(255,51,102,0.3)",
    alignItems: "center",
  },
  // Food tab
  foodTabContainer: {
    flex: 1, flexDirection: "row",
  },
  foodList: {
    width: 130,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  packItem: {
    alignItems: "center", gap: 4,
    paddingVertical: 14, paddingHorizontal: 8,
    borderRadius: 14, borderCurve: "continuous",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  packItemActive: {
    backgroundColor: "rgba(255,215,0,0.12)",
    borderColor: "rgba(255,215,0,0.5)",
  },
  packName: { color: colors.textSecondary, fontSize: 11, fontWeight: "700", textAlign: "center" },
  packCheck: {
    position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.gold, alignItems: "center", justifyContent: "center",
  },
  // Preview
  previewArea: {
    flex: 1, padding: spacing.lg, gap: spacing.md,
  },
  previewTitle: {
    color: colors.gold, fontSize: 18, fontWeight: "800", letterSpacing: 1, textAlign: "center",
  },
  previewBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20, borderCurve: "continuous",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    padding: spacing.lg,
    justifyContent: "center", alignItems: "center",
  },
  previewGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 16,
    justifyContent: "center", alignItems: "center",
  },
  previewImg: {
    width: 50, height: 50,
  },
  previewCircle: {
    width: 30, height: 30, borderRadius: 15,
  },
});
