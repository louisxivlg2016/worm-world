import { useState, lazy, Suspense } from "react";
import { View, Text, Pressable, Alert, ScrollView, Image, StyleSheet, useWindowDimensions, TouchableOpacity, Platform } from "react-native";

const MiniWormGame = Platform.OS === "web" ? require("@/components/MiniWormGame").default : () => null;
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, spacing } from "@/expo/theme";
import { getStorage } from "@/services/StorageService";
import { FLAG_IMAGES } from "@/assets/flags";

const allLanguages: Record<string, { name: string; flag: string }> = {
  fr: { name: "Français", flag: "🇫🇷" },
  en: { name: "English", flag: "🇬🇧" },
  es: { name: "Español", flag: "🇪🇸" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  it: { name: "Italiano", flag: "🇮🇹" },
  pt: { name: "Português", flag: "🇵🇹" },
  nl: { name: "Nederlands", flag: "🇳🇱" },
  pl: { name: "Polski", flag: "🇵🇱" },
  ru: { name: "Русский", flag: "🇷🇺" },
  uk: { name: "Українська", flag: "🇺🇦" },
  tr: { name: "Türkçe", flag: "🇹🇷" },
  sv: { name: "Svenska", flag: "🇸🇪" },
  no: { name: "Norsk", flag: "🇳🇴" },
  da: { name: "Dansk", flag: "🇩🇰" },
  fi: { name: "Suomi", flag: "🇫🇮" },
  cs: { name: "Čeština", flag: "🇨🇿" },
  ro: { name: "Română", flag: "🇷🇴" },
  hu: { name: "Magyar", flag: "🇭🇺" },
  el: { name: "Ελληνικά", flag: "🇬🇷" },
  bg: { name: "Български", flag: "🇧🇬" },
  sk: { name: "Slovenčina", flag: "🇸🇰" },
  hr: { name: "Hrvatski", flag: "🇭🇷" },
  sr: { name: "Српски", flag: "🇷🇸" },
  sl: { name: "Slovenščina", flag: "🇸🇮" },
  lt: { name: "Lietuvių", flag: "🇱🇹" },
  lv: { name: "Latviešu", flag: "🇱🇻" },
  et: { name: "Eesti", flag: "🇪🇪" },
  zh: { name: "中文", flag: "🇨🇳" },
  ja: { name: "日本語", flag: "🇯🇵" },
  ko: { name: "한국어", flag: "🇰🇷" },
  vi: { name: "Tiếng Việt", flag: "🇻🇳" },
  th: { name: "ไทย", flag: "🇹🇭" },
  id: { name: "Bahasa Indonesia", flag: "🇮🇩" },
  ms: { name: "Bahasa Melayu", flag: "🇲🇾" },
  tl: { name: "Filipino", flag: "🇵🇭" },
  my: { name: "မြန်မာ", flag: "🇲🇲" },
  km: { name: "ខ្មែរ", flag: "🇰🇭" },
  ar: { name: "العربية", flag: "🇸🇦" },
  fa: { name: "فارسی", flag: "🇮🇷" },
  he: { name: "עברית", flag: "🇮🇱" },
  ur: { name: "اردو", flag: "🇵🇰" },
  hi: { name: "हिन्दी", flag: "🇮🇳" },
  bn: { name: "বাংলা", flag: "🇧🇩" },
  pa: { name: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  ta: { name: "தமிழ்", flag: "🇱🇰" },
  te: { name: "తెలుగు", flag: "🇮🇳" },
  mr: { name: "मराठी", flag: "🇮🇳" },
  gu: { name: "ગુજરાતી", flag: "🇮🇳" },
  ml: { name: "മലയാളം", flag: "🇮🇳" },
  kn: { name: "ಕನ್ನಡ", flag: "🇮🇳" },
  ne: { name: "नेपाली", flag: "🇳🇵" },
  si: { name: "සිංහල", flag: "🇱🇰" },
  sw: { name: "Kiswahili", flag: "🇰🇪" },
  am: { name: "አማርኛ", flag: "🇪🇹" },
  ha: { name: "Hausa", flag: "🇳🇬" },
  yo: { name: "Yorùbá", flag: "🇳🇬" },
  zu: { name: "Zulu", flag: "🇿🇦" },
  af: { name: "Afrikaans", flag: "🇿🇦" },
  xh: { name: "isiXhosa", flag: "🇿🇦" },
  st: { name: "Sesotho", flag: "🇱🇸" },
  tn: { name: "Setswana", flag: "🇧🇼" },
  sn: { name: "ChiShona", flag: "🇿🇼" },
  ny: { name: "Chichewa", flag: "🇲🇼" },
  rw: { name: "Kinyarwanda", flag: "🇷🇼" },
  mg: { name: "Malagasy", flag: "🇲🇬" },
  so: { name: "Soomaali", flag: "🇸🇴" },
  ig: { name: "Igbo", flag: "🇳🇬" },
  om: { name: "Afaan Oromoo", flag: "🇪🇹" },
  ti: { name: "ትግርኛ", flag: "🇪🇷" },
  wo: { name: "Wolof", flag: "🇸🇳" },
  lg: { name: "Luganda", flag: "🇺🇬" },
  ak: { name: "Akan", flag: "🇬🇭" },
  ff: { name: "Fulfulde", flag: "🇸🇳" },
  ee: { name: "Eʋegbe", flag: "🇹🇬" },
  bm: { name: "Bamanankan", flag: "🇲🇱" },
  kg: { name: "Kikongo", flag: "🇨🇩" },
  ln: { name: "Lingála", flag: "🇨🇩" },
  ca: { name: "Català", flag: "🏴" },
  eu: { name: "Euskara", flag: "🏴" },
  gl: { name: "Galego", flag: "🏴" },
  cy: { name: "Cymraeg", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  ga: { name: "Gaeilge", flag: "🇮🇪" },
  gd: { name: "Gàidhlig", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  is: { name: "Íslenska", flag: "🇮🇸" },
  fo: { name: "Føroyskt", flag: "🇫🇴" },
  mk: { name: "Македонски", flag: "🇲🇰" },
  sq: { name: "Shqip", flag: "🇦🇱" },
  be: { name: "Беларуская", flag: "🇧🇾" },
  hy: { name: "Հայերեն", flag: "🇦🇲" },
  ka: { name: "ქართული", flag: "🇬🇪" },
  az: { name: "Azərbaycanca", flag: "🇦🇿" },
  kk: { name: "Қазақша", flag: "🇰🇿" },
  uz: { name: "Oʻzbekcha", flag: "🇺🇿" },
  ky: { name: "Кыргызча", flag: "🇰🇬" },
  tg: { name: "Тоҷикӣ", flag: "🇹🇯" },
  tk: { name: "Türkmençe", flag: "🇹🇲" },
  mn: { name: "Монгол", flag: "🇲🇳" },
  bo: { name: "བོད་ཡིག", flag: "🇨🇳" },
  dz: { name: "རྫོང་ཁ", flag: "🇧🇹" },
  lo: { name: "ລາວ", flag: "🇱🇦" },
  ku: { name: "Kurdî", flag: "🇮🇶" },
  ps: { name: "پښتو", flag: "🇦🇫" },
  ug: { name: "ئۇيغۇرچە", flag: "🇨🇳" },
  sd: { name: "سنڌي", flag: "🇵🇰" },
  as: { name: "অসমীয়া", flag: "🇮🇳" },
  or: { name: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  jv: { name: "Basa Jawa", flag: "🇮🇩" },
  su: { name: "Basa Sunda", flag: "🇮🇩" },
  ceb: { name: "Cebuano", flag: "🇵🇭" },
  hil: { name: "Ilonggo", flag: "🇵🇭" },
  mt: { name: "Malti", flag: "🇲🇹" },
  lb: { name: "Lëtzebuergesch", flag: "🇱🇺" },
  rm: { name: "Rumantsch", flag: "🇨🇭" },
  oc: { name: "Occitan", flag: "🏴" },
  co: { name: "Corsu", flag: "🏴" },
  fy: { name: "Frysk", flag: "🇳🇱" },
  br: { name: "Brezhoneg", flag: "🏴" },
  mi: { name: "Māori", flag: "🇳🇿" },
  haw: { name: "ʻŌlelo Hawaiʻi", flag: "🇺🇸" },
  sm: { name: "Gagana Samoa", flag: "🇼🇸" },
  to: { name: "Lea Faka-Tonga", flag: "🇹🇴" },
  fj: { name: "Na Vosa Vakaviti", flag: "🇫🇯" },
  qu: { name: "Runa Simi", flag: "🇵🇪" },
  ay: { name: "Aymar aru", flag: "🇧🇴" },
  gn: { name: "Avañeʼẽ", flag: "🇵🇾" },
  ht: { name: "Kreyòl Ayisyen", flag: "🇭🇹" },
  yi: { name: "ייִדיש", flag: "🇮🇱" },
  la: { name: "Latina", flag: "🇻🇦" },
  eo: { name: "Esperanto", flag: "🌐" },
  ia: { name: "Interlingua", flag: "🌐" },
  ie: { name: "Interlingue", flag: "🌐" },
  ks: { name: "کٲشُر", flag: "🇮🇳" },
  mai: { name: "मैथिली", flag: "🇮🇳" },
  bho: { name: "भोजपुरी", flag: "🇮🇳" },
  awa: { name: "अवधी", flag: "🇮🇳" },
  sa: { name: "संस्कृतम्", flag: "🇮🇳" },
  mni: { name: "মৈতৈলোন্", flag: "🇮🇳" },
  kok: { name: "कोंकणी", flag: "🇮🇳" },
  dv: { name: "ދިވެހި", flag: "🇲🇻" },
  rn: { name: "Ikirundi", flag: "🇧🇮" },
  nso: { name: "Sesotho sa Leboa", flag: "🇿🇦" },
  ts: { name: "Xitsonga", flag: "🇿🇦" },
  ve: { name: "Tshivenda", flag: "🇿🇦" },
  ss: { name: "SiSwati", flag: "🇸🇿" },
};

// Flag color palettes (simplified, 2-3 colored stripes per language) — drawn with Views
const LANG_FLAGS: Record<string, { cols: string[]; orientation: "h" | "v" }> = {
  fr: { cols: ["#002395", "#FFFFFF", "#ED2939"], orientation: "v" },
  en: { cols: ["#012169", "#FFFFFF", "#C8102E"], orientation: "h" },
  es: { cols: ["#AA151B", "#F1BF00", "#AA151B"], orientation: "h" },
  de: { cols: ["#000000", "#DD0000", "#FFCC00"], orientation: "h" },
  it: { cols: ["#009246", "#FFFFFF", "#CE2B37"], orientation: "v" },
  pt: { cols: ["#006600", "#FF0000"], orientation: "v" },
  nl: { cols: ["#AE1C28", "#FFFFFF", "#21468B"], orientation: "h" },
  pl: { cols: ["#FFFFFF", "#DC143C"], orientation: "h" },
  ru: { cols: ["#FFFFFF", "#0039A6", "#D52B1E"], orientation: "h" },
  uk: { cols: ["#005BBB", "#FFD500"], orientation: "h" },
  tr: { cols: ["#E30A17", "#FFFFFF", "#E30A17"], orientation: "h" },
  sv: { cols: ["#006AA7", "#FECC00", "#006AA7"], orientation: "h" },
  no: { cols: ["#BA0C2F", "#FFFFFF", "#00205B"], orientation: "h" },
  da: { cols: ["#C8102E", "#FFFFFF"], orientation: "h" },
  fi: { cols: ["#FFFFFF", "#003580", "#FFFFFF"], orientation: "h" },
  cs: { cols: ["#FFFFFF", "#D7141A", "#11457E"], orientation: "h" },
  ro: { cols: ["#002B7F", "#FCD116", "#CE1126"], orientation: "v" },
  hu: { cols: ["#CE2939", "#FFFFFF", "#477050"], orientation: "h" },
  el: { cols: ["#0D5EAF", "#FFFFFF", "#0D5EAF"], orientation: "h" },
  bg: { cols: ["#FFFFFF", "#00966E", "#D62612"], orientation: "h" },
  sk: { cols: ["#FFFFFF", "#0B4EA2", "#EE1C25"], orientation: "h" },
  hr: { cols: ["#FF0000", "#FFFFFF", "#171796"], orientation: "h" },
  sr: { cols: ["#C6363C", "#0C4077", "#FFFFFF"], orientation: "h" },
  sl: { cols: ["#FFFFFF", "#005DA4", "#ED1C24"], orientation: "h" },
  lt: { cols: ["#FDB913", "#006A44", "#C1272D"], orientation: "h" },
  lv: { cols: ["#9E3039", "#FFFFFF", "#9E3039"], orientation: "h" },
  et: { cols: ["#0072CE", "#000000", "#FFFFFF"], orientation: "h" },
  zh: { cols: ["#EE1C25", "#FFDE00"], orientation: "v" },
  ja: { cols: ["#FFFFFF", "#BC002D", "#FFFFFF"], orientation: "v" },
  ko: { cols: ["#FFFFFF", "#CD2E3A", "#FFFFFF"], orientation: "v" },
  vi: { cols: ["#DA251D", "#FFFF00"], orientation: "v" },
  th: { cols: ["#A51931", "#F4F5F8", "#2D2A4A"], orientation: "h" },
  id: { cols: ["#FF0000", "#FFFFFF"], orientation: "h" },
  ms: { cols: ["#CC0001", "#FFFFFF", "#010066"], orientation: "h" },
  tl: { cols: ["#0038A8", "#FFFFFF", "#CE1126"], orientation: "h" },
  my: { cols: ["#FECB00", "#34B233", "#EA2839"], orientation: "h" },
  km: { cols: ["#032EA1", "#E00025", "#032EA1"], orientation: "h" },
  ar: { cols: ["#006C35", "#FFFFFF"], orientation: "h" },
  fa: { cols: ["#239F40", "#FFFFFF", "#DA0000"], orientation: "h" },
  he: { cols: ["#FFFFFF", "#0038B8", "#FFFFFF"], orientation: "h" },
  ur: { cols: ["#01411C", "#FFFFFF"], orientation: "v" },
  // Hindi = India (langue principale)
  hi: { cols: ["#FF9933", "#FFFFFF", "#138808"], orientation: "h" },
  // Bengali = West Bengal (Biswa Bangla blue/yellow)
  bn: { cols: ["#006A4E", "#F4A000"], orientation: "h" },
  // Punjabi = Punjab (saffron Nishan Sahib)
  pa: { cols: ["#FF6600", "#003893"], orientation: "h" },
  // Tamil = Tamil Nadu (red/black)
  ta: { cols: ["#CC0000", "#000000"], orientation: "h" },
  // Telugu = Andhra Pradesh (blue/gold)
  te: { cols: ["#0066CC", "#FFD700"], orientation: "h" },
  // Marathi = Maharashtra (saffron Bhagwa)
  mr: { cols: ["#FF6600", "#FF9933"], orientation: "h" },
  // Gujarati = Gujarat (red/white)
  gu: { cols: ["#B22234", "#FFFFFF"], orientation: "h" },
  // Malayalam = Kerala (red/white)
  ml: { cols: ["#CE1126", "#FFFFFF"], orientation: "h" },
  // Kannada = Karnataka (red/yellow)
  kn: { cols: ["#FFCC00", "#CC0000"], orientation: "h" },
  ne: { cols: ["#DC143C", "#003893"], orientation: "h" },
  si: { cols: ["#FFB700", "#8D153A", "#00534E"], orientation: "v" },
  sw: { cols: ["#000000", "#FF0000", "#00A651"], orientation: "h" },
  am: { cols: ["#078930", "#FCDD09", "#DA121A"], orientation: "h" },
  ha: { cols: ["#008751", "#FFFFFF", "#008751"], orientation: "v" },
  yo: { cols: ["#008751", "#FFFFFF", "#008751"], orientation: "v" },
  zu: { cols: ["#007749", "#FFFFFF", "#FFB612"], orientation: "h" },
  af: { cols: ["#007749", "#FFB612", "#DE3831"], orientation: "h" },
  xh: { cols: ["#007749", "#FFB612", "#DE3831"], orientation: "h" },
  st: { cols: ["#00209F", "#FFFFFF", "#009543"], orientation: "h" },
  tn: { cols: ["#6DA9D2", "#000000", "#FFFFFF"], orientation: "h" },
  sn: { cols: ["#006B3F", "#FCE300", "#CE1126"], orientation: "h" },
  ny: { cols: ["#000000", "#CE1126", "#00A651"], orientation: "h" },
  rw: { cols: ["#00A1DE", "#E5BE01", "#20603D"], orientation: "h" },
  mg: { cols: ["#FFFFFF", "#FC3D32", "#007E3A"], orientation: "v" },
  so: { cols: ["#4189DD", "#FFFFFF"], orientation: "h" },
  ig: { cols: ["#008751", "#FFFFFF", "#008751"], orientation: "v" },
  om: { cols: ["#078930", "#FCDD09", "#DA121A"], orientation: "h" },
  ti: { cols: ["#EE1C25", "#0084C9", "#FFC72C"], orientation: "h" },
  wo: { cols: ["#00853F", "#FDEF42", "#E31B23"], orientation: "v" },
  lg: { cols: ["#000000", "#FCDC04", "#D90000"], orientation: "h" },
  ak: { cols: ["#CE1126", "#FCD116", "#006B3F"], orientation: "h" },
  ff: { cols: ["#00853F", "#FDEF42", "#E31B23"], orientation: "v" },
  ee: { cols: ["#008751", "#FFFFFF", "#FFCE00"], orientation: "h" },
  bm: { cols: ["#14B53A", "#FCD116", "#CE1126"], orientation: "v" },
  kg: { cols: ["#007FFF", "#F7D618", "#CE1021"], orientation: "h" },
  ln: { cols: ["#007FFF", "#F7D618", "#CE1021"], orientation: "h" },
  ca: { cols: ["#FCDD09", "#DA121A", "#FCDD09", "#DA121A", "#FCDD09"], orientation: "h" },
  eu: { cols: ["#C8102E", "#009639", "#FFFFFF"], orientation: "h" },
  gl: { cols: ["#FFFFFF", "#0066CC", "#FFFFFF"], orientation: "h" },
  cy: { cols: ["#FFFFFF", "#00AB39", "#FFFFFF"], orientation: "h" },
  ga: { cols: ["#169B62", "#FFFFFF", "#FF883E"], orientation: "v" },
  gd: { cols: ["#005EB8", "#FFFFFF", "#005EB8"], orientation: "h" },
  is: { cols: ["#02529C", "#FFFFFF", "#DC1E35"], orientation: "h" },
  fo: { cols: ["#FFFFFF", "#D72828", "#0065BD"], orientation: "h" },
  mk: { cols: ["#D20000", "#FFE600"], orientation: "h" },
  sq: { cols: ["#FF0000", "#000000"], orientation: "h" },
  be: { cols: ["#CE1720", "#007C30", "#FFFFFF"], orientation: "h" },
  hy: { cols: ["#D90012", "#0033A0", "#F2A800"], orientation: "h" },
  ka: { cols: ["#FFFFFF", "#FF0000"], orientation: "h" },
  az: { cols: ["#00B5E2", "#EF3340", "#509E2F"], orientation: "h" },
  kk: { cols: ["#00AFCA", "#FFE600"], orientation: "h" },
  uz: { cols: ["#1EB53A", "#FFFFFF", "#0099B5"], orientation: "h" },
  ky: { cols: ["#E8112D", "#FFEF00"], orientation: "h" },
  tg: { cols: ["#CC0000", "#FFFFFF", "#006600"], orientation: "h" },
  tk: { cols: ["#00843D", "#CE1126"], orientation: "v" },
  mn: { cols: ["#C4272F", "#015197", "#C4272F"], orientation: "v" },
  bo: { cols: ["#FFCC00", "#D20000", "#005EB8"], orientation: "h" },
  dz: { cols: ["#FFCD00", "#FF4E12"], orientation: "h" },
  lo: { cols: ["#CE1126", "#002868", "#CE1126"], orientation: "h" },
  ku: { cols: ["#ED2024", "#FFFFFF", "#278E43"], orientation: "h" },
  ps: { cols: ["#000000", "#D32011", "#007A36"], orientation: "v" },
  ug: { cols: ["#00A5DF", "#FFFFFF"], orientation: "v" },
  sd: { cols: ["#01411C", "#FFFFFF"], orientation: "v" },
  as: { cols: ["#FF9933", "#FFFFFF", "#138808"], orientation: "h" },
  or: { cols: ["#FF9933", "#FFFFFF", "#138808"], orientation: "h" },
  jv: { cols: ["#FF0000", "#FFFFFF"], orientation: "h" },
  su: { cols: ["#FF0000", "#FFFFFF"], orientation: "h" },
  ceb: { cols: ["#0038A8", "#FFFFFF", "#CE1126"], orientation: "h" },
  hil: { cols: ["#0038A8", "#FFFFFF", "#CE1126"], orientation: "h" },
  mt: { cols: ["#FFFFFF", "#CE1126"], orientation: "v" },
  lb: { cols: ["#ED2939", "#FFFFFF", "#00A1DE"], orientation: "h" },
  rm: { cols: ["#FF0000", "#FFFFFF"], orientation: "h" },
  oc: { cols: ["#FCDD09", "#DA121A"], orientation: "h" },
  co: { cols: ["#FFFFFF", "#000000"], orientation: "h" },
  fy: { cols: ["#00A0E1", "#FFFFFF", "#EF2B2D"], orientation: "h" },
  br: { cols: ["#000000", "#FFFFFF", "#000000"], orientation: "h" },
  mi: { cols: ["#CC142B", "#000000", "#FFFFFF"], orientation: "h" },
  haw: { cols: ["#B22234", "#FFFFFF", "#002868"], orientation: "h" },
  sm: { cols: ["#002B7F", "#FFFFFF", "#CE1126"], orientation: "h" },
  to: { cols: ["#C10000", "#FFFFFF"], orientation: "h" },
  fj: { cols: ["#68BFE5", "#FFFFFF", "#CF142B"], orientation: "h" },
  qu: { cols: ["#FF0000", "#FFFFFF", "#0000FF"], orientation: "h" },
  ay: { cols: ["#009639", "#FFFFFF", "#D72828"], orientation: "h" },
  gn: { cols: ["#D52B1E", "#FFFFFF", "#0038A8"], orientation: "h" },
  ht: { cols: ["#00209F", "#D21034"], orientation: "h" },
  yi: { cols: ["#FFFFFF", "#0038B8", "#FFFFFF"], orientation: "h" },
  la: { cols: ["#FFDD00", "#FFFFFF"], orientation: "v" },
  eo: { cols: ["#FFFFFF", "#009900"], orientation: "h" },
  ia: { cols: ["#003399", "#FFFFFF"], orientation: "h" },
  ie: { cols: ["#003399", "#FFFFFF"], orientation: "h" },
  ks: { cols: ["#FF9933", "#FFFFFF", "#138808"], orientation: "h" },
  mai: { cols: ["#FF9933", "#FFFFFF", "#138808"], orientation: "h" },
  bho: { cols: ["#FF9933", "#FFFFFF", "#138808"], orientation: "h" },
  awa: { cols: ["#FF9933", "#FFFFFF", "#138808"], orientation: "h" },
  sa: { cols: ["#FF9933", "#FFFFFF", "#138808"], orientation: "h" },
  mni: { cols: ["#FF9933", "#FFFFFF", "#138808"], orientation: "h" },
  kok: { cols: ["#FF9933", "#FFFFFF", "#138808"], orientation: "h" },
  dv: { cols: ["#D21034", "#007E3A", "#FFFFFF"], orientation: "h" },
  rn: { cols: ["#00A1DE", "#FFFFFF", "#CE1126"], orientation: "h" },
  nso: { cols: ["#007749", "#FFB612", "#DE3831"], orientation: "h" },
  ts: { cols: ["#007749", "#FFB612", "#DE3831"], orientation: "h" },
  ve: { cols: ["#007749", "#FFB612", "#DE3831"], orientation: "h" },
  ss: { cols: ["#3E5EB9", "#FFD200", "#B10C0C"], orientation: "h" },
};

// Map language code → country name in FLAG_IMAGES (uses same flags as shop)
const LANG_TO_COUNTRY: Record<string, string> = {
  fr: "France", en: "Royaume-Uni", es: "Espagne", de: "Allemagne", it: "Italie",
  pt: "Portugal", nl: "Pays-Bas", pl: "Pologne", ru: "Russie", uk: "Ukraine",
  tr: "Turquie", sv: "Suede", no: "Norvege", da: "Danemark", fi: "Finlande",
  cs: "Tchequie", ro: "Roumanie", hu: "Hongrie", el: "Grece", bg: "Bulgarie",
  sk: "Slovaquie", hr: "Croatie", sr: "Serbie", sl: "Slovenie",
  lt: "Lituanie", lv: "Lettonie", et: "Estonie", zh: "Chine", ja: "Japon",
  ko: "Coree du Sud", vi: "Vietnam", th: "Thailande", id: "Indonesie",
  ms: "Malaisie", tl: "Philippines", my: "Myanmar", km: "Cambodge",
  ar: "Arabie Saoudite", fa: "Iran", he: "Israel", ur: "Pakistan", hi: "Inde",
  bn: "Bangladesh", ne: "Nepal", si: "Sri Lanka",
  sw: "Kenya", am: "Ethiopie", ha: "Nigeria", yo: "Nigeria", ig: "Nigeria",
  zu: "Afrique du Sud", af: "Afrique du Sud", xh: "Afrique du Sud",
  so: "Somalie", mg: "Madagascar", rw: "Rwanda", sn: "Zimbabwe", ny: "Malawi",
  wo: "Senegal", lg: "Ouganda", ak: "Ghana", om: "Ethiopie", ti: "Erythree",
  ga: "Irlande", is: "Islande", mt: "Malte", sq: "Albanie",
  mk: "Macedoine du Nord", be: "Bielorussie", hy: "Armenie", ka: "Georgie",
  az: "Azerbaidjan", kk: "Kazakhstan", uz: "Ouzbekistan", ky: "Kirghizistan",
  tg: "Tadjikistan", tk: "Turkmenistan", mn: "Mongolie", lo: "Laos",
  ps: "Afghanistan", st: "Lesotho", tn: "Botswana", ht: "Haiti",
  rn: "Burundi", dv: "Maldives", dz: "Bhoutan", lb: "Luxembourg",
  fj: "Fidji", sm: "Samoa", to: "Tonga", ff: "Senegal", ee: "Togo",
  bm: "Mali", kg: "Congo", ln: "Congo", nso: "Afrique du Sud",
  ts: "Afrique du Sud", ve: "Afrique du Sud", ss: "Eswatini",
  ku: "Irak", sd: "Pakistan", jv: "Indonesie", su: "Indonesie", ceb: "Philippines",
  hil: "Philippines", fo: "Danemark", fy: "Pays-Bas",
  bo: "Chine", ug: "Chine", pa: "Pakistan", as: "Inde", or: "Inde",
};

const LANG_FLAG_IMAGES: Record<string, any> = Object.fromEntries(
  Object.entries(LANG_TO_COUNTRY)
    .map(([code, country]) => [code, FLAG_IMAGES[country]])
    .filter(([, img]) => img),
);

// Preload all flag images on module load so they are cached in the browser
if (typeof window !== "undefined") {
  Object.values(LANG_FLAG_IMAGES).forEach((src: any) => {
    const uri = typeof src === "string" ? src : src?.uri || src?.default;
    if (uri && typeof uri === "string") {
      const preImg = new window.Image();
      preImg.src = uri;
    }
  });
  Object.values(FLAG_IMAGES).forEach((src: any) => {
    const uri = typeof src === "string" ? src : src?.uri || src?.default;
    if (uri && typeof uri === "string") {
      const preImg = new window.Image();
      preImg.src = uri;
    }
  });
}

const LangFlag = ({ code }: { code: string }) => {
  const img = LANG_FLAG_IMAGES[code];
  // Use colored-stripe fallback as placeholder background
  const flag = LANG_FLAGS[code] || { cols: ["#444", "#555"], orientation: "h" as const };
  const isH = flag.orientation === "h";
  const placeholder = (
    <View style={{
      position: "absolute", top: 0, left: 0, width: 24, height: 16, borderRadius: 3, overflow: "hidden",
      flexDirection: isH ? "column" : "row",
    }}>
      {flag.cols.map((c, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: c }} />
      ))}
    </View>
  );
  if (img) {
    return (
      <View style={{ width: 24, height: 16, borderRadius: 3, overflow: "hidden", borderWidth: 1, borderColor: "rgba(0,0,0,0.3)" }}>
        {placeholder}
        <Image source={img} style={{ width: 24, height: 16 }} resizeMode="cover" />
      </View>
    );
  }
  return (
    <View style={{ width: 24, height: 16, borderRadius: 3, overflow: "hidden", borderWidth: 1, borderColor: "rgba(0,0,0,0.3)" }}>
      {placeholder}
    </View>
  );
};

// Food packs with their items
const FOOD_PACKS = [
  {
    id: "classic",
    name: "Classique",
    icon: "🍔",
    items: ["/food/burger.png", "/food/pizza.png", "/food/donut.png", "/food/hot-dog.png", "/food/muffin.png", "/food/sushi.png"],
    price: 2300,
  },
  {
    id: "fruits",
    name: "Fruits",
    icon: "🍓",
    items: ["/food/fraise.png", "/food/banane.png", "/food/pomme.png", "/food/gateau.png", "/food/susette.png", "/food/poulet.png"],
    free: true,
  },
  {
    id: "francaise",
    name: "Française",
    icon: "🥐",
    items: [
      "/food/baguette.png", "/food/borgignon.png", "/food/brie.png", "/food/camenbert.png",
      "/food/coq-au-vin.png", "/food/creme-brule.png", "/food/crepe.png", "/food/croissant.png",
      "/food/eclair.png", "/food/entrecote.png", "/food/escargo.png", "/food/flan.png",
      "/food/fruit-de-mer.png", "/food/gallete.png", "/food/macaran.png", "/food/mille-feuille.png",
      "/food/pain-au-chocolat.png", "/food/paris-brest.png", "/food/poulet-a-la-francaise.png",
      "/food/profitorelle.png", "/food/purre-de-pomme-de-terre.png", "/food/quiche-lorraine.png",
      "/food/raclette.png", "/food/ratatouille.png", "/food/saussison.png", "/food/soupe-au-pain.png",
      "/food/soupe-au-saussice.png", "/food/tartarre.png", "/food/tarte-au-abricot.png",
    ],
    price: 2300,
  },
  {
    id: "italienne",
    name: "Italienne",
    icon: "🍕",
    items: [
      "/food/pizza-margherita.png", "/food/alasagna-alla-bognese.png", "/food/amaretti.png",
      "/food/antipasto-misto.png", "/food/aracini.png", "/food/bombolone.png",
      "/food/boulette-de-viande.png", "/food/caponata-sicilienne.png", "/food/carpacio-di-manz.png",
      "/food/cornetto.png", "/food/cotoletta-alla-milanese.png", "/food/croissant-nutella.png",
      "/food/crostata.png", "/food/fromage-bleu.png", "/food/gelato.png", "/food/osso-buco.png",
      "/food/paneton.png", "/food/panna-cotta.png", "/food/parmezan.png",
      "/food/pollo-ala-cacciatora.png", "/food/pollo-al-limone-.png", "/food/ribollita.png",
      "/food/risotto-ai-funghi.png", "/food/saltimbocca-alla-romana-.png", "/food/tiramisu.png",
      "/food/torta-della-nona.png", "/food/zuppa-inglese.png",
    ],
    price: 2300,
  },
  {
    id: "americaine",
    name: "Américaine",
    icon: "🍩",
    items: [
      "/food/americaine-donut.png", "/food/americaine-burger.png", "/food/americaine-hot-dog.png",
      "/food/americaine-steak.png", "/food/americaine-nugget.png", "/food/americaine-pankake.png",
      "/food/americaine-biscuit.png", "/food/americaine-chedar.png", "/food/americaine-crabe.png",
      "/food/americaine-crevette-frit.png", "/food/americaine-dessert.png", "/food/americaine-dessert-.png",
      "/food/americaine-donut-vide.png", "/food/americaine-gallete.png", "/food/americaine-glace.png",
      "/food/americaine-sandhiwh.png", "/food/americaine-sandwhich.png", "/food/americaine-viande.png",
    ],
    price: 2300,
  },
  {
    id: "circles",
    name: "Cercles",
    icon: "●",
    items: [],
    free: true,
    isCircles: true,
  },
  {
    id: "emojis",
    name: "Emojis",
    icon: "😋",
    items: [],
    free: true,
    isEmojis: true,
  },
];

const CIRCLE_COLORS = ["#ff3366", "#00ccff", "#7cff00", "#ff6b35", "#ffd700", "#cc33ff", "#ff69b4", "#00ff88"];
const EMOJI_FOOD = ["🍖", "🍗", "🍕", "🍔", "🍩", "🍓", "🍌", "🍎", "🍣", "🌭", "🧁", "🍰"];

const BG_THEMES = [
  { id: "ocean", name: "Océan", colors: ["#1a5c8a", "#0e3a5c"] },
  { id: "forest", name: "Forêt", colors: ["#1a6b3a", "#0e3d22"] },
  { id: "sunset", name: "Coucher de soleil", colors: ["#8a3a1a", "#5c1e0e"] },
  { id: "purple", name: "Violet", colors: ["#5c1a8a", "#360e5c"] },
  { id: "night", name: "Nuit", colors: ["#1a1a3a", "#0a0a1e"] },
  { id: "red", name: "Rouge", colors: ["#8a1a1a", "#5c0e0e"] },
  { id: "pink", name: "Rose", colors: ["#8a1a6b", "#5c0e45"] },
  { id: "gold", name: "Or", colors: ["#8a7a1a", "#5c500e"] },
  { id: "cyan", name: "Cyan", colors: ["#1a8a8a", "#0e5c5c"] },
  { id: "grey", name: "Gris", colors: ["#4a4a4a", "#2a2a2a"] },
  { id: "lime", name: "Lime", colors: ["#4a8a1a", "#2e5c0e"] },
  { id: "black", name: "Noir", colors: ["#111111", "#000000"] },
];

const CELEBRATION_EMOJIS = [
  "😜", "😎", "🤩", "🥳", "😏", "💪", "🔥", "👑",
  "💀", "😈", "🤑", "🫡", "✌️", "👊", "🏆", "⭐",
  "💎", "🦁", "🐉", "🎯", "💥", "🌟", "😤", "🤯",
];

const CONTROL_STYLES = [
  { id: "mouse", icon: "🖱️" },
  { id: "buttons", icon: "🕹️" },
  { id: "joystick", icon: "🎮" },
  { id: "swipe", icon: "👆" },
];

const MAP_SIZES = [
  { id: "tiny", name: "Très petite", size: 80 },
  { id: "small", name: "Petite", size: 120 },
  { id: "medium", name: "Moyenne", size: 160 },
  { id: "large", name: "Grande", size: 200 },
  { id: "xlarge", name: "Très grande", size: 250 },
];

export default function SettingsPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 600;
  const [tab, setTab] = useState<"settings" | "food" | "bg" | "map" | "emoji" | "move" | "volume">("settings");
  const [currentLang, setCurrentLang] = useState(i18n.language?.split("-")[0] || "fr");
  const [playerCoins, setPlayerCoins] = useState(() => {
    try { return parseInt(getStorage().getItem("totalCoins") || "0", 10); } catch { return 0; }
  });
  const [ownedPacks, setOwnedPacks] = useState<string[]>(() => {
    try {
      const saved = getStorage().getItem("ownedFoodPacks");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [foodStyle, setFoodStyle] = useState(() => {
    try { return getStorage().getItem("foodStyle") || "classic"; } catch { return "classic"; }
  });
  const [bgColor, setBgColor] = useState(() => {
    try { return getStorage().getItem("gameBgColor") || "ocean"; } catch { return "ocean"; }
  });
  const [activeBg, setActiveBg] = useState(() => {
    try { return getStorage().getItem("gameBgColor") || "ocean"; } catch { return "ocean"; }
  });
  const [mapSize, setMapSize] = useState(() => {
    try { return getStorage().getItem("minimapSize") || "medium"; } catch { return "medium"; }
  });
  const [activeMapSize, setActiveMapSize] = useState(() => {
    try { return getStorage().getItem("minimapSize") || "medium"; } catch { return "medium"; }
  });
  const [celebrationEmoji, setCelebrationEmoji] = useState(() => {
    try { return getStorage().getItem("celebrationEmoji") || "😜"; } catch { return "😜"; }
  });
  const [activeEmoji, setActiveEmoji] = useState(() => {
    try { return getStorage().getItem("celebrationEmoji") || "😜"; } catch { return "😜"; }
  });
  const [controlStyle, setControlStyle] = useState(() => {
    try { return getStorage().getItem("controlStyle") || "mouse"; } catch { return "mouse"; }
  });
  const [activeControlStyle, setActiveControlStyle] = useState(() => {
    try { return getStorage().getItem("controlStyle") || "mouse"; } catch { return "mouse"; }
  });
  const [musicVolume, setMusicVolume] = useState(() => {
    try { return parseFloat(getStorage().getItem("musicVolume") || "0.35"); } catch { return 0.35; }
  });
  const [sfxVolume, setSfxVolume] = useState(() => {
    try { return parseFloat(getStorage().getItem("sfxVolume") || "0.6"); } catch { return 0.6; }
  });
  const [previewPack, setPreviewPack] = useState<string | null>(null);
  const [modalSize, setModalSize] = useState({ width: 0, height: 0 });
  const [playerSkin] = useState<{ colors: string[]; headType?: string; bodyTexture?: string }>(() => {
    try {
      const saved = getStorage().getItem("playerSkin");
      if (saved) return JSON.parse(saved);
      const custom = getStorage().getItem("customSkin");
      if (custom) return JSON.parse(custom);
    } catch {}
    return { colors: ["#4ade80", "#22c55e", "#16a34a", "#15803d"] };
  });

  // Positions for food items inside the dark blue content area
  const foodPositions = [
    { top: "28%", left: "20%" }, { top: "26%", left: "45%" }, { top: "30%", left: "68%" },
    { top: "45%", left: "25%" }, { top: "48%", left: "52%" }, { top: "42%", left: "75%" },
    { top: "60%", left: "18%" }, { top: "58%", left: "48%" }, { top: "62%", left: "70%" },
    { top: "35%", left: "35%" }, { top: "52%", left: "38%" }, { top: "68%", left: "55%" },
  ];

  const handleBuyPack = (packId: string) => {
    const pack = FOOD_PACKS.find(p => p.id === packId);
    if (!pack || !pack.price) return;
    if (ownedPacks.includes(packId)) return;
    if (playerCoins < pack.price) {
      if (typeof window !== "undefined") window.alert(t("notEnoughCoins"));
      else Alert.alert(t("notEnoughCoins"));
      return;
    }
    const newCoins = playerCoins - pack.price;
    const newOwned = [...ownedPacks, packId];
    setPlayerCoins(newCoins);
    setOwnedPacks(newOwned);
    try {
      getStorage().setItem("totalCoins", String(newCoins));
      getStorage().setItem("ownedFoodPacks", JSON.stringify(newOwned));
    } catch {}
    handleFoodStyle(packId);
  };

  const handleSelectBg = (themeId: string) => {
    setActiveBg(themeId);
    setBgColor(themeId);
    try { getStorage().setItem("gameBgColor", themeId); } catch {}
  };

  const handleFoodStyle = (packId: string) => {
    setFoodStyle(packId);
    // Map pack id to engine food style
    const styleMap: Record<string, string> = { classic: "images", fruits: "images", francaise: "images", italienne: "images", americaine: "images", circles: "circles", emojis: "emojis" };
    try {
      getStorage().setItem("foodStyle", styleMap[packId] || "images");
      getStorage().setItem("foodPack", packId);
    } catch {}
  };

  const handleChangeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLang(lang);
    try { getStorage().setItem("userLanguage", lang); } catch {}
  };

  const handleReset = () => {
    if (typeof window !== "undefined") {
      if (!window.confirm(t("resetConfirm"))) return;
      try {
        const storage = getStorage();
        storage.removeItem("playerStats");
        storage.removeItem("totalCoins");
        storage.removeItem("currentSkin");
        storage.removeItem("customSkin");
        storage.removeItem("playerSkin");
      } catch {}
      router.back();
      return;
    }
    Alert.alert(t("resetData"), t("resetConfirm"), [
      { text: t("cancel"), style: "cancel" },
      { text: t("confirm"), style: "destructive", onPress: () => {
        try {
          const storage = getStorage();
          storage.removeItem("playerStats");
          storage.removeItem("totalCoins");
          storage.removeItem("currentSkin");
          storage.removeItem("customSkin");
          storage.removeItem("playerSkin");
        } catch {}
        router.back();
      }},
    ]);
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(game)" as any);
  };

  const selectedPack = FOOD_PACKS.find((p) => p.id === foodStyle) || FOOD_PACKS[0];

  return (
    <View style={{ flex: 1, height: "100%" as any, backgroundColor: colors.background }}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => setTab("settings")}
          style={[styles.tab, tab === "settings" && styles.tabActive]}
        >
          <Text style={{ fontSize: 22 }}>⚙️</Text>
          <Text style={[styles.tabText, tab === "settings" && styles.tabTextActive]}>{t("settings")}</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("food")}
          style={[styles.tab, tab === "food" && styles.tabActive]}
        >
          <Text style={{ fontSize: 22 }}>🍕</Text>
          <Text style={[styles.tabText, tab === "food" && styles.tabTextActive]}>{t("tabFood")}</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("bg")}
          style={[styles.tab, tab === "bg" && styles.tabActive]}
        >
          <Text style={{ fontSize: 22 }}>🎨</Text>
          <Text style={[styles.tabText, tab === "bg" && styles.tabTextActive]}>{t("tabBg")}</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("map")}
          style={[styles.tab, tab === "map" && styles.tabActive]}
        >
          <Text style={{ fontSize: 22 }}>🗺️</Text>
          <Text style={[styles.tabText, tab === "map" && styles.tabTextActive]}>{t("tabMap")}</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("emoji")}
          style={[styles.tab, tab === "emoji" && styles.tabActive]}
        >
          <Text style={{ fontSize: 22 }}>💬</Text>
          <Text style={[styles.tabText, tab === "emoji" && styles.tabTextActive]}>{t("tabEmoji")}</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("move")}
          style={[styles.tab, tab === "move" && styles.tabActive]}
        >
          <Text style={{ fontSize: 22 }}>🕹️</Text>
          <Text style={[styles.tabText, tab === "move" && styles.tabTextActive]}>{t("tabMove")}</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("volume")}
          style={[styles.tab, tab === "volume" && styles.tabActive]}
        >
          <Text style={{ fontSize: 22 }}>🔊</Text>
          <Text style={[styles.tabText, tab === "volume" && styles.tabTextActive]}>{t("tabVolume")}</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        {tab === "settings" && (
          <Pressable onPress={goBack}>
            <Image source={require("../assets/close-red-btn.png")} style={{ width: 50, height: 50 }} />
          </Pressable>
        )}
      </View>

      {tab === "volume" ? (
        /* Volume tab */
        <View style={{ flex: 1, backgroundColor: "#5876bc" }}>
          <View style={foodStyles.header}>
            <Text style={foodStyles.titleText}>{t("headerVolume")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <Pressable onPress={() => setTab("settings")} style={{ marginLeft: 4 }}>
                <Image source={require("../assets/close-red-btn.png")} style={{ width: 56, height: 56 }} />
              </Pressable>
            </View>
          </View>

          <View style={{ flex: 1, padding: 32, alignItems: "center", justifyContent: "center" }}>
            <View style={foodStyles.modalCard}>
              <View style={foodStyles.modalTop} />
              <ScrollView style={foodStyles.modalContent} contentContainerStyle={{ alignItems: "center", padding: 20, gap: 16 }}>
                {/* Music section */}
                <View style={{ alignItems: "center", width: "100%" }}>
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800", marginBottom: 4 }}>
                    🎵 {t("musicVolume")}
                  </Text>
                  <Text style={{ fontSize: 40, marginBottom: 6 }}>
                    {musicVolume === 0 ? "🔇" : musicVolume < 0.3 ? "🔈" : musicVolume < 0.7 ? "🔉" : "🔊"}
                  </Text>
                  <Text style={{ color: "#ffd700", fontSize: 22, fontWeight: "900", marginBottom: 10 }}>
                    {Math.round(musicVolume * 100)}%
                  </Text>
                  <View style={{ width: "90%", maxWidth: 380, flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Pressable onPress={() => {
                      const v = Math.max(0, Math.round((musicVolume - 0.1) * 10) / 10);
                      setMusicVolume(v);
                      try { getStorage().setItem("musicVolume", String(v)); } catch {}
                    }}>
                      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900" }}>−</Text>
                      </View>
                    </Pressable>
                    <View style={{ flex: 1, height: 10, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 5, overflow: "hidden" }}>
                      <View style={{ width: `${musicVolume * 100}%` as any, height: "100%", backgroundColor: "#ffd700", borderRadius: 5 }} />
                    </View>
                    <Pressable onPress={() => {
                      const v = Math.min(1, Math.round((musicVolume + 0.1) * 10) / 10);
                      setMusicVolume(v);
                      try { getStorage().setItem("musicVolume", String(v)); } catch {}
                    }}>
                      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900" }}>+</Text>
                      </View>
                    </Pressable>
                  </View>
                </View>

                {/* Separator */}
                <View style={{ width: "80%", height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: 4 }} />

                {/* SFX section */}
                <View style={{ alignItems: "center", width: "100%" }}>
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800", marginBottom: 4 }}>
                    💥 {t("sfxVolume")}
                  </Text>
                  <Text style={{ fontSize: 40, marginBottom: 6 }}>
                    {sfxVolume === 0 ? "🔇" : sfxVolume < 0.3 ? "🔈" : sfxVolume < 0.7 ? "🔉" : "🔊"}
                  </Text>
                  <Text style={{ color: "#4ade80", fontSize: 22, fontWeight: "900", marginBottom: 10 }}>
                    {Math.round(sfxVolume * 100)}%
                  </Text>
                  <View style={{ width: "90%", maxWidth: 380, flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Pressable onPress={() => {
                      const v = Math.max(0, Math.round((sfxVolume - 0.1) * 10) / 10);
                      setSfxVolume(v);
                      try { getStorage().setItem("sfxVolume", String(v)); } catch {}
                    }}>
                      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900" }}>−</Text>
                      </View>
                    </Pressable>
                    <View style={{ flex: 1, height: 10, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 5, overflow: "hidden" }}>
                      <View style={{ width: `${sfxVolume * 100}%` as any, height: "100%", backgroundColor: "#4ade80", borderRadius: 5 }} />
                    </View>
                    <Pressable onPress={() => {
                      const v = Math.min(1, Math.round((sfxVolume + 0.1) * 10) / 10);
                      setSfxVolume(v);
                      try { getStorage().setItem("sfxVolume", String(v)); } catch {}
                    }}>
                      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900" }}>+</Text>
                      </View>
                    </Pressable>
                  </View>
                  {/* Test button */}
                  <Pressable onPress={() => {
                    try {
                      const ctx = (window as any).__audioCtx;
                      const buffer = (window as any).__coinBuffer;
                      if (ctx && buffer) {
                        if (ctx.state === "suspended") ctx.resume();
                        const source = ctx.createBufferSource();
                        source.buffer = buffer;
                        const gain = ctx.createGain();
                        gain.gain.value = sfxVolume;
                        source.connect(gain).connect(ctx.destination);
                        source.start(0);
                      }
                    } catch {}
                  }} style={{ marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: "rgba(74,222,128,0.2)", borderWidth: 2, borderColor: "rgba(74,222,128,0.4)" }}>
                    <Text style={{ color: "#4ade80", fontSize: 13, fontWeight: "700" }}>▶ {t("testSound")}</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      ) : tab === "move" ? (
        /* Movement style tab */
        <View style={{ flex: 1, backgroundColor: "#5876bc" }}>
          <View style={foodStyles.header}>
            <Text style={foodStyles.titleText}>{t("headerMove")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <Pressable onPress={() => setTab("settings")} style={{ marginLeft: 4 }}>
                <Image source={require("../assets/close-red-btn.png")} style={{ width: 56, height: 56 }} />
              </Pressable>
            </View>
          </View>

          <View style={{ flex: 1, padding: 32, alignItems: "center", justifyContent: "center" }}>
            <View style={foodStyles.modalCard}>
              <View style={foodStyles.modalTop} />
              <View style={foodStyles.modalContent} onLayout={(e) => {
                const { width: w, height: h } = e.nativeEvent.layout;
                setModalSize({ width: Math.floor(w), height: Math.floor(h) });
              }}>
                {modalSize.width > 0 ? (
                  <MiniWormGame
                    key={`move-${controlStyle}`}
                    foodImages={selectedPack.items.length > 0 ? selectedPack.items : ["/food/burger.png"]}
                    width={modalSize.width}
                    height={modalSize.height}
                    skinColors={playerSkin.colors}
                    headType={playerSkin.headType}
                    bgColors={BG_THEMES.find(t => t.id === activeBg)?.colors as [string, string]}
                    controlStyle={controlStyle}
                  />
                ) : null}
                {/* Select / Selected button */}
                {activeControlStyle === controlStyle ? (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
                    <Text style={{ color: "#4ade80", fontSize: 16, fontWeight: "800" }}>✅ {t("selected")}</Text>
                  </View>
                ) : (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
                    <Pressable
                      onPress={() => {
                        setActiveControlStyle(controlStyle);
                        try { getStorage().setItem("controlStyle", controlStyle); } catch {}
                      }}
                      style={{
                        backgroundColor: "#4687d6", paddingHorizontal: 28, paddingVertical: 12,
                        borderRadius: 12, borderWidth: 2, borderColor: "#a8d5ff",
                        shadowColor: "#24548c", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>{t("selectBtn")}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>

            {/* Move style buttons - left side */}
            <ScrollView
              style={{ position: "absolute", left: 12, top: "10%", bottom: "10%", width: 70 } as any}
              contentContainerStyle={{ gap: 8, alignItems: "center", paddingVertical: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {CONTROL_STYLES.map((ms) => {
                const active = controlStyle === ms.id;
                return (
                  <Pressable
                    key={ms.id}
                    onPress={() => setControlStyle(ms.id)}
                    style={{
                      width: 56, height: 56, borderRadius: 14,
                      borderWidth: active ? 3 : 2,
                      borderColor: active ? "#ffd700" : "rgba(255,255,255,0.2)",
                      backgroundColor: "rgba(0,0,0,0.4)",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{ms.icon}</Text>
                    <Text style={{ color: "#fff", fontSize: 7, fontWeight: "700" }}>{t(`ctrl_${ms.id}`)}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      ) : tab === "map" ? (
        /* Minimap size tab — same layout as food/bg tabs */
        <View style={{ flex: 1, backgroundColor: "#5876bc" }}>
          {/* Header bar */}
          <View style={foodStyles.header}>
            <Text style={foodStyles.titleText}>{t("headerMap")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <Pressable onPress={() => setTab("settings")} style={{ marginLeft: 4 }}>
                <Image source={require("../assets/close-red-btn.png")} style={{ width: 56, height: 56 }} />
              </Pressable>
            </View>
          </View>

          {/* Main content */}
          <View style={{ flex: 1, padding: 32, alignItems: "center", justifyContent: "center" }}>
            {/* Dark modal card with MiniWormGame + minimap overlay */}
            <View style={foodStyles.modalCard}>
              <View style={foodStyles.modalTop} />
              <View style={foodStyles.modalContent} onLayout={(e) => {
                const { width: w, height: h } = e.nativeEvent.layout;
                setModalSize({ width: Math.floor(w), height: Math.floor(h) });
              }}>
                {modalSize.width > 0 ? (
                  <MiniWormGame
                    key={`map-${mapSize}`}
                    foodImages={selectedPack.items.length > 0 ? selectedPack.items : ["/food/burger.png"]}
                    width={modalSize.width}
                    height={modalSize.height}
                    skinColors={playerSkin.colors}
                    headType={playerSkin.headType}
                    bgColors={BG_THEMES.find(t => t.id === activeBg)?.colors as [string, string]}
                  />
                ) : null}
                {/* Minimap overlay - bottom right like in game */}
                {(() => {
                  const sizeObj = MAP_SIZES.find(s => s.id === mapSize) || MAP_SIZES[2];
                  return (
                    <View style={{
                      position: "absolute", bottom: 12, right: 12,
                      width: sizeObj.size, height: sizeObj.size,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      borderRadius: 12, borderWidth: 2, borderColor: "rgba(255,255,255,0.25)",
                      overflow: "hidden",
                    }} pointerEvents="none">
                      <View style={{ position: "absolute", top: 2, left: 2, right: 2, bottom: 2, borderWidth: 1, borderColor: "rgba(255,50,50,0.3)", borderRadius: 8 }} />
                      <View style={{ position: "absolute", top: "45%", left: "50%", width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ade80" }} />
                      <View style={{ position: "absolute", top: "25%", left: "30%", width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,100,100,0.6)" }} />
                      <View style={{ position: "absolute", top: "60%", left: "70%", width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(100,100,255,0.6)" }} />
                      <View style={{ position: "absolute", top: "75%", left: "20%", width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,200,100,0.6)" }} />
                      <View style={{ position: "absolute", top: "35%", left: "80%", width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(200,100,255,0.6)" }} />
                    </View>
                  );
                })()}
                {/* Select / Selected button */}
                {activeMapSize === mapSize ? (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
                    <Text style={{ color: "#4ade80", fontSize: 16, fontWeight: "800" }}>✅ {t("selected")}</Text>
                  </View>
                ) : (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
                    <Pressable
                      onPress={() => {
                        setActiveMapSize(mapSize);
                        try { getStorage().setItem("minimapSize", mapSize); } catch {}
                      }}
                      style={{
                        backgroundColor: "#4687d6", paddingHorizontal: 28, paddingVertical: 12,
                        borderRadius: 12, borderWidth: 2, borderColor: "#a8d5ff",
                        shadowColor: "#24548c", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>{t("selectBtn")}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>

            {/* Size buttons - left side */}
            <View style={{ position: "absolute", left: 16, top: "20%", gap: 10 } as any}>
              {MAP_SIZES.map((s) => {
                const active = mapSize === s.id;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => setMapSize(s.id)}
                    style={{
                      width: 60, height: 60, borderRadius: 14, overflow: "hidden",
                      borderWidth: active ? 3 : 2,
                      borderColor: active ? "#ffd700" : "rgba(255,255,255,0.2)",
                      backgroundColor: "rgba(0,0,0,0.4)",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <View style={{
                      width: s.size / 5, height: s.size / 5,
                      backgroundColor: "rgba(255,255,255,0.15)",
                      borderRadius: 3, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
                    }} />
                    <Text style={{ color: "#fff", fontSize: 8, fontWeight: "700", marginTop: 2 }}>{s.name.split(" ").pop()}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      ) : tab === "emoji" ? (
        /* Celebration emoji tab */
        <View style={{ flex: 1, backgroundColor: "#5876bc" }}>
          <View style={foodStyles.header}>
            <Text style={foodStyles.titleText}>{t("headerEmoji")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <Pressable onPress={() => setTab("settings")} style={{ marginLeft: 4 }}>
                <Image source={require("../assets/close-red-btn.png")} style={{ width: 56, height: 56 }} />
              </Pressable>
            </View>
          </View>

          <View style={{ flex: 1, padding: 32, alignItems: "center", justifyContent: "center" }}>
            <View style={foodStyles.modalCard}>
              <View style={foodStyles.modalTop} />
              <View style={foodStyles.modalContent} onLayout={(e) => {
                const { width: w, height: h } = e.nativeEvent.layout;
                setModalSize({ width: Math.floor(w), height: Math.floor(h) });
              }}>
                {modalSize.width > 0 ? (
                  <MiniWormGame
                    key={`emoji-${celebrationEmoji}`}
                    foodImages={selectedPack.items.length > 0 ? selectedPack.items : ["/food/burger.png"]}
                    width={modalSize.width}
                    height={modalSize.height}
                    skinColors={playerSkin.colors}
                    headType={playerSkin.headType}
                    bgColors={BG_THEMES.find(t => t.id === activeBg)?.colors as [string, string]}
                    celebrationEmoji={celebrationEmoji}
                  />
                ) : null}
                {/* Select / Selected button */}
                {activeEmoji === celebrationEmoji ? (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
                    <Text style={{ color: "#4ade80", fontSize: 16, fontWeight: "800" }}>✅ {t("selected")}</Text>
                  </View>
                ) : (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
                    <Pressable
                      onPress={() => {
                        setActiveEmoji(celebrationEmoji);
                        try { getStorage().setItem("celebrationEmoji", celebrationEmoji); } catch {}
                      }}
                      style={{
                        backgroundColor: "#4687d6", paddingHorizontal: 28, paddingVertical: 12,
                        borderRadius: 12, borderWidth: 2, borderColor: "#a8d5ff",
                        shadowColor: "#24548c", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>{t("selectBtn")}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>

            {/* Emoji buttons - left side */}
            <ScrollView
              style={{ position: "absolute", left: 12, top: "10%", bottom: "10%", width: 70 } as any}
              contentContainerStyle={{ gap: 8, alignItems: "center", paddingVertical: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {CELEBRATION_EMOJIS.map((emoji) => {
                const active = celebrationEmoji === emoji;
                return (
                  <Pressable
                    key={emoji}
                    onPress={() => setCelebrationEmoji(emoji)}
                    style={{
                      width: 56, height: 56, borderRadius: 14,
                      borderWidth: active ? 3 : 2,
                      borderColor: active ? "#ffd700" : "rgba(255,255,255,0.2)",
                      backgroundColor: "rgba(0,0,0,0.4)",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>{emoji}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      ) : tab === "bg" ? (
        /* Background color tab — same layout as food tab */
        <View style={{ flex: 1, backgroundColor: "#5876bc" }}>
          {/* Header bar */}
          <View style={foodStyles.header}>
            <Text style={foodStyles.titleText}>{t("headerBg")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              {/* Currency pill */}
              <View style={foodStyles.currencyPill}>
                <View style={foodStyles.coinStack}>
                  <View style={[foodStyles.coinLayer, { bottom: 0 }]} />
                  <View style={[foodStyles.coinLayer, { bottom: 6 }]} />
                  <View style={[foodStyles.coinLayer, { bottom: 12, alignItems: "center", justifyContent: "center" }]}>
                    <View style={foodStyles.coinFace}>
                      <View style={{ flexDirection: "row", gap: 3, marginTop: 2 }}>
                        <View style={foodStyles.coinEye} />
                        <View style={foodStyles.coinEye} />
                      </View>
                      <View style={foodStyles.coinMouth} />
                    </View>
                  </View>
                </View>
                <Text style={foodStyles.currencyText}>{playerCoins.toLocaleString()}</Text>
                <Pressable style={foodStyles.plusBtn}>
                  <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>+</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => setTab("settings")} style={{ marginLeft: 4 }}>
                <Image source={require("../assets/close-red-btn.png")} style={{ width: 56, height: 56 }} />
              </Pressable>
            </View>
          </View>

          {/* Main content */}
          <View style={{ flex: 1, padding: 32, alignItems: "center", justifyContent: "center" }}>
            {/* Dark modal card with preview */}
            <View style={foodStyles.modalCard}>
              <View style={foodStyles.modalTop} />
              <View style={foodStyles.modalContent} onLayout={(e) => {
                const { width: w, height: h } = e.nativeEvent.layout;
                setModalSize({ width: Math.floor(w), height: Math.floor(h) });
              }}>
                {modalSize.width > 0 ? (
                  <MiniWormGame
                    key={`bg-${bgColor}`}
                    foodImages={selectedPack.items.length > 0 ? selectedPack.items : ["/food/burger.png"]}
                    width={modalSize.width}
                    height={modalSize.height}
                    skinColors={playerSkin.colors}
                    headType={playerSkin.headType}
                    bgColors={BG_THEMES.find(t => t.id === bgColor)?.colors as [string, string]}
                  />
                ) : (
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, fontWeight: "700" }}>
                      {t("chooseColor")}
                    </Text>
                  </View>
                )}
                {/* Select / Selected button */}
                {activeBg === bgColor ? (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
                    <Text style={{ color: "#4ade80", fontSize: 16, fontWeight: "800" }}>✅ {t("selected")}</Text>
                  </View>
                ) : (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
                    <Pressable
                      onPress={() => handleSelectBg(bgColor)}
                      style={{
                        backgroundColor: "#4687d6", paddingHorizontal: 28, paddingVertical: 12,
                        borderRadius: 12, borderWidth: 2, borderColor: "#a8d5ff",
                        shadowColor: "#24548c", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>{t("selectBtn")}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>

            {/* Color buttons - left side */}
            <ScrollView
              style={{ position: "absolute", left: 12, top: "10%", bottom: "10%", width: 70 } as any}
              contentContainerStyle={{ gap: 8, alignItems: "center", paddingVertical: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {BG_THEMES.map((theme) => {
                const active = bgColor === theme.id;
                return (
                  <Pressable
                    key={theme.id}
                    onPress={() => {
                      setBgColor(theme.id);
                      try { getStorage().setItem("gameBgColor", theme.id); } catch {}
                    }}
                    style={{
                      width: 56, height: 56, borderRadius: 28, overflow: "hidden",
                      borderWidth: active ? 3 : 2,
                      borderColor: active ? "#ffd700" : "rgba(255,255,255,0.2)",
                    }}
                  >
                    <View style={{ flex: 1, backgroundColor: theme.colors[0], alignItems: "center", justifyContent: "center" }}>
                      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", backgroundColor: theme.colors[1] }} />
                      {active && <Text style={{ fontSize: 16, zIndex: 1 }}>✓</Text>}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      ) : tab === "settings" ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.container,
            isDesktop && { maxWidth: 500, alignSelf: "center", width: "100%" },
          ]}
        >
          {/* Language */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>🌍 {t("language")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(allLanguages).map(([code, { name }]) => {
                const active = currentLang === code;
                return (
                  <Pressable
                    key={code}
                    onPress={() => handleChangeLang(code)}
                    style={[styles.langBtn, active && styles.langBtnActive]}
                  >
                    <LangFlag code={code} />
                    <Text style={[styles.langText, active && { color: colors.text }]}>{name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Danger zone */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>⚠️ {t("resetData")}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t("resetWarning")}</Text>
            <Pressable onPress={handleReset} style={styles.dangerBtn}>
              <Text style={{ color: colors.danger, fontWeight: "700", fontSize: 15 }}>🗑 {t("resetData")}</Text>
            </Pressable>
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      ) : (
        /* Food tab — game-style UI */
        <View style={{ flex: 1, backgroundColor: "#5876bc" }}>
          {/* Header bar */}
          <View style={foodStyles.header}>
            <Text style={foodStyles.titleText}>{t("headerFood")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              {/* Currency pill */}
              <View style={foodStyles.currencyPill}>
                {/* Coin stack */}
                <View style={foodStyles.coinStack}>
                  <View style={[foodStyles.coinLayer, { bottom: 0 }]} />
                  <View style={[foodStyles.coinLayer, { bottom: 6 }]} />
                  <View style={[foodStyles.coinLayer, { bottom: 12, alignItems: "center", justifyContent: "center" }]}>
                    <View style={foodStyles.coinFace}>
                      <View style={{ flexDirection: "row", gap: 3, marginTop: 2 }}>
                        <View style={foodStyles.coinEye} />
                        <View style={foodStyles.coinEye} />
                      </View>
                      <View style={foodStyles.coinMouth} />
                    </View>
                  </View>
                </View>
                <Text style={foodStyles.currencyText}>{playerCoins.toLocaleString()}</Text>
                {/* Plus button */}
                <Pressable style={foodStyles.plusBtn}>
                  <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>+</Text>
                </Pressable>
              </View>
              {/* Close button - SVG-style rendered with image */}
              <Pressable onPress={() => setTab("settings")} style={{ marginLeft: 4 }}>
                <Image source={require("../assets/close-red-btn.png")} style={{ width: 56, height: 56 }} />
              </Pressable>
            </View>
          </View>

          {/* Main content */}
          <View style={{ flex: 1, padding: 32, alignItems: "center", justifyContent: "center" }}>
            {/* Dark modal card */}
            <View style={foodStyles.modalCard}>
              {/* Darker top section */}
              <View style={foodStyles.modalTop} />
              {/* Content area with mini game or food preview */}
              <View style={foodStyles.modalContent} onLayout={(e) => {
                const { width: w, height: h } = e.nativeEvent.layout;
                setModalSize({ width: Math.floor(w), height: Math.floor(h) });
              }}>
                {modalSize.width > 0 && (
                  <MiniWormGame
                    key={previewPack || foodStyle}
                    foodImages={(FOOD_PACKS.find(p => p.id === (previewPack || foodStyle))?.items) || selectedPack.items || ["/food/burger.png"]}
                    width={modalSize.width}
                    height={modalSize.height}
                    skinColors={playerSkin.colors}
                    headType={playerSkin.headType}
                    bgColors={BG_THEMES.find(t => t.id === activeBg)?.colors as [string, string]}
                    controlStyle={activeControlStyle}
                    celebrationEmoji={activeEmoji}
                  />
                )}
                {/* Buy button - show when previewing a pack that's not owned */}
                {previewPack && !ownedPacks.includes(previewPack) && (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center", alignItems: "center", gap: 6 }}>
                    <Text style={{ color: "#ffd700", fontSize: 14, fontWeight: "800" }}>
                      💰 2 300 pièces
                    </Text>
                    <Pressable onPress={() => handleBuyPack(previewPack)}>
                      <Image source={require("../assets/buy-btn.png")} style={{ width: 140, height: 50 }} resizeMode="contain" />
                    </Pressable>
                  </View>
                )}
                {/* Owned badge */}
                {previewPack && ownedPacks.includes(previewPack) && (
                  <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
                    <Text style={{ color: "#4ade80", fontSize: 16, fontWeight: "800" }}>✅ {t("purchased")}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Pack buttons - left side */}
            <View style={{ position: "absolute", left: 20, top: "25%", gap: 12 } as any}>
              <Pressable onPress={() => setPreviewPack(previewPack === "classic" ? null : "classic")}>
                <Image source={{ uri: "/food/burger.png" }} style={{ width: 80, height: 80 }} resizeMode="contain" />
              </Pressable>
              <Pressable onPress={() => setPreviewPack(previewPack === "francaise" ? null : "francaise")}>
                <Image source={{ uri: "/food/croissant.png" }} style={{ width: 80, height: 80 }} resizeMode="contain" />
              </Pressable>
              <Pressable onPress={() => setPreviewPack(previewPack === "italienne" ? null : "italienne")}>
                <Image source={{ uri: "/food/pizza-margherita.png" }} style={{ width: 80, height: 80 }} resizeMode="contain" />
              </Pressable>
              <Pressable onPress={() => setPreviewPack(previewPack === "americaine" ? null : "americaine")}>
                <Image source={{ uri: "/food/americaine-donut.png" }} style={{ width: 80, height: 80 }} resizeMode="contain" />
              </Pressable>
            </View>

            {/* Sparkle decoration */}
            <View style={{ position: "absolute", bottom: 20, right: 24 }} pointerEvents="none">
              <Text style={{ color: "#f0f6ff", fontSize: 30, opacity: 0.9 }}>✦</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  // Tab bar
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  tab: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 12, borderCurve: "continuous",
  },
  tabActive: {
    backgroundColor: "rgba(255,215,0,0.12)",
  },
  tabText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: colors.gold },
  // Cards
  card: {
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, borderCurve: "continuous",
    padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  // Language
  langBtn: {
    flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 12, borderCurve: "continuous", backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.08)",
  },
  langBtnActive: { backgroundColor: "rgba(124,58,237,0.2)", borderColor: "rgba(124,58,237,0.5)" },
  langText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
  // Danger
  dangerBtn: {
    paddingVertical: 14, borderRadius: 14, borderCurve: "continuous",
    backgroundColor: "rgba(255,51,102,0.15)", borderWidth: 1.5, borderColor: "rgba(255,51,102,0.3)",
    alignItems: "center",
  },
  // Food tab
  foodTabContainer: {
    flex: 1, flexDirection: "row",
  },
  foodList: {
    width: 130,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  packItem: {
    alignItems: "center", gap: 4,
    paddingVertical: 14, paddingHorizontal: 8,
    borderRadius: 14, borderCurve: "continuous",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  packItemActive: {
    backgroundColor: "rgba(255,215,0,0.12)",
    borderColor: "rgba(255,215,0,0.5)",
  },
  packName: { color: colors.textSecondary, fontSize: 11, fontWeight: "700", textAlign: "center" },
  packCheck: {
    position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.gold, alignItems: "center", justifyContent: "center",
  },
  // Preview
  previewArea: {
    flex: 1, padding: spacing.lg, gap: spacing.md,
  },
  previewTitle: {
    color: colors.gold, fontSize: 18, fontWeight: "800", letterSpacing: 1, textAlign: "center",
  },
  previewBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20, borderCurve: "continuous",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    padding: spacing.lg,
    justifyContent: "center", alignItems: "center",
  },
  previewGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 16,
    justifyContent: "center", alignItems: "center",
  },
  previewImg: {
    width: 50, height: 50,
  },
  previewCircle: {
    width: 30, height: 30, borderRadius: 15,
  },
});

const foodStyles = StyleSheet.create({
  header: {
    height: 76,
    backgroundColor: "#3d4999",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#2d3778",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  titleText: {
    color: "#ffeb70",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 2,
  },
  currencyPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8c5264",
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#b88698",
    height: 44,
    paddingLeft: 48,
    paddingRight: 6,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  coinStack: {
    position: "absolute",
    left: -18,
    top: -6,
    width: 44,
    height: 48,
  },
  coinLayer: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e63946",
    borderWidth: 1,
    borderColor: "#730a0a",
    left: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  coinFace: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#911b1b",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.8,
  },
  coinEye: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#911b1b",
  },
  coinMouth: {
    width: 10,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: "#911b1b",
    marginTop: 3,
  },
  currencyText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 1,
    letterSpacing: 1,
  },
  plusBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#4687d6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#a8d5ff",
    shadowColor: "#24548c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  closeBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#d83030",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ff8585",
    shadowColor: "#821010",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  modalCard: {
    width: "100%" as any,
    maxWidth: 850,
    height: "65%" as any,
    minHeight: 400,
    backgroundColor: "#384c80",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4f67a3",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  modalTop: {
    height: 76,
    backgroundColor: "#2c3d69",
    borderBottomWidth: 1,
    borderBottomColor: "#253359",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#384c80",
  },
  buyBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
});
