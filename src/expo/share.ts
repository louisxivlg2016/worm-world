/**
 * Share module — wraps expo-sharing for native share sheets.
 * Falls back to Web Share API, then clipboard.
 */

type ShareModule = typeof import("expo-sharing");

let Sharing: ShareModule | null = null;
let shareLoaded = false;

async function load(): Promise<ShareModule | null> {
  if (shareLoaded) return Sharing;
  shareLoaded = true;
  try {
    Sharing = await import("expo-sharing");
  } catch {
    Sharing = null;
  }
  return Sharing;
}

/** Share a score / invite link. */
export async function shareScore(score: number, roomSlug?: string) {
  const link = roomSlug
    ? `wormworld://room/${roomSlug}`
    : "https://wormworld.app";
  const text = `I scored ${score} in Worm World! Join me: ${link}`;

  try {
    // Try expo-sharing first (native)
    const s = await load();
    if (s && (await s.isAvailableAsync())) {
      await s.shareAsync(link, { dialogTitle: text, mimeType: "text/plain" });
      return;
    }
  } catch {}

  // Fallback: Web Share API
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ text });
      return;
    }
  } catch {}

  // Last resort: clipboard
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  } catch {}
}

/** Share arbitrary text via the best available method. */
export async function shareText(text: string) {
  try {
    const s = await load();
    if (s && (await s.isAvailableAsync())) {
      await s.shareAsync(text, { mimeType: "text/plain" });
      return;
    }
  } catch {}

  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ text });
      return;
    }
  } catch {}

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  } catch {}
}
