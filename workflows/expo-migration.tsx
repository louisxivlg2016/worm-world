/**
 * Smithers workflow: Expo Migration for Worm World
 *
 * Usage:
 *   bunx smithers run workflows/expo-migration.tsx
 *
 * Phase 1: Expo scaffold + NativeTabs + metro config + "use dom" game
 * Phase 2: Native Shop, Profile, Lobby screens with form sheets
 * Phase 3: Native features (haptics, audio, notifications, orientation)
 * Phase 4: Navigation polish, design system, staggered animations
 * Phase 5: App assets, EAS config, full build verification + smoke test
 *
 * Architecture:
 *   - Game runs via "use dom" in WebView (Canvas 2D engine stays as-is)
 *   - Shop, Profile, Lobby are native React Native screens
 *   - NativeTabs for bottom navigation (4 tabs: Play, Shop, Rank, Profile)
 *   - SpacetimeDB multiplayer works as-is (WebSocket)
 *   - Bridge pattern for native <-> DOM communication
 *
 * Delete smithers.db before running to start fresh.
 */
import { createSmithers, Ralph, Sequence } from "smithers-orchestrator";
import { ClaudeCodeAgent, CodexAgent } from "smithers-orchestrator";
import { z } from "zod";

const implResult = z.object({
  summary: z.string(),
  filesChanged: z.array(z.string()),
});

const reviewResult = z.object({
  approved: z.boolean(),
  issues: z.array(z.string()),
  summary: z.string(),
});

const { Workflow, Task, smithers, outputs } = createSmithers({
  impl1: implResult, review1: reviewResult,
  impl2: implResult, review2: reviewResult,
  impl3: implResult, review3: reviewResult,
  impl4: implResult, review4: reviewResult,
  impl5: implResult, review5: reviewResult,
});

const PROJECT_DIR = "/home/louisxiv/worm-world";

const coder = new ClaudeCodeAgent({
  model: "claude-opus-4-6",
  dangerouslySkipPermissions: true,
  allowDangerouslySkipPermissions: true,
});

const reviewer = new CodexAgent({
  model: "gpt-5.3-codex",
  config: { model_reasoning_effort: "high" },
  dangerouslyBypassApprovalsAndSandbox: true,
  skipGitRepoCheck: true,
  cd: PROJECT_DIR,
});

