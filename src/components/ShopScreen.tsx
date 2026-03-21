import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SKINS, type WormSkin, type HeadType } from '@/types/game'
import ukFlagBody from '../../drapeau/angleterre.png'
import franceFlagBody from '../../drapeau/france.png'
import chinaFlagBody from '../../drapeau/chine.png'
import russiaFlagBody from '../../drapeau/russie.png'
import germanyFlagBody from '../../drapeau/allemagne.png'
import usaFlagBody from '../../drapeau/etat unis.png'
import spainFlagBody from '../../drapeau/espagne.png'
import italyFlagBody from '../../drapeau/italie.png'
import portugalFlagBody from '../../drapeau/portugal.png'
import belgiumFlagBody from '../../drapeau/belgique.png'
import netherlandsFlagBody from '../../drapeau/pays-bas.png'
import switzerlandFlagBody from '../../drapeau/suisse.png'
import swedenFlagBody from '../../drapeau/suede.png'
import polandFlagBody from '../../drapeau/pologne.png'
import ukraineFlagBody from '../../drapeau/ukraine.png'
import greeceFlagBody from '../../drapeau/grece.png'
import romaniaFlagBody from '../../drapeau/roumanie.png'
import irelandFlagBody from '../../drapeau/irlande.png'
import croatiaFlagBody from '../../drapeau/croatie.png'
import norwayFlagBody from '../../drapeau/norvege.png'
import denmarkFlagBody from '../../drapeau/danemark.png'
import finlandFlagBody from '../../drapeau/finlande.png'
import turkeyFlagBody from '../../drapeau/turquie.png'
import canadaFlagBody from '../../drapeau/canada.png'
import mexicoFlagBody from '../../drapeau/mexique.png'
import brazilFlagBody from '../../drapeau/bresil.png'
import argentinaFlagBody from '../../drapeau/argentine.png'
import colombiaFlagBody from '../../drapeau/colombie.png'
import chileFlagBody from '../../drapeau/chili.png'
import peruFlagBody from '../../drapeau/perou.png'
import jamaicaFlagBody from '../../drapeau/jamaique.png'
import moroccoFlagBody from '../../drapeau/maroc.png'
import algeriaFlagBody from '../../drapeau/algerie.png'
import tunisiaFlagBody from '../../drapeau/tunisie.png'
import egyptFlagBody from '../../drapeau/egypte.png'
import senegalFlagBody from '../../drapeau/senegal.png'
import nigeriaFlagBody from '../../drapeau/nigeria.png'
import southAfricaFlagBody from '../../drapeau/afrique-du-sud.png'
import cameroonFlagBody from '../../drapeau/cameroun.png'
import ivoryCoastFlagBody from '../../drapeau/cote-divoire.png'
import ghanaFlagBody from '../../drapeau/ghana.png'
import congoFlagBody from '../../drapeau/congo.png'
import ethiopiaFlagBody from '../../drapeau/ethiopie.png'
import japanFlagBody from '../../drapeau/japon.png'
import southKoreaFlagBody from '../../drapeau/coree-du-sud.png'
import indiaFlagBody from '../../drapeau/inde.png'
import pakistanFlagBody from '../../drapeau/pakistan.png'
import indonesiaFlagBody from '../../drapeau/indonesie.png'
import philippinesFlagBody from '../../drapeau/philippines.png'
import vietnamFlagBody from '../../drapeau/vietnam.png'
import thailandFlagBody from '../../drapeau/thailande.png'
import saudiArabiaFlagBody from '../../drapeau/arabie-saoudite.png'
import iranFlagBody from '../../drapeau/iran.png'
import australiaFlagBody from '../../drapeau/australie.png'
import newZealandFlagBody from '../../drapeau/nouvelle-zelande.png'
import haitiFlagBody from '../../drapeau/haiti.png'
import cubaFlagBody from '../../drapeau/cuba.png'
import dominicanRepFlagBody from '../../drapeau/rep-dominicaine.png'

