import { Image } from "react-native";
import { FLAG_IMAGES } from "@/assets/flags";
import type { WormSkin } from "@/types/game";

type FlagEntry = {
  name: string;
  colors: [string, string, string, string];
};

const FLAG_CATALOG: FlagEntry[] = [
  { name: "France", colors: ["#002395", "#FFFFFF", "#ED2939", "#002395"] },
  { name: "Allemagne", colors: ["#000000", "#DD0000", "#FFCC00", "#000000"] },
  { name: "Italie", colors: ["#008C45", "#FFFFFF", "#CD212A", "#008C45"] },
  { name: "Espagne", colors: ["#AA151B", "#F1BF00", "#AA151B", "#F1BF00"] },
  { name: "Portugal", colors: ["#006600", "#FF0000", "#FFCC00", "#006600"] },
  { name: "Royaume-Uni", colors: ["#00247D", "#CF142B", "#FFFFFF", "#CF142B"] },
  { name: "Belgique", colors: ["#000000", "#FDDA24", "#EF3340", "#000000"] },
  { name: "Pays-Bas", colors: ["#AE1C28", "#FFFFFF", "#21468B", "#AE1C28"] },
  { name: "Suisse", colors: ["#FF0000", "#FFFFFF", "#FF0000", "#FFFFFF"] },
  { name: "Suede", colors: ["#005BAA", "#FECC02", "#005BAA", "#FECC02"] },
  { name: "Pologne", colors: ["#FFFFFF", "#DC143C", "#FFFFFF", "#DC143C"] },
  { name: "Ukraine", colors: ["#0057B7", "#FFD700", "#0057B7", "#FFD700"] },
  { name: "Grece", colors: ["#004C98", "#FFFFFF", "#004C98", "#FFFFFF"] },
  { name: "Roumanie", colors: ["#002B7F", "#FCD116", "#CE1126", "#002B7F"] },
  { name: "Irlande", colors: ["#169B62", "#FFFFFF", "#FF883E", "#169B62"] },
  { name: "Croatie", colors: ["#FF0000", "#FFFFFF", "#171796", "#FF0000"] },
  { name: "Norvege", colors: ["#EF2B2D", "#002868", "#FFFFFF", "#EF2B2D"] },
  { name: "Danemark", colors: ["#C60C30", "#FFFFFF", "#C60C30", "#FFFFFF"] },
  { name: "Finlande", colors: ["#FFFFFF", "#003580", "#FFFFFF", "#003580"] },
  { name: "Russie", colors: ["#FFFFFF", "#0039A6", "#D52B1E", "#FFFFFF"] },
  { name: "Turquie", colors: ["#E30A17", "#FFFFFF", "#E30A17", "#FFFFFF"] },
  { name: "USA", colors: ["#3C3B6E", "#B22234", "#FFFFFF", "#B22234"] },
  { name: "Canada", colors: ["#FF0000", "#FFFFFF", "#FF0000", "#FFFFFF"] },
  { name: "Mexique", colors: ["#006341", "#FFFFFF", "#CE1126", "#006341"] },
  { name: "Bresil", colors: ["#009739", "#FEDD00", "#012169", "#009739"] },
  { name: "Argentine", colors: ["#74ACDF", "#FFFFFF", "#74ACDF", "#74ACDF"] },
  { name: "Colombie", colors: ["#FCD116", "#003893", "#CE1126", "#FCD116"] },
  { name: "Japon", colors: ["#FFFFFF", "#BC002D", "#FFFFFF", "#BC002D"] },
  { name: "Chine", colors: ["#DE2910", "#FFDE00", "#DE2910", "#FFDE00"] },
  { name: "Coree du Sud", colors: ["#FFFFFF", "#CD2E3A", "#0047A0", "#000000"] },
  { name: "Inde", colors: ["#FF9933", "#FFFFFF", "#138808", "#000080"] },
  { name: "Maroc", colors: ["#C1272D", "#006233", "#C1272D", "#006233"] },
  { name: "Algerie", colors: ["#006633", "#FFFFFF", "#D21034", "#006633"] },
  { name: "Tunisie", colors: ["#E70013", "#FFFFFF", "#E70013", "#FFFFFF"] },
  { name: "Egypte", colors: ["#CE1126", "#FFFFFF", "#000000", "#CE1126"] },
  { name: "Senegal", colors: ["#00853F", "#FDEF42", "#E31B23", "#00853F"] },
  { name: "Nigeria", colors: ["#008751", "#FFFFFF", "#008751", "#FFFFFF"] },
  { name: "Afrique du Sud", colors: ["#007A4D", "#FFB612", "#DE3831", "#002395"] },
  { name: "Cameroun", colors: ["#007A33", "#CE1126", "#FCD116", "#007A33"] },
  { name: "Ghana", colors: ["#EF3340", "#FCD116", "#009739", "#000000"] },
  { name: "Australie", colors: ["#00008B", "#FF0000", "#FFFFFF", "#00008B"] },
  { name: "Nouvelle-Zelande", colors: ["#00247D", "#CC142B", "#FFFFFF", "#00247D"] },
  { name: "Pakistan", colors: ["#01411C", "#FFFFFF", "#01411C", "#FFFFFF"] },
  { name: "Indonesie", colors: ["#FF0000", "#FFFFFF", "#FF0000", "#FFFFFF"] },
  { name: "Philippines", colors: ["#0038A8", "#CE1126", "#FCD116", "#FFFFFF"] },
  { name: "Vietnam", colors: ["#DA251D", "#FFCD00", "#DA251D", "#FFCD00"] },
  { name: "Thailande", colors: ["#ED1C24", "#FFFFFF", "#241D4F", "#FFFFFF"] },
  { name: "Iran", colors: ["#239F40", "#FFFFFF", "#DA0000", "#239F40"] },
  { name: "Arabie Saoudite", colors: ["#006C35", "#FFFFFF", "#006C35", "#FFFFFF"] },
  { name: "Chili", colors: ["#FFFFFF", "#D52B1E", "#0039A6", "#FFFFFF"] },
  { name: "Perou", colors: ["#D91023", "#FFFFFF", "#D91023", "#FFFFFF"] },
  { name: "Jamaique", colors: ["#009B3A", "#000000", "#FED100", "#009B3A"] },
  { name: "Haiti", colors: ["#00209F", "#D21034", "#00209F", "#D21034"] },
  { name: "Cuba", colors: ["#002A8F", "#FFFFFF", "#CF142B", "#002A8F"] },
  { name: "Congo", colors: ["#007FFF", "#F7D618", "#CE1021", "#007FFF"] },
  { name: "Ethiopie", colors: ["#078930", "#FCDD09", "#DA121A", "#0F47AF"] },
  { name: "Kenya", colors: ["#000000", "#BB0000", "#006600", "#FFFFFF"] },
  { name: "Israel", colors: ["#FFFFFF", "#0038B8", "#FFFFFF", "#0038B8"] },
  { name: "Palestine", colors: ["#000000", "#FFFFFF", "#009736", "#CE1126"] },
  { name: "Emirats Arabes Unis", colors: ["#00843D", "#FFFFFF", "#000000", "#CE1126"] },
];

function normalizeHex(color: string) {
  return color.trim().toUpperCase();
}

function colorsMatch(a: string[], b: string[]) {
  return a.length === b.length && a.every((color, index) => normalizeHex(color) === normalizeHex(b[index] ?? ""));
}

export function getFlagTextureUri(flagName?: string | null) {
  if (!flagName) return "";
  const source = FLAG_IMAGES[flagName];
  if (!source) return "";
  const resolved = Image.resolveAssetSource(source);
  return resolved?.uri ?? "";
}

export function getFlagNameFromColors(colors?: string[] | null) {
  if (!colors || colors.length !== 4) return undefined;
  return FLAG_CATALOG.find((flag) => colorsMatch(flag.colors, colors))?.name;
}

export function normalizeFlagSkin<T extends WormSkin>(skin: T): T {
  if (!skin?.isFlag) return skin;
  if (skin.bodyTexture) return skin;
  const flagName = (skin as T & { flagName?: string }).flagName ?? getFlagNameFromColors(skin.colors);
  if (!flagName) return skin;
  const bodyTexture = getFlagTextureUri(flagName);
  if (!bodyTexture) return skin;
  return { ...skin, flagName, bodyTexture };
}
