import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { colors, spacing } from "@/expo/theme";
import { getStorage } from "@/services/StorageService";
import { GAME_EVENTS } from "@/config/events";

interface PlayerStats {
  bestScore: number;
  bestTime: number;
  kills: number;
  gamesPlayed: number;
  totalPlayTime: number;
}

function loadStats(): PlayerStats {
  try {
    const raw = getStorage().getItem("playerStats");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { bestScore: 0, bestTime: 0, kills: 0, gamesPlayed: 0, totalPlayTime: 0 };
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function StatRow({ icon, label, value, index }: { icon: string; label: string; value: string; index: number }) {
  return (
    <Animated.View entering={FadeInUp.delay(index * 50).springify()}>
      <View style={styles.statRow}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const stats = loadStats();

  const coins = (() => {
    try {
      return parseInt(getStorage().getItem("playerCoins") ?? "0", 10) || 0;
    } catch {
      return 0;
    }
  })();

  const unlockedEvents = GAME_EVENTS.filter(
    (e) => getStorage().getItem(e.unlockKey) === "true",
  );
  const totalCostumes = GAME_EVENTS.reduce((sum, e) => sum + e.costumes.length, 0);
  const unlockedCostumes = unlockedEvents.reduce((sum, e) => sum + e.costumes.length, 0);
  const progressPct = totalCostumes > 0 ? (unlockedCostumes / totalCostumes) * 100 : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Coin Balance Card */}
      <View style={styles.card}>
        <View style={styles.coinBadge}>
          <Text style={styles.coinText}>🪙 {coins}</Text>
        </View>
      </View>

      {/* Stats Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Statistiques</Text>
        <StatRow index={0} icon="🏆" label="Meilleur Score" value={stats.bestScore.toLocaleString()} />
        <StatRow index={1} icon="⏱️" label="Meilleur Temps" value={formatTime(stats.bestTime)} />
        <StatRow index={2} icon="💀" label="Vaincu" value={String(stats.kills)} />
        <StatRow index={3} icon="🎮" label="Parties jouées" value={String(stats.gamesPlayed)} />
        <StatRow index={4} icon="⏳" label="Temps total" value={formatTime(stats.totalPlayTime)} />
      </View>

      {/* Costumes Progress Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Costumes débloqués</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {unlockedCostumes} / {totalCostumes}
        </Text>

        {unlockedEvents.length > 0 && (
          <View style={styles.badgeRow}>
            {unlockedEvents.map((e) => (
              <View key={e.id} style={styles.badge}>
                <Text style={styles.badgeEmoji}>{e.emoji}</Text>
                <Text style={styles.badgeLabel}>{e.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Settings Button */}
      <Pressable
        onPress={() => router.push("/(profile)/settings")}
        style={styles.settingsBtn}
      >
        <Text style={styles.settingsBtnText}>Paramètres</Text>
      </Pressable>

      <View style={{ height: spacing.xxl }} />
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
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderCurve: "continuous",
    padding: spacing.md,
    gap: spacing.xs,
    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
  },
  cardTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 17,
    marginBottom: spacing.xs,
  },
  coinBadge: {
    alignSelf: "center",
    backgroundColor: "rgba(255,215,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
    borderRadius: 30,
    borderCurve: "continuous",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  coinText: {
    color: colors.gold,
    fontWeight: "700",
    fontSize: 22,
    fontVariant: ["tabular-nums"],
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    borderCurve: "continuous",
  },
  statIcon: {
    fontSize: 22,
    width: 32,
    textAlign: "center",
  },
  statLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  statValue: {
    color: colors.gold,
    fontWeight: "700",
    fontSize: 17,
    fontVariant: ["tabular-nums"],
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    borderCurve: "continuous",
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
    borderCurve: "continuous",
    backgroundColor: colors.danger,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  badge: {
    alignItems: "center",
    gap: 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(255,215,0,0.1)",
    borderRadius: 10,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
  },
  badgeEmoji: {
    fontSize: 22,
  },
  badgeLabel: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  settingsBtn: {
    paddingVertical: 14,
    borderRadius: 30,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
  },
  settingsBtnText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 16,
  },
});
