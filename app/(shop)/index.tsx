import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing } from "@/expo/theme";
import { useGameState } from "@/context/GameStateContext";
import { FLAG_IMAGES } from "@/assets/flags";
import { translateFlag } from "@/i18n/flagNames";
import { getStorage } from "@/services/StorageService";
import { GAME_EVENTS } from "@/config/events";

// Preload all flag images on module load so they are cached in the browser
if (typeof window !== "undefined") {
  Object.values(FLAG_IMAGES).forEach((src: any) => {
    const uri = typeof src === "string" ? src : src?.uri || src?.default;
    if (uri && typeof uri === "string") {
      const preImg = new window.Image();
      preImg.src = uri;
    }
  });
}

type FlagSkin = {
  name: string;
  bodyTexture?: string;
  colors: [string, string, string, string];
};

const FLAG_SKINS: FlagSkin[] = [
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

const DEFAULT_FLAG_TEXTURE_SCALE = 1.4;
const FLAG_TEXTURE_OFFSETS: Record<string, number> = {
  "/assets/france.png": 0.18,
};
const FLAG_TEXTURE_SCALES: Record<string, number> = {
  "/assets/france.png": DEFAULT_FLAG_TEXTURE_SCALE,
};

type ShopTab = "shop" | "fetes" | "flags" | "eyes" | "mouths";

const SHOP_TAB_LABELS: Record<ShopTab, string> = {
  shop: "Shop",
  fetes: "Fêtes",
  flags: "Flags",
  eyes: "Yeux",
  mouths: "Bouches",
};

const SHOP_TAB_ORDER: ShopTab[] = ["shop", "fetes", "flags", "eyes", "mouths"];
const DEFAULT_FACE_HEAD_TYPES = new Set<string>([
  "bastille_flag",
  "hispanidad_flag",
  "einheit_flag",
  "repubblica_flag",
  "portugal_flag",
  "russia_flag",
  "china_flag",
  "india_flag",
  "cumhuriyet_flag",
  "koningsdag_flag",
  "japan_flag",
  "korea_flag",
  "santa",
  "santa2",
  "santa3",
]);

type HeadOption = {
  id: string;
  label: string;
  locked: boolean;
  preview?: string;
  bodyTexture?: string;
  unlockKey?: string;
  eventId?: string;
  eventEmoji?: string;
  currencyImage?: string;
};

type EyeOption = {
  id: "classic" | "angry" | "happy" | "wink";
  label: string;
  preview: string;
};

type MouthOption = {
  id: "none" | "smile" | "grin" | "angry" | "surprised";
  label: string;
  preview: string;
};

function drawPreviewFaceDetails(
  ctx: CanvasRenderingContext2D,
  hp: { x: number; y: number },
  headR: number,
  eyeStyle: EyeOption["id"],
  mouthStyle: MouthOption["id"],
) {
  const eyeR = headR * 0.32;
  const pupilR = eyeR * 0.55;
  const eyeSpacing = headR * 0.35;
  const eyeY = hp.y - headR * 0.1;

  const drawClosedEye = (ex: number, arch = 0.45) => {
    ctx.beginPath();
    ctx.lineWidth = Math.max(2, headR * 0.11);
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
    ctx.moveTo(ex - eyeR * 0.7, eyeY);
    ctx.quadraticCurveTo(ex, eyeY - eyeR * arch, ex + eyeR * 0.7, eyeY);
    ctx.stroke();
  };

  for (let side = -1; side <= 1; side += 2) {
    const ex = hp.x + side * eyeSpacing;
    const winkEye = eyeStyle === "wink" && side === 1;
    const happyEye = eyeStyle === "happy";
    const angryEye = eyeStyle === "angry";

    if (winkEye || happyEye) {
      drawClosedEye(ex, happyEye ? 0.6 : 0.18);
      continue;
    }

    const eyeOffsetY = angryEye ? eyeR * 0.06 : 0;

    ctx.beginPath();
    ctx.arc(ex, eyeY + eyeOffsetY, eyeR, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ex, eyeY + eyeOffsetY, pupilR, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ex - pupilR * 0.3, eyeY + eyeOffsetY - pupilR * 0.3, pupilR * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    if (angryEye) {
      ctx.beginPath();
      ctx.lineWidth = Math.max(2, headR * 0.09);
      ctx.lineCap = "round";
      ctx.strokeStyle = "#111";
      ctx.moveTo(ex - eyeR * 0.8, eyeY - eyeR * 0.95);
      ctx.lineTo(ex + side * eyeR * 0.55, eyeY - eyeR * 1.2);
      ctx.stroke();
    }
  }

  if (mouthStyle === "none") return;

  const mouthY = hp.y + headR * 0.42;
  ctx.beginPath();
  ctx.lineWidth = Math.max(2, headR * 0.1);
  ctx.lineCap = "round";
  ctx.strokeStyle = "#111";

  if (mouthStyle === "surprised") {
    ctx.arc(hp.x, mouthY - headR * 0.02, headR * 0.15, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }

  if (mouthStyle === "angry") {
    ctx.moveTo(hp.x - headR * 0.28, mouthY + headR * 0.08);
    ctx.quadraticCurveTo(hp.x, mouthY - headR * 0.18, hp.x + headR * 0.28, mouthY + headR * 0.08);
    ctx.stroke();
    return;
  }

  const smileDepth = mouthStyle === "grin" ? headR * 0.22 : headR * 0.14;
  ctx.moveTo(hp.x - headR * 0.3, mouthY - headR * 0.02);
  ctx.quadraticCurveTo(hp.x, mouthY + smileDepth, hp.x + headR * 0.3, mouthY - headR * 0.02);
  ctx.stroke();
}

function PreviewJuly4th2Head({
  eyeStyle,
  mouthStyle,
}: {
  eyeStyle: EyeOption["id"];
  mouthStyle: MouthOption["id"];
}) {
  const renderEye = (side: "left" | "right") => {
    const closed = eyeStyle === "happy" || (eyeStyle === "wink" && side === "right");
    if (closed) {
      return <View style={[styles.previewEyeClosed, eyeStyle === "happy" && styles.previewEyeHappy]} />;
    }
    return (
      <View style={styles.previewEye}>
        <View style={styles.previewPupil} />
      </View>
    );
  };

  const mouthNode = mouthStyle === "none"
    ? null
    : mouthStyle === "surprised"
      ? <View style={styles.previewMouthSurprised} />
      : (
        <View
          style={[
            styles.previewMouth,
            mouthStyle === "grin" && styles.previewMouthGrin,
            mouthStyle === "angry" && styles.previewMouthAngry,
          ]}
        />
      );

  return (
    <View style={styles.previewJulyHeadBubble}>
      <View style={styles.previewJulyHeadBase} />
      <View style={styles.previewJulyStripeWrap}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View
            key={`preview-july-stripe-${index}`}
            style={[
              styles.previewJulyStripe,
              { backgroundColor: index % 2 === 0 ? "#ffffff" : "#c63d4f" },
            ]}
          />
        ))}
      </View>
      <View style={styles.previewJulyBluePatch} />
      <View style={styles.previewJulyGlow} />
      <View style={styles.previewJulyStarsRow}>
        <Text style={styles.previewJulyStar}>★</Text>
        <Text style={styles.previewJulyStar}>★</Text>
        <Text style={styles.previewJulyStar}>★</Text>
      </View>
      <View style={styles.previewJulyBrowsRow}>
        <View style={[styles.previewJulyBrow, styles.previewJulyBrowLeft]} />
        <View style={[styles.previewJulyBrow, styles.previewJulyBrowRight]} />
      </View>
      <View style={styles.previewFaceWrap}>
        <View style={styles.previewEyesRow}>
          {renderEye("left")}
          {renderEye("right")}
        </View>
        {mouthNode}
      </View>
      <View style={styles.previewJulyBeard} />
    </View>
  );
}

