import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing } from "@/expo/theme";
import { getStorage } from "@/services/StorageService";

export default function EditUsernameSheet() {
  const router = useRouter();
  const storage = getStorage();
  const [name, setName] = useState(
    () => storage.getItem("playerName") || "",
  );

  const handleSave = useCallback(() => {
    const trimmed = name.trim();
    if (trimmed) {
      storage.setItem("playerName", trimmed);
    }
    router.back();
  }, [name, router, storage]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name..."
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={setName}
        maxLength={20}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />
      <Pressable onPress={handleSave} style={styles.saveBtn}>
        <Text style={styles.saveBtnText}>Save</Text>
      </Pressable>
    </View>
  );
}

export const unstable_settings = {
  presentation: "formSheet",
  sheetAllowedDetents: [0.35],
  ...(Platform.OS === "ios" && {
    sheetGrabberVisible: true,
    sheetCornerRadius: 24,
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.gold,
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    borderCurve: "continuous",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 30,
    borderCurve: "continuous",
    alignItems: "center",
    backgroundColor: colors.primary,
    boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
  },
  saveBtnText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
});