type FlagSkin = {
  name: string
  preview: string
  colors: [string, string, string, string]
  bodyTexture: string
}

const HEAD_OPTIONS: { id: HeadType; label: string; preview: string; bodyTexture?: string }[] = [
  { id: 'default', label: 'Classique', preview: '' },
  { id: 'queen', label: 'Reine', preview: '/heads/queen.png' },
  { id: 'king', label: 'Roi', preview: '/heads/king.png' },
  { id: 'dragon', label: 'Dragon', preview: '/heads/dragon.png', bodyTexture: '/heads/dragon-body.png' },
  { id: 'stpatrick', label: 'St Patrick', preview: '/heads/stpatrick.png', bodyTexture: '/heads/stpatrick-body.png' },
]


// ============================================
// FLAG PRESETS
// ============================================
const FLAG_SKINS: FlagSkin[] = [
  // Europe
  { name: 'France', preview: franceFlagBody, bodyTexture: franceFlagBody, colors: ['#002395', '#FFFFFF', '#ED2939', '#002395'] },
  { name: 'Allemagne', preview: germanyFlagBody, bodyTexture: germanyFlagBody, colors: ['#000000', '#DD0000', '#FFCC00', '#000000'] },
  { name: 'Italie', preview: italyFlagBody, bodyTexture: italyFlagBody, colors: ['#008C45', '#FFFFFF', '#CD212A', '#008C45'] },
  { name: 'Espagne', preview: spainFlagBody, bodyTexture: spainFlagBody, colors: ['#AA151B', '#F1BF00', '#AA151B', '#F1BF00'] },
  { name: 'Portugal', preview: portugalFlagBody, bodyTexture: portugalFlagBody, colors: ['#006600', '#FF0000', '#FFCC00', '#006600'] },
  { name: 'Royaume-Uni', preview: ukFlagBody, bodyTexture: ukFlagBody, colors: ['#00247D', '#CF142B', '#FFFFFF', '#CF142B'] },
  { name: 'Belgique', preview: belgiumFlagBody, bodyTexture: belgiumFlagBody, colors: ['#000000', '#FDDA24', '#EF3340', '#000000'] },
  { name: 'Pays-Bas', preview: netherlandsFlagBody, bodyTexture: netherlandsFlagBody, colors: ['#AE1C28', '#FFFFFF', '#21468B', '#AE1C28'] },
  { name: 'Suisse', preview: switzerlandFlagBody, bodyTexture: switzerlandFlagBody, colors: ['#FF0000', '#FFFFFF', '#FF0000', '#FFFFFF'] },
  { name: 'Suede', preview: swedenFlagBody, bodyTexture: swedenFlagBody, colors: ['#005BAA', '#FECC02', '#005BAA', '#FECC02'] },
  { name: 'Pologne', preview: polandFlagBody, bodyTexture: polandFlagBody, colors: ['#FFFFFF', '#DC143C', '#FFFFFF', '#DC143C'] },
  { name: 'Ukraine', preview: ukraineFlagBody, bodyTexture: ukraineFlagBody, colors: ['#0057B7', '#FFD700', '#0057B7', '#FFD700'] },
  { name: 'Grece', preview: greeceFlagBody, bodyTexture: greeceFlagBody, colors: ['#004C98', '#FFFFFF', '#004C98', '#FFFFFF'] },
  { name: 'Roumanie', preview: romaniaFlagBody, bodyTexture: romaniaFlagBody, colors: ['#002B7F', '#FCD116', '#CE1126', '#002B7F'] },
  { name: 'Irlande', preview: irelandFlagBody, bodyTexture: irelandFlagBody, colors: ['#169B62', '#FFFFFF', '#FF883E', '#169B62'] },
  { name: 'Croatie', preview: croatiaFlagBody, bodyTexture: croatiaFlagBody, colors: ['#FF0000', '#FFFFFF', '#171796', '#FF0000'] },
  { name: 'Norvege', preview: norwayFlagBody, bodyTexture: norwayFlagBody, colors: ['#EF2B2D', '#002868', '#FFFFFF', '#EF2B2D'] },
  { name: 'Danemark', preview: denmarkFlagBody, bodyTexture: denmarkFlagBody, colors: ['#C60C30', '#FFFFFF', '#C60C30', '#FFFFFF'] },
  { name: 'Finlande', preview: finlandFlagBody, bodyTexture: finlandFlagBody, colors: ['#FFFFFF', '#003580', '#FFFFFF', '#003580'] },
  { name: 'Russie', preview: russiaFlagBody, bodyTexture: russiaFlagBody, colors: ['#FFFFFF', '#0039A6', '#D52B1E', '#FFFFFF'] },
  { name: 'Turquie', preview: turkeyFlagBody, bodyTexture: turkeyFlagBody, colors: ['#E30A17', '#FFFFFF', '#E30A17', '#FFFFFF'] },
  // Americas
  { name: 'USA', preview: usaFlagBody, bodyTexture: usaFlagBody, colors: ['#3C3B6E', '#B22234', '#FFFFFF', '#B22234'] },
  { name: 'Canada', preview: canadaFlagBody, bodyTexture: canadaFlagBody, colors: ['#FF0000', '#FFFFFF', '#FF0000', '#FFFFFF'] },
  { name: 'Mexique', preview: mexicoFlagBody, bodyTexture: mexicoFlagBody, colors: ['#006341', '#FFFFFF', '#CE1126', '#006341'] },
  { name: 'Bresil', preview: brazilFlagBody, bodyTexture: brazilFlagBody, colors: ['#009739', '#FEDD00', '#012169', '#009739'] },
  { name: 'Argentine', preview: argentinaFlagBody, bodyTexture: argentinaFlagBody, colors: ['#74ACDF', '#FFFFFF', '#74ACDF', '#74ACDF'] },
  { name: 'Colombie', preview: colombiaFlagBody, bodyTexture: colombiaFlagBody, colors: ['#FCD116', '#003893', '#CE1126', '#FCD116'] },
  { name: 'Chili', preview: chileFlagBody, bodyTexture: chileFlagBody, colors: ['#FFFFFF', '#D52B1E', '#0039A6', '#FFFFFF'] },
  { name: 'Perou', preview: peruFlagBody, bodyTexture: peruFlagBody, colors: ['#D91023', '#FFFFFF', '#D91023', '#FFFFFF'] },
  { name: 'Jamaique', preview: jamaicaFlagBody, bodyTexture: jamaicaFlagBody, colors: ['#009B3A', '#000000', '#FED100', '#009B3A'] },
  // Africa
  { name: 'Maroc', preview: moroccoFlagBody, bodyTexture: moroccoFlagBody, colors: ['#C1272D', '#006233', '#C1272D', '#006233'] },
  { name: 'Algerie', preview: algeriaFlagBody, bodyTexture: algeriaFlagBody, colors: ['#006633', '#FFFFFF', '#D21034', '#006633'] },
  { name: 'Tunisie', preview: tunisiaFlagBody, bodyTexture: tunisiaFlagBody, colors: ['#E70013', '#FFFFFF', '#E70013', '#FFFFFF'] },
  { name: 'Egypte', preview: egyptFlagBody, bodyTexture: egyptFlagBody, colors: ['#CE1126', '#FFFFFF', '#000000', '#CE1126'] },
  { name: 'Senegal', preview: senegalFlagBody, bodyTexture: senegalFlagBody, colors: ['#00853F', '#FDEF42', '#E31B23', '#00853F'] },
  { name: 'Nigeria', preview: nigeriaFlagBody, bodyTexture: nigeriaFlagBody, colors: ['#008751', '#FFFFFF', '#008751', '#FFFFFF'] },
  { name: 'Afrique du Sud', preview: southAfricaFlagBody, bodyTexture: southAfricaFlagBody, colors: ['#007A4D', '#FFB612', '#DE3831', '#002395'] },
  { name: 'Cameroun', preview: cameroonFlagBody, bodyTexture: cameroonFlagBody, colors: ['#007A33', '#CE1126', '#FCD116', '#007A33'] },
  { name: 'Cote d\'Ivoire', preview: ivoryCoastFlagBody, bodyTexture: ivoryCoastFlagBody, colors: ['#FF8200', '#FFFFFF', '#009A44', '#FF8200'] },
  { name: 'Ghana', preview: ghanaFlagBody, bodyTexture: ghanaFlagBody, colors: ['#EF3340', '#FCD116', '#009739', '#000000'] },
  { name: 'Congo', preview: congoFlagBody, bodyTexture: congoFlagBody, colors: ['#007FFF', '#F7D618', '#CE1021', '#007FFF'] },
  { name: 'Ethiopie', preview: ethiopiaFlagBody, bodyTexture: ethiopiaFlagBody, colors: ['#078930', '#FCDD09', '#DA121A', '#0F47AF'] },
  // Asia
  { name: 'Japon', preview: japanFlagBody, bodyTexture: japanFlagBody, colors: ['#FFFFFF', '#BC002D', '#FFFFFF', '#BC002D'] },
  { name: 'Chine', preview: chinaFlagBody, bodyTexture: chinaFlagBody, colors: ['#DE2910', '#FFDE00', '#DE2910', '#FFDE00'] },
  { name: 'Coree du Sud', preview: southKoreaFlagBody, bodyTexture: southKoreaFlagBody, colors: ['#FFFFFF', '#CD2E3A', '#0047A0', '#000000'] },
  { name: 'Inde', preview: indiaFlagBody, bodyTexture: indiaFlagBody, colors: ['#FF9933', '#FFFFFF', '#138808', '#000080'] },
  { name: 'Pakistan', preview: pakistanFlagBody, bodyTexture: pakistanFlagBody, colors: ['#01411C', '#FFFFFF', '#01411C', '#FFFFFF'] },
  { name: 'Indonesie', preview: indonesiaFlagBody, bodyTexture: indonesiaFlagBody, colors: ['#FF0000', '#FFFFFF', '#FF0000', '#FFFFFF'] },
  { name: 'Philippines', preview: philippinesFlagBody, bodyTexture: philippinesFlagBody, colors: ['#0038A8', '#CE1126', '#FCD116', '#FFFFFF'] },
  { name: 'Vietnam', preview: vietnamFlagBody, bodyTexture: vietnamFlagBody, colors: ['#DA251D', '#FFCD00', '#DA251D', '#FFCD00'] },
  { name: 'Thailande', preview: thailandFlagBody, bodyTexture: thailandFlagBody, colors: ['#ED1C24', '#FFFFFF', '#241D4F', '#FFFFFF'] },
  { name: 'Arabie Saoudite', preview: saudiArabiaFlagBody, bodyTexture: saudiArabiaFlagBody, colors: ['#006C35', '#FFFFFF', '#006C35', '#FFFFFF'] },
  { name: 'Iran', preview: iranFlagBody, bodyTexture: iranFlagBody, colors: ['#239F40', '#FFFFFF', '#DA0000', '#239F40'] },
  // Oceania
  { name: 'Australie', preview: australiaFlagBody, bodyTexture: australiaFlagBody, colors: ['#00008B', '#FF0000', '#FFFFFF', '#00008B'] },
  { name: 'Nouvelle-Zelande', preview: newZealandFlagBody, bodyTexture: newZealandFlagBody, colors: ['#00247D', '#CC142B', '#FFFFFF', '#00247D'] },
  // Caribbean / Islands
  { name: 'Haiti', preview: haitiFlagBody, bodyTexture: haitiFlagBody, colors: ['#00209F', '#D21034', '#00209F', '#D21034'] },
  { name: 'Cuba', preview: cubaFlagBody, bodyTexture: cubaFlagBody, colors: ['#002A8F', '#FFFFFF', '#CF142B', '#002A8F'] },
  { name: 'Rep. Dominicaine', preview: dominicanRepFlagBody, bodyTexture: dominicanRepFlagBody, colors: ['#002D62', '#CE1126', '#FFFFFF', '#002D62'] },
]



