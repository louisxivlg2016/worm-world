import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import obfuscatorPlugin from "vite-plugin-javascript-obfuscator"
import { execSync } from "child_process"

const commitHash = (() => {
  try { return execSync('git rev-parse --short HEAD').toString().trim() }
  catch { return 'dev' }
})()

export default defineConfig(({ mode }) => {
  const obfuscate = mode !== 'development' && mode !== 'production' && mode !== 'crazygames'
  const base = (mode !== 'development' && mode !== 'production') ? './' : '/'

  return {
    base,
    plugins: [
      react({ babel: { plugins: [["babel-plugin-react-compiler"]] } }),
      ...(obfuscate ? [obfuscatorPlugin({
        apply: "build",
        include: ['src/**'],
        exclude: ['src/platform/providers/crazygames/**'],
        options: {
          compact: true, controlFlowFlattening: true, controlFlowFlatteningThreshold: 0.5,
          deadCodeInjection: true, deadCodeInjectionThreshold: 0.2,
          identifierNamesGenerator: "hexadecimal", renameGlobals: false,
          stringArray: true, stringArrayEncoding: ["base64"], stringArrayThreshold: 0.5,
          reservedNames: ['CrazyGames', 'CrazySDK', 'PokiSDK'],
        },
      })] : []),
    ],
    define: { __BUILD_HASH__: JSON.stringify(commitHash) },
    publicDir: "public",
    resolve: { alias: { "@": "/src" } },
  }
})
