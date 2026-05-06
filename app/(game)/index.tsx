import { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, useWindowDimensions, Image } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useGameState } from "@/context/GameStateContext";
import { SKINS } from "@/types/game";
import { GAME_EVENTS, isEventActive } from "@/config/events";
import { getStorage } from "@/services/StorageService";
import { colors, spacing } from "@/expo/theme";

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 600;
  const { customSkin, playerSkin, startGame, totalCoins } = useGameState();

  const [name, setName] = useState(() => {
    try { return getStorage().getItem("playerName") ?? ""; } catch { return ""; }
  });
  const [selectedSkin, setSelectedSkin] = useState(0);
  const activeSkin = customSkin ?? playerSkin ?? SKINS[selectedSkin] ?? SKINS[0];

  const userLang = (i18n.language || "fr").split("-")[0];
  // Show events: universal (no lang) + matching user's language
  const activeEvents = GAME_EVENTS.filter((e) => isEventActive(e) && (!e.lang || e.lang === userLang));

  const saveName = (n: string) => {
    setName(n);
    try { getStorage().setItem("playerName", n); } catch {}
  };

  const getPlayerName = () => name.trim() || `Guest${Math.floor(Math.random() * 999)}`;

  const play = (mode: "ffa" | "coins") => {
    startGame(getPlayerName(), activeSkin, mode);
    router.push({ pathname: "/(game)/play", params: { mode } });
  };

  const playEvent = (eventId: string) => {
    startGame(getPlayerName(), activeSkin, eventId as any);
    router.push({ pathname: "/(game)/play", params: { mode: eventId } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        position: "absolute",
        top: -120,
        left: -40,
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: "rgba(46,196,182,0.12)",
      }} />
      <View style={{
        position: "absolute",
        top: 80,
        right: -70,
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: "rgba(246,196,83,0.10)",
      }} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: "center",
          padding: spacing.lg,
          gap: spacing.md,
          maxWidth: isDesktop ? 500 : undefined,
          alignSelf: isDesktop ? "center" : undefined,
          width: isDesktop ? "100%" : undefined,
        }}
        contentInsetAdjustmentBehavior="automatic"
      >
      {/* Settings button */}
      <Pressable
        onPress={() => router.push("/settings" as any)}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 100 }}
      >
        <Image
          source={require("../../assets/settings-btn.png")}
          style={{ width: 50, height: 50 }}
        />
      </Pressable>

      {/* Title */}
      <Text style={{ color: colors.gold, fontSize: 36, fontWeight: "900", letterSpacing: 4, marginTop: spacing.xl, textShadowColor: "rgba(0,0,0,0.35)", textShadowRadius: 12 }}>
        {t("title")}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: -8 }}>
        {t("subtitle")}
      </Text>

      {/* Coins */}
      <View style={{
        backgroundColor: "rgba(246,196,83,0.12)", borderRadius: 30, paddingHorizontal: 20, paddingVertical: 8,
        borderWidth: 1, borderColor: "rgba(246,196,83,0.3)",
      }}>
        <Text style={{ color: colors.gold, fontWeight: "700", fontSize: 18, fontVariant: ["tabular-nums"] }}>
          🪙 {totalCoins.toLocaleString()}
        </Text>
      </View>

      {/* Name input */}
      <TextInput
        value={name}
        onChangeText={saveName}
        placeholder={t("namePlaceholder")}
        placeholderTextColor={colors.textSecondary}
        maxLength={15}
        style={{
          width: "100%", padding: 14, borderRadius: 30, borderCurve: "continuous",
          backgroundColor: "rgba(255,255,255,0.06)", color: colors.text,
          borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", fontSize: 16, textAlign: "center",
        }}
      />

      {/* Skin selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 60 }}>
        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 4 }}>
          {SKINS.map((skin, i) => (
            <Pressable
              key={i}
              onPress={() => setSelectedSkin(i)}
              style={{
                width: 44, height: 44, borderRadius: 22,
                borderWidth: 3, borderCurve: "continuous",
                borderColor: !customSkin && i === selectedSkin ? colors.gold : "rgba(255,255,255,0.15)",
                backgroundColor: skin.colors[0],
                boxShadow: !customSkin && i === selectedSkin ? "0 0 12px rgba(246,196,83,0.45)" : "0 4px 10px rgba(0,0,0,0.18)",
              }}
            />
          ))}
        </View>
      </ScrollView>

      {/* Play button */}
      <Pressable onPress={() => play("ffa")} style={{ width: "100%", alignItems: "center" }}>
        <Image
          source={require("../../assets/play-btn.png")}
          style={{ width: 220, height: 70, resizeMode: "contain" }}
        />
      </Pressable>

      <Pressable
        onPress={() => play("coins")}
        style={{
          width: "100%", paddingVertical: 14, borderRadius: 50, borderCurve: "continuous",
          backgroundColor: "rgba(246,196,83,0.14)", borderWidth: 1, borderColor: "rgba(246,196,83,0.4)",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.gold, fontSize: 16, fontWeight: "800", letterSpacing: 2 }}>
          {t("coinsMode")}
        </Text>
      </Pressable>

      {/* Race mode — only show if available */}
      {(() => {
        const now = Date.now();
        let raceStart = 0;
        let raceWon = false;
        try {
          raceStart = parseInt(getStorage().getItem("raceStartTime") ?? "0", 10) || 0;
          raceWon = getStorage().getItem("raceWon") === "true";
        } catch {}

        const elapsed = now - raceStart;
        const DAY = 24 * 60 * 60 * 1000;
        const WEEK = 7 * DAY;
        const isDev = (process.env.VITE_DEV_MODE || process.env.EXPO_PUBLIC_DEV_MODE) === 'true';

        // If race was won or expired (24h), cooldown 1 week (skip in dev)
        const raceExpired = raceStart > 0 && elapsed > DAY;
        const inCooldown = !isDev && (raceWon || raceExpired) && elapsed < WEEK;

        if (inCooldown) {
          const cooldownEnd = raceStart + WEEK;
          const remaining = cooldownEnd - now;
          const days = Math.floor(remaining / DAY);
          const hours = Math.floor((remaining % DAY) / (60 * 60 * 1000));
          return (
            <View style={{ width: "100%", paddingVertical: 14, borderRadius: 50, borderCurve: "continuous", backgroundColor: "rgba(255,255,255,0.04)", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}>
              <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                🏁 {t("grandPrix")} — {days}j {hours}h
              </Text>
            </View>
          );
        }

        const needsReset = raceExpired || raceWon;

        return (
          <Pressable
            onPress={() => {
              if (!raceStart || needsReset) {
                try {
                  getStorage().setItem("raceStartTime", String(now));
                  getStorage().removeItem("raceWon");
                  getStorage().removeItem("lastRaceScore");
                } catch {}
              }
              router.push("/(game)/race");
            }}
            style={{
              width: "100%", paddingVertical: 14, borderRadius: 50, borderCurve: "continuous",
              backgroundColor: "#1f8f7b", alignItems: "center",
              boxShadow: "0 6px 25px rgba(46,196,182,0.35)",
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "800", letterSpacing: 2 }}>
              🏁 {t("grandPrix")}
            </Text>
          </Pressable>
        );
      })()}

      {/* Event modes - all festivals shown, wrap to multiple rows */}
      {activeEvents.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", paddingHorizontal: spacing.sm }}>
          {activeEvents.map((event) => (
            <Pressable
              key={event.id}
              onPress={() => playEvent(event.id)}
              style={{
                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30, borderCurve: "continuous",
                background: event.btnGradient as any, backgroundColor: event.aiColors[0],
                boxShadow: event.btnShadow,
              }}
            >
              <Text style={{ color: "white", fontSize: 13, fontWeight: "700" }}>
                {event.emoji} {t(`event_${event.id}`, event.label)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
    </View>
  );
}