function PreviewSantaHead({
  eyeStyle,
  mouthStyle,
}: {
  eyeStyle: EyeOption["id"];
  mouthStyle: MouthOption["id"];
}) {
  const renderEye = (side: "left" | "right") => {
    const closed = eyeStyle === "happy" || (eyeStyle === "wink" && side === "right");
    if (closed) return <View style={[styles.previewEyeClosed, eyeStyle === "happy" && styles.previewEyeHappy]} />;
    return <View style={styles.previewEye}><View style={styles.previewPupil} /></View>;
  };
  const mouthNode = mouthStyle === "none" ? null : mouthStyle === "surprised" ? <View style={styles.previewMouthSurprised} /> : (
    <View style={[styles.previewMouth, mouthStyle === "grin" && styles.previewMouthGrin, mouthStyle === "angry" && styles.previewMouthAngry]} />
  );
  return (
    <View style={styles.previewHolidayHeadBubble}>
      <View style={styles.previewSantaBase} />
      <View style={styles.previewSantaFace} />
      <View style={styles.previewSantaBeard} />
      <View style={[styles.previewSantaCheek, styles.previewSantaCheekLeft]} />
      <View style={[styles.previewSantaCheek, styles.previewSantaCheekRight]} />
      <View style={styles.previewSantaMustacheLeft} />
      <View style={styles.previewSantaMustacheRight} />
      <View style={styles.previewSantaNose} />
      <View style={styles.previewSantaHat} />
      <View style={styles.previewSantaTrim} />
      <View style={styles.previewSantaPom} />
      <View style={[styles.previewFaceWrap, styles.previewHolidayFaceWrap]}>
        <View style={styles.previewEyesRow}>
          {renderEye("left")}
          {renderEye("right")}
        </View>
        {mouthNode}
      </View>
    </View>
  );
}

function PreviewElfHead({
  eyeStyle,
  mouthStyle,
}: {
  eyeStyle: EyeOption["id"];
  mouthStyle: MouthOption["id"];
}) {
  const renderEye = (side: "left" | "right") => {
    const closed = eyeStyle === "happy" || (eyeStyle === "wink" && side === "right");
    if (closed) return <View style={[styles.previewEyeClosed, eyeStyle === "happy" && styles.previewEyeHappy]} />;
    return <View style={styles.previewEye}><View style={styles.previewPupil} /></View>;
  };
  const mouthNode = mouthStyle === "none" ? null : mouthStyle === "surprised" ? <View style={styles.previewMouthSurprised} /> : (
    <View style={[styles.previewMouth, mouthStyle === "grin" && styles.previewMouthGrin, mouthStyle === "angry" && styles.previewMouthAngry]} />
  );
  return (
    <View style={styles.previewHolidayHeadBubble}>
      <View style={styles.previewElfBase} />
      <View style={styles.previewElfFace} />
      <View style={[styles.previewElfEar, styles.previewElfEarLeft]} />
      <View style={[styles.previewElfEar, styles.previewElfEarRight]} />
      <View style={styles.previewElfHat} />
      <View style={styles.previewElfBell} />
      <View style={[styles.previewFaceWrap, styles.previewHolidayFaceWrap]}>
        <View style={styles.previewEyesRow}>
          {renderEye("left")}
          {renderEye("right")}
        </View>
        {mouthNode}
      </View>
    </View>
  );
}

function PreviewSnowmanHead({
  eyeStyle,
  mouthStyle,
}: {
  eyeStyle: EyeOption["id"];
  mouthStyle: MouthOption["id"];
}) {
  const renderEye = (side: "left" | "right") => {
    const closed = eyeStyle === "happy" || (eyeStyle === "wink" && side === "right");
    if (closed) return <View style={[styles.previewEyeClosed, eyeStyle === "happy" && styles.previewEyeHappy]} />;
    return <View style={styles.previewEye}><View style={styles.previewPupil} /></View>;
  };
  const mouthNode = mouthStyle === "none" ? null : mouthStyle === "surprised" ? <View style={styles.previewMouthSurprised} /> : (
    <View style={[styles.previewMouth, mouthStyle === "grin" && styles.previewMouthGrin, mouthStyle === "angry" && styles.previewMouthAngry]} />
  );
  return (
    <View style={styles.previewHolidayHeadBubble}>
      <View style={styles.previewSnowmanBase} />
      <View style={styles.previewSnowmanHatBrim} />
      <View style={styles.previewSnowmanHatTop} />
      <View style={styles.previewSnowmanNose} />
      <View style={[styles.previewFaceWrap, styles.previewHolidayFaceWrap]}>
        <View style={styles.previewEyesRow}>
          {renderEye("left")}
          {renderEye("right")}
        </View>
        {mouthNode}
      </View>
    </View>
  );
}

