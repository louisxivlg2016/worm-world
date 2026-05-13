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

type ShopTab = "shop" | "all" | "europe" | "ameriques" | "asie" | "afrique" | "oceanie" | "moyenorient";
type FlagRegion = Exclude<ShopTab, "shop">;

const SHOP_TAB_LABELS: Record<ShopTab, string> = {
  shop: "Boutique",
  all: "Tous",
  europe: "Europe",
  ameriques: "Amériques",
  asie: "Asie",
  afrique: "Afrique",
  oceanie: "Océanie",
  moyenorient: "Moyen-Orient",
};

const SHOP_TAB_ORDER: ShopTab[] = [
  "shop", "all", "europe", "ameriques", "asie", "afrique", "moyenorient", "oceanie",
];

const FLAG_REGION_MAP: Record<string, Exclude<FlagRegion, "all">> = {
  France: "europe", Allemagne: "europe", Italie: "europe", Espagne: "europe",
  Portugal: "europe", "Royaume-Uni": "europe", Belgique: "europe", "Pays-Bas": "europe",
  Suisse: "europe", Suede: "europe", Pologne: "europe", Ukraine: "europe",
  Grece: "europe", Roumanie: "europe", Irlande: "europe", Croatie: "europe",
  Norvege: "europe", Danemark: "europe", Finlande: "europe", Russie: "europe",
  USA: "ameriques", Canada: "ameriques", Mexique: "ameriques", Bresil: "ameriques",
  Argentine: "ameriques", Colombie: "ameriques", Chili: "ameriques", Perou: "ameriques",
  Jamaique: "ameriques", Haiti: "ameriques", Cuba: "ameriques",
  Japon: "asie", Chine: "asie", "Coree du Sud": "asie", Inde: "asie",
  Pakistan: "asie", Indonesie: "asie", Philippines: "asie", Vietnam: "asie",
  Thailande: "asie",
  Maroc: "afrique", Algerie: "afrique", Tunisie: "afrique", Egypte: "afrique",
  Senegal: "afrique", Nigeria: "afrique", "Afrique du Sud": "afrique",
  Cameroun: "afrique", Ghana: "afrique", Congo: "afrique", Ethiopie: "afrique",
  Kenya: "afrique",
  Australie: "oceanie", "Nouvelle-Zelande": "oceanie",
  Turquie: "moyenorient", Iran: "moyenorient", "Arabie Saoudite": "moyenorient",
  Israel: "moyenorient", Palestine: "moyenorient", "Emirats Arabes Unis": "moyenorient",
};

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