function drawContainedTextureInCircle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  radius: number,
  offsetX = 0,
  scale = 1,
) {
  const diameter = radius * 2
  const aspect = img.naturalWidth / img.naturalHeight
  let drawW = diameter
  let drawH = diameter

  if (aspect > 1) {
    drawH = diameter / aspect
  } else {
    drawW = diameter * aspect
  }

  drawW *= scale
  drawH *= scale

  const dx = x - drawW / 2 + offsetX * radius
  const dy = y - drawH / 2
  ctx.drawImage(img, dx, dy, drawW, drawH)
}

interface ShopScreenProps {
  currentSkin: WormSkin
  onApply: (skin: WormSkin) => void
  onBack: () => void
}

export function ShopScreen({ currentSkin, onApply, onBack }: ShopScreenProps) {
  const { t } = useTranslation()
  const headBodyTextures = new Set(HEAD_OPTIONS.map(opt => opt.bodyTexture).filter(Boolean))
  const [colors, setColors] = useState<string[]>([...currentSkin.colors])
  const [headType, setHeadType] = useState<HeadType>(currentSkin.headType ?? 'default')
  const [selectedBodyTexture, setSelectedBodyTexture] = useState<string | undefined>(
    currentSkin.bodyTexture && !headBodyTextures.has(currentSkin.bodyTexture) ? currentSkin.bodyTexture : undefined,
  )
  const [activeSlot, setActiveSlot] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [headImgs, setHeadImgs] = useState<Record<string, HTMLImageElement>>({})
  const [bodyImgs, setBodyImgs] = useState<Record<string, HTMLImageElement>>({})

  // Load head + body images for preview
  useEffect(() => {
    for (const opt of HEAD_OPTIONS) {
      if (opt.preview) {
        const img = new Image()
        img.src = opt.preview
        img.onload = () => setHeadImgs(prev => ({ ...prev, [opt.id]: img }))
      }
      if (opt.bodyTexture) {
        const img = new Image()
        img.src = opt.bodyTexture
        img.onload = () => setBodyImgs(prev => ({ ...prev, [opt.id]: img }))
      }
    }

    for (const flag of FLAG_SKINS) {
      if (!flag.bodyTexture) continue
      const img = new Image()
      img.src = flag.bodyTexture
      img.onload = () => setBodyImgs(prev => ({ ...prev, [flag.bodyTexture!]: img }))
    }
  }, [])

  const setSlotColor = (slot: number, color: string) => {
    setColors(prev => {
      const next = [...prev]
      next[slot] = color
      return next
    })
    setIsFlagSkin(false)
  }

  const [isFlagSkin, setIsFlagSkin] = useState(currentSkin.isFlag ?? false)

  const applyFlag = (flagColors: string[], bodyTexture?: string) => {
    setColors([...flagColors])
    setSelectedBodyTexture(bodyTexture)
    setIsFlagSkin(true)
  }

  const applyPreset = (skin: WormSkin) => {
    setColors([...skin.colors])
    setSelectedBodyTexture(skin.bodyTexture)
    setIsFlagSkin(false)
  }

  // Draw worm preview
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const cx = w / 2, cy = h / 2
    const segCount = 20
    const segGap = 14
    const radius = 12

    // Draw segments in a slight curve
    for (let i = segCount - 1; i >= 0; i--) {
      const angle = (i / segCount) * Math.PI * 0.6 - Math.PI * 0.3
      const sx = cx + Math.cos(angle) * (i * segGap - segCount * segGap / 2)
      const sy = cy + Math.sin(angle) * 30

      // Shadow
      ctx.beginPath()
      ctx.arc(sx, sy + radius * 0.3, radius * 1.05, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.fill()

      const selectedHead = HEAD_OPTIONS.find(option => option.id === headType)
      const bodyTextureKey = selectedBodyTexture ?? selectedHead?.bodyTexture
      const bImg = bodyTextureKey ? bodyImgs[bodyTextureKey] : undefined
      if (bImg) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(sx, sy, radius, 0, Math.PI * 2)
        ctx.clip()
        ctx.fillStyle = colors[i % colors.length]
        ctx.fillRect(sx - radius, sy - radius, radius * 2, radius * 2)
        drawContainedTextureInCircle(ctx, bImg, sx, sy, radius)
        ctx.restore()
      } else {
        // Solid color body
        ctx.beginPath()
        ctx.arc(sx, sy, radius, 0, Math.PI * 2)
        ctx.fillStyle = colors[i % colors.length]
        ctx.fill()

        // Highlight
        ctx.beginPath()
        ctx.arc(sx - radius * 0.2, sy - radius * 0.25, radius * 0.45, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.fill()
      }
    }

    // Head on first segment
    const headX = cx + Math.cos(-Math.PI * 0.3) * (-segCount * segGap / 2)
    const headY = cy + Math.sin(-Math.PI * 0.3) * 30

    const hImg = headImgs[headType]
    if (headType !== 'default' && hImg) {
      const aspect = hImg.naturalHeight / hImg.naturalWidth
      const imgW = radius * 5
      const imgH = imgW * aspect
      ctx.drawImage(hImg, headX - imgW / 2, headY - imgH * 0.7, imgW, imgH)
    } else {
      // Default eyes
      for (let side = -1; side <= 1; side += 2) {
        const ex = headX + side * 5
        const ey = headY - 3
        ctx.beginPath()
        ctx.arc(ex, ey, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(ex + 1, ey, 2.2, 0, Math.PI * 2)
        ctx.fillStyle = '#111'
        ctx.fill()
      }
    }
  }, [colors, headType, headImgs, bodyImgs, selectedBodyTexture])

  return (
    <div style={shopStyles.container}>
      <h1 style={shopStyles.title}>{t('shop')}</h1>

      {/* Worm preview */}
      <canvas ref={canvasRef} width={360} height={120} style={shopStyles.preview} />

      {/* Color slots */}
      <div style={shopStyles.section}>
        <div style={shopStyles.sectionTitle}>{t('shopColors')}</div>
        <div style={shopStyles.slotRow}>
          {colors.map((c, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div
                style={{
                  ...shopStyles.colorSlot,
                  background: c,
                  borderColor: i === activeSlot ? '#ffd700' : 'rgba(255,255,255,0.3)',
                  boxShadow: i === activeSlot ? '0 0 15px rgba(255,215,0,0.5)' : 'none',
                }}
                onClick={() => setActiveSlot(i)}
              />
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4 }}>
                {i + 1}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <input
            type="color"
            value={colors[activeSlot]}
            onChange={(e) => setSlotColor(activeSlot, e.target.value)}
            style={shopStyles.colorPicker}
          />
          <span style={{ color: 'white', fontSize: 14, fontFamily: "'Fredoka', sans-serif" }}>
            {colors[activeSlot]}
          </span>
        </div>
      </div>

      {/* Preset skins */}
      <div style={shopStyles.section}>
        <div style={shopStyles.sectionTitle}>{t('shopPresets')}</div>
        <div style={shopStyles.presetRow}>
          {SKINS.map((skin, i) => (
            <div
              key={i}
              title={skin.name}
              style={{
                ...shopStyles.presetCircle,
                background: `linear-gradient(135deg, ${skin.colors[0]}, ${skin.colors[1]})`,
              }}
              onClick={() => applyPreset(skin)}
            />
          ))}
        </div>
      </div>

      {/* Head style */}
      <div style={shopStyles.section}>
        <div style={shopStyles.sectionTitle}>{t('shopHead')}</div>
        <div style={shopStyles.headRow}>
          {HEAD_OPTIONS.map((h) => (
            <div
              key={h.id}
              style={{
                ...shopStyles.headOption,
                borderColor: headType === h.id ? '#ffd700' : 'rgba(255,255,255,0.2)',
                boxShadow: headType === h.id ? '0 0 15px rgba(255,215,0,0.4)' : 'none',
              }}
              onClick={() => setHeadType(h.id)}
            >
              {h.preview ? (
                <img src={h.preview} alt={h.label} style={{ width: 48, height: 48, objectFit: 'contain' }} />
              ) : (
                <div style={shopStyles.defaultEyes}>
                  <div style={shopStyles.eyeDot} />
                  <div style={shopStyles.eyeDot} />
                </div>
              )}
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 }}>{h.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Flag presets */}
      <div style={shopStyles.section}>
        <div style={shopStyles.sectionTitle}>{t('shopFlags')}</div>
        <div style={shopStyles.flagGrid}>
          {FLAG_SKINS.map((f, i) => (
            <div
              key={i}
              style={shopStyles.flagItem}
              onClick={() => applyFlag(f.colors, f.bodyTexture)}
              title={f.name}
            >
              <img src={f.preview} alt={f.name} style={shopStyles.flagPreview} />
              <span style={shopStyles.flagName}>{f.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16, marginBottom: 30 }}>
        <button
          style={shopStyles.applyBtn}
          onClick={() => {
            const selectedHead = HEAD_OPTIONS.find(h => h.id === headType)
            onApply({
              colors: [...colors],
              eye: '#fff',
              name: 'Custom',
              headType,
              bodyTexture: selectedBodyTexture ?? selectedHead?.bodyTexture,
              isFlag: isFlagSkin && !!selectedBodyTexture,
            })
          }}
        >
          {t('shopApply')}
        </button>
        <button style={shopStyles.backBtn} onClick={onBack}>
          {t('back')}
        </button>
      </div>
    </div>
  )
}

const shopStyles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 30,
    zIndex: 100,
    background: 'radial-gradient(ellipse at center, #1a5c8a 0%, #0e3a5c 60%, #082740 100%)',
    overflow: 'auto',
  },
  title: {
    fontFamily: "'Bungee', cursive",
    fontSize: 38,
    background: 'linear-gradient(180deg, #ffd700, #ff6b35)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: 10,
  },
  preview: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    border: '2px solid rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  section: {
    width: 420,
    maxWidth: '92%',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontFamily: "'Bungee', cursive",
    fontSize: 14,
    color: '#ffd700',
    marginBottom: 10,
    letterSpacing: 1,
  },
  slotRow: {
    display: 'flex',
    gap: 14,
    justifyContent: 'center',
  },
  colorSlot: {
    width: 48, height: 48,
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.3)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  colorPicker: {
    width: 50, height: 40,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    background: 'transparent',
  },
  presetRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  presetCircle: {
    width: 40, height: 40,
    borderRadius: '50%',
    cursor: 'pointer',
    border: '2px solid rgba(255,255,255,0.2)',
    transition: 'transform 0.2s',
  },
  flagGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
    gap: 10,
    maxHeight: 350,
    overflow: 'auto',
  },
  flagItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  flagName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  flagPreview: {
    width: 52,
    height: 36,
    objectFit: 'cover',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.15)',
    flexShrink: 0,
  },
  headRow: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
  },
  headOption: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    border: '3px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minWidth: 80,
  },
  defaultEyes: {
    width: 48, height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  eyeDot: {
    width: 14, height: 14,
    borderRadius: '50%',
    background: 'white',
    border: '3px solid #111',
  },
  applyBtn: {
    padding: '14px 50px',
    border: 'none',
    borderRadius: 50,
    fontFamily: "'Bungee', cursive",
    fontSize: 18,
    color: 'white',
    background: 'linear-gradient(135deg, #ff3366, #ff6b35)',
    cursor: 'pointer',
    boxShadow: '0 6px 25px rgba(255,51,102,0.4)',
    letterSpacing: 2,
  },
  backBtn: {
    padding: '14px 30px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: 50,
    fontFamily: "'Bungee', cursive",
    fontSize: 14,
    color: 'white',
    background: 'transparent',
    cursor: 'pointer',
  },
}
