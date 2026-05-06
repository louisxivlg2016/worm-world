import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Alert,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { colors, spacing } from "@/expo/theme";
import { useGameState } from "@/context/GameStateContext";
import { FLAG_IMAGES } from "@/assets/flags";
import { translateFlag } from "@/i18n/flagNames";
import { SKINS } from "@/types/game";
import { getStorage } from "@/services/StorageService";
import { GAME_EVENTS } from "@/config/events";

// Preload all flag images on module load so they are cached in the browser
if (typeof window !== "undefined") {
  Object.values(FLAG_IMAGES).forEach((src: any) => {
    const uri = typeof src === "string" ? src : src?.uri || src?.default;
    if (uri && typeof uri === "string") {
      const preImg = new window.Image();
      preImg.src = uri;
    }
  });
}

type FlagSkin = {
  name: string;
  bodyTexture?: string;
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

type EyeOption = {
  id: "classic" | "angry" | "happy" | "wink";
  label: string;
  preview: string;
};

type MouthOption = {
  id: "none" | "smile" | "grin" | "angry" | "surprised";
  label: string;
  preview: string;
};

function ShopWormPreview({
  colors: palette,
  eyeStyle,
  mouthStyle,
  flagSource,
}: {
  colors: string[];
  eyeStyle: EyeOption["id"];
  mouthStyle: MouthOption["id"];
  flagSource?: any;
}) {
  const segments = Array.from({ length: 8 });

  const renderEye = (side: "left" | "right") => {
    const closed = eyeStyle === "happy" || (eyeStyle === "wink" && side === "right");
    if (closed) {
      return <View style={[styles.previewEyeClosed, eyeStyle === "happy" && styles.previewEyeHappy]} />;
    }
    return (
      <View style={styles.previewEye}>
        <View style={styles.previewPupil} />
      </View>
    );
  };

  const mouthNode = mouthStyle === "none"
    ? null
    : mouthStyle === "surprised"
      ? <View style={styles.previewMouthSurprised} />
      : (
        <View
          style={[
            styles.previewMouth,
            mouthStyle === "grin" && styles.previewMouthGrin,
            mouthStyle === "angry" && styles.previewMouthAngry,
          ]}
        />
      );

  return (
    <View style={styles.previewCard}>
      <Text style={styles.previewTitle}>Aperçu du ver</Text>
      <View style={styles.previewStage}>
        {segments.map((_, index) => {
          const isHead = index === segments.length - 1;
          const left = index * 34;
          const top = Math.abs(index - 3.5) * 4 + (index > 4 ? 4 : 0);
          const stripeColor = palette[(segments.length - 1 - index) % palette.length] || palette[0];
          const commonStyle = [
            styles.previewSegment,
            { left, top },
            isHead && styles.previewHead,
          ];

          const face = isHead ? (
            <View style={styles.previewFaceWrap}>
              <View style={styles.previewEyesRow}>
                {renderEye("left")}
                {renderEye("right")}
              </View>
              {mouthNode}
            </View>
          ) : null;

          if (flagSource) {
            return (
              <ImageBackground
                key={index}
                source={flagSource}
                resizeMode="cover"
                imageStyle={styles.previewSegmentImage}
                style={commonStyle}
              >
                {face}
              </ImageBackground>
            );
          }

          return (
            <View
              key={index}
              style={[
                ...commonStyle,
                { backgroundColor: stripeColor },
              ]}
            >
              <View style={styles.previewHighlight} />
              {face}
            </View>
          );
        })}
      </View>
    </View>
  );
}

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
      unlockKey: e.unlockKey as string | undefined,
      eventId: e.id as string | undefined,
      eventEmoji: e.emoji as string | undefined,
      currencyImage: e.currencyImage as string | undefined,
    }));
  });
  return [...base, ...eventHeads];
}

const FLAG_PRICE = 200;
const DRAGON_PRICE = 2000;
const TUBE_PRICE = 500;

const EYE_OPTIONS: EyeOption[] = [
  { id: "classic", label: "Classiques", preview: "◉ ◉" },
  { id: "angry", label: "Méchants", preview: "⌒ ⌒" },
  { id: "happy", label: "Joyeux", preview: "◡ ◡" },
  { id: "wink", label: "Clin d'œil", preview: "◉ ー" },
];

const MOUTH_OPTIONS: MouthOption[] = [
  { id: "none", label: "Aucune", preview: "·" },
  { id: "smile", label: "Sourire", preview: "◡" },
  { id: "grin", label: "Grand sourire", preview: "ᴗ" },
  { id: "angry", label: "Méchante", preview: "⌣" },
  { id: "surprised", label: "Surprise", preview: "O" },
];

const COLOR_PALETTE = [
  "#ff3366", "#ff6b9d", "#cc0044", "#00ccff", "#0088ff", "#0055cc",
  "#7cff00", "#44cc00", "#228800", "#ff6b35", "#ffaa00", "#cc4400",
  "#cc33ff", "#8833ff", "#6600cc", "#ffd700", "#ffaa00", "#cc8800",
  "#ff1493", "#ff69b4", "#c71585", "#00ff88", "#00cc66", "#009944",
  "#ffffff", "#cccccc", "#888888", "#444444", "#000000", "#e74c3c",
  "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#e91e63",
];

