import { useState, lazy, Suspense } from "react";
import { View, Text, Pressable, Alert, ScrollView, Image, StyleSheet, useWindowDimensions, TouchableOpacity, Platform } from "react-native";

const MiniWormGame = Platform.OS === "web" ? require("@/components/MiniWormGame").default : () => null;
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
    price: 2300,
  },
  {
    id: "fruits",
    name: "Fruits",
    icon: "🍓",
    items: ["/food/fraise.png", "/food/banane.png", "/food/pomme.png", "/food/gateau.png", "/food/susette.png", "/food/poulet.png"],
    free: true,
  },
  {
    id: "francaise",
    name: "Française",
    icon: "🥐",
    items: [
      "/food/baguette.png", "/food/borgignon.png", "/food/brie.png", "/food/camenbert.png",
      "/food/coq-au-vin.png", "/food/creme-brule.png", "/food/crepe.png", "/food/croissant.png",
      "/food/eclair.png", "/food/entrecote.png", "/food/escargo.png", "/food/flan.png",
      "/food/fruit-de-mer.png", "/food/gallete.png", "/food/macaran.png", "/food/mille-feuille.png",
      "/food/pain-au-chocolat.png", "/food/paris-brest.png", "/food/poulet-a-la-francaise.png",
      "/food/profitorelle.png", "/food/purre-de-pomme-de-terre.png", "/food/quiche-lorraine.png",
      "/food/raclette.png", "/food/ratatouille.png", "/food/saussison.png", "/food/soupe-au-pain.png",
      "/food/soupe-au-saussice.png", "/food/tartarre.png", "/food/tarte-au-abricot.png",
    ],
    price: 2300,
  },
  {
    id: "italienne",
    name: "Italienne",
    icon: "🍕",
    items: [
      "/food/pizza-margherita.png", "/food/alasagna-alla-bognese.png", "/food/amaretti.png",
      "/food/antipasto-misto.png", "/food/aracini.png", "/food/bombolone.png",
      "/food/boulette-de-viande.png", "/food/caponata-sicilienne.png", "/food/carpacio-di-manz.png",
      "/food/cornetto.png", "/food/cotoletta-alla-milanese.png", "/food/croissant-nutella.png",
      "/food/crostata.png", "/food/fromage-bleu.png", "/food/gelato.png", "/food/osso-buco.png",
      "/food/paneton.png", "/food/panna-cotta.png", "/food/parmezan.png",
      "/food/pollo-ala-cacciatora.png", "/food/pollo-al-limone-.png", "/food/ribollita.png",
      "/food/risotto-ai-funghi.png", "/food/saltimbocca-alla-romana-.png", "/food/tiramisu.png",
      "/food/torta-della-nona.png", "/food/zuppa-inglese.png",
    ],
    price: 2300,
  },
  {
    id: "americaine",
    name: "Américaine",
    icon: "🍩",
    items: [
      "/food/americaine-donut.png", "/food/americaine-burger.png", "/food/americaine-hot-dog.png",
      "/food/americaine-steak.png", "/food/americaine-nugget.png", "/food/americaine-pankake.png",
      "/food/americaine-biscuit.png", "/food/americaine-chedar.png", "/food/americaine-crabe.png",
      "/food/americaine-crevette-frit.png", "/food/americaine-dessert.png", "/food/americaine-dessert-.png",
      "/food/americaine-donut-vide.png", "/food/americaine-gallete.png", "/food/americaine-glace.png",
      "/food/americaine-sandhiwh.png", "/food/americaine-sandwhich.png", "/food/americaine-viande.png",
    ],
    price: 2300,
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

const BG_THEMES = [
  { id: "ocean", name: "Océan", colors: ["#1a5c8a", "#0e3a5c"] },
  { id: "forest", name: "Forêt", colors: ["#1a6b3a", "#0e3d22"] },
  { id: "sunset", name: "Coucher de soleil", colors: ["#8a3a1a", "#5c1e0e"] },
  { id: "purple", name: "Violet", colors: ["#5c1a8a", "#360e5c"] },
  { id: "night", name: "Nuit", colors: ["#1a1a3a", "#0a0a1e"] },
  { id: "red", name: "Rouge", colors: ["#8a1a1a", "#5c0e0e"] },
  { id: "pink", name: "Rose", colors: ["#8a1a6b", "#5c0e45"] },
  { id: "gold", name: "Or", colors: ["#8a7a1a", "#5c500e"] },
  { id: "cyan", name: "Cyan", colors: ["#1a8a8a", "#0e5c5c"] },
  { id: "grey", name: "Gris", colors: ["#4a4a4a", "#2a2a2a"] },
  { id: "lime", name: "Lime", colors: ["#4a8a1a", "#2e5c0e"] },
  { id: "black", name: "Noir", colors: ["#111111", "#000000"] },
];

const CELEBRATION_EMOJIS = [
  "😜", "😎", "🤩", "🥳", "😏", "💪", "🔥", "👑",
  "💀", "😈", "🤑", "🫡", "✌️", "👊", "🏆", "⭐",
  "💎", "🦁", "🐉", "🎯", "💥", "🌟", "😤", "🤯",
];

const MAP_SIZES = [
  { id: "tiny", name: "Très petite", size: 80 },
  { id: "small", name: "Petite", size: 120 },
  { id: "medium", name: "Moyenne", size: 160 },
  { id: "large", name: "Grande", size: 200 },
  { id: "xlarge", name: "Très grande", size: 250 },
];

export default function SettingsPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 600;
  const [tab, setTab] = useState<"settings" | "food" | "bg" | "map" | "emoji">("settings");
  const [currentLang, setCurrentLang] = useState(i18n.language?.split("-")[0] || "fr");
  const [playerCoins, setPlayerCoins] = useState(() => {
    try { return parseInt(getStorage().getItem("totalCoins") || "0", 10); } catch { return 0; }
  });
  const [ownedPacks, setOwnedPacks] = useState<string[]>(() => {
    try {
      const saved = getStorage().getItem("ownedFoodPacks");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [foodStyle, setFoodStyle] = useState(() => {
    try { return getStorage().getItem("foodStyle") || "classic"; } catch { return "classic"; }
  });
  const [bgColor, setBgColor] = useState(() => {
    try { return getStorage().getItem("gameBgColor") || "ocean"; } catch { return "ocean"; }
  });
  const [activeBg, setActiveBg] = useState(() => {
    try { return getStorage().getItem("gameBgColor") || "ocean"; } catch { return "ocean"; }
  });
  const [mapSize, setMapSize] = useState(() => {
    try { return getStorage().getItem("minimapSize") || "medium"; } catch { return "medium"; }
  });
  const [activeMapSize, setActiveMapSize] = useState(() => {
    try { return getStorage().getItem("minimapSize") || "medium"; } catch { return "medium"; }
  });
  const [celebrationEmoji, setCelebrationEmoji] = useState(() => {
    try { return getStorage().getItem("celebrationEmoji") || "😜"; } catch { return "😜"; }
  });
  const [activeEmoji, setActiveEmoji] = useState(() => {
    try { return getStorage().getItem("celebrationEmoji") || "😜"; } catch { return "😜"; }
  });
  const [previewPack, setPreviewPack] = useState<string | null>(null);
  const [modalSize, setModalSize] = useState({ width: 0, height: 0 });
  const [playerSkin] = useState<{ colors: string[]; headType?: string; bodyTexture?: string }>(() => {
    try {
      const saved = getStorage().getItem("playerSkin");
      if (saved) return JSON.parse(saved);
      const custom = getStorage().getItem("customSkin");
      if (custom) return JSON.parse(custom);
    } catch {}
    return { colors: ["#4ade80", "#22c55e", "#16a34a", "#15803d"] };
  });

  // Positions for food items inside the dark blue content area
  const foodPositions = [
    { top: "28%", left: "20%" }, { top: "26%", left: "45%" }, { top: "30%", left: "68%" },
    { top: "45%", left: "25%" }, { top: "48%", left: "52%" }, { top: "42%", left: "75%" },
    { top: "60%", left: "18%" }, { top: "58%", left: "48%" }, { top: "62%", left: "70%" },
    { top: "35%", left: "35%" }, { top: "52%", left: "38%" }, { top: "68%", left: "55%" },
  ];

  const handleBuyPack = (packId: string) => {
    const pack = FOOD_PACKS.find(p => p.id === packId);
    if (!pack || !pack.price) return;
    if (ownedPacks.includes(packId)) return;
    if (playerCoins < pack.price) {
      if (typeof window !== "undefined") window.alert(t("notEnoughCoins"));
      else Alert.alert(t("notEnoughCoins"));
      return;
    }
    const newCoins = playerCoins - pack.price;
    const newOwned = [...ownedPacks, packId];
    setPlayerCoins(newCoins);
    setOwnedPacks(newOwned);
    try {
      getStorage().setItem("totalCoins", String(newCoins));
      getStorage().setItem("ownedFoodPacks", JSON.stringify(newOwned));
    } catch {}
    handleFoodStyle(packId);
  };

  const handleSelectBg = (themeId: string) => {
    setActiveBg(themeId);
    setBgColor(themeId);
    try { getStorage().setItem("gameBgColor", themeId); } catch {}
  };

  const handleFoodStyle = (packId: string) => {
    setFoodStyle(packId);
    // Map pack id to engine food style
    const styleMap: Record<string, string> = { classic: "images", fruits: "images", francaise: "images", italienne: "images", americaine: "images", circles: "circles", emojis: "emojis" };
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
      router.back();
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
    if (router.canGoBack()) router.back();
    else router.replace("/(game)" as any);
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
          <Text style={[styles.tabText, tab === "food" && styles.tabTextActive]}>{t("tabFood")}</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("bg")}
          style={[styles.tab, tab === "bg" && styles.tabActive]}
        >
          <Text style={{ fontSize: 22 }}>🎨</Text>
          <Text style={[styles.tabText, tab === "bg" && styles.tabTextActive]}>{t("tabBg")}</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("map")}
          style={[styles.tab, tab === "map" && styles.tabActive]}
        >
          <Text style={{ fontSize: 22 }}>🗺️</Text>
          <Text style={[styles.tabText, tab === "map" && styles.tabTextActive]}>{t("tabMap")}</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("emoji")}
          style={[styles.tab, tab === "emoji" && styles.tabActive]}
        >
          <Text style={{ fontSize: 22 }}>💬</Text>
          <Text style={[styles.tabText, tab === "emoji" && styles.tabTextActive]}>{t("tabEmoji")}</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        {tab === "settings" && (
          <Pressable onPress={goBack}>
            <Image source={require("../assets/close-red-btn.png")} style={{ width: 50, height: 50 }} />
          </Pressable>
        )}
      </View>

      {tab === "map" ? (
        /* Minimap size tab — same layout as food/bg tabs */
        <View style={{ flex: 1, backgroundColor: "#5876bc" }}>
          {/* Header bar */}
          <View style={foodStyles.header}>
            <Text style={foodStyles.titleText}>{t("headerMap")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <Pressable onPress={() => setTab("settings")} style={{ marginLeft: 4 }}>
                <Image source={require("../assets/close-red-btn.png")} style={{ width: 56, height: 56 }} />
              </Pressable>
            </View>
          </View>

          {/* Main content */}
          <View style={{ flex: 1, padding: 32, alignItems: "center", justifyContent: "center" }}>
            {/* Dark modal card with MiniWormGame + minimap overlay */}
            <View style={foodStyles.modalCard}>
              <View style={foodStyles.modalTop} />
              <View style={foodStyles.modalContent} onLayout={(e) => {
                const { width: w, height: h } = e.nativeEvent.layout;
                setModalSize({ width: Math.floor(w), height: Math.floor(h) });
              }}>
                {modalSize.width > 0 ? (
                  <MiniWormGame
                    key={`map-${mapSize}`}
                    foodImages={selectedPack.items.length > 0 ? selectedPack.items : ["/food/burger.png"]}
                    width={modalSize.width}
                    height={modalSize.height}
                    skinColors={playerSkin.colors}
                    headType={playerSkin.headType}
                    bgColors={BG_THEMES.find(t => t.id === activeBg)?.colors as [string, string]}
                  />
                ) : null}
                {/* Minimap overlay - bottom right like in game */}
                {(() => {
                  const sizeObj = MAP_SIZES.find(s => s.id === mapSize) || MAP_SIZES[2];
                  return (
                    <View style={{
                      position: "absolute", bottom: 12, right: 12,
                      width: sizeObj.size, height: sizeObj.size,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      borderRadius: 12, borderWidth: 2, borderColor: "rgba(255,255,255,0.25)",
                      overflow: "hidden",
                    }} pointerEvents="none">
                      <View style={{ position: "absolute", top: 2, left: 2, right: 2, bottom: 2, borderWidth: 1, borderColor: "rgba(255,50,50,0.3)", borderRadius: 8 }} />
                      <View style={{ position: "absolute", top: "45%", left: "50%", width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ade80" }} />
                      <View style={{ position: "absolute", top: "25%", left: "30%", width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,100,100,0.6)" }} />
                      <View style={{ position: "absolute", top: "60%", left: "70%", width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(100,100,255,0.6)" }} />
                      <View style={{ position: "absolute", top: "75%", left: "20%", width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,200,100,0.6)" }} />
                      <View style={{ position: "absolute", top: "35%", left: "80%", width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(200,100,255,0.6)" }} />
                    </View>
                  );
                })()}
                {/* Select / Selected button */}
                {activeMapSize === mapSize ? (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
                    <Text style={{ color: "#4ade80", fontSize: 16, fontWeight: "800" }}>✅ {t("selected")}</Text>
                  </View>
                ) : (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
                    <Pressable
                      onPress={() => {
                        setActiveMapSize(mapSize);
                        try { getStorage().setItem("minimapSize", mapSize); } catch {}
                      }}
                      style={{
                        backgroundColor: "#4687d6", paddingHorizontal: 28, paddingVertical: 12,
                        borderRadius: 12, borderWidth: 2, borderColor: "#a8d5ff",
                        shadowColor: "#24548c", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>{t("selectBtn")}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>

            {/* Size buttons - left side */}
            <View style={{ position: "absolute", left: 16, top: "20%", gap: 10 } as any}>
              {MAP_SIZES.map((s) => {
                const active = mapSize === s.id;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => setMapSize(s.id)}
                    style={{
                      width: 60, height: 60, borderRadius: 14, overflow: "hidden",
                      borderWidth: active ? 3 : 2,
                      borderColor: active ? "#ffd700" : "rgba(255,255,255,0.2)",
                      backgroundColor: "rgba(0,0,0,0.4)",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <View style={{
                      width: s.size / 5, height: s.size / 5,
                      backgroundColor: "rgba(255,255,255,0.15)",
                      borderRadius: 3, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
                    }} />
                    <Text style={{ color: "#fff", fontSize: 8, fontWeight: "700", marginTop: 2 }}>{s.name.split(" ").pop()}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      ) : tab === "emoji" ? (
        /* Celebration emoji tab */
        <View style={{ flex: 1, backgroundColor: "#5876bc" }}>
          <View style={foodStyles.header}>
            <Text style={foodStyles.titleText}>{t("headerEmoji")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <Pressable onPress={() => setTab("settings")} style={{ marginLeft: 4 }}>
                <Image source={require("../assets/close-red-btn.png")} style={{ width: 56, height: 56 }} />
              </Pressable>
            </View>
          </View>

          <View style={{ flex: 1, padding: 32, alignItems: "center", justifyContent: "center" }}>
            <View style={foodStyles.modalCard}>
              <View style={foodStyles.modalTop} />
              <View style={foodStyles.modalContent} onLayout={(e) => {
                const { width: w, height: h } = e.nativeEvent.layout;
                setModalSize({ width: Math.floor(w), height: Math.floor(h) });
              }}>
                {modalSize.width > 0 ? (
                  <MiniWormGame
                    key={`emoji-${celebrationEmoji}`}
                    foodImages={selectedPack.items.length > 0 ? selectedPack.items : ["/food/burger.png"]}
                    width={modalSize.width}
                    height={modalSize.height}
                    skinColors={playerSkin.colors}
                    headType={playerSkin.headType}
                    bgColors={BG_THEMES.find(t => t.id === activeBg)?.colors as [string, string]}
                    celebrationEmoji={celebrationEmoji}
                  />
                ) : null}
                {/* Select / Selected button */}
                {activeEmoji === celebrationEmoji ? (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
                    <Text style={{ color: "#4ade80", fontSize: 16, fontWeight: "800" }}>✅ {t("selected")}</Text>
                  </View>
                ) : (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
                    <Pressable
                      onPress={() => {
                        setActiveEmoji(celebrationEmoji);
                        try { getStorage().setItem("celebrationEmoji", celebrationEmoji); } catch {}
                      }}
                      style={{
                        backgroundColor: "#4687d6", paddingHorizontal: 28, paddingVertical: 12,
                        borderRadius: 12, borderWidth: 2, borderColor: "#a8d5ff",
                        shadowColor: "#24548c", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>{t("selectBtn")}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>

            {/* Emoji buttons - left side */}
            <ScrollView
              style={{ position: "absolute", left: 12, top: "10%", bottom: "10%", width: 70 } as any}
              contentContainerStyle={{ gap: 8, alignItems: "center", paddingVertical: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {CELEBRATION_EMOJIS.map((emoji) => {
                const active = celebrationEmoji === emoji;
                return (
                  <Pressable
                    key={emoji}
                    onPress={() => setCelebrationEmoji(emoji)}
                    style={{
                      width: 56, height: 56, borderRadius: 14,
                      borderWidth: active ? 3 : 2,
                      borderColor: active ? "#ffd700" : "rgba(255,255,255,0.2)",
                      backgroundColor: "rgba(0,0,0,0.4)",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>{emoji}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      ) : tab === "bg" ? (
        /* Background color tab — same layout as food tab */
        <View style={{ flex: 1, backgroundColor: "#5876bc" }}>
          {/* Header bar */}
          <View style={foodStyles.header}>
            <Text style={foodStyles.titleText}>{t("headerBg")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              {/* Currency pill */}
              <View style={foodStyles.currencyPill}>
                <View style={foodStyles.coinStack}>
                  <View style={[foodStyles.coinLayer, { bottom: 0 }]} />
                  <View style={[foodStyles.coinLayer, { bottom: 6 }]} />
                  <View style={[foodStyles.coinLayer, { bottom: 12, alignItems: "center", justifyContent: "center" }]}>
                    <View style={foodStyles.coinFace}>
                      <View style={{ flexDirection: "row", gap: 3, marginTop: 2 }}>
                        <View style={foodStyles.coinEye} />
                        <View style={foodStyles.coinEye} />
                      </View>
                      <View style={foodStyles.coinMouth} />
                    </View>
                  </View>
                </View>
                <Text style={foodStyles.currencyText}>{playerCoins.toLocaleString()}</Text>
                <Pressable style={foodStyles.plusBtn}>
                  <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>+</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => setTab("settings")} style={{ marginLeft: 4 }}>
                <Image source={require("../assets/close-red-btn.png")} style={{ width: 56, height: 56 }} />
              </Pressable>
            </View>
          </View>

          {/* Main content */}
          <View style={{ flex: 1, padding: 32, alignItems: "center", justifyContent: "center" }}>
            {/* Dark modal card with preview */}
            <View style={foodStyles.modalCard}>
              <View style={foodStyles.modalTop} />
              <View style={foodStyles.modalContent} onLayout={(e) => {
                const { width: w, height: h } = e.nativeEvent.layout;
                setModalSize({ width: Math.floor(w), height: Math.floor(h) });
              }}>
                {modalSize.width > 0 ? (
                  <MiniWormGame
                    key={`bg-${bgColor}`}
                    foodImages={selectedPack.items.length > 0 ? selectedPack.items : ["/food/burger.png"]}
                    width={modalSize.width}
                    height={modalSize.height}
                    skinColors={playerSkin.colors}
                    headType={playerSkin.headType}
                    bgColors={BG_THEMES.find(t => t.id === bgColor)?.colors as [string, string]}
                  />
                ) : (
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, fontWeight: "700" }}>
                      Choisis une couleur
                    </Text>
                  </View>
                )}
                {/* Select / Selected button */}
                {activeBg === bgColor ? (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
                    <Text style={{ color: "#4ade80", fontSize: 16, fontWeight: "800" }}>✅ {t("selected")}</Text>
                  </View>
                ) : (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
                    <Pressable
                      onPress={() => handleSelectBg(bgColor)}
                      style={{
                        backgroundColor: "#4687d6", paddingHorizontal: 28, paddingVertical: 12,
                        borderRadius: 12, borderWidth: 2, borderColor: "#a8d5ff",
                        shadowColor: "#24548c", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>{t("selectBtn")}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>

            {/* Color buttons - left side */}
            <ScrollView
              style={{ position: "absolute", left: 12, top: "10%", bottom: "10%", width: 70 } as any}
              contentContainerStyle={{ gap: 8, alignItems: "center", paddingVertical: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {BG_THEMES.map((theme) => {
                const active = bgColor === theme.id;
                return (
                  <Pressable
                    key={theme.id}
                    onPress={() => {
                      setBgColor(theme.id);
                      try { getStorage().setItem("gameBgColor", theme.id); } catch {}
                    }}
                    style={{
                      width: 56, height: 56, borderRadius: 28, overflow: "hidden",
                      borderWidth: active ? 3 : 2,
                      borderColor: active ? "#ffd700" : "rgba(255,255,255,0.2)",
                    }}
                  >
                    <View style={{ flex: 1, backgroundColor: theme.colors[0], alignItems: "center", justifyContent: "center" }}>
                      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", backgroundColor: theme.colors[1] }} />
                      {active && <Text style={{ fontSize: 16, zIndex: 1 }}>✓</Text>}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      ) : tab === "settings" ? (
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
        /* Food tab — game-style UI */
        <View style={{ flex: 1, backgroundColor: "#5876bc" }}>
          {/* Header bar */}
          <View style={foodStyles.header}>
            <Text style={foodStyles.titleText}>{t("headerFood")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              {/* Currency pill */}
              <View style={foodStyles.currencyPill}>
                {/* Coin stack */}
                <View style={foodStyles.coinStack}>
                  <View style={[foodStyles.coinLayer, { bottom: 0 }]} />
                  <View style={[foodStyles.coinLayer, { bottom: 6 }]} />
                  <View style={[foodStyles.coinLayer, { bottom: 12, alignItems: "center", justifyContent: "center" }]}>
                    <View style={foodStyles.coinFace}>
                      <View style={{ flexDirection: "row", gap: 3, marginTop: 2 }}>
                        <View style={foodStyles.coinEye} />
                        <View style={foodStyles.coinEye} />
                      </View>
                      <View style={foodStyles.coinMouth} />
                    </View>
                  </View>
                </View>
                <Text style={foodStyles.currencyText}>{playerCoins.toLocaleString()}</Text>
                {/* Plus button */}
                <Pressable style={foodStyles.plusBtn}>
                  <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>+</Text>
                </Pressable>
              </View>
              {/* Close button - SVG-style rendered with image */}
              <Pressable onPress={() => setTab("settings")} style={{ marginLeft: 4 }}>
                <Image source={require("../assets/close-red-btn.png")} style={{ width: 56, height: 56 }} />
              </Pressable>
            </View>
          </View>

          {/* Main content */}
          <View style={{ flex: 1, padding: 32, alignItems: "center", justifyContent: "center" }}>
            {/* Dark modal card */}
            <View style={foodStyles.modalCard}>
              {/* Darker top section */}
              <View style={foodStyles.modalTop} />
              {/* Content area with mini game or food preview */}
              <View style={foodStyles.modalContent} onLayout={(e) => {
                const { width: w, height: h } = e.nativeEvent.layout;
                setModalSize({ width: Math.floor(w), height: Math.floor(h) });
              }}>
                {previewPack && modalSize.width > 0 ? (
                  <MiniWormGame
                    key={previewPack}
                    foodImages={FOOD_PACKS.find(p => p.id === previewPack)?.items || []}
                    width={modalSize.width}
                    height={modalSize.height}
                    skinColors={playerSkin.colors}
                    headType={playerSkin.headType}
                  />
                ) : (
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, fontWeight: "700" }}>
                      ← Choisis un pack pour essayer
                    </Text>
                  </View>
                )}
                {/* Buy button - show when previewing a pack that's not owned */}
                {previewPack && !ownedPacks.includes(previewPack) && (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center", alignItems: "center", gap: 6 }}>
                    <Text style={{ color: "#ffd700", fontSize: 14, fontWeight: "800" }}>
                      💰 2 300 pièces
                    </Text>
                    <Pressable onPress={() => handleBuyPack(previewPack)}>
                      <Image source={require("../assets/buy-btn.png")} style={{ width: 140, height: 50 }} resizeMode="contain" />
                    </Pressable>
                  </View>
                )}
                {/* Owned badge */}
                {previewPack && ownedPacks.includes(previewPack) && (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
                    <Text style={{ color: "#4ade80", fontSize: 16, fontWeight: "800" }}>✅ {t("purchased")}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Pack buttons - left side */}
            <View style={{ position: "absolute", left: 20, top: "25%", gap: 12 } as any}>
              <Pressable onPress={() => setPreviewPack(previewPack === "classic" ? null : "classic")}>
                <Image source={{ uri: "/food/burger.png" }} style={{ width: 80, height: 80 }} resizeMode="contain" />
              </Pressable>
              <Pressable onPress={() => setPreviewPack(previewPack === "francaise" ? null : "francaise")}>
                <Image source={{ uri: "/food/croissant.png" }} style={{ width: 80, height: 80 }} resizeMode="contain" />
              </Pressable>
              <Pressable onPress={() => setPreviewPack(previewPack === "italienne" ? null : "italienne")}>
                <Image source={{ uri: "/food/pizza-margherita.png" }} style={{ width: 80, height: 80 }} resizeMode="contain" />
              </Pressable>
              <Pressable onPress={() => setPreviewPack(previewPack === "americaine" ? null : "americaine")}>
                <Image source={{ uri: "/food/americaine-donut.png" }} style={{ width: 80, height: 80 }} resizeMode="contain" />
              </Pressable>
            </View>

            {/* Sparkle decoration */}
            <View style={{ position: "absolute", bottom: 20, right: 24 }} pointerEvents="none">
              <Text style={{ color: "#f0f6ff", fontSize: 30, opacity: 0.9 }}>✦</Text>
            </View>
          </View>
        </View>
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

const foodStyles = StyleSheet.create({
  header: {
    height: 76,
    backgroundColor: "#3d4999",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#2d3778",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  titleText: {
    color: "#ffeb70",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 2,
  },
  currencyPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8c5264",
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#b88698",
    height: 44,
    paddingLeft: 48,
    paddingRight: 6,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  coinStack: {
    position: "absolute",
    left: -18,
    top: -6,
    width: 44,
    height: 48,
  },
  coinLayer: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e63946",
    borderWidth: 1,
    borderColor: "#730a0a",
    left: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  coinFace: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#911b1b",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.8,
  },
  coinEye: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#911b1b",
  },
  coinMouth: {
    width: 10,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: "#911b1b",
    marginTop: 3,
  },
  currencyText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 1,
    letterSpacing: 1,
  },
  plusBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#4687d6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#a8d5ff",
    shadowColor: "#24548c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  closeBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#d83030",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ff8585",
    shadowColor: "#821010",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  modalCard: {
    width: "100%" as any,
    maxWidth: 850,
    height: "65%" as any,
    minHeight: 400,
    backgroundColor: "#384c80",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4f67a3",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  modalTop: {
    height: 76,
    backgroundColor: "#2c3d69",
    borderBottomWidth: 1,
    borderBottomColor: "#253359",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#384c80",
  },
  buyBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
});
