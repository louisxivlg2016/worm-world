import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { colors, spacing } from "@/expo/theme";
import { useGameState } from "@/context/GameStateContext";
import { FLAG_IMAGES } from "@/assets/flags";
import { SKINS } from "@/types/game";
import { getStorage } from "@/services/StorageService";
import { GAME_EVENTS } from "@/config/events";

type FlagSkin = {
  name: string;
  colors: [string, string, string, string];
};

const FLAG_SKINS: FlagSkin[] = [
  { name: "France", colors: ["#002395", "#FFFFFF", "#ED2939", "#002395"] },
  { name: "Allemagne", colors: ["#000000", "#DD0000", "#FFCC00", "#000000"] },
  { name: "Italie", colors: ["#008C45", "#FFFFFF", "#CD212A", "#008C45"] },
  { name: "Espagne", colors: ["#AA151B", "#F1BF00", "#AA151B", "#F1BF00"] },
  { name: "Portugal", colors: ["#006600", "#FF0000", "#FFCC00", "#006600"] },
  { name: "Royaume-Uni", colors: ["#00247D", "#CF142B", "#FFFFFF", "#CF142B"] },
  { name: "Belgique", colors: ["#000000", "#FDDA24", "#EF3340", "#000000"] },
  { name: "Pays-Bas", colors: ["#AE1C28", "#FFFFFF", "#21468B", "#AE1C28"] },
  { name: "Suisse", colors: ["#FF0000", "#FFFFFF", "#FF0000", "#FFFFFF"] },
  { name: "Suede", colors: ["#005BAA", "#FECC02", "#005BAA", "#FECC02"] },
  { name: "Pologne", colors: ["#FFFFFF", "#DC143C", "#FFFFFF", "#DC143C"] },
  { name: "Ukraine", colors: ["#0057B7", "#FFD700", "#0057B7", "#FFD700"] },
  { name: "Grece", colors: ["#004C98", "#FFFFFF", "#004C98", "#FFFFFF"] },
  { name: "Roumanie", colors: ["#002B7F", "#FCD116", "#CE1126", "#002B7F"] },
  { name: "Irlande", colors: ["#169B62", "#FFFFFF", "#FF883E", "#169B62"] },
  { name: "Croatie", colors: ["#FF0000", "#FFFFFF", "#171796", "#FF0000"] },
  { name: "Norvege", colors: ["#EF2B2D", "#002868", "#FFFFFF", "#EF2B2D"] },
  { name: "Danemark", colors: ["#C60C30", "#FFFFFF", "#C60C30", "#FFFFFF"] },
  { name: "Finlande", colors: ["#FFFFFF", "#003580", "#FFFFFF", "#003580"] },
  { name: "Russie", colors: ["#FFFFFF", "#0039A6", "#D52B1E", "#FFFFFF"] },
  { name: "Turquie", colors: ["#E30A17", "#FFFFFF", "#E30A17", "#FFFFFF"] },
  { name: "USA", colors: ["#3C3B6E", "#B22234", "#FFFFFF", "#B22234"] },
  { name: "Canada", colors: ["#FF0000", "#FFFFFF", "#FF0000", "#FFFFFF"] },
  { name: "Mexique", colors: ["#006341", "#FFFFFF", "#CE1126", "#006341"] },
  { name: "Bresil", colors: ["#009739", "#FEDD00", "#012169", "#009739"] },
  { name: "Argentine", colors: ["#74ACDF", "#FFFFFF", "#74ACDF", "#74ACDF"] },
  { name: "Colombie", colors: ["#FCD116", "#003893", "#CE1126", "#FCD116"] },
  { name: "Japon", colors: ["#FFFFFF", "#BC002D", "#FFFFFF", "#BC002D"] },
  { name: "Chine", colors: ["#DE2910", "#FFDE00", "#DE2910", "#FFDE00"] },
  { name: "Coree du Sud", colors: ["#FFFFFF", "#CD2E3A", "#0047A0", "#000000"] },
  { name: "Inde", colors: ["#FF9933", "#FFFFFF", "#138808", "#000080"] },
  { name: "Maroc", colors: ["#C1272D", "#006233", "#C1272D", "#006233"] },
  { name: "Algerie", colors: ["#006633", "#FFFFFF", "#D21034", "#006633"] },
  { name: "Tunisie", colors: ["#E70013", "#FFFFFF", "#E70013", "#FFFFFF"] },
  { name: "Egypte", colors: ["#CE1126", "#FFFFFF", "#000000", "#CE1126"] },
  { name: "Senegal", colors: ["#00853F", "#FDEF42", "#E31B23", "#00853F"] },
  { name: "Nigeria", colors: ["#008751", "#FFFFFF", "#008751", "#FFFFFF"] },
  { name: "Afrique du Sud", colors: ["#007A4D", "#FFB612", "#DE3831", "#002395"] },
  { name: "Cameroun", colors: ["#007A33", "#CE1126", "#FCD116", "#007A33"] },
  { name: "Ghana", colors: ["#EF3340", "#FCD116", "#009739", "#000000"] },
  { name: "Australie", colors: ["#00008B", "#FF0000", "#FFFFFF", "#00008B"] },
  { name: "Nouvelle-Zelande", colors: ["#00247D", "#CC142B", "#FFFFFF", "#00247D"] },
  { name: "Pakistan", colors: ["#01411C", "#FFFFFF", "#01411C", "#FFFFFF"] },
  { name: "Indonesie", colors: ["#FF0000", "#FFFFFF", "#FF0000", "#FFFFFF"] },
  { name: "Philippines", colors: ["#0038A8", "#CE1126", "#FCD116", "#FFFFFF"] },
  { name: "Vietnam", colors: ["#DA251D", "#FFCD00", "#DA251D", "#FFCD00"] },
  { name: "Thailande", colors: ["#ED1C24", "#FFFFFF", "#241D4F", "#FFFFFF"] },
  { name: "Iran", colors: ["#239F40", "#FFFFFF", "#DA0000", "#239F40"] },
  { name: "Arabie Saoudite", colors: ["#006C35", "#FFFFFF", "#006C35", "#FFFFFF"] },
  { name: "Chili", colors: ["#FFFFFF", "#D52B1E", "#0039A6", "#FFFFFF"] },
  { name: "Perou", colors: ["#D91023", "#FFFFFF", "#D91023", "#FFFFFF"] },
  { name: "Jamaique", colors: ["#009B3A", "#000000", "#FED100", "#009B3A"] },
  { name: "Haiti", colors: ["#00209F", "#D21034", "#00209F", "#D21034"] },
  { name: "Cuba", colors: ["#002A8F", "#FFFFFF", "#CF142B", "#002A8F"] },
  { name: "Congo", colors: ["#007FFF", "#F7D618", "#CE1021", "#007FFF"] },
  { name: "Ethiopie", colors: ["#078930", "#FCDD09", "#DA121A", "#0F47AF"] },
  { name: "Kenya", colors: ["#000000", "#BB0000", "#006600", "#FFFFFF"] },
  { name: "Israel", colors: ["#FFFFFF", "#0038B8", "#FFFFFF", "#0038B8"] },
  { name: "Palestine", colors: ["#000000", "#FFFFFF", "#009736", "#CE1126"] },
  { name: "Emirats Arabes Unis", colors: ["#00843D", "#FFFFFF", "#000000", "#CE1126"] },
];