function ShopWormPreview({
  colors: palette,
  eyeStyle,
  mouthStyle,
  bodyStyle,
  flagSource,
  bodyTextureSource,
  headPreview,
  headType,
}: {
  colors: string[];
  eyeStyle: EyeOption["id"];
  mouthStyle: MouthOption["id"];
  bodyStyle: "circles" | "tube";
  flagSource?: any;
  bodyTextureSource?: any;
  headPreview?: string;
  headType?: string;
}) {
  const { t: previewT } = useTranslation();
  const hasHeadCostume = !!headPreview;
  const isFlagPreview = !!flagSource;
  const segmentSource = flagSource || bodyTextureSource;
  const isJuly4thUncleSam = headType === "july4th2";
  const isElfHead = headType === "santa2";
  const isSnowmanHead = headType === "santa3";
  const [flagPreviewUri, setFlagPreviewUri] = useState<string>("");
  const showsTubeBody = bodyStyle === "tube" || isFlagPreview;
  const flagTextureScale = isFlagPreview && segmentSource ? (FLAG_TEXTURE_SCALES[segmentSource] ?? DEFAULT_FLAG_TEXTURE_SCALE) : 1;
  const flagTextureOffset = isFlagPreview && segmentSource ? (FLAG_TEXTURE_OFFSETS[segmentSource] ?? 0) : 0;
  const baseColor = palette[0] || "#9a9a9a";
  const previewBands = palette.length ? palette : [baseColor];
  const repeatedPreviewBands = Array.from({ length: Math.max(28, previewBands.length * 9) }, (_, index) => (
    previewBands[index % previewBands.length] || baseColor
  ));
  const tubeTop = isFlagPreview ? 42 : 168;
  const tubeHeight = isFlagPreview ? 44 : 124;
  const tubeRadius = tubeHeight / 2;
  const flagHeadSize = tubeHeight + 4;
  const flagTailSize = Math.round(tubeRadius * 2.04);
  const flagTailTop = tubeTop + (tubeHeight - flagTailSize) / 2;
  const previewRadius = 68;
  const circleHeadSize = headType === "santa" ? previewRadius * 2.45 : previewRadius * 2;
  const circleSegmentSize = previewRadius * 2;
  const circleSegmentStep = Math.max(8, Math.round(previewRadius * 0.38));
  const circleBodyTop = 150;
  const circleStartLeft = 16;
  const previewSegments = Array.from({ length: 30 }, (_, index) => ({
    left: circleStartLeft + index * circleSegmentStep,
    color: previewBands[index % previewBands.length] || baseColor,
  }));
  const classicHeadLeft = previewSegments[0].left + (circleSegmentSize - circleHeadSize) / 2;
  const classicHeadTop = circleBodyTop + (circleSegmentSize - circleHeadSize) / 2;

  const renderTubePaletteFill = (roundedStyle: object) => (
    <View style={[styles.previewPaletteFill, roundedStyle]}>
      {repeatedPreviewBands.map((color, index) => (
        <View key={`${color}-${index}`} style={[styles.previewPaletteBand, { backgroundColor: color }]} />
      ))}
    </View>
  );

  const renderEye = (side: "left" | "right") => {
    const closed = eyeStyle === "happy" || (eyeStyle === "wink" && side === "right");
    if (closed) {
      return <View style={[styles.previewEyeClosed, eyeStyle === "happy" && styles.previewEyeHappy]} />;
    }
    return (
      <View style={styles.previewEye}>
        <View style={styles.previewPupil} />
      </View>
    );
  };

  const mouthNode = mouthStyle === "none"
    ? null
    : mouthStyle === "surprised"
      ? <View style={styles.previewMouthSurprised} />
      : (
        <View
          style={[
            styles.previewMouth,
            mouthStyle === "grin" && styles.previewMouthGrin,
            mouthStyle === "angry" && styles.previewMouthAngry,
          ]}
        />
      );

  useEffect(() => {
    if (typeof window === "undefined" || !isFlagPreview || !segmentSource || hasHeadCostume) {
      setFlagPreviewUri("");
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = segmentSource;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1320;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const R = 110;
      const segCount = 26;
      const segGap = 42;
      const startX = 130; // head on the left, like in image #10
      const segments = Array.from({ length: segCount }, (_, index) => ({
        x: startX + index * segGap,
        y: 150,
      }));
      const head = segments[0];
      const tail = segments[segCount - 1];
      const hp = { x: head.x, y: head.y };

      // Body shadow
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(head.x, head.y - R);
      ctx.lineTo(tail.x, tail.y - R);
      ctx.arc(tail.x, tail.y, R, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(head.x, head.y + R);
      ctx.arc(head.x, head.y, R, Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
      ctx.translate(0, R * 0.36);
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.fill();
      ctx.restore();

      // Body — long horizontal pill clipped to flag-texture repeat
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(head.x, head.y - R);
      ctx.lineTo(tail.x, tail.y - R);
      ctx.arc(tail.x, tail.y, R, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(head.x, head.y + R);
      ctx.arc(head.x, head.y, R, Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
      ctx.clip();
      const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
      const texH = R * 2;
      const texW = texH * aspect;
      for (let x = head.x - R; x < tail.x + R; x += texW) {
        ctx.drawImage(img, x, head.y - R, texW, texH);
      }
      // soft bottom shadow + top highlight, like in-game tube shading
      const shadeGrad = ctx.createLinearGradient(0, head.y - R, 0, head.y + R);
      shadeGrad.addColorStop(0, "rgba(255,255,255,0.18)");
      shadeGrad.addColorStop(0.55, "rgba(0,0,0,0)");
      shadeGrad.addColorStop(1, "rgba(0,0,0,0.28)");
      ctx.fillStyle = shadeGrad;
      ctx.fillRect(head.x - R, head.y - R, (tail.x - head.x) + R * 2, R * 2);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(head.x, head.y - R);
      ctx.lineTo(tail.x, tail.y - R);
      ctx.arc(tail.x, tail.y, R, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(head.x, head.y + R);
      ctx.arc(head.x, head.y, R, Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(0,0,0,0.14)";
      ctx.stroke();
      ctx.restore();

      // Head — same code as in-game drawTexturedHeadFace
      ctx.save();
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, R * 0.98, 0, Math.PI * 2);
      ctx.clip();
      ctx.translate(hp.x, hp.y);
      const drawR = R * 1.9;
      ctx.drawImage(img, -drawR * 1.25, -drawR, drawR * 2.5, drawR * 2);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, R * 0.98, 0, Math.PI * 2);
      ctx.clip();
      const headGloss = ctx.createRadialGradient(
        hp.x - R * 0.35, hp.y - R * 0.45, R * 0.12,
        hp.x, hp.y, R * 1.15,
      );
      headGloss.addColorStop(0, "rgba(255,255,255,0.20)");
      headGloss.addColorStop(0.5, "rgba(255,255,255,0.05)");
      headGloss.addColorStop(1, "rgba(0,0,0,0.12)");
      ctx.fillStyle = headGloss;
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, R * 0.98, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      drawPreviewFaceDetails(ctx, hp, R, eyeStyle, mouthStyle);

      setFlagPreviewUri(canvas.toDataURL("image/png"));
    };

    img.onerror = () => setFlagPreviewUri("");
  }, [eyeStyle, mouthStyle, hasHeadCostume, isFlagPreview, segmentSource]);

  return (
    <View style={styles.previewCard}>
      <Text style={styles.previewTitle}>{previewT("wormPreview")}</Text>
      <View style={styles.previewStage}>
        {flagPreviewUri ? (
          <Image source={{ uri: flagPreviewUri }} style={styles.previewCanvasImage} resizeMode="contain" />
        ) : null}
        {!flagPreviewUri && showsTubeBody ? (
          <>
            {isFlagPreview ? (
              <View
                style={[
                  styles.previewFlagTailCap,
                  {
                    top: flagTailTop,
                    width: flagTailSize,
                    height: flagTailSize,
                    borderRadius: flagTailSize / 2,
                  },
                ]}
              >
                <ImageBackground
                  source={segmentSource}
                  resizeMode="repeat"
                  imageStyle={[
                    styles.previewHeadRepeatImage,
                    {
                      transform: [{ scale: flagTextureScale }, { translateX: flagTextureOffset * 24 }],
                    },
                  ]}
                  style={styles.previewHeadBubbleFill}
                />
                <View style={styles.previewFlagTailGloss} />
              </View>
            ) : null}

            <View
              style={[
                styles.previewTube,
                isFlagPreview && styles.previewTubeFlag,
                {
                  top: tubeTop,
                  height: tubeHeight,
                  borderRadius: tubeRadius,
                  backgroundColor: segmentSource ? "transparent" : baseColor,
                },
              ]}
            >
              {segmentSource ? (
                <ImageBackground
                  source={segmentSource}
                  resizeMode={isFlagPreview ? "repeat" : "stretch"}
                  imageStyle={[
                    styles.previewTubeImage,
                    isFlagPreview && styles.previewTubeRepeatImage,
                    isFlagPreview && {
                      transform: [{ scale: flagTextureScale }, { translateX: flagTextureOffset * 100 }],
                    },
                  ]}
                  style={styles.previewTubeFill}
                />
              ) : renderTubePaletteFill(styles.previewTubeImage)}
              <View style={styles.previewTubeShade} />
              <View style={styles.previewTubeHighlight} />
            </View>
          </>
        ) : !flagPreviewUri ? (
          <View style={[styles.previewCircleBody, { top: circleBodyTop, height: circleSegmentSize }]}>
            <View style={styles.previewCircleShadow} />
            {previewSegments.map((segment, index) => (
              <View
                key={`preview-segment-${index}`}
                style={[
                  styles.previewSegment,
                  {
                    left: segment.left,
                    width: circleSegmentSize,
                    height: circleSegmentSize,
                    borderRadius: circleSegmentSize / 2,
                    backgroundColor: segmentSource ? "transparent" : segment.color,
                    zIndex: previewSegments.length - index,
                  },
                ]}
              >
                {segmentSource ? (
                  <ImageBackground
                    source={segmentSource}
                    resizeMode="stretch"
                    imageStyle={styles.previewSegmentImage}
                    style={styles.previewHeadBubbleFill}
                  />
                ) : null}
                <View style={styles.previewHighlight} />
              </View>
            ))}
          </View>
        ) : null}

        {!flagPreviewUri ? (
          <View
            style={[
              styles.previewHead,
              !hasHeadCostume && styles.previewHeadCircleMode,
              isFlagPreview && {
                left: undefined,
                right: 6,
                top: tubeTop - 2,
                width: flagHeadSize,
                height: flagHeadSize,
                zIndex: 20,
              },
              !showsTubeBody && {
                left: classicHeadLeft,
                top: classicHeadTop,
                width: circleHeadSize,
                height: circleHeadSize,
                zIndex: 50,
              },
              showsTubeBody && !isFlagPreview && !hasHeadCostume && {
                left: 20,
                top: tubeTop + (tubeHeight - circleHeadSize) / 2,
                width: circleHeadSize,
                height: circleHeadSize,
                zIndex: 50,
              },
            ]}
          >
            {hasHeadCostume ? (
              <View style={styles.previewHeadCostumeWrap}>
                <View style={styles.previewHeadCostumeGlow} />
                <View style={styles.previewHeadCostumePlate} />
                <Image
                  source={{ uri: headPreview }}
                  style={[styles.previewHeadImage, styles.previewHeadCostume]}
                  resizeMode="contain"
                />
              </View>
            ) : isElfHead ? (
              <PreviewElfHead eyeStyle={eyeStyle} mouthStyle={mouthStyle} />
            ) : isSnowmanHead ? (
              <PreviewSnowmanHead eyeStyle={eyeStyle} mouthStyle={mouthStyle} />
            ) : isJuly4thUncleSam ? (
              <PreviewJuly4th2Head eyeStyle={eyeStyle} mouthStyle={mouthStyle} />
            ) : (
              <View
                style={[
                  styles.previewHeadBubble,
                  {
                    width: isFlagPreview ? flagHeadSize : circleHeadSize,
                    height: isFlagPreview ? flagHeadSize : circleHeadSize,
                    borderRadius: (isFlagPreview ? flagHeadSize : circleHeadSize) / 2,
                  },
                  { backgroundColor: segmentSource ? "transparent" : baseColor },
                  isFlagPreview && styles.previewFlagHeadBubble,
                ]}
              >
                {segmentSource ? (
                  <ImageBackground
                    source={segmentSource}
                    resizeMode={isFlagPreview ? "repeat" : "stretch"}
                    imageStyle={[
                      styles.previewHeadBubbleImage,
                      isFlagPreview && styles.previewHeadRepeatImage,
                      isFlagPreview && {
                        transform: [{ scale: flagTextureScale }, { translateX: flagTextureOffset * 24 }],
                      },
                    ]}
                    style={styles.previewHeadBubbleFill}
                  />
                ) : null}
                <View style={styles.previewFaceWrap}>
                  <View style={styles.previewEyesRow}>
                    {renderEye("left")}
                    {renderEye("right")}
                  </View>
                  {mouthNode}
                </View>
              </View>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function getHeadOptions(): HeadOption[] {
  const base: HeadOption[] = [
    { id: "default", label: "Classique", locked: false },
    { id: "queen", label: "Reine", locked: false, preview: "/heads/queen.png" },
    { id: "king", label: "Roi", locked: false, preview: "/heads/king.png" },
    { id: "dragon", label: "Dragon", locked: false, preview: "/heads/dragon.png", bodyTexture: "/heads/dragon-body.png" },
    { id: "cat", label: "Chat 🐱", locked: false, preview: "/heads/cat.png", bodyTexture: "/heads/cat-body.png" },
    { id: "dog", label: "Chien 🐶", locked: false, preview: "/heads/dog.png", bodyTexture: "/heads/dog-body.png" },
    { id: "panda", label: "Panda 🐼", locked: false, preview: "/heads/panda.png", bodyTexture: "/heads/panda-body.png" },
    { id: "fox", label: "Renard 🦊", locked: false, preview: "/heads/fox.png", bodyTexture: "/heads/fox-body.png" },
    { id: "penguin", label: "Pingouin 🐧", locked: false, preview: "/heads/penguin.png", bodyTexture: "/heads/penguin-body.png" },
    { id: "robot", label: "Robot 🤖", locked: false, preview: "/heads/robot.png", bodyTexture: "/heads/robot-body.png" },
    { id: "alien", label: "Alien 👽", locked: false, preview: "/heads/alien.png", bodyTexture: "/heads/alien-body.png" },
    { id: "ninja", label: "Ninja 🥷", locked: false, preview: "/heads/ninja.png", bodyTexture: "/heads/ninja-body.png" },
  ];
  const eventHeads = GAME_EVENTS.flatMap((e) => {
    const locked = getStorage().getItem(e.unlockKey) !== "true";
    return e.costumes.map((c) => ({
      id: c.id,
      label: `${c.label} ${e.emoji}`,
      locked,
      preview: c.preview,
      bodyTexture: c.bodyTexture,
      unlockKey: e.unlockKey as string | undefined,
      eventId: e.id as string | undefined,
      eventEmoji: e.emoji as string | undefined,
      currencyImage: e.currencyImage as string | undefined,
    }));
  });
  return [...base, ...eventHeads];
}

function isEventHeadOption(option: HeadOption) {
  return !!option.eventId;
}

const FLAG_PRICE = 200;
const DRAGON_PRICE = 2000;
const TUBE_PRICE = 500;

const EYE_OPTIONS: EyeOption[] = [
  { id: "classic", label: "Classiques", preview: "◉ ◉" },
  { id: "angry", label: "Méchants", preview: "⌒ ⌒" },
  { id: "happy", label: "Joyeux", preview: "◡ ◡" },
  { id: "wink", label: "Clin d'œil", preview: "◉ ー" },
];

const MOUTH_OPTIONS: MouthOption[] = [
  { id: "none", label: "Aucune", preview: "·" },
  { id: "smile", label: "Sourire", preview: "◡" },
  { id: "grin", label: "Grand sourire", preview: "ᴗ" },
  { id: "angry", label: "Méchante", preview: "⌣" },
  { id: "surprised", label: "Surprise", preview: "O" },
];

const COLOR_PALETTE = [
  "#ff3366", "#ff6b9d", "#cc0044", "#00ccff", "#0088ff", "#0055cc",
  "#7cff00", "#44cc00", "#228800", "#ff6b35", "#ffaa00", "#cc4400",
  "#cc33ff", "#8833ff", "#6600cc", "#ffd700", "#ffaa00", "#cc8800",
  "#ff1493", "#ff69b4", "#c71585", "#00ff88", "#00cc66", "#009944",
  "#ffffff", "#cccccc", "#888888", "#444444", "#000000", "#e74c3c",
  "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#e91e63",
];

function getAssetUri(source: any): string {
  if (!source) return "";
  if (typeof source === "string") return source;
  if (typeof source?.uri === "string") return source.uri;
  if (typeof source?.default === "string") return source.default;
  try {
    const resolved = Image.resolveAssetSource(source);
    if (resolved?.uri) return resolved.uri;
  } catch {}
  return "";
}

export default function ShopScreen() {
  const { t, i18n } = useTranslation();
  const flagLang = (i18n.language || "fr").split("-")[0];
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isDesktop = width >= 600;
  const contentMaxWidth = 600;
  const previewRowWidth = width - spacing.md * 2;

  const {
    totalCoins: coins,
    eventGems,
    unlockEventCostumeForEvent,
    playerSkin,
    wonEventUnlockKey,
  } = useGameState();

  const [flagSearch, setFlagSearch] = useState("");
  const [headSearch, setHeadSearch] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>(() =>
    playerSkin?.colors?.length ? [...playerSkin.colors] : ["#888888", "#999999", "#888888", "#999999"],
  );
  const [activeSlot, setActiveSlot] = useState(0);
  const [headType, setHeadType] = useState<string>(() => playerSkin?.headType ?? "default");
  const [eyeStyle, setEyeStyle] = useState<EyeOption["id"]>(() => (playerSkin?.eyeStyle as EyeOption["id"]) ?? "classic");
  const [mouthStyle, setMouthStyle] = useState<MouthOption["id"]>(() => (playerSkin?.mouthStyle as MouthOption["id"]) ?? "smile");
  const bodyStyle: "circles" | "tube" = "circles";
  const [selectedFlag, setSelectedFlag] = useState<string | null>(() => (playerSkin?.isFlag && playerSkin?.flagName) ? playerSkin.flagName : null);
  const [activeTab, setActiveTab] = useState<ShopTab>("shop");
  const [selectedFeteEventId, setSelectedFeteEventId] = useState<string | null>(() => {
    const initialHead = playerSkin?.headType;
    if (!initialHead) return null;
    const event = GAME_EVENTS.find((candidate) => candidate.costumes.some((costume) => costume.id === initialHead));
    return event?.id ?? null;
  });

  const [, setUnlockTick] = useState(0);

  const headOptions = useMemo(() => getHeadOptions(), [eventGems, wonEventUnlockKey]);

  const handleUnlockEvent = useCallback((eventId: string, unlockKey: string) => {
    const EVENT_COSTUME_COST = 30;
    const bal = eventGems[eventId] || 0;
    const event = GAME_EVENTS.find((e) => e.id === eventId);
    const icon = event?.emoji || "💎";
    if (bal < EVENT_COSTUME_COST) {
      const msg = `Pas assez de ${icon} ! (${bal}/${EVENT_COSTUME_COST})`;
      if (typeof window !== "undefined") window.alert(msg);
      else Alert.alert(msg);
      return;
    }
    const ok = unlockEventCostumeForEvent(eventId, unlockKey, EVENT_COSTUME_COST);
    if (ok) setUnlockTick((x) => x + 1);
  }, [eventGems, unlockEventCostumeForEvent]);

  const filteredFlags = useMemo(() => {
    const q = flagSearch.trim().toLowerCase();
    if (!q) return FLAG_SKINS;
    return FLAG_SKINS.filter((f) =>
      f.name.toLowerCase().includes(q) || translateFlag(f.name, flagLang).toLowerCase().includes(q)
    );
  }, [flagSearch, flagLang]);

  const baseHeadOptions = useMemo(
    () => headOptions.filter((option) => !isEventHeadOption(option)),
    [headOptions],
  );

  const eventHeadOptions = useMemo(
    () => headOptions.filter((option) => isEventHeadOption(option)),
    [headOptions],
  );

  const visibleFetesEvents = useMemo(
    () => GAME_EVENTS.filter((event) => {
      if ((eventGems[event.id] || 0) > 0) return true;
      return headOptions.some((option) => option.eventId === event.id && !option.locked);
    }),
    [eventGems, headOptions],
  );

  useEffect(() => {
    if (!visibleFetesEvents.length) {
      setSelectedFeteEventId(null);
      return;
    }
    if (selectedFeteEventId && visibleFetesEvents.some((event) => event.id === selectedFeteEventId)) return;
    setSelectedFeteEventId(visibleFetesEvents[0].id);
  }, [selectedFeteEventId, visibleFetesEvents]);

  const filteredHeads = useMemo(
    () => (
      activeTab === "fetes"
        ? eventHeadOptions.filter((option) => option.eventId === selectedFeteEventId)
        : baseHeadOptions
    ),
    [activeTab, baseHeadOptions, eventHeadOptions, selectedFeteEventId],
  );

  const availableHeadIds = useMemo(
    () => filteredHeads.filter((h) => !h.locked).map((h) => h.id),
    [filteredHeads],
  );

  useEffect(() => {
    if (activeTab !== "shop" && activeTab !== "fetes") return;
    if (!availableHeadIds.length) return;
    if (availableHeadIds.includes(headType)) return;
    setHeadType(availableHeadIds[0]);
  }, [activeTab, availableHeadIds, headType]);

  const selectedHeadMeta = useMemo(
    () => headOptions.find((h) => h.id === headType) ?? null,
    [headOptions, headType],
  );

  const cycleHead = useCallback((direction: -1 | 1) => {
    if (availableHeadIds.length === 0) return;
    const currentIndex = availableHeadIds.indexOf(headType);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeIndex + direction + availableHeadIds.length) % availableHeadIds.length;
    setHeadType(availableHeadIds[nextIndex]);
  }, [availableHeadIds, headType]);

  const cycleFlag = useCallback((direction: -1 | 1) => {
    if (filteredFlags.length === 0) return;
    const currentIndex = filteredFlags.findIndex((f) => f.name === selectedFlag);
    const safeIndex = currentIndex >= 0 ? currentIndex : (direction > 0 ? -1 : 0);
    const nextIndex = (safeIndex + direction + filteredFlags.length) % filteredFlags.length;
    const next = filteredFlags[nextIndex];
    setSelectedFlag(next.name);
    setSelectedColors([...next.colors]);
    setHeadType("default");
  }, [filteredFlags, selectedFlag]);

  const computePrice = useCallback(() => {
    if (selectedFlag) return FLAG_PRICE;
    if (headType === "dragon") return DRAGON_PRICE;
    if (bodyStyle === "tube") return TUBE_PRICE;
    return 0;
  }, [selectedFlag, headType, bodyStyle]);

  const getFlagTextureUri = useCallback((flagName: string | null) => {
    if (!flagName) return "";
    return getAssetUri(FLAG_IMAGES[flagName]);
  }, []);

  const handleApply = () => {
    const price = computePrice();
    if (price > 0 && price > coins) return;
    const selectedBodyTexture = selectedFlag
      ? getFlagTextureUri(selectedFlag)
      : (selectedHeadMeta?.bodyTexture ?? selectedHeadMeta?.preview ?? "");
    router.push({
      pathname: "/(shop)/buy-confirm",
      params: {
        price: String(price),
        flag: selectedFlag ?? "",
        bodyTexture: selectedBodyTexture,
        headType,
        eyeStyle,
        mouthStyle,
        bodyStyle,
        colors: JSON.stringify(selectedColors),
      },
    });
  };

  const desktopContainerStyle = isDesktop
    ? { maxWidth: contentMaxWidth, alignSelf: 'center' as const, width: '100%' as any, paddingHorizontal: spacing.md }
    : {};

  const selectedFlagSource = selectedFlag ? FLAG_IMAGES[selectedFlag] : undefined;
  const selectedHeadPreview = selectedHeadMeta && !DEFAULT_FACE_HEAD_TYPES.has(selectedHeadMeta.id)
    ? selectedHeadMeta.preview
    : undefined;
  const selectedHeadBodySource = (selectedHeadMeta?.bodyTexture || selectedHeadMeta?.preview)
    ? { uri: selectedHeadMeta.bodyTexture ?? selectedHeadMeta.preview! }
    : undefined;
  const selectedEvent = useMemo(() => {
    if (activeTab === "fetes" && selectedFeteEventId) {
      return GAME_EVENTS.find((event) => event.id === selectedFeteEventId) ?? null;
    }
    return selectedHeadMeta?.eventId ? GAME_EVENTS.find((event) => event.id === selectedHeadMeta.eventId) ?? null : null;
  }, [activeTab, selectedFeteEventId, selectedHeadMeta]);
  const selectedEventBalance = selectedEvent ? (eventGems[selectedEvent.id] || 0) : 0;
  const selectedEyeMeta = EYE_OPTIONS.find((option) => option.id === eyeStyle) ?? EYE_OPTIONS[0];
  const selectedMouthMeta = MOUTH_OPTIONS.find((option) => option.id === mouthStyle) ?? MOUTH_OPTIONS[0];
  const previewLabel = activeTab === "shop" || activeTab === "fetes"
    ? (selectedHeadMeta?.label ?? "Classique")
    : activeTab === "flags"
      ? (selectedFlag ? translateFlag(selectedFlag, flagLang) : null)
      : activeTab === "eyes"
        ? selectedEyeMeta.label
        : selectedMouthMeta.label;
  const showCycleArrows = activeTab === "shop" || activeTab === "fetes" || activeTab === "flags";
  const cycleDisabled = activeTab === "shop" || activeTab === "fetes"
    ? availableHeadIds.length === 0
    : filteredFlags.length === 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.bgOrbA} />
      <View style={styles.bgOrbB} />
      <View style={desktopContainerStyle}>
      {/* Coin Balance */}
      <View style={styles.coinBar}>
        <Text style={styles.coinText}>{"\u{1FA99}"} {coins}</Text>
      </View>

      <View style={[styles.topRow, isDesktop && { width: previewRowWidth, alignSelf: "center" }]}>
        <View style={styles.flagTabsTop}>
          {SHOP_TAB_ORDER.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.flagTab, isActive && styles.flagTabActive]}
              >
                <Text style={[styles.flagTabText, isActive && styles.flagTabTextActive]}>
                  {tab === "fetes" ? t("fetesTab") : SHOP_TAB_LABELS[tab]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeTab === "shop" && (
          <View style={styles.colorColumn}>
            <Text style={styles.colorColumnTitle}>{t("shopColors")}</Text>
            <View style={styles.slotRow}>
              {selectedColors.map((c, i) => (
                <Pressable
                  key={i}
                  onPress={() => setActiveSlot(i)}
                  style={[
                    styles.slotBtn,
                    { backgroundColor: c },
                    activeSlot === i && styles.slotBtnActive,
                  ]}
                />
              ))}
            </View>
            <View style={styles.paletteGrid}>
              {COLOR_PALETTE.map((c, i) => (
                <Pressable
                  key={`${c}-${i}`}
                  onPress={() => {
                    setSelectedFlag(null);
                    const next = [...selectedColors];
                    next[activeSlot] = c;
                    setSelectedColors(next);
                  }}
                  style={[styles.paletteColor, { backgroundColor: c }]}
                />
              ))}
            </View>
          </View>
        )}
        {activeTab === "eyes" && (
          <View style={styles.colorColumn}>
            <Text style={styles.colorColumnTitle}>Yeux</Text>
            <View style={styles.faceGrid}>
              {EYE_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => setEyeStyle(option.id)}
                  style={[
                    styles.faceOption,
                    styles.faceOptionGrid,
                    eyeStyle === option.id && styles.faceOptionSelected,
                  ]}
                >
                  <Text style={styles.facePreview}>{option.preview}</Text>
                  <Text style={[styles.faceLabel, eyeStyle === option.id && styles.faceLabelSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        {activeTab === "mouths" && (
          <View style={styles.colorColumn}>
            <Text style={styles.colorColumnTitle}>Bouches</Text>
            <View style={styles.faceGrid}>
              {MOUTH_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => setMouthStyle(option.id)}
                  style={[
                    styles.faceOption,
                    styles.faceOptionGrid,
                    mouthStyle === option.id && styles.faceOptionSelected,
                  ]}
                >
                  <Text style={styles.facePreview}>{option.preview}</Text>
                  <Text style={[styles.faceLabel, mouthStyle === option.id && styles.faceLabelSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        <View style={styles.previewNavCenter}>
          <ShopWormPreview
            colors={selectedColors}
            eyeStyle={eyeStyle}
            mouthStyle={mouthStyle}
            bodyStyle={bodyStyle}
            flagSource={selectedFlagSource}
            bodyTextureSource={activeTab === "shop" || activeTab === "fetes" ? selectedHeadBodySource : undefined}
            headPreview={activeTab === "shop" || activeTab === "fetes" ? selectedHeadPreview : undefined}
            headType={activeTab === "shop" || activeTab === "fetes" ? selectedHeadMeta?.id : undefined}
          />
          {previewLabel ? <Text style={styles.previewCostumeName}>{previewLabel}</Text> : null}
          {showCycleArrows ? (
            <>
              <Pressable
                onPress={() => activeTab === "shop" || activeTab === "fetes" ? cycleHead(-1) : cycleFlag(-1)}
                style={[
                  styles.costumeArrowBtn,
                  styles.costumeArrowBtnLeft,
                  cycleDisabled && styles.costumeArrowBtnDisabled,
                ]}
                disabled={cycleDisabled}
              >
                <Text style={styles.costumeArrowText}>‹</Text>
              </Pressable>
              <Pressable
                onPress={() => activeTab === "shop" || activeTab === "fetes" ? cycleHead(1) : cycleFlag(1)}
                style={[
                  styles.costumeArrowBtn,
                  styles.costumeArrowBtnRight,
                  cycleDisabled && styles.costumeArrowBtnDisabled,
                ]}
                disabled={cycleDisabled}
              >
                <Text style={styles.costumeArrowText}>›</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </View>

      {(activeTab === "shop" || activeTab === "fetes") && (
        <>
          <Text style={styles.sectionTitle}>{activeTab === "fetes" ? "Fêtes" : t("shopHead")}</Text>
          {activeTab === "fetes" ? (
            <>
              {selectedEvent ? (
                <View style={[styles.eventFeatureCard, { borderColor: selectedEvent.borderColor }]}>
                  <View style={[styles.eventFeatureGlow, { backgroundColor: selectedEvent.borderColor }]} />
                  <View style={styles.eventFeatureHeader}>
                    <View style={styles.eventFeatureTitleWrap}>
                      <Text style={styles.eventFeatureEmoji}>{selectedEvent.emoji}</Text>
                      <View style={styles.eventFeatureTextWrap}>
                        <Text style={styles.eventFeatureTitle}>{selectedEvent.label}</Text>
                        <Text style={styles.eventFeatureSubtitle}>
                          Costume sélectionné: {selectedHeadMeta?.label ?? "Aucun"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.eventFeatureBadge}>
                      <Text style={styles.eventFeatureBadgeText}>
                        {selectedHeadMeta?.locked ? "À débloquer" : "Débloqué"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.eventFeatureMetaRow}>
                    <View style={styles.eventFeatureCurrencyCard}>
                      {selectedEvent.currencyImage ? (
                        <Image source={{ uri: selectedEvent.currencyImage }} style={styles.eventFeatureCurrencyIcon} resizeMode="contain" />
                      ) : (
                        <Text style={styles.eventFeatureCurrencyEmoji}>{selectedEvent.emoji}</Text>
                      )}
                      <View>
                        <Text style={styles.eventFeatureMetaLabel}>Solde événement</Text>
                        <Text style={styles.eventFeatureMetaValue}>{selectedEventBalance}</Text>
                      </View>
                    </View>
                    <View style={styles.eventFeatureUnlockCard}>
                      <Text style={styles.eventFeatureMetaLabel}>Déblocage</Text>
                      <Text style={styles.eventFeatureMetaValue}>30</Text>
                    </View>
                  </View>
                </View>
              ) : null}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {visibleFetesEvents.map(e => (
                    <Pressable
                      key={e.id}
                      onPress={() => {
                        setSelectedFeteEventId(e.id);
                        const firstHeadForEvent = headOptions.find((option) => option.eventId === e.id);
                        if (firstHeadForEvent) setHeadType(firstHeadForEvent.id);
                      }}
                      style={[
                        styles.gemsBar,
                        selectedEvent?.id === e.id && styles.gemsBarActive,
                        { borderColor: selectedEvent?.id === e.id ? e.borderColor : "rgba(147,197,253,0.3)" },
                      ]}
                    >
                      {e.currencyImage ? (
                        <Image source={{ uri: e.currencyImage }} style={{ width: 22, height: 22 }} resizeMode="contain" />
                      ) : (
                        <Text style={styles.gemsText}>{e.emoji}</Text>
                      )}
                      <Text style={styles.gemsText}>{eventGems[e.id] || 0}</Text>
                      <Text style={styles.gemsMiniLabel}>{e.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
              {!!selectedHeadMeta?.locked && (
                <Pressable
                  onPress={() => {
                    if (selectedHeadMeta.unlockKey && selectedHeadMeta.eventId) {
                      handleUnlockEvent(selectedHeadMeta.eventId, selectedHeadMeta.unlockKey);
                    }
                  }}
                  style={[styles.lockedCostumeCard, selectedEvent && { borderColor: selectedEvent.borderColor }]}
                >
                  <View style={styles.lockedCostumeHeader}>
                    <Text style={styles.lockedCostumePill}>Débloquer</Text>
                    <Text style={styles.lockedCostumeCost}>
                      {selectedHeadMeta.currencyImage ? "30" : `${selectedHeadMeta.eventEmoji || "💎"} 30`}
                    </Text>
                  </View>
                  <Text style={styles.lockedCostumeTitle}>{selectedHeadMeta.label}</Text>
                  <Text style={styles.lockedCostumeSubtitle}>
                    Utilise la monnaie de l’événement pour débloquer ce costume de fête.
                  </Text>
                </Pressable>
              )}
            </>
          ) : null}

        </>
      )}


      {/* Apply Button */}
      <View style={{ marginTop: spacing.lg, alignItems: "center", gap: 6 }}>
        {computePrice() > 0 && (
          <Text style={{ color: "#ffd700", fontSize: 14, fontWeight: "800" }}>
            💰 {computePrice()} 🪙
          </Text>
        )}
        <Pressable
          onPress={handleApply}
          style={computePrice() > coins && styles.applyBtnDisabled}
        >
          <Image source={require("../../assets/buy-btn.png")} style={{ width: 140, height: 50 }} resizeMode="contain" />
        </Pressable>
      </View>

      <View style={{ height: spacing.xxl }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  bgOrbA: {
    position: "absolute",
    top: -60,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(120,226,214,0.18)",
  },
  bgOrbB: {
    position: "absolute",
    top: 120,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,221,140,0.16)",
  },
  coinBar: {
    alignSelf: "center",
    backgroundColor: "rgba(246,196,83,0.20)",
    borderWidth: 1,
    borderColor: "rgba(255,226,150,0.38)",
    borderRadius: 30,
    borderCurve: "continuous",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  previewCard: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 22,
    borderCurve: "continuous",
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginBottom: spacing.md,
    boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
  },
  previewTitle: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  previewStage: {
    height: 460,
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  previewCanvasImage: {
    alignSelf: "center",
    width: 1100,
    height: 250,
    maxWidth: "100%",
  },
  previewTube: {
    position: "absolute",
    left: 20,
    right: 14,
    top: 38,
    height: 50,
    borderRadius: 25,
    borderCurve: "continuous",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.18)",
    boxShadow: "0 10px 22px rgba(0,0,0,0.25)",
  },
  previewTubeFlag: {
    left: 30,
    right: 20,
    borderWidth: 0,
    boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
  },
  previewFlagTailCap: {
    position: "absolute",
    left: 18,
    overflow: "hidden",
    boxShadow: "0 5px 10px rgba(0,0,0,0.14)",
  },
  previewFlagTailGloss: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  previewTubeFill: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  previewTubeImage: {
    borderRadius: 25,
  },
  previewTubeRepeatImage: {
    borderRadius: 25,
  },
  previewPaletteFill: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
  },
  previewPaletteBand: {
    width: 17,
    height: "100%",
  },
  previewTubeShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 13,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  previewTubeHighlight: {
    position: "absolute",
    left: 16,
    right: 24,
    top: 5,
    height: 6,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  previewHead: {
    position: "absolute",
    left: 2,
    top: 16,
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  previewHeadCircleMode: {
    left: 0,
    top: 32,
    width: 60,
    height: 60,
    zIndex: 20,
  },
  previewHeadImage: {
    width: "100%",
    height: "100%",
  },
  previewHeadBubble: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.18)",
    boxShadow: "0 5px 10px rgba(0,0,0,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewFlagHeadBubble: {
    borderWidth: 0,
    boxShadow: "0 4px 10px rgba(0,0,0,0.14)",
  },
  previewJulyHeadBubble: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 5px 10px rgba(0,0,0,0.22)",
    backgroundColor: "#3c3b6e",
  },
  previewHolidayHeadBubble: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 5px 10px rgba(0,0,0,0.22)",
  },
  previewHolidayFaceWrap: {
    zIndex: 4,
  },
  previewSantaBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#d22f2f",
  },
  previewSantaFace: {
    position: "absolute",
    top: 15,
    width: 46,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f2cfb3",
    zIndex: 1,
  },
  previewSantaBeard: {
    position: "absolute",
    bottom: 3,
    width: 60,
    height: 34,
    borderRadius: 24,
    backgroundColor: "#fff",
    zIndex: 2,
  },
  previewSantaCheek: {
    position: "absolute",
    top: 35,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(231,144,144,0.6)",
    zIndex: 3,
  },
  previewSantaCheekLeft: {
    left: 24,
  },
  previewSantaCheekRight: {
    right: 24,
  },
  previewSantaMustacheLeft: {
    position: "absolute",
    top: 43,
    left: 27,
    width: 18,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#fff",
    transform: [{ rotate: "14deg" }],
    zIndex: 3,
  },
  previewSantaMustacheRight: {
    position: "absolute",
    top: 43,
    right: 27,
    width: 18,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#fff",
    transform: [{ rotate: "-14deg" }],
    zIndex: 3,
  },
  previewSantaNose: {
    position: "absolute",
    top: 39,
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#e7b596",
    zIndex: 4,
  },
  previewSantaHat: {
    position: "absolute",
    top: 1,
    left: 2,
    width: 78,
    height: 34,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 22,
    backgroundColor: "#d92f2f",
    transform: [{ rotate: "-10deg" }],
    zIndex: 2,
  },
  previewSantaTrim: {
    position: "absolute",
    top: 22,
    width: 78,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#fff",
    zIndex: 3,
  },
  previewSantaPom: {
    position: "absolute",
    right: 2,
    top: 4,
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: "#fff",
    zIndex: 3,
  },
  previewElfBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#27a156",
  },
  previewElfFace: {
    position: "absolute",
    top: 20,
    width: 54,
    height: 46,
    borderRadius: 24,
    backgroundColor: "#f3d7be",
    zIndex: 1,
  },
  previewElfEar: {
    position: "absolute",
    top: 34,
    width: 18,
    height: 18,
    backgroundColor: "#f3d7be",
    zIndex: 0,
  },
  previewElfEarLeft: {
    left: 8,
    transform: [{ rotate: "-38deg" }],
  },
  previewElfEarRight: {
    right: 8,
    transform: [{ rotate: "38deg" }],
  },
  previewElfHat: {
    position: "absolute",
    top: 5,
    left: 9,
    width: 70,
    height: 28,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 26,
    borderBottomRightRadius: 16,
    backgroundColor: "#cf3434",
    transform: [{ rotate: "-12deg" }],
    zIndex: 2,
  },
  previewElfBell: {
    position: "absolute",
    right: 10,
    top: 20,
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#f4cf57",
    zIndex: 3,
  },
  previewSnowmanBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#eef4fb",
  },
  previewSnowmanHatBrim: {
    position: "absolute",
    top: 12,
    width: 40,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#171717",
    zIndex: 3,
  },
  previewSnowmanHatTop: {
    position: "absolute",
    top: 2,
    width: 24,
    height: 16,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: "#171717",
    zIndex: 3,
  },
  previewSnowmanNose: {
    position: "absolute",
    top: 46,
    left: 47,
    width: 18,
    height: 8,
    backgroundColor: "#ff8a1d",
    transform: [{ rotate: "10deg" }],
    zIndex: 5,
  },
  previewJulyHeadBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#3c3b6e",
  },
  previewJulyStripeWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 32,
  },
  previewJulyStripe: {
    flex: 1,
  },
  previewJulyBluePatch: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 46,
    height: 40,
    backgroundColor: "#27468d",
  },
  previewJulyGlow: {
    position: "absolute",
    left: 12,
    top: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  previewJulyStarsRow: {
    position: "absolute",
    left: 5,
    top: 5,
    width: 40,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  previewJulyStar: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
  },
  previewJulyBrowsRow: {
    position: "absolute",
    top: 32,
    width: 44,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  previewJulyBrow: {
    width: 16,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#f7f3ea",
  },
  previewJulyBrowLeft: {
    transform: [{ rotate: "-14deg" }],
  },
  previewJulyBrowRight: {
    transform: [{ rotate: "14deg" }],
  },
  previewJulyBeard: {
    position: "absolute",
    bottom: 10,
    width: 18,
    height: 12,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: "#f7f3ea",
  },
  previewHeadBubbleFill: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  previewHeadBubbleImage: {
    borderRadius: 44,
  },
  previewHeadRepeatImage: {
    borderRadius: 44,
  },
  previewNavRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  previewNavCenter: {
    flex: 1,
    position: "relative",
  },
  previewCircleBody: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 26,
    height: 64,
  },
  previewCircleShadow: {
    position: "absolute",
    left: 18,
    right: 28,
    bottom: 3,
    height: 10,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  previewCostumeName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
    marginTop: spacing.sm,
  },
  previewSegment: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderCurve: "continuous",
    overflow: "hidden",
    borderWidth: 0,
    borderColor: "transparent",
    boxShadow: "0 5px 10px rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewSegmentImage: {
    borderRadius: 24,
  },
  previewBodyTextureImage: {
    transform: [{ scale: 1.1 }],
  },
  previewHeadShell: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    boxShadow: "none",
  },
  previewHeadShellBase: {
    backgroundColor: "#9a9a9a",
  },
  previewHighlight: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 14,
    height: 7,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  previewFaceWrap: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  previewHeadCostume: {
    width: "126%",
    height: "126%",
    transform: [{ translateX: -10 }, { translateY: 4 }],
  },
  previewHeadCostumeWrap: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  previewHeadCostumeGlow: {
    position: "absolute",
    width: "92%",
    height: "92%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
  },
  previewHeadCostumePlate: {
    position: "absolute",
    width: "82%",
    height: "82%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  previewEyesRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  previewEye: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  previewPupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#111",
  },
  previewEyeClosed: {
    width: 12,
    height: 3,
    borderRadius: 4,
    backgroundColor: "#111",
  },
  previewEyeHappy: {
    transform: [{ rotate: "8deg" }],
  },
  previewMouth: {
    width: 18,
    height: 8,
    borderBottomWidth: 2,
    borderColor: "#111",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: 5,
  },
  previewMouthGrin: {
    width: 20,
    height: 10,
    borderBottomWidth: 3,
  },
  previewMouthAngry: {
    transform: [{ rotate: "180deg" }],
  },
  previewMouthSurprised: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#111",
    marginTop: 5,
  },
  coinText: {
    color: colors.gold,
    fontWeight: "700",
    fontSize: 20,
    fontVariant: ["tabular-nums"],
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 18,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  searchInput: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 12,
    borderCurve: "continuous",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  gemsBar: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(147,197,253,0.12)", borderRadius: 14,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1, borderColor: "rgba(147,197,253,0.3)",
  },
  gemsBarActive: {
    backgroundColor: "rgba(255,255,255,0.16)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
  },
  gemsText: {
    color: "#60a5fa", fontSize: 18, fontWeight: "800",
  },
  gemsMiniLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "700",
  },
  gemsHint: {
    color: colors.textSecondary, fontSize: 12,
  },
  eventFeatureCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 22,
    borderCurve: "continuous",
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: "rgba(20,34,28,0.92)",
    borderWidth: 1,
    boxShadow: "0 14px 30px rgba(0,0,0,0.22)",
  },
  eventFeatureGlow: {
    position: "absolute",
    right: -34,
    top: -34,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.16,
  },
  eventFeatureHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  eventFeatureTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  eventFeatureEmoji: {
    fontSize: 28,
  },
  eventFeatureTextWrap: {
    flex: 1,
  },
  eventFeatureTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  eventFeatureSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  eventFeatureBadge: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  eventFeatureBadgeText: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  eventFeatureMetaRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  eventFeatureCurrencyCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  eventFeatureUnlockCard: {
    minWidth: 100,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  eventFeatureCurrencyIcon: {
    width: 34,
    height: 34,
  },
  eventFeatureCurrencyEmoji: {
    fontSize: 26,
  },
  eventFeatureMetaLabel: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  eventFeatureMetaValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2,
  },
  costumeArrowBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderCurve: "continuous",
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
  },
  costumeArrowBtnLeft: {
    position: "absolute",
    left: 8,
    top: "50%",
    marginTop: -20,
    zIndex: 30,
  },
  costumeArrowBtnRight: {
    position: "absolute",
    right: 8,
    top: "50%",
    marginTop: -20,
    zIndex: 30,
  },
  costumeArrowBtnDisabled: {
    opacity: 0.45,
  },
  costumeArrowText: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 30,
  },
  lockedCostumeCard: {
    borderRadius: 16,
    borderCurve: "continuous",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    boxShadow: "0 10px 22px rgba(0,0,0,0.16)",
  },
  lockedCostumeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  lockedCostumePill: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  lockedCostumeCost: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  lockedCostumeTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  lockedCostumeSubtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  lockedCostumeText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  optionRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  faceOption: {
    minWidth: 96,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "rgba(39,71,99,0.94)",
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    marginRight: spacing.sm,
  },
  faceOptionSelected: {
    borderColor: colors.gold,
    backgroundColor: "rgba(255,215,0,0.15)",
  },
  faceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  faceOptionGrid: {
    width: 112,
    minWidth: 112,
    marginRight: 0,
  },
  facePreview: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  faceLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  faceLabelSelected: {
    color: colors.gold,
  },
  toggleRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: "rgba(255,215,0,0.2)",
    borderColor: colors.gold,
  },
  toggleText: {
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
  toggleTextActive: {
    color: colors.gold,
  },
  colorColumn: {
    width: 232,
    flexDirection: "column",
  },
  colorColumnTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 17,
    marginBottom: spacing.sm,
  },
  slotRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  slotBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderCurve: "continuous",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  slotBtnActive: {
    borderColor: colors.gold,
    boxShadow: "0 0 10px rgba(255,215,0,0.5)",
  },
  paletteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: spacing.sm,
  },
  paletteColor: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  flagTabsTop: {
    width: 76,
    flexDirection: "column",
    gap: 6,
  },
  flagSectionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  flagTabs: {
    width: 100,
    flexDirection: "column",
    gap: 6,
  },
  flagTab: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderCurve: "continuous",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  flagTabActive: {
    backgroundColor: "rgba(246,196,83,0.18)",
    borderColor: colors.gold,
  },
  flagTabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  flagTabTextActive: {
    color: colors.gold,
  },
  applyBtn: {
    marginTop: spacing.lg,
    paddingVertical: 14,
    borderRadius: 30,
    borderCurve: "continuous",
    alignItems: "center",
    backgroundColor: colors.primary,
    boxShadow: "0 6px 18px rgba(255,122,89,0.28)",
  },
  applyBtnDisabled: {
    opacity: 0.5,
  },
  applyBtnText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 17,
    fontVariant: ["tabular-nums"],
  },
});
