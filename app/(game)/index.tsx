import { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useGameState } from "@/context/GameStateContext";
import { SKINS } from "@/types/game";
import { GAME_EVENTS, isEventActive } from "@/config/events";
import { getStorage } from "@/services/StorageService";
import { colors, spacing } from "@/expo/theme";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 600;
  const { customSkin, playerSkin, startGame, totalCoins } = useGameState();

  const [name, setName] = useState(() => {
    try { return getStorage().getItem("playerName") ?? ""; } catch { return ""; }
  });
  const [selectedSkin, setSelectedSkin] = useState(0);
  const activeSkin = customSkin ?? SKINS[selectedSkin] ?? SKINS[0];

  const activeEvents = GAME_EVENTS.filter(
    (e) => isEventActive(e) && getStorage().getItem(e.unlockKey) !== "true"
  );

  const saveName = (n: string) => {
    setName(n);
    try { getStorage().setItem("playerName", n); } catch {}
  };

  const getPlayerName = () => name.trim() || `Guest${Math.floor(Math.random() * 999)}`;

  const play = (mode: "ffa" | "coins") => {
    startGame(getPlayerName(), activeSkin, mode);
    router.push("/(game)/play");
  };

  const playEvent = (eventId: string) => {
    startGame(getPlayerName(), activeSkin, eventId as any);
    router.push("/(game)/play");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
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
      {/* Title */}
      <Text style={{ color: colors.gold, fontSize: 36, fontWeight: "900", letterSpacing: 4, marginTop: spacing.xl }}>
        {t("title")}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: -8 }}>
        {t("subtitle")}
      </Text>

      {/* Coins */}
      <View style={{
        backgroundColor: "rgba(255,215,0,0.12)", borderRadius: 30, paddingHorizontal: 20, paddingVertical: 8,
        borderWidth: 1, borderColor: "rgba(255,215,0,0.3)",
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
          backgroundColor: "rgba(255,255,255,0.08)", color: colors.text,
          borderWidth: 2, borderColor: "rgba(255,255,255,0.15)", fontSize: 16, textAlign: "center",
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
                boxShadow: !customSkin && i === selectedSkin ? "0 0 12px rgba(255,215,0,0.5)" : "none",
              }}
            />
          ))}
        </View>
      </ScrollView>

      {/* Play buttons */}
      <Pressable
        onPress={() => play("ffa")}
        style={{
          width: "100%", paddingVertical: 16, borderRadius: 50, borderCurve: "continuous",
          backgroundColor: "#ff3366", alignItems: "center",
          boxShadow: "0 6px 25px rgba(255,51,102,0.4)",
        }}
      >
        <Text style={{ color: "white", fontSize: 20, fontWeight: "900", letterSpacing: 3 }}>
          {t("soloPlay")}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => play("coins")}
        style={{
          width: "100%", paddingVertical: 14, borderRadius: 50, borderCurve: "continuous",
          backgroundColor: "rgba(255,215,0,0.15)", borderWidth: 2, borderColor: "rgba(255,215,0,0.4)",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.gold, fontSize: 16, fontWeight: "800", letterSpacing: 2 }}>
          {t("coinsMode")}
        </Text>
      </Pressable>

      {/* Event modes */}
      {activeEvents.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 50 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {activeEvents.map((event) => (
              <Pressable
                key={event.id}
                onPress={() => playEvent(event.id)}
                style={{
                  paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, borderCurve: "continuous",
                  background: event.btnGradient as any, backgroundColor: event.aiColors[0],
                  boxShadow: event.btnShadow,
                }}
              >
                <Text style={{ color: "white", fontSize: 14, fontWeight: "700" }}>
                  {event.emoji} {event.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}