export default smithers((ctx) => (
  <Workflow name="worm-world-expo-migration">
    <Sequence>

      {/* ═══════════════════════════════════════════
          PHASE 1: Expo Scaffold + NativeTabs + DOM Game
          ═══════════════════════════════════════════ */}
      <Ralph
        until={ctx.latest(reviewResult, "review1")?.approved}
        maxIterations={3}
        onMaxReached="return-last"
      >
        <Sequence>
        <Task id="impl1" output={implResult} agent={coder} retries={2}>
{`You are working on worm-world at ${PROJECT_DIR}.
${ctx.latest(reviewResult, "review1")?.issues?.length ? `\nPREVIOUS REVIEW FEEDBACK:\n${ctx.latest(reviewResult, "review1")!.issues.join("\n")}\n` : ""}
Implement Phase 1: Expo scaffold + NativeTabs + "use dom" game wrapper.

This is a Vite + React 19 + TypeScript slither.io clone.

echo "=== Phase 1: Installing Expo dependencies ==="
bun add expo expo-router react-native react-native-web react-native-safe-area-context react-native-screens react-native-reanimated react-native-gesture-handler @expo/metro-runtime
bun add -D @expo/metro-config babel-preset-expo

echo "=== Creating app.json ==="
Create app.json: name "Worm World", slug "worm-world", scheme "wormworld", web.bundler "metro", web.output "static", plugins ["expo-router"]

echo "=== Creating metro.config.js ==="
Create metro.config.js with @/ alias resolving to src/:
  const { getDefaultConfig } = require("expo/metro-config");
  const path = require("path");
  const config = getDefaultConfig(__dirname);
  config.resolver.alias = { "@": path.resolve(__dirname, "src") };
  module.exports = config;

echo "=== Creating babel.config.js ==="
Create babel.config.js: module.exports = { presets: ["babel-preset-expo"] };

echo "=== Updating package.json ==="
Update package.json: "main": "expo-router/entry", add expo scripts (start, android, ios)

echo "=== Creating NativeTabs layout ==="
Create app/_layout.tsx with NativeTabs (4 tabs):
  import { NativeTabs } from "expo-router/unstable-native-tabs";
  (game) Play gamecontroller.fill/sports_esports
  (shop) Shop cart.fill/shopping_cart
  (lobby) Multi person.2.fill/groups
  (profile) Profile person.crop.circle.fill/account_circle

echo "=== Creating web layout ==="
Create app/_layout.web.tsx with Tabs from "expo-router/tabs":
  Same 4 tabs, web-compatible with emoji icons.
  Default tabBarItemStyle: { display: "none" }, override each visible tab with { display: "flex" }.

echo "=== Creating tab groups ==="
Create tab group layouts and index files:
  app/(game)/_layout.tsx: Stack headerShown: false
  app/(game)/index.tsx: Renders GameDom full-screen
  app/(shop)/_layout.tsx: Stack headerLargeTitle
  app/(shop)/index.tsx: Placeholder "Shop coming in Phase 2"
  app/(lobby)/_layout.tsx: Stack headerLargeTitle
  app/(lobby)/index.tsx: Placeholder "Lobby coming in Phase 2"
  app/(profile)/_layout.tsx: Stack headerLargeTitle
  app/(profile)/index.tsx: Placeholder "Profile coming in Phase 2"

echo "=== Creating DOM game component ==="
Create src/expo/GameDom.tsx with "use dom" directive wrapping <App />.
Pass onHaptic, onShare, onPlaySound props. Inject window.__nativeBridge.

echo "=== Creating bridge and theme ==="
Create src/expo/bridge.ts: NativeBridge interface with web fallbacks.
Create src/expo/theme.ts: colors (background, surface, primary, accent, text), spacing tokens.
Create app/+html.tsx: font links (Bungee, Fredoka) + meta viewport.

echo "=== Fixing import.meta.env ==="
In SpacetimeService.ts: replace import.meta.env.VITE_* with process.env.VITE_* || process.env.EXPO_PUBLIC_*
Update vite.config.ts to use loadEnv() and define process.env.VITE_* values.

echo "=== Verifying builds ==="
bun run build
bunx expo export --platform web

DO NOT modify useGameEngine.ts or any core game logic.
DO NOT modify existing screen components in this phase.

Log progress with echo statements. Fix any errors until builds pass.

Return JSON: { summary: "...", filesChanged: ["path1", ...] }`}
        </Task>

        <Task id="review1" output={reviewResult} agent={reviewer} retries={2}>
{`Review Phase 1 of Expo migration at ${PROJECT_DIR}.

Check these files exist and are correct:
1. app.json — has expo config with scheme "wormworld", plugins ["expo-router"]
2. metro.config.js — has @/ alias resolving to src/
3. babel.config.js — uses babel-preset-expo
4. app/_layout.tsx — NativeTabs with 4 tabs (game, shop, lobby, profile)
5. app/_layout.web.tsx — web Tabs with tabBarItemStyle hiding pattern
6. app/(game)/_layout.tsx + index.tsx — Stack + GameDom render
7. app/(shop|lobby|profile)/_layout.tsx + index.tsx — Stack + placeholder
8. src/expo/GameDom.tsx — has "use dom" directive as first line, imports App
9. src/expo/bridge.ts — NativeBridge interface with haptic, playSound, share, scheduleNotification
10. src/expo/theme.ts — colors and spacing tokens
11. app/+html.tsx — font links for Bungee and Fredoka
12. src/services/SpacetimeService.ts — NO import.meta.env (uses process.env)

Run these commands and check output:
  cd ${PROJECT_DIR}
  bun run build 2>&1 | tail -5
  bunx expo export --platform web 2>&1 | tail -10
  timeout 15 bunx expo start --no-dev 2>&1 | tail -20 || true

If ALL checks pass AND builds succeed: { approved: true, issues: [], summary: "Phase 1 looks good" }
If ANY issue: { approved: false, issues: ["describe each issue"], summary: "Found N issues" }`}
        </Task>
        </Sequence>
      </Ralph>

      {/* ═══════════════════════════════════════════
          PHASE 2: Native Shop, Profile, Lobby Screens
          ═══════════════════════════════════════════ */}
      <Ralph
        until={ctx.latest(reviewResult, "review2")?.approved}
        maxIterations={3}
        onMaxReached="return-last"
      >
        <Sequence>
        <Task id="impl2" output={implResult} agent={coder} retries={2}>
{`You are working on worm-world at ${PROJECT_DIR}.
${ctx.latest(reviewResult, "review2")?.issues?.length ? `\nPREVIOUS REVIEW FEEDBACK:\n${ctx.latest(reviewResult, "review2")!.issues.join("\n")}\n` : ""}
Implement Phase 2: Native Shop, Profile, Lobby screens.

echo "=== Phase 2: Creating native screens ==="

SHOP (app/(shop)/index.tsx):
- ScrollView with FlatList numColumns=3 for flag grid
- Search TextInput for flags
- Horizontal ScrollView for head/costume selector
- Body style toggle (Circles vs Tube)
- Color picker section, coin balance, apply button with price
- Data from FLAG_SKINS, HEAD_OPTIONS, GAME_EVENTS arrays in ShopScreen.tsx
- Create src/assets/flags.ts mapping flag names to require() calls for drapeau/ PNGs

echo "=== Creating shop form sheets ==="
app/(shop)/buy-confirm.tsx: presentation "formSheet", sheetAllowedDetents [0.3], cost + confirm/cancel

echo "=== Creating native profile ==="
app/(profile)/index.tsx: Card layout, stats rows (best score, time, kills, games, play time), costumes progress bar, event badges, coin balance
app/(profile)/settings.tsx: formSheet sheetAllowedDetents [0.75, 1.0], reset data with Alert.alert

echo "=== Creating native lobby ==="
app/(lobby)/index.tsx: TextInput for room name, mode selector, join by code, FlatList for public rooms. Uses spacetimeService directly.

Use theme.ts colors/spacing. Use Pressable not TouchableOpacity. Use boxShadow strings. Use borderCurve: 'continuous'. Use useWindowDimensions() not Dimensions.get().

echo "=== Verifying builds ==="
bun run build
bunx expo export --platform web

Log progress with echo. Fix errors until builds pass.

Return JSON: { summary: "...", filesChanged: ["path1", ...] }`}
        </Task>

        <Task id="review2" output={reviewResult} agent={reviewer} retries={2}>
{`Review Phase 2: Native screens at ${PROJECT_DIR}.

Check:
1. app/(shop)/index.tsx — native shop with flag grid, search, head selector, body style, prices
2. app/(shop)/buy-confirm.tsx — formSheet presentation with cost breakdown + confirm
3. app/(profile)/index.tsx — native profile with stats, progress bar, event badges
4. app/(profile)/settings.tsx — formSheet with reset data using Alert.alert
5. app/(lobby)/index.tsx — native lobby with create/join/list using spacetimeService
6. src/assets/flags.ts — flag name -> require() mapping exists
7. All screens use theme.ts colors, Pressable, boxShadow, borderCurve: 'continuous'
8. Zero TouchableOpacity, zero Platform.select shadows, zero Dimensions.get()

Run:
  cd ${PROJECT_DIR}
  grep -r "TouchableOpacity" app/ src/expo/ --include="*.tsx" | head -5
  bun run build 2>&1 | tail -5
  bunx expo export --platform web 2>&1 | tail -10

If ALL checks pass AND builds succeed: { approved: true, issues: [], summary: "Phase 2 looks good" }
If ANY issue: { approved: false, issues: ["..."], summary: "Found N issues" }`}
        </Task>
        </Sequence>
      </Ralph>

      {/* ═══════════════════════════════════════════
          PHASE 3: Native Features
          ═══════════════════════════════════════════ */}
      <Ralph
        until={ctx.latest(reviewResult, "review3")?.approved}
        maxIterations={3}
        onMaxReached="return-last"
      >
        <Sequence>
        <Task id="impl3" output={implResult} agent={coder} retries={2}>
{`You are working on worm-world at ${PROJECT_DIR}.
${ctx.latest(reviewResult, "review3")?.issues?.length ? `\nPREVIOUS REVIEW FEEDBACK:\n${ctx.latest(reviewResult, "review3")!.issues.join("\n")}\n` : ""}
Implement Phase 3: Native features (haptics, audio, orientation, keep awake).

echo "=== Phase 3: Installing native packages ==="
bun add expo-haptics expo-av expo-screen-orientation expo-keep-awake expo-notifications expo-sharing expo-font @expo-google-fonts/bungee @expo-google-fonts/fredoka

echo "=== Creating haptics module ==="
src/expo/haptics.ts: Wrap expo-haptics with try/catch for web. Functions: lightImpact, mediumImpact, heavyImpact, success, error, selection.

echo "=== Creating audio module ==="
src/expo/audio.ts: Wrap expo-av Audio.Sound. Functions: playSound(name), playMusic(uri), stopMusic(). Sound pool for concurrent effects.

echo "=== Creating notifications module ==="
src/expo/notifications.ts: Local notifications for event mode available, daily reward. Permission request on first launch.

echo "=== Creating share module ==="
src/expo/share.ts: Share score/invite via expo-sharing. Format: "I scored {score} in Worm World! Join me: wormworld://room/{slug}"

echo "=== Wiring native callbacks ==="
app/(game)/index.tsx: Pass onHaptic, onPlaySound, onShare to GameDom. useKeepAwake(). Lock landscape during gameplay (catch errors for web).

echo "=== Loading fonts ==="
app/_layout.tsx: useFonts with Bungee and Fredoka. SplashScreen.preventAutoHideAsync() until fonts loaded.

echo "=== Updating app.json ==="
Add plugins: expo-screen-orientation, expo-notifications

echo "=== Bridge haptic triggers ==="
In game DOM bridge, call native haptics on: boost, kill, coin collect, death.

echo "=== Verifying builds ==="
bun run build
bunx expo export --platform web

All expo API calls MUST be wrapped in try/catch for web compatibility.

Log progress with echo. Fix errors until builds pass.

Return JSON: { summary: "...", filesChanged: ["path1", ...] }`}
        </Task>

        <Task id="review3" output={reviewResult} agent={reviewer} retries={2}>
{`Review Phase 3: Native features at ${PROJECT_DIR}.

Check:
1. src/expo/haptics.ts — functions exist, all wrapped in try/catch
2. src/expo/audio.ts — expo-av based sound pool
3. src/expo/notifications.ts — local notification helpers
4. src/expo/share.ts — share score/invite
5. app/(game)/index.tsx — passes native callbacks to GameDom, useKeepAwake, orientation lock with .catch()
6. app/_layout.tsx — useFonts with SplashScreen.preventAutoHideAsync
7. app.json — plugins includes expo-screen-orientation, expo-notifications
8. All expo API calls wrapped in try/catch (grep for unwrapped calls)

Run:
  cd ${PROJECT_DIR}
  bun run build 2>&1 | tail -5
  bunx expo export --platform web 2>&1 | tail -10
  timeout 15 bunx expo start --no-dev 2>&1 | tail -20 || true

If ALL checks pass AND builds succeed: { approved: true, issues: [], summary: "Phase 3 looks good" }
If ANY issue: { approved: false, issues: ["..."], summary: "Found N issues" }`}
        </Task>
        </Sequence>
      </Ralph>

      {/* ═══════════════════════════════════════════
          PHASE 4: Navigation Polish + Design System
          ═══════════════════════════════════════════ */}
      <Ralph
        until={ctx.latest(reviewResult, "review4")?.approved}
        maxIterations={3}
        onMaxReached="return-last"
      >
        <Sequence>
        <Task id="impl4" output={implResult} agent={coder} retries={2}>
{`You are working on worm-world at ${PROJECT_DIR}.
${ctx.latest(reviewResult, "review4")?.issues?.length ? `\nPREVIOUS REVIEW FEEDBACK:\n${ctx.latest(reviewResult, "review4")!.issues.join("\n")}\n` : ""}
Implement Phase 4: Navigation polish, animations, design refinement.

echo "=== Phase 4: Polishing NativeTabs ==="
Add badges: "NEW" on Shop if new costumes, dot badge on lobby if rooms exist.
State-variant icons (filled selected, outline unselected).

echo "=== Stack headers ==="
All tab Stacks: headerTransparent: true, headerLargeTitle: true, headerLargeTitleShadowVisible: false, headerBlurEffect: "none", contentStyle: { backgroundColor: colors.background }, headerTintColor: colors.text.

echo "=== Staggered animations ==="
bun add react-native-reanimated (if not already)
Shop: FadeInDown.delay(index * 50) on flag grid items.
Profile: FadeInUp on stat rows.
Lobby: FadeInDown on room list entries.

echo "=== Form sheet polish ==="
All form sheets: contentStyle: { backgroundColor: "transparent" }, sheetGrabberVisible: true, correct detent sizes.

echo "=== Dark theme ==="
ThemeProvider with DarkTheme from @react-navigation/native. All cards colors.surface, all text colors.text/textSecondary.

echo "=== Style consistency ==="
Replace ALL TouchableOpacity -> Pressable.
Replace ALL Platform.select shadows -> boxShadow strings.
Add borderCurve: 'continuous' to all rounded elements.
Add fontVariant: 'tabular-nums' to all numeric displays.

echo "=== Tab hiding during gameplay ==="
Hide tab bar when game is playing. Show on death/back.

echo "=== Verifying builds ==="
bun run build
bunx expo export --platform web

Log progress with echo. Fix errors until builds pass.

Return JSON: { summary: "...", filesChanged: ["path1", ...] }`}
        </Task>

        <Task id="review4" output={reviewResult} agent={reviewer} retries={2}>
{`Review Phase 4: Navigation polish at ${PROJECT_DIR}.

Check:
1. NativeTabs has badges and state-variant icons
2. All Stack layouts: headerTransparent, headerLargeTitle
3. Staggered animations with react-native-reanimated (FadeInDown/FadeInUp)
4. All form sheets: transparent contentStyle + grabber visible
5. ThemeProvider with DarkTheme wraps app
6. Zero TouchableOpacity: grep -r "TouchableOpacity" app/ src/expo/ --include="*.tsx"
7. Zero Platform.select shadows: grep -r "Platform.select" app/ src/expo/ --include="*.tsx"
8. borderCurve: 'continuous' on rounded elements
9. fontVariant: 'tabular-nums' on numbers
10. Tab bar hidden during gameplay

Run:
  cd ${PROJECT_DIR}
  grep -r "TouchableOpacity" app/ src/expo/ --include="*.tsx" | wc -l
  grep -r "Platform.select" app/ src/expo/ --include="*.tsx" | wc -l
  bun run build 2>&1 | tail -5
  bunx expo export --platform web 2>&1 | tail -10
  timeout 15 bunx expo start --no-dev 2>&1 | tail -20 || true

If ALL checks pass AND builds succeed: { approved: true, issues: [], summary: "Phase 4 looks good" }
If ANY issue: { approved: false, issues: ["..."], summary: "Found N issues" }`}
        </Task>
        </Sequence>
      </Ralph>

      {/* ═══════════════════════════════════════════
          PHASE 5: App Assets + EAS + Full Verification
          ═══════════════════════════════════════════ */}
      <Ralph
        until={ctx.latest(reviewResult, "review5")?.approved}
        maxIterations={3}
        onMaxReached="return-last"
      >
        <Sequence>
        <Task id="impl5" output={implResult} agent={coder} retries={2}>
{`You are working on worm-world at ${PROJECT_DIR}.
${ctx.latest(reviewResult, "review5")?.issues?.length ? `\nPREVIOUS REVIEW FEEDBACK:\n${ctx.latest(reviewResult, "review5")!.issues.join("\n")}\n` : ""}
Implement Phase 5: App assets, EAS config, full build verification.

echo "=== Phase 5: Creating app icon ==="
Use ImageMagick to create assets/icon.png (1024x1024): green circle with cartoon worm eyes.
Set in app.json: icon, splash.image, adaptiveIcon.

echo "=== Creating splash screen ==="
Create assets/splash.png (1284x2778) with ImageMagick.
Configure expo-splash-screen in app.json.
SplashScreen.preventAutoHideAsync() + hideAsync() after fonts load.

echo "=== Creating EAS config ==="
Create eas.json with development, preview, production build profiles.

echo "=== Creating env example ==="
Create .env.example:
  EXPO_PUBLIC_SPACETIMEDB_URI=wss://maincloud.spacetimedb.com
  EXPO_PUBLIC_SPACETIMEDB_DB=worm-world-server

echo "=== Deep linking ==="
Handle wormworld://room/{slug} in app/(lobby)/index.tsx.
Use expo-linking to parse incoming URLs.

echo "=== Updating gitignore ==="
Add to .gitignore: .expo/, ios/, android/, *.jks, *.keystore

echo "=== Creating edit-username sheet ==="
app/(game)/edit-username.tsx: FormSheet sheetAllowedDetents [0.35] for editing player name.

echo "=== FULL VERIFICATION ==="
bun run build
bunx expo export --platform web
timeout 15 bunx expo start --no-dev 2>&1 | tail -20 || true
bunx expo-doctor 2>&1 | tail -10

Fix ANY failures before completing.

Log progress with echo. Fix errors until ALL builds pass.

Return JSON: { summary: "...", filesChanged: ["path1", ...] }`}
        </Task>

        <Task id="review5" output={reviewResult} agent={reviewer} retries={2}>
{`Final review of Expo migration at ${PROJECT_DIR}.

Check all files:
1. assets/icon.png exists and is 1024x1024
2. assets/splash.png exists
3. eas.json with development, preview, production profiles
4. .env.example with EXPO_PUBLIC_SPACETIMEDB_URI and EXPO_PUBLIC_SPACETIMEDB_DB
5. .gitignore includes .expo/, ios/, android/
6. app/(game)/edit-username.tsx — formSheet for player name
7. Deep linking handler in app/(lobby)/index.tsx

Run ALL verification:
  cd ${PROJECT_DIR}
  bun run build 2>&1 | tail -5
  bunx expo export --platform web 2>&1 | tail -10
  timeout 15 bunx expo start --no-dev 2>&1 | tail -20 || true
  bunx expo-doctor 2>&1 | tail -10

Vite web build must produce output.
Expo web export must succeed.
Expo dev server must start without crash.

If ALL checks pass AND ALL builds succeed: { approved: true, issues: [], summary: "Migration complete" }
If ANY issue: { approved: false, issues: ["..."], summary: "Found N issues" }`}
        </Task>
        </Sequence>
      </Ralph>

    </Sequence>
  </Workflow>
));
