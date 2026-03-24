/**
 * Haptics module — wraps expo-haptics with web-safe try/catch.
 */

let Haptics: typeof import("expo-haptics") | null = null;

async function load() {
  if (Haptics) return Haptics;
  try {
    Haptics = await import("expo-haptics");
  } catch {
    Haptics = null;
  }
  return Haptics;
}

export async function lightImpact() {
  try {
    const h = await load();
    await h?.impactAsync(h.ImpactFeedbackStyle.Light);
  } catch {}
}

export async function mediumImpact() {
  try {
    const h = await load();
    await h?.impactAsync(h.ImpactFeedbackStyle.Medium);
  } catch {}
}

export async function heavyImpact() {
  try {
    const h = await load();
    await h?.impactAsync(h.ImpactFeedbackStyle.Heavy);
  } catch {}
}

export async function success() {
  try {
    const h = await load();
    await h?.notificationAsync(h.NotificationFeedbackType.Success);
  } catch {}
}

export async function error() {
  try {
    const h = await load();
    await h?.notificationAsync(h.NotificationFeedbackType.Error);
  } catch {}
}

export async function selection() {
  try {
    const h = await load();
    await h?.selectionAsync();
  } catch {}
}
