import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { getDefaultConfig } = require("expo/metro-config");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = getDefaultConfig(__dirname);
config.resolver.alias = { "@": path.resolve(__dirname, "src") };

export default config;
