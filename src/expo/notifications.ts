/**
 * Local notifications module — wraps expo-notifications.
 * Web-safe: all calls wrapped in try/catch.
 */

type NotifModule = typeof import("expo-notifications");

let Notif: NotifModule | null = null;
let notifLoaded = false;

async function load(): Promise<NotifModule | null> {
  if (notifLoaded) return Notif;
  notifLoaded = true;
  try {
    Notif = await import("expo-notifications");
  } catch {
    Notif = null;
  }
  return Notif;
}

/** Request notification permission (call on first launch). */
export async function requestPermission(): Promise<boolean> {
  try {
    const n = await load();
    if (!n) return false;
    const { status } = await n.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

/** Schedule a local notification after `seconds` delay. */
export async function scheduleNotification(
  title: string,
  body: string,
  seconds: number,
) {
  try {
    const n = await load();
    if (!n) return;
    await n.scheduleNotificationAsync({
      content: { title, body },
      trigger: { type: "timeInterval" as const, seconds, repeats: false },
    });
  } catch {}
}

/** Notify that a new event mode is available. */
export async function notifyEventAvailable(eventName: string) {
  await scheduleNotification(
    "New Event!",
    `${eventName} mode is now available in Worm World!`,
    1,
  );
}

/** Schedule a daily reward reminder (24h from now). */
export async function scheduleDailyReward() {
  await scheduleNotification(
    "Daily Reward",
    "Your daily coins are waiting! Open Worm World to collect.",
    86400,
  );
}
