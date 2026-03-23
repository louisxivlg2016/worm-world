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

function feedback(ctx: any, reviewId: string): string {
  const result = ctx.latest(reviewResult, reviewId);
  if (!result?.issues?.length) return "";
  return "\nPREVIOUS REVIEW FEEDBACK:\n" + result.issues.join("\n") + "\n";
}

const coder = new ClaudeCodeAgent({
  model: "claude-opus-4-6",
  dangerouslySkipPermissions: true,
  allowDangerouslySkipPermissions: true,
});

const reviewer = new CodexAgent({
  model: "gpt-5.3-codex",
  config: { model_reasoning_effort: "high" },
  fullAuto: true,
  cd: PROJECT_DIR,
});

export default smithers((ctx) => (
  <Workflow name="worm-world-expo-migration">
    <Sequence>

      {/* ═══════════════════════════════════════════
          PHASE 1: Expo Scaffold + NativeTabs + DOM Game
          ═══════════════════════════════════════════ */}
      <Ralph maxIterations={3} onMaxReached="return-last">
        <Task
          id="impl1"
          agent={coder}
          retries={2}
          resultSchema={implResult}
          cd={PROJECT_DIR}
        >
{`Migrate worm-world to Expo (Phase 1: Scaffold + Game via DOM component).
${feedback(ctx, "review1")}

This is a Vite + React 19 + TypeScript slither.io clone at ${PROJECT_DIR}.

STEP 1: Install Expo dependencies
  bun add expo expo-router react-native react-native-web react-native-safe-area-context react-native-screens react-native-reanimated react-native-gesture-handler @expo/metro-runtime
  bun add -D @expo/metro-config babel-preset-expo

STEP 2: Create app.json with:
  - name: "Worm World", slug: "worm-world", scheme: "wormworld"
  - web.bundler: "metro", web.output: "static"
  - plugins: ["expo-router"]

STEP 3: Create metro.config.js with @/ alias resolving to src/:
  const { getDefaultConfig } = require("expo/metro-config");
  const path = require("path");
  const config = getDefaultConfig(__dirname);
  config.resolver.alias = { "@": path.resolve(__dirname, "src") };
  module.exports = config;

STEP 4: Create babel.config.js:
  module.exports = { presets: ["babel-preset-expo"] };

STEP 5: Update package.json:
  - "main": "expo-router/entry"
  - scripts: "start": "expo start", "android": "expo start --android", "ios": "expo start --ios"

STEP 6: Create app/_layout.tsx with NativeTabs (4 tabs):
  import { NativeTabs } from "expo-router/unstable-native-tabs";
  Tabs: (game) Play gamecontroller.fill/sports_esports, (shop) Shop cart.fill/shopping_cart, (lobby) Multi person.2.fill/groups, (profile) Profile person.crop.circle.fill/account_circle

STEP 7: Create app/_layout.web.tsx with Tabs from "expo-router/tabs":
  Same 4 tabs but using web-compatible Tabs component with emoji icons.
  Default tabBarItemStyle: { display: "none" }, override each visible tab with { display: "flex" }.

STEP 8: Create tab group layouts and index files:
  - app/(game)/_layout.tsx: Stack with headerShown: false
  - app/(game)/index.tsx: Renders GameDom component full-screen
  - app/(shop)/_layout.tsx: Stack with headerLargeTitle
  - app/(shop)/index.tsx: Placeholder "Shop coming in Phase 2"
  - app/(lobby)/_layout.tsx: Stack with headerLargeTitle
  - app/(lobby)/index.tsx: Placeholder "Lobby coming in Phase 2"
  - app/(profile)/_layout.tsx: Stack with headerLargeTitle
  - app/(profile)/index.tsx: Placeholder "Profile coming in Phase 2"

STEP 9: Create src/expo/GameDom.tsx with "use dom" directive:
  "use dom";
  import { App } from "@/App";
  This wraps the existing web <App /> component.
  Pass onHaptic, onShare, onPlaySound as props.
  Inject window.__nativeBridge for DOM <-> native communication.

STEP 10: Create src/expo/bridge.ts with NativeBridge interface:
  haptic(type), playSound(name), share(text), scheduleNotification(title, body, delayMs)
  Web fallback that does nothing.

STEP 11: Create src/expo/theme.ts with design tokens:
  colors: background "#2c3e50", surface "#34495e", primary "#e67e22", accent "#f39c12", text "#ecf0f1", etc.
  spacing: xs 4, sm 8, md 16, lg 24, xl 32

STEP 12: Create app/+html.tsx with font links (Bungee, Fredoka) and meta viewport.

STEP 13: Fix import.meta.env in SpacetimeService.ts:
  Replace import.meta.env.VITE_* with process.env.VITE_* || process.env.EXPO_PUBLIC_*
  Update vite.config.ts to use loadEnv() and define process.env.VITE_* values.

STEP 14: Verify builds:
  - bun run build (Vite web build must still work)
  - bunx expo export --platform web (Expo web must work)

DO NOT modify the game engine (useGameEngine.ts) or any core game logic.
DO NOT modify existing screen components (WelcomeScreen, ShopScreen, etc.) in this phase.
The game runs entirely through the "use dom" component wrapping the existing App.`}
        </Task>
        <Task
          id="review1"
          agent={reviewer}
          resultSchema={reviewResult}
        >
{`Review Phase 1 of Expo migration for worm-world at ${PROJECT_DIR}.

CHECK these files exist and are correct:
1. app.json — has expo config with scheme, plugins
2. metro.config.js — has @/ alias
3. babel.config.js — uses babel-preset-expo
4. app/_layout.tsx — NativeTabs with 4 tabs (game, shop, lobby, profile)
5. app/_layout.web.tsx — web Tabs with tabBarItemStyle hiding
6. app/(game)/_layout.tsx + index.tsx — Stack + GameDom render
7. app/(shop|lobby|profile)/_layout.tsx + index.tsx — Stack + placeholder
8. src/expo/GameDom.tsx — has "use dom" directive, imports App
9. src/expo/bridge.ts — NativeBridge interface
10. src/expo/theme.ts — design tokens
11. app/+html.tsx — font links
12. src/services/SpacetimeService.ts — no import.meta.env (uses process.env)

RUN these commands:
  cd ${PROJECT_DIR}
  bunx tsc --noEmit 2>&1 | head -20
  bun run build 2>&1 | tail -5
  bunx expo export --platform web 2>&1 | tail -10
  timeout 15 bunx expo start --no-dev 2>&1 | tail -20 || true

Verify original Vite build still works.
Return { approved, issues, summary }.`}
        </Task>
      </Ralph>

      {/* ═══════════════════════════════════════════
          PHASE 2: Native Shop, Profile, Lobby Screens
          ═══════════════════════════════════════════ */}
      <Ralph maxIterations={3} onMaxReached="return-last">
        <Task
          id="impl2"
          agent={coder}
          retries={2}
          resultSchema={implResult}
          cd={PROJECT_DIR}
        >
{`Expo migration Phase 2: Native Shop, Profile, Lobby screens.
${feedback(ctx, "review2")}

Create native React Native versions of the Shop, Profile, and Lobby screens.
These replace the placeholder screens from Phase 1.

SHOP (app/(shop)/index.tsx):
- ScrollView with flag grid (FlatList numColumns=3 for flags)
- Search bar for flags (Stack.SearchBar or TextInput)
- Head/costume selector as horizontal ScrollView
- Body style toggle (Circles vs Tube)
- Color picker section
- Coin balance display
- Apply button with price
- Data comes from the same FLAG_SKINS, HEAD_OPTIONS, GAME_EVENTS arrays
- Flag images: use require() for each flag PNG in drapeau/
- Create src/assets/flags.ts that maps flag names to require() calls

SHOP FORM SHEETS:
- app/(shop)/buy-confirm.tsx: presentation "formSheet", sheetAllowedDetents [0.3]
  Shows cost breakdown and confirm/cancel buttons

PROFILE (app/(profile)/index.tsx):
- Card-based layout with stats rows (best score, best time, kills, games, play time)
- Costumes unlocked progress bar
- Event badges
- Coin balance
- Uses loadStats() from ProfileScreen.tsx
- Settings row -> navigate to settings sheet

PROFILE FORM SHEETS:
- app/(profile)/settings.tsx: presentation "formSheet", sheetAllowedDetents [0.75, 1.0]
  Reset data button with Alert.alert confirmation

LOBBY (app/(lobby)/index.tsx):
- Create room: TextInput for name, mode selector buttons
- Join by code: TextInput + join button
- Public rooms: FlatList with room entries
- Uses spacetimeService directly
- All the same logic as current LobbyScreen but with RN components

Use theme.ts colors and spacing throughout.
Use Pressable (not TouchableOpacity), boxShadow strings, borderCurve: 'continuous'.
Use useWindowDimensions() not Dimensions.get().

Verify:
  bun run build && bunx expo export --platform web`}
        </Task>
        <Task
          id="review2"
          agent={reviewer}
          resultSchema={reviewResult}
        >
{`Review Phase 2: Native screens for worm-world at ${PROJECT_DIR}.

CHECK:
1. app/(shop)/index.tsx — native shop with flag grid, search, head selector, body style, prices
2. app/(shop)/buy-confirm.tsx — formSheet with cost + confirm
3. app/(profile)/index.tsx — native profile with stats, progress bar, badges
4. app/(profile)/settings.tsx — formSheet with reset
5. app/(lobby)/index.tsx — native lobby with create/join/list
6. src/assets/flags.ts — flag name -> require() mapping
7. All use theme.ts colors, Pressable, boxShadow, borderCurve
8. No TouchableOpacity, no Platform.select shadows, no Dimensions.get()

RUN:
  cd ${PROJECT_DIR}
  bun run build 2>&1 | tail -5
  bunx expo export --platform web 2>&1 | tail -10
  timeout 15 bunx expo start --no-dev 2>&1 | tail -20 || true

Return { approved, issues, summary }.`}
        </Task>
      </Ralph>

      {/* ═══════════════════════════════════════════
          PHASE 3: Native Features
          ═══════════════════════════════════════════ */}
      <Ralph maxIterations={3} onMaxReached="return-last">
        <Task
          id="impl3"
          agent={coder}
          retries={2}
          resultSchema={implResult}
          cd={PROJECT_DIR}
        >
{`Expo migration Phase 3: Native features (haptics, audio, orientation, keep awake).
${feedback(ctx, "review3")}

STEP 1: Install native packages:
  bun add expo-haptics expo-av expo-screen-orientation expo-keep-awake expo-notifications expo-sharing expo-font @expo-google-fonts/bungee @expo-google-fonts/fredoka

STEP 2: Create src/expo/haptics.ts:
  Wrap expo-haptics with platform guard (try/catch for web)
  Functions: lightImpact, mediumImpact, heavyImpact, success, error, selection

STEP 3: Create src/expo/audio.ts:
  Wrap expo-av Audio.Sound
  Functions: playSound(name), playMusic(uri), stopMusic()
  Sound pool for concurrent effects

STEP 4: Create src/expo/notifications.ts:
  Local notifications for: event mode available, daily reward reminder
  Request permissions on first launch

STEP 5: Create src/expo/share.ts:
  Share score/invite link using expo-sharing
  Format: "I scored {score} in Worm World! Join me: wormworld://room/{slug}"

STEP 6: Wire native callbacks in app/(game)/index.tsx:
  Pass onHaptic, onPlaySound, onShare to GameDom component
  useKeepAwake() while game is active
  Lock landscape orientation during gameplay (catch errors for web)

STEP 7: Load fonts in app/_layout.tsx:
  Use useFonts from expo-font with Bungee and Fredoka
  SplashScreen.preventAutoHideAsync() until fonts loaded

STEP 8: Update app.json plugins:
  Add expo-screen-orientation, expo-notifications

STEP 9: In the game DOM component bridge, call native haptics on:
  - Boost activation
  - Kill an enemy
  - Collect coin
  - Death

Verify:
  bun run build && bunx expo export --platform web`}
        </Task>
        <Task
          id="review3"
          agent={reviewer}
          resultSchema={reviewResult}
        >
{`Review Phase 3: Native features for worm-world at ${PROJECT_DIR}.

CHECK:
1. src/expo/haptics.ts — platform-guarded haptic functions
2. src/expo/audio.ts — expo-av sound pool
3. src/expo/notifications.ts — local notification helpers
4. src/expo/share.ts — share score/invite
5. app/(game)/index.tsx — passes native callbacks, useKeepAwake, orientation lock
6. app/_layout.tsx — font loading with SplashScreen
7. app.json — plugins array includes expo-screen-orientation, expo-notifications
8. All expo API calls wrapped in try/catch for web compatibility

RUN:
  cd ${PROJECT_DIR}
  bun run build 2>&1 | tail -5
  bunx expo export --platform web 2>&1 | tail -10
  timeout 15 bunx expo start --no-dev 2>&1 | tail -20 || true

Return { approved, issues, summary }.`}
        </Task>
      </Ralph>

      {/* ═══════════════════════════════════════════
          PHASE 4: Navigation Polish + Design System
          ═══════════════════════════════════════════ */}
      <Ralph maxIterations={3} onMaxReached="return-last">
        <Task
          id="impl4"
          agent={coder}
          retries={2}
          resultSchema={implResult}
          cd={PROJECT_DIR}
        >
{`Expo migration Phase 4: Navigation polish, animations, design refinement.
${feedback(ctx, "review4")}

STEP 1: Polish NativeTabs:
  Add badges: "NEW" on Shop if new costumes available, dot badge on lobby if rooms exist
  State-variant icons (filled when selected, outline when not)

STEP 2: Stack headers for all tabs:
  headerTransparent: true, headerLargeTitle: true
  headerLargeTitleShadowVisible: false, headerBlurEffect: "none"
  contentStyle: { backgroundColor: colors.background }
  headerTintColor: colors.text

STEP 3: Staggered animations with react-native-reanimated:
  Shop: FadeInDown.delay(index * 50) on flag grid items
  Profile: FadeInUp on stat rows
  Lobby: FadeInDown on room list entries

STEP 4: Form sheet polish:
  All form sheets: contentStyle: { backgroundColor: "transparent" }
  sheetGrabberVisible: true
  Correct detent sizes for each sheet type

STEP 5: Bottom-zone layout:
  Interactive elements (stats, player card, balance) at bottom of screens
  Hero/branding at top
  Play button centered

STEP 6: Dark theme enforcement:
  ThemeProvider with DarkTheme from @react-navigation/native
  All cards use colors.surface, not white
  All text uses colors.text or colors.textSecondary

STEP 7: Style consistency sweep:
  Replace any TouchableOpacity -> Pressable
  Replace Platform.select shadows -> boxShadow strings
  Add borderCurve: 'continuous' to all rounded elements
  Add fontVariant: 'tabular-nums' to all numeric displays
  Haptic feedback on interactive elements

STEP 8: Hide tabs during active gameplay:
  When game is playing, hide the tab bar for full immersion
  Show tabs again on death/back to menu

Verify:
  bun run build && bunx expo export --platform web`}
        </Task>
        <Task
          id="review4"
          agent={reviewer}
          resultSchema={reviewResult}
        >
{`Review Phase 4: Navigation polish for worm-world at ${PROJECT_DIR}.

CHECK:
1. NativeTabs has badges and state-variant icons
2. All Stack layouts use transparent headers + headerLargeTitle
3. Staggered animations with react-native-reanimated in shop, profile, lobby
4. All form sheets have transparent contentStyle + grabber
5. ThemeProvider with DarkTheme wraps app
6. Zero TouchableOpacity in codebase (use Pressable)
7. Zero Platform.select shadows (use boxShadow strings)
8. borderCurve: 'continuous' on all rounded elements
9. fontVariant: 'tabular-nums' on all numbers
10. Tab bar hidden during gameplay

RUN:
  cd ${PROJECT_DIR}
  grep -r "TouchableOpacity" app/ src/expo/ --include="*.tsx" | head -5
  grep -r "Platform.select" app/ src/expo/ --include="*.tsx" | head -5
  bun run build 2>&1 | tail -5
  bunx expo export --platform web 2>&1 | tail -10
  timeout 15 bunx expo start --no-dev 2>&1 | tail -20 || true

Return { approved, issues, summary }.`}
        </Task>
      </Ralph>

      {/* ═══════════════════════════════════════════
          PHASE 5: App Assets + EAS + Full Verification
          ═══════════════════════════════════════════ */}
      <Ralph maxIterations={3} onMaxReached="return-last">
        <Task
          id="impl5"
          agent={coder}
          retries={2}
          resultSchema={implResult}
          cd={PROJECT_DIR}
        >
{`Expo migration Phase 5: App assets, EAS config, full build verification.
${feedback(ctx, "review5")}

STEP 1: App icon:
  Create assets/icon.png (1024x1024) — a simple worm icon
  Use ImageMagick to generate: green circle with cartoon worm eyes
  Set in app.json: icon, splash.image, adaptiveIcon

STEP 2: Splash screen:
  Create assets/splash.png (1284x2778)
  Configure expo-splash-screen in app.json
  Use SplashScreen.preventAutoHideAsync() + hideAsync() after fonts load

STEP 3: Create eas.json:
  {
    "cli": { "version": ">= 13.0.0" },
    "build": {
      "development": { "developmentClient": true, "distribution": "internal" },
      "preview": { "distribution": "internal" },
      "production": {}
    }
  }

STEP 4: Create .env.example:
  EXPO_PUBLIC_SPACETIMEDB_URI=wss://maincloud.spacetimedb.com
  EXPO_PUBLIC_SPACETIMEDB_DB=worm-world-server

STEP 5: Deep linking:
  Handle wormworld://room/{slug} in app/(lobby)/index.tsx
  Use expo-linking to parse incoming URLs
  Auto-join room when deep link received

STEP 6: Update .gitignore:
  Add: .expo/, ios/, android/, *.jks, *.keystore

STEP 7: Create app/(game)/edit-username.tsx:
  FormSheet for editing player name (sheetAllowedDetents [0.35])

STEP 8: FULL VERIFICATION — ALL must pass:
  1. bunx tsc --noEmit 2>&1 | head -20
  2. bun run build 2>&1 | tail -5 (Vite web build)
  3. bunx expo export --platform web 2>&1 | tail -10 (Expo web)
  4. timeout 15 bunx expo start --no-dev 2>&1 | tail -20 || true (app starts)
  5. bunx expo-doctor 2>&1 | tail -10 (dependency check)

If any fail, fix them before completing.`}
        </Task>
        <Task
          id="review5"
          agent={reviewer}
          resultSchema={reviewResult}
        >
{`Final review of Expo migration for worm-world at ${PROJECT_DIR}.

CHECK all files:
1. assets/icon.png exists (1024x1024)
2. assets/splash.png exists
3. eas.json with 3 build profiles
4. .env.example with EXPO_PUBLIC vars
5. .gitignore includes .expo/, ios/, android/
6. app/(game)/edit-username.tsx — formSheet
7. Deep linking handler in lobby

RUN ALL verification commands:
  cd ${PROJECT_DIR}
  bunx tsc --noEmit 2>&1 | head -20
  bun run build 2>&1 | tail -5
  bunx expo export --platform web 2>&1 | tail -10
  timeout 15 bunx expo start --no-dev 2>&1 | tail -20 || true
  bunx expo-doctor 2>&1 | tail -10

Check that original Vite web build still produces output.
Check that Expo web export succeeds.
Check that Expo dev server starts without crash.

Return { approved, issues, summary }.`}
        </Task>
      </Ralph>

    </Sequence>
  </Workflow>
));
