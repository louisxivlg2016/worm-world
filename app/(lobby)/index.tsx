import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { colors, spacing } from "@/expo/theme";
import { spacetimeService } from "@/services/SpacetimeService";
import type { GameMode } from "@/types/game";

type RoomInfo = {
  id: bigint;
  name: string;
  slug: string;
  gameMode: string;
  maxPlayers: number;
  memberCount: number;
};

export default function LobbyScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 600;
  const contentMaxWidth = 600;

  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [roomName, setRoomName] = useState("");
  const [joinSlug, setJoinSlug] = useState("");
  const [gameMode, setGameMode] = useState<GameMode>("battle");
  const [loading, setLoading] = useState(false);

  const loadRooms = useCallback(() => {
    setRooms(spacetimeService.getRoomList());
  }, []);

  useEffect(() => {
    loadRooms();
    spacetimeService.updateCallbacks({ onRoomListChanged: loadRooms });
    const interval = setInterval(loadRooms, 5000);
    return () => clearInterval(interval);
  }, [loadRooms]);

  // Handle wormworld://room/{slug} deep links
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const parsed = Linking.parse(event.url);
      if (parsed.path?.startsWith("room/")) {
        const slug = parsed.path.replace("room/", "");
        if (slug) handleJoin(slug);
      }
    };

    // Check initial URL
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    // Listen for incoming links
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, []);

  const handleCreate = async () => {
    if (!roomName.trim()) return;
    setLoading(true);
    try {
      const result = await spacetimeService.createRoom(roomName.trim(), true, gameMode, 8);
      if (result) {
        // Subscribe to game data and navigate to play tab
        const roomId = spacetimeService.getCurrentRoomId();
        if (roomId) spacetimeService.subscribeToGameData(roomId);
        router.push("/");
      }
    } catch (e) {
      console.error("Failed to create room:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (slug: string) => {
    if (!slug.trim()) return;
    setLoading(true);
    try {
      const result = spacetimeService.joinRoom(slug.trim());
      if (result) {
        spacetimeService.subscribeToGameData(result.roomId);
        router.push("/");
      }
    } catch (e) {
      console.error("Failed to join room:", e);
    } finally {
      setLoading(false);
    }
  };

  const renderRoom = ({ item, index }: { item: RoomInfo; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <View style={styles.roomEntry}>
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{item.name}</Text>
          <Text style={styles.roomMode}>{item.gameMode.toUpperCase()}</Text>
        </View>
        <View style={styles.roomRight}>
          <Text style={styles.roomPlayers}>
            {item.memberCount}/{item.maxPlayers}
          </Text>
          <Pressable onPress={() => handleJoin(item.slug)} style={styles.joinSmallBtn}>
            <Text style={styles.joinSmallText}>Rejoindre</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );

  const desktopContainerStyle = isDesktop
    ? { maxWidth: contentMaxWidth, alignSelf: 'center' as const, width: '100%' as any }
    : {};

  const desktopInputStyle = isDesktop
    ? { maxWidth: 400 }
    : {};

  return (
    <View style={styles.container}>
      <View style={[{ flex: 1, gap: spacing.md }, desktopContainerStyle]}>
      {/* Create Room */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Créer une salle</Text>
        <TextInput
          style={[styles.input, desktopInputStyle]}
          placeholder="Nom de la salle..."
          placeholderTextColor={colors.textSecondary}
          value={roomName}
          onChangeText={setRoomName}
          maxLength={30}
        />
        <View style={styles.modeRow}>
          {(["battle", "ffa"] as GameMode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => setGameMode(m)}
              style={[styles.modeBtn, m === gameMode && styles.modeBtnActive]}
            >
              <Text style={[styles.modeText, m === gameMode && styles.modeTextActive]}>
                {m === "battle" ? "Battle" : "FFA"}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={handleCreate}
          style={[styles.createBtn, loading && styles.btnDisabled]}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.createBtnText}>Créer</Text>
          )}
        </Pressable>
      </View>

      {/* Join by Code */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rejoindre par code</Text>
        <View style={[styles.joinRow, desktopInputStyle]}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Code..."
            placeholderTextColor={colors.textSecondary}
            value={joinSlug}
            onChangeText={setJoinSlug}
            maxLength={6}
            autoCapitalize="characters"
          />
          <Pressable
            onPress={() => handleJoin(joinSlug)}
            style={[styles.joinBtn, loading && styles.btnDisabled]}
          >
            <Text style={styles.joinBtnText}>Rejoindre</Text>
          </Pressable>
        </View>
      </View>

      {/* Public Rooms */}
      <View style={[styles.section, { flex: 1 }]}>
        <Text style={styles.sectionTitle}>Salles publiques</Text>
        <FlatList
          data={rooms}
          renderItem={renderRoom}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.roomList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucune salle disponible</Text>
          }
        />
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.md,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderCurve: "continuous",
    padding: spacing.md,
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  },
  sectionTitle: {
    color: colors.gold,
    fontWeight: "700",
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  input: {
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
  modeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
  },
  modeBtnActive: {
    backgroundColor: "rgba(255,215,0,0.2)",
    borderColor: colors.gold,
  },
  modeText: {
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
  modeTextActive: {
    color: colors.gold,
  },
  createBtn: {
    paddingVertical: 12,
    borderRadius: 30,
    borderCurve: "continuous",
    alignItems: "center",
    backgroundColor: colors.danger,
    boxShadow: "0 4px 12px rgba(255,51,102,0.3)",
  },
  createBtnText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  joinRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  joinBtn: {
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: 30,
    borderCurve: "continuous",
    backgroundColor: colors.primary,
    boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
  },
  joinBtnText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  roomList: {
    gap: spacing.xs,
  },
  roomEntry: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderCurve: "continuous",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  roomInfo: {
    flex: 1,
    gap: 2,
  },
  roomName: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  roomMode: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  roomRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  roomPlayers: {
    color: colors.textSecondary,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  joinSmallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderCurve: "continuous",
    backgroundColor: colors.primary,
  },
  joinSmallText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    paddingVertical: spacing.lg,
    fontSize: 14,
  },
});