function getAssetUri(source: any): string {
  if (!source) return "";
  if (typeof source === "string") return source;
  if (typeof source?.uri === "string") return source.uri;
  if (typeof source?.default === "string") return source.default;
  return "";
}

export default function ShopScreen() {
  const { t, i18n } = useTranslation();
  const flagLang = (i18n.language || "fr").split("-")[0];
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
  const [eyeStyle, setEyeStyle] = useState<EyeOption["id"]>("classic");
  const [mouthStyle, setMouthStyle] = useState<MouthOption["id"]>("smile");
  const [bodyStyle, setBodyStyle] = useState<"circles" | "tube">("circles");
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);

  const { totalCoins: coins, eventGems, unlockEventCostumeForEvent } = useGameState();
  const [, setUnlockTick] = useState(0);

  const headOptions = useMemo(() => getHeadOptions(), [eventGems]);

  const handleUnlockEvent = useCallback((eventId: string, unlockKey: string) => {
    const EVENT_COSTUME_COST = 30;
    const bal = eventGems[eventId] || 0;
    const event = GAME_EVENTS.find((e) => e.id === eventId);
    const icon = event?.emoji || "💎";
    if (bal < EVENT_COSTUME_COST) {
      const msg = `Pas assez de ${icon} ! (${bal}/${EVENT_COSTUME_COST})`;
      if (typeof window !== "undefined") window.alert(msg);
      else Alert.alert(msg);
      return;
    }
    const ok = unlockEventCostumeForEvent(eventId, unlockKey, EVENT_COSTUME_COST);
    if (ok) setUnlockTick((x) => x + 1);
  }, [eventGems, unlockEventCostumeForEvent]);

  const filteredFlags = useMemo(() => {
    if (!flagSearch.trim()) return FLAG_SKINS;
    const q = flagSearch.toLowerCase();
    return FLAG_SKINS.filter((f) =>
      f.name.toLowerCase().includes(q) || translateFlag(f.name, flagLang).toLowerCase().includes(q)
    );
  }, [flagSearch, flagLang]);

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

  const getFlagTextureUri = useCallback((flagName: string | null) => {
    if (!flagName) return "";
    return getAssetUri(FLAG_IMAGES[flagName]);
  }, []);

  const handleApply = () => {
    const price = computePrice();
    if (price > 0 && price > coins) return;
    router.push({
      pathname: "/(shop)/buy-confirm",
      params: {
        price: String(price),
        flag: selectedFlag ?? "",
        bodyTexture: getFlagTextureUri(selectedFlag),
        headType,
        eyeStyle,
        mouthStyle,
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
              {translateFlag(item.name, flagLang)}
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

  const selectedFlagSource = selectedFlag ? FLAG_IMAGES[selectedFlag] : undefined;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.bgOrbA} />
      <View style={styles.bgOrbB} />
      <View style={desktopContainerStyle}>
      {/* Coin Balance */}
      <View style={styles.coinBar}>
        <Text style={styles.coinText}>{"\u{1FA99}"} {coins}</Text>
      </View>

      <ShopWormPreview
        colors={selectedColors}
        eyeStyle={eyeStyle}
        mouthStyle={mouthStyle}
        flagSource={selectedFlagSource}
      />

      {/* Preset Skins */}
      <Text style={styles.sectionTitle}>{t("shopPresets")}</Text>
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
      <Text style={styles.sectionTitle}>{t("shopHead")}</Text>
      <TextInput
        style={styles.searchInput}
        placeholder={t("searchCostume")}
        placeholderTextColor={colors.textSecondary}
        value={headSearch}
        onChangeText={setHeadSearch}
      />
      {/* Per-event currency balances */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {GAME_EVENTS.filter(e => (eventGems[e.id] || 0) > 0).map(e => (
            <View key={e.id} style={styles.gemsBar}>
              {e.currencyImage ? (
                <Image source={{ uri: e.currencyImage }} style={{ width: 22, height: 22 }} resizeMode="contain" />
              ) : (
                <Text style={styles.gemsText}>{e.emoji}</Text>
              )}
              <Text style={styles.gemsText}>{eventGems[e.id] || 0}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.headRow}>
        {filteredHeads.map((h) => (
          <Pressable
            key={h.id}
            onPress={() => {
              if (h.locked && h.unlockKey && h.eventId) {
                handleUnlockEvent(h.eventId, h.unlockKey);
              } else if (!h.locked) {
                setHeadType(h.id);
              }
            }}
            style={[
              styles.headItem,
              headType === h.id && styles.headItemSelected,
              h.locked && styles.headItemLocked,
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              {h.locked && h.unlockKey && h.currencyImage && (
                <Image source={{ uri: h.currencyImage }} style={{ width: 18, height: 18 }} resizeMode="contain" />
              )}
              <Text style={[styles.headLabel, h.locked && styles.headLabelLocked]}>
                {h.locked
                  ? (h.unlockKey
                      ? (h.currencyImage ? `30 ${h.label}` : `${h.eventEmoji || "💎"} 30 ${h.label}`)
                      : `🔒 ${h.label}`)
                  : h.label}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Body Style Toggle */}
      <Text style={styles.sectionTitle}>{t("shopBodyStyle")}</Text>
      <View style={styles.toggleRow}>
        {(["circles", "tube"] as const).map((s) => (
          <Pressable
            key={s}
            onPress={() => setBodyStyle(s)}
            style={[styles.toggleBtn, bodyStyle === s && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, bodyStyle === s && styles.toggleTextActive]}>
              {s === "circles" ? t("shopCircles") : t("shopTube")}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Yeux</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionRow}>
        {EYE_OPTIONS.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => setEyeStyle(option.id)}
            style={[
              styles.faceOption,
              eyeStyle === option.id && styles.faceOptionSelected,
            ]}
          >
            <Text style={styles.facePreview}>{option.preview}</Text>
            <Text style={[styles.faceLabel, eyeStyle === option.id && styles.faceLabelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Bouche</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionRow}>
        {MOUTH_OPTIONS.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => setMouthStyle(option.id)}
            style={[
              styles.faceOption,
              mouthStyle === option.id && styles.faceOptionSelected,
            ]}
          >
            <Text style={styles.facePreview}>{option.preview}</Text>
            <Text style={[styles.faceLabel, mouthStyle === option.id && styles.faceLabelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Color Picker */}
      <Text style={styles.sectionTitle}>{t("shopColors")}</Text>
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
      <Text style={styles.sectionTitle}>{t("shopFlags")}</Text>
      <TextInput
        style={styles.searchInput}
        placeholder={t("searchFlag")}
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
          {computePrice() > 0 ? `${t("shopApply")} (${computePrice()} 🪙)` : t("shopApply")}
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
  bgOrbA: {
    position: "absolute",
    top: -60,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(46,196,182,0.10)",
  },
  bgOrbB: {
    position: "absolute",
    top: 120,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(246,196,83,0.10)",
  },
  coinBar: {
    alignSelf: "center",
    backgroundColor: "rgba(246,196,83,0.15)",
    borderWidth: 1,
    borderColor: "rgba(246,196,83,0.3)",
    borderRadius: 30,
    borderCurve: "continuous",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  previewCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 22,
    borderCurve: "continuous",
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: spacing.md,
    boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
  },
  previewTitle: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  previewStage: {
    height: 92,
    justifyContent: "center",
  },
  previewSegment: {
    position: "absolute",
    width: 58,
    height: 58,
    borderRadius: 29,
    borderCurve: "continuous",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    boxShadow: "0 8px 16px rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewSegmentImage: {
    borderRadius: 29,
  },
  previewHead: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  previewHighlight: {
    position: "absolute",
    top: 8,
    left: 10,
    width: 18,
    height: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  previewFaceWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  previewEyesRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  previewEye: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  previewPupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#111",
  },
  previewEyeClosed: {
    width: 12,
    height: 3,
    borderRadius: 4,
    backgroundColor: "#111",
  },
  previewEyeHappy: {
    transform: [{ rotate: "8deg" }],
  },
  previewMouth: {
    width: 18,
    height: 8,
    borderBottomWidth: 2,
    borderColor: "#111",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: 5,
  },
  previewMouthGrin: {
    width: 20,
    height: 10,
    borderBottomWidth: 3,
  },
  previewMouthAngry: {
    transform: [{ rotate: "180deg" }],
  },
  previewMouthSurprised: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#111",
    marginTop: 5,
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
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
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
    backgroundColor: "rgba(19,38,60,0.92)",
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
  gemsBar: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(147,197,253,0.12)", borderRadius: 14,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1, borderColor: "rgba(147,197,253,0.3)",
  },
  gemsText: {
    color: "#60a5fa", fontSize: 18, fontWeight: "800",
  },
  gemsHint: {
    color: colors.textSecondary, fontSize: 12,
  },
  headItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "rgba(19,38,60,0.92)",
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
    opacity: 0.8,
    borderColor: "rgba(147,197,253,0.5)",
    backgroundColor: "rgba(147,197,253,0.1)",
  },
  headLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  headLabelLocked: {
    color: colors.textSecondary,
  },
  optionRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  faceOption: {
    minWidth: 96,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "rgba(19,38,60,0.92)",
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    marginRight: spacing.sm,
  },
  faceOptionSelected: {
    borderColor: colors.gold,
    backgroundColor: "rgba(255,215,0,0.15)",
  },
  facePreview: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  faceLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  faceLabelSelected: {
    color: colors.gold,
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
    backgroundColor: "rgba(19,38,60,0.92)",
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
    boxShadow: "0 6px 18px rgba(255,122,89,0.28)",
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