function ShopWormPreview({
  colors: palette,
  eyeStyle,
  mouthStyle,
  bodyStyle,
  flagSource,
  bodyTextureSource,
  headPreview,
}: {
  colors: string[];
  eyeStyle: EyeOption["id"];
  mouthStyle: MouthOption["id"];
  bodyStyle: "circles" | "tube";
  flagSource?: any;
  bodyTextureSource?: any;
  headPreview?: string;
}) {
  const hasHeadCostume = !!headPreview;
  const isFlagPreview = !!flagSource;
  const segmentSource = flagSource || bodyTextureSource;
  const [flagPreviewUri, setFlagPreviewUri] = useState<string>("");
  const showsTubeBody = bodyStyle === "tube" || isFlagPreview;
  const flagTextureScale = isFlagPreview && segmentSource ? (FLAG_TEXTURE_SCALES[segmentSource] ?? DEFAULT_FLAG_TEXTURE_SCALE) : 1;
  const flagTextureOffset = isFlagPreview && segmentSource ? (FLAG_TEXTURE_OFFSETS[segmentSource] ?? 0) : 0;
  const baseColor = palette[0] || "#9a9a9a";
  const previewBands = palette.length ? palette : [baseColor];
  const repeatedPreviewBands = Array.from({ length: Math.max(28, previewBands.length * 9) }, (_, index) => (
    previewBands[index % previewBands.length] || baseColor
  ));
  const tubeTop = isFlagPreview ? 42 : 38;
  const tubeHeight = isFlagPreview ? 44 : 50;
  const tubeRadius = tubeHeight / 2;
  const flagHeadSize = tubeHeight + 4;
  const flagTailSize = Math.round(tubeRadius * 2.04);
  const flagTailTop = tubeTop + (tubeHeight - flagTailSize) / 2;
  const previewRadius = segmentSource ? 26 : 24;
  const circleHeadSize = previewRadius * 2;
  const circleSegmentSize = previewRadius * 2;
  const circleSegmentStep = Math.max(8, Math.round(previewRadius * 0.38));
  const circleBodyTop = 26;
  const circleStartLeft = 16;
  const previewSegments = Array.from({ length: 30 }, (_, index) => ({
    left: circleStartLeft + index * circleSegmentStep,
    color: previewBands[index % previewBands.length] || baseColor,
  }));
  const classicHeadLeft = previewSegments[previewSegments.length - 1].left + (circleSegmentSize - circleHeadSize) / 2;
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
      canvas.width = 340;
      canvas.height = 140;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const points = Array.from({ length: 16 }, (_, index) => ({
        x: 286 - index * 17,
        y: 65,
      }));
      const head = { x: 314, y: 64 };
      const R = 23;

      const lengths = [0];
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        lengths.push(lengths[lengths.length - 1] + Math.sqrt(dx * dx + dy * dy));
      }

      const normals = points.map((_, i) => {
        let dx = 0;
        let dy = 0;
        const range = 3;
        for (let j = Math.max(0, i - range); j < Math.min(points.length - 1, i + range); j++) {
          dx += points[j + 1].x - points[j].x;
          dy += points[j + 1].y - points[j].y;
        }
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        return { nx: -dy / len, ny: dx / len };
      });

      const upper = points.map((p, i) => ({ x: p.x + normals[i].nx * R, y: p.y + normals[i].ny * R }));
      const lower = points.map((p, i) => ({ x: p.x - normals[i].nx * R, y: p.y - normals[i].ny * R }));

      const drawSmoothCurve = (curvePoints: { x: number; y: number }[]) => {
        if (curvePoints.length < 2) return;
        ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
        for (let i = 0; i < curvePoints.length - 1; i++) {
          const cx = (curvePoints[i].x + curvePoints[i + 1].x) / 2;
          const cy = (curvePoints[i].y + curvePoints[i + 1].y) / 2;
          ctx.quadraticCurveTo(curvePoints[i].x, curvePoints[i].y, cx, cy);
        }
        const last = curvePoints[curvePoints.length - 1];
        ctx.lineTo(last.x, last.y);
      };

      const traceTubePath = () => {
        ctx.beginPath();
        drawSmoothCurve(upper);
        const tail = points[points.length - 1];
        ctx.arc(
          tail.x,
          tail.y,
          R,
          Math.atan2(upper[upper.length - 1].y - tail.y, upper[upper.length - 1].x - tail.x),
          Math.atan2(lower[lower.length - 1].y - tail.y, lower[lower.length - 1].x - tail.x),
        );
        drawSmoothCurve([...lower].reverse());
        ctx.arc(
          head.x,
          head.y,
          R,
          Math.atan2(lower[0].y - head.y, lower[0].x - head.x),
          Math.atan2(upper[0].y - head.y, upper[0].x - head.x),
        );
        ctx.closePath();
      };

      const repeatScreenWidth = Math.max(R * 2.08 * (img.naturalWidth / img.naturalHeight), R * 3.6);
      const repeatTextureWidth = img.naturalWidth;

      ctx.save();
      traceTubePath();
      ctx.clip();

      for (let i = 0; i < points.length - 1; i++) {
        const p = points[i];
        const next = points[i + 1];
        const dx = next.x - p.x;
        const dy = next.y - p.y;
        const sliceLen = Math.max(1, Math.sqrt(dx * dx + dy * dy) + R * 0.85);
        const angle = Math.atan2(dy, dx);
        const sx = (lengths[i] / repeatScreenWidth) * repeatTextureWidth;
        const sw = Math.max(1, (sliceLen / repeatScreenWidth) * repeatTextureWidth);
        ctx.save();
        ctx.translate((p.x + next.x) * 0.5, (p.y + next.y) * 0.5);
        ctx.rotate(angle);
        ctx.drawImage(
          img,
          sx,
          0,
          sw,
          img.naturalHeight,
          -sliceLen / 2,
          -R * 1.04,
          sliceLen,
          R * 2.08,
        );
        ctx.restore();
      }
      ctx.restore();

      const shine = ctx.createLinearGradient(0, 40, 0, 92);
      shine.addColorStop(0, "rgba(255,255,255,0.22)");
      shine.addColorStop(0.28, "rgba(255,255,255,0.08)");
      shine.addColorStop(0.55, "rgba(255,255,255,0)");
      shine.addColorStop(1, "rgba(0,0,0,0.18)");
      ctx.save();
      traceTubePath();
      ctx.clip();
      ctx.fillStyle = shine;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(head.x, head.y, R * 0.98, 0, Math.PI * 2);
      ctx.clip();
      const drawR = R * 1.9;
      ctx.drawImage(img, head.x - drawR * 1.25, head.y - drawR, drawR * 2.5, drawR * 2);
      ctx.restore();

      const eyeR = R * 0.32;
      const pupilR = eyeR * 0.55;
      const eyeSpacing = R * 0.35;
      const eyeY = head.y - R * 0.1;
      [-1, 1].forEach((side) => {
        const ex = head.x + side * eyeSpacing;
        ctx.beginPath();
        ctx.arc(ex, eyeY, eyeR, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex, eyeY, pupilR, 0, Math.PI * 2);
        ctx.fillStyle = "#111";
        ctx.fill();
      });
      ctx.beginPath();
      ctx.lineWidth = Math.max(2, R * 0.1);
      ctx.lineCap = "round";
      ctx.strokeStyle = "#111";
      ctx.moveTo(head.x - R * 0.3, head.y + R * 0.4);
      ctx.quadraticCurveTo(head.x, head.y + R * 0.56, head.x + R * 0.3, head.y + R * 0.4);
      ctx.stroke();

      setFlagPreviewUri(canvas.toDataURL("image/png"));
    };

    img.onerror = () => setFlagPreviewUri("");
  }, [hasHeadCostume, isFlagPreview, segmentSource]);

  return (
    <View style={styles.previewCard}>
      <Text style={styles.previewTitle}>Aperçu du ver</Text>
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
        ) : (
          <View style={styles.previewCircleBody}>
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
                    zIndex: index + 1,
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
        )}

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
              },
            ]}
          >
            {hasHeadCostume ? (
              <Image
                source={{ uri: headPreview }}
                style={styles.previewHeadImage}
                resizeMode="contain"
              />
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

  const { totalCoins: coins, eventGems, unlockEventCostumeForEvent, playerSkin } = useGameState();

  const [flagSearch, setFlagSearch] = useState("");
  const [headSearch, setHeadSearch] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>(() =>
    playerSkin?.colors?.length ? [...playerSkin.colors] : ["#888888", "#999999", "#888888", "#999999"],
  );
  const [activeSlot, setActiveSlot] = useState(0);
  const [headType, setHeadType] = useState<string>(() => playerSkin?.headType ?? "default");
  const [eyeStyle, setEyeStyle] = useState<EyeOption["id"]>(() => (playerSkin?.eyeStyle as EyeOption["id"]) ?? "classic");
  const [mouthStyle, setMouthStyle] = useState<MouthOption["id"]>(() => (playerSkin?.mouthStyle as MouthOption["id"]) ?? "smile");
  const [bodyStyle, setBodyStyle] = useState<"circles" | "tube">(() => playerSkin?.bodyStyle ?? "circles");
  const [selectedFlag, setSelectedFlag] = useState<string | null>(() => (playerSkin?.isFlag && playerSkin?.flagName) ? playerSkin.flagName : null);
  const [activeTab, setActiveTab] = useState<ShopTab>("shop");
  const flagRegion: FlagRegion = activeTab === "shop" ? "all" : activeTab;

  const [, setUnlockTick] = useState(0);

  const headOptions = useMemo(() => getHeadOptions(), [eventGems]);

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
    return FLAG_SKINS.filter((f) => {
      if (flagRegion !== "all" && FLAG_REGION_MAP[f.name] !== flagRegion) return false;
      if (!q) return true;
      return f.name.toLowerCase().includes(q) || translateFlag(f.name, flagLang).toLowerCase().includes(q);
    });
  }, [flagSearch, flagLang, flagRegion]);

  const filteredHeads = useMemo(() => headOptions, [headOptions]);

  const availableHeadIds = useMemo(
    () => filteredHeads.filter((h) => !h.locked).map((h) => h.id),
    [filteredHeads],
  );

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
  const selectedHeadPreview = selectedHeadMeta?.preview;
  const selectedHeadBodySource = (selectedHeadMeta?.bodyTexture || selectedHeadMeta?.preview)
    ? { uri: selectedHeadMeta.bodyTexture ?? selectedHeadMeta.preview! }
    : undefined;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.bgOrbA} />
      <View style={styles.bgOrbB} />
      <View style={desktopContainerStyle}>
      {/* Coin Balance */}
      <View style={styles.coinBar}>
        <Text style={styles.coinText}>{"\u{1FA99}"} {coins}</Text>
      </View>

      <View style={styles.topRow}>
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
                  {SHOP_TAB_LABELS[tab]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.previewNavRow}>
        <Pressable
          onPress={() => activeTab === "shop" ? cycleHead(-1) : cycleFlag(-1)}
          style={[
            styles.costumeArrowBtn,
            (activeTab === "shop" ? availableHeadIds.length === 0 : filteredFlags.length === 0) && styles.costumeArrowBtnDisabled,
          ]}
          disabled={activeTab === "shop" ? availableHeadIds.length === 0 : filteredFlags.length === 0}
        >
          <Text style={styles.costumeArrowText}>‹</Text>
        </Pressable>
        <View style={styles.previewNavCenter}>
          <ShopWormPreview
            colors={selectedColors}
            eyeStyle={eyeStyle}
            mouthStyle={mouthStyle}
            bodyStyle={bodyStyle}
            flagSource={selectedFlagSource}
            bodyTextureSource={activeTab === "shop" ? selectedHeadBodySource : undefined}
            headPreview={activeTab === "shop" ? selectedHeadPreview : undefined}
          />
          {activeTab === "shop" ? (
            <Text style={styles.previewCostumeName}>{selectedHeadMeta?.label ?? "Classique"}</Text>
          ) : selectedFlag ? (
            <Text style={styles.previewCostumeName}>{translateFlag(selectedFlag, flagLang)}</Text>
          ) : null}
        </View>
        <Pressable
          onPress={() => activeTab === "shop" ? cycleHead(1) : cycleFlag(1)}
          style={[
            styles.costumeArrowBtn,
            (activeTab === "shop" ? availableHeadIds.length === 0 : filteredFlags.length === 0) && styles.costumeArrowBtnDisabled,
          ]}
          disabled={activeTab === "shop" ? availableHeadIds.length === 0 : filteredFlags.length === 0}
        >
          <Text style={styles.costumeArrowText}>›</Text>
        </Pressable>
        </View>
      </View>

      {activeTab === "shop" && (<>
      {/* Head / Costume Selector */}
      <Text style={styles.sectionTitle}>{t("shopHead")}</Text>
      {/* Per-event currency balances */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {GAME_EVENTS.filter(e => (eventGems[e.id] || 0) > 0).map(e => (
            <View key={e.id} style={styles.gemsBar}>
              {e.currencyImage ? (
                <Image source={{ uri: e.currencyImage }} style={{ width: 22, height: 22 }} resizeMode="contain" />
              ) : (
                <Text style={styles.gemsText}>{e.emoji}</Text>
              )}
              <Text style={styles.gemsText}>{eventGems[e.id] || 0}</Text>
            </View>
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
          style={styles.lockedCostumeCard}
        >
          <Text style={styles.lockedCostumeText}>
            {selectedHeadMeta.currencyImage ? `30 ${selectedHeadMeta.label}` : `${selectedHeadMeta.eventEmoji || "💎"} 30 ${selectedHeadMeta.label}`}
          </Text>
        </Pressable>
      )}

      {/* Body Style Toggle */}
      <Text style={styles.sectionTitle}>{t("shopBodyStyle")}</Text>
      <View style={styles.toggleRow}>
        {(["circles", "tube"] as const).map((s) => (
          <Pressable
            key={s}
            onPress={() => setBodyStyle(s)}
            style={[styles.toggleBtn, bodyStyle === s && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, bodyStyle === s && styles.toggleTextActive]}>
              {s === "circles" ? t("shopCircles") : t("shopTube")}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Yeux</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionRow}>
        {EYE_OPTIONS.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => setEyeStyle(option.id)}
            style={[
              styles.faceOption,
              eyeStyle === option.id && styles.faceOptionSelected,
            ]}
          >
            <Text style={styles.facePreview}>{option.preview}</Text>
            <Text style={[styles.faceLabel, eyeStyle === option.id && styles.faceLabelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Bouche</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionRow}>
        {MOUTH_OPTIONS.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => setMouthStyle(option.id)}
            style={[
              styles.faceOption,
              mouthStyle === option.id && styles.faceOptionSelected,
            ]}
          >
            <Text style={styles.facePreview}>{option.preview}</Text>
            <Text style={[styles.faceLabel, mouthStyle === option.id && styles.faceLabelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Color Picker */}
      <Text style={styles.sectionTitle}>{t("shopColors")}</Text>
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
      </>)}

      {/* Apply Button */}
      <Pressable
        onPress={handleApply}
        style={[styles.applyBtn, computePrice() > coins && styles.applyBtnDisabled]}
      >
        <Text style={styles.applyBtnText}>
          {computePrice() > 0 ? `${t("shopApply")} (${computePrice()} 🪙)` : t("shopApply")}
        </Text>
      </Pressable>

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
    height: 140,
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  previewCanvasImage: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
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
  gemsText: {
    color: "#60a5fa", fontSize: 18, fontWeight: "800",
  },
  gemsHint: {
    color: colors.textSecondary, fontSize: 12,
  },
  costumeArrowBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderCurve: "continuous",
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
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
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
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
  slotRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  slotBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    gap: 6,
    marginBottom: spacing.sm,
  },
  paletteColor: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  flagTabsTop: {
    width: 110,
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
    paddingHorizontal: 10,
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