type HeadOption = {
  id: string;
  label: string;
  locked: boolean;
};

function getHeadOptions(): HeadOption[] {
  const base: HeadOption[] = [
    { id: "default", label: "Classique", locked: false },
    { id: "queen", label: "Reine", locked: false },
    { id: "king", label: "Roi", locked: false },
    { id: "dragon", label: "Dragon", locked: false },
    { id: "cat", label: "Chat 🐱", locked: false },
    { id: "dog", label: "Chien 🐶", locked: false },
    { id: "panda", label: "Panda 🐼", locked: false },
    { id: "fox", label: "Renard 🦊", locked: false },
    { id: "penguin", label: "Pingouin 🐧", locked: false },
    { id: "robot", label: "Robot 🤖", locked: false },
    { id: "alien", label: "Alien 👽", locked: false },
    { id: "ninja", label: "Ninja 🥷", locked: false },
  ];
  const eventHeads = GAME_EVENTS.flatMap((e) => {
    const locked = getStorage().getItem(e.unlockKey) !== "true";
    return e.costumes.map((c) => ({
      id: c.id,
      label: `${c.label} ${e.emoji}`,
      locked,
    }));
  });
  return [...base, ...eventHeads];
}

const FLAG_PRICE = 200;
const DRAGON_PRICE = 2000;
const TUBE_PRICE = 500;

const COLOR_PALETTE = [
  "#ff3366", "#ff6b9d", "#cc0044", "#00ccff", "#0088ff", "#0055cc",
  "#7cff00", "#44cc00", "#228800", "#ff6b35", "#ffaa00", "#cc4400",
  "#cc33ff", "#8833ff", "#6600cc", "#ffd700", "#ffaa00", "#cc8800",
  "#ff1493", "#ff69b4", "#c71585", "#00ff88", "#00cc66", "#009944",
  "#ffffff", "#cccccc", "#888888", "#444444", "#000000", "#e74c3c",
  "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#e91e63",
];

export default function ShopScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isDesktop = width >= 600;
  const contentMaxWidth = 600;

  const [flagSearch, setFlagSearch] = useState("");
  const [headSearch, setHeadSearch] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([
    "#888888", "#999999", "#888888", "#999999",
  ]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [headType, setHeadType] = useState("default");
  const [bodyStyle, setBodyStyle] = useState<"circles" | "tube">("circles");
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);

  const { totalCoins: coins } = useGameState();

  const headOptions = useMemo(() => getHeadOptions(), []);

  const filteredFlags = useMemo(() => {
    if (!flagSearch.trim()) return FLAG_SKINS;
    const q = flagSearch.toLowerCase();
    return FLAG_SKINS.filter((f) => f.name.toLowerCase().includes(q));
  }, [flagSearch]);

  const filteredHeads = useMemo(() => {
    if (!headSearch.trim()) return headOptions;
    const q = headSearch.toLowerCase();
    return headOptions.filter((h) => h.label.toLowerCase().includes(q));
  }, [headSearch, headOptions]);

  const numColumns = isDesktop ? 3 : 2;
  const itemGap = spacing.sm;
  const effectiveWidth = isDesktop ? contentMaxWidth : width;
  const flagItemWidth = (effectiveWidth - spacing.md * 2 - itemGap * (numColumns - 1)) / numColumns;

  const computePrice = useCallback(() => {
    if (selectedFlag) return FLAG_PRICE;
    if (headType === "dragon") return DRAGON_PRICE;
    if (bodyStyle === "tube") return TUBE_PRICE;
    return 0;
  }, [selectedFlag, headType, bodyStyle]);

  const handleApply = () => {
    const price = computePrice();
    if (price > 0 && price > coins) return;
    router.push({
      pathname: "/(shop)/buy-confirm",
      params: {
        price: String(price),
        flag: selectedFlag ?? "",
        headType,
        bodyStyle,
        colors: JSON.stringify(selectedColors),
      },
    });
  };

  const renderFlagItem = useCallback(
    ({ item, index }: { item: FlagSkin; index: number }) => {
      const img = FLAG_IMAGES[item.name];
      const isSelected = selectedFlag === item.name;
      return (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
          <Pressable
            onPress={() => {
              setSelectedFlag(item.name);
              setSelectedColors([...item.colors]);
            }}
            style={[
              styles.flagItem,
              {
                width: flagItemWidth,
                borderColor: isSelected ? colors.gold : "rgba(255,255,255,0.1)",
                borderWidth: isSelected ? 2 : 1,
              },
            ]}
          >
            {img ? (
              <Image source={img} style={styles.flagImage} resizeMode="cover" />
            ) : (
              <View style={styles.flagColorPreview}>
                {item.colors.map((c, i) => (
                  <View key={i} style={[styles.colorStripe, { backgroundColor: c }]} />
                ))}
              </View>
            )}
            <Text style={styles.flagLabel} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>
          </Pressable>
        </Animated.View>
      );
    },
    [flagItemWidth, selectedFlag],
  );

  const desktopContainerStyle = isDesktop
    ? { maxWidth: contentMaxWidth, alignSelf: 'center' as const, width: '100%' as any, paddingHorizontal: spacing.md }
    : {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={desktopContainerStyle}>
      {/* Coin Balance */}
      <View style={styles.coinBar}>
        <Text style={styles.coinText}>{"\u{1FA99}"} {coins}</Text>
      </View>

      {/* Preset Skins */}
      <Text style={styles.sectionTitle}>Skins</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetRow}>
        {SKINS.map((skin) => (
          <Pressable
            key={skin.name}
            onPress={() => {
              setSelectedFlag(null);
              setSelectedColors([...skin.colors]);
            }}
            style={styles.presetItem}
          >
            <View style={styles.presetSwatches}>
              {skin.colors.slice(0, 4).map((c, i) => (
                <View key={i} style={[styles.presetSwatch, { backgroundColor: c }]} />
              ))}
            </View>
            <Text style={styles.presetLabel}>{skin.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Head / Costume Selector */}
      <Text style={styles.sectionTitle}>Tête / Costume</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher costume..."
        placeholderTextColor={colors.textSecondary}
        value={headSearch}
        onChangeText={setHeadSearch}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.headRow}>
        {filteredHeads.map((h) => (
          <Pressable
            key={h.id}
            onPress={() => !h.locked && setHeadType(h.id)}
            style={[
              styles.headItem,
              headType === h.id && styles.headItemSelected,
              h.locked && styles.headItemLocked,
            ]}
          >
            <Text style={[styles.headLabel, h.locked && styles.headLabelLocked]}>
              {h.locked ? "🔒 " : ""}
              {h.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Body Style Toggle */}
      <Text style={styles.sectionTitle}>Style du corps</Text>
      <View style={styles.toggleRow}>
        {(["circles", "tube"] as const).map((s) => (
          <Pressable
            key={s}
            onPress={() => setBodyStyle(s)}
            style={[styles.toggleBtn, bodyStyle === s && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, bodyStyle === s && styles.toggleTextActive]}>
              {s === "circles" ? "Cercles" : "Tube"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Color Picker */}
      <Text style={styles.sectionTitle}>Couleurs</Text>
      <View style={styles.slotRow}>
        {selectedColors.map((c, i) => (
          <Pressable
            key={i}
            onPress={() => setActiveSlot(i)}
            style={[
              styles.slotBtn,
              { backgroundColor: c },
              activeSlot === i && styles.slotBtnActive,
            ]}
          />
        ))}
      </View>
      <View style={styles.paletteGrid}>
        {COLOR_PALETTE.map((c, i) => (
          <Pressable
            key={`${c}-${i}`}
            onPress={() => {
              setSelectedFlag(null);
              const next = [...selectedColors];
              next[activeSlot] = c;
              setSelectedColors(next);
            }}
            style={[styles.paletteColor, { backgroundColor: c }]}
          />
        ))}
      </View>

      {/* Flag Grid */}
      <Text style={styles.sectionTitle}>Drapeaux</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher drapeau..."
        placeholderTextColor={colors.textSecondary}
        value={flagSearch}
        onChangeText={setFlagSearch}
      />
      <FlatList
        key={numColumns}
        data={filteredFlags}
        renderItem={renderFlagItem}
        keyExtractor={(item) => item.name}
        numColumns={numColumns}
        scrollEnabled={false}
        columnWrapperStyle={{ gap: itemGap }}
        contentContainerStyle={{ gap: itemGap }}
      />

      {/* Apply Button */}
      <Pressable
        onPress={handleApply}
        style={[styles.applyBtn, computePrice() > coins && styles.applyBtnDisabled]}
      >
        <Text style={styles.applyBtnText}>
          {computePrice() > 0 ? `Appliquer (${computePrice()} 🪙)` : "Appliquer"}
        </Text>
      </Pressable>

      <View style={{ height: spacing.xxl }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  coinBar: {
    alignSelf: "center",
    backgroundColor: "rgba(255,215,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
    borderRadius: 30,
    borderCurve: "continuous",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  coinText: {
    color: colors.gold,
    fontWeight: "700",
    fontSize: 20,
    fontVariant: ["tabular-nums"],
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 18,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  searchInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    borderCurve: "continuous",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  presetRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  presetItem: {
    alignItems: "center",
    marginRight: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderCurve: "continuous",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  presetSwatches: {
    flexDirection: "row",
    gap: 2,
    marginBottom: 4,
  },
  presetSwatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderCurve: "continuous",
  },
  presetLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  headRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  headItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    marginRight: spacing.sm,
  },
  headItemSelected: {
    borderColor: colors.gold,
    backgroundColor: "rgba(255,215,0,0.15)",
  },
  headItemLocked: {
    opacity: 0.5,
  },
  headLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  headLabelLocked: {
    color: colors.textSecondary,
  },
  toggleRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: "rgba(255,215,0,0.2)",
    borderColor: colors.gold,
  },
  toggleText: {
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
  toggleTextActive: {
    color: colors.gold,
  },
  slotRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  slotBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderCurve: "continuous",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  slotBtnActive: {
    borderColor: colors.gold,
    boxShadow: "0 0 10px rgba(255,215,0,0.5)",
  },
  paletteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: spacing.sm,
  },
  paletteColor: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  flagItem: {
    borderRadius: 12,
    borderCurve: "continuous",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
  },
  flagImage: {
    width: 52,
    height: 36,
    borderRadius: 6,
    borderCurve: "continuous",
  },
  flagColorPreview: {
    width: 52,
    height: 36,
    borderRadius: 6,
    borderCurve: "continuous",
    flexDirection: "row",
    overflow: "hidden",
  },
  colorStripe: {
    flex: 1,
  },
  flagLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    flex: 1,
  },
  applyBtn: {
    marginTop: spacing.lg,
    paddingVertical: 14,
    borderRadius: 30,
    borderCurve: "continuous",
    alignItems: "center",
    backgroundColor: colors.primary,
    boxShadow: "0 4px 15px rgba(124,58,237,0.4)",
  },
  applyBtnDisabled: {
    opacity: 0.5,
  },
  applyBtnText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 17,
    fontVariant: ["tabular-nums"],
  },
});
