import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SKINS, type WormSkin, type HeadType } from '@/types/game'

const HEAD_OPTIONS: { id: HeadType; label: string; preview: string; bodyTexture?: string }[] = [
  { id: 'default', label: 'Classique', preview: '' },
  { id: 'queen', label: 'Reine', preview: '/heads/queen.png' },
  { id: 'king', label: 'Roi', preview: '/heads/king.png' },
  { id: 'dragon', label: 'Dragon', preview: '/heads/dragon.png', bodyTexture: '/heads/dragon-body.png' },
]

// ============================================
// FLAG PRESETS — colors from flags around the world
// ============================================
const FLAG_SKINS: { name: string; flag: string; colors: [string, string, string, string] }[] = [
  // Europe
  { name: 'France', flag: '🇫🇷', colors: ['#002395', '#FFFFFF', '#ED2939', '#002395'] },
  { name: 'Allemagne', flag: '🇩🇪', colors: ['#000000', '#DD0000', '#FFCC00', '#000000'] },
  { name: 'Italie', flag: '🇮🇹', colors: ['#008C45', '#FFFFFF', '#CD212A', '#008C45'] },
  { name: 'Espagne', flag: '🇪🇸', colors: ['#AA151B', '#F1BF00', '#AA151B', '#F1BF00'] },
  { name: 'Portugal', flag: '🇵🇹', colors: ['#006600', '#FF0000', '#FFCC00', '#006600'] },
  { name: 'Royaume-Uni', flag: '🇬🇧', colors: ['#00247D', '#CF142B', '#FFFFFF', '#CF142B'] },
  { name: 'Belgique', flag: '🇧🇪', colors: ['#000000', '#FDDA24', '#EF3340', '#000000'] },
  { name: 'Pays-Bas', flag: '🇳🇱', colors: ['#AE1C28', '#FFFFFF', '#21468B', '#AE1C28'] },
  { name: 'Suisse', flag: '🇨🇭', colors: ['#FF0000', '#FFFFFF', '#FF0000', '#FFFFFF'] },
  { name: 'Suede', flag: '🇸🇪', colors: ['#005BAA', '#FECC02', '#005BAA', '#FECC02'] },
  { name: 'Pologne', flag: '🇵🇱', colors: ['#FFFFFF', '#DC143C', '#FFFFFF', '#DC143C'] },
  { name: 'Ukraine', flag: '🇺🇦', colors: ['#0057B7', '#FFD700', '#0057B7', '#FFD700'] },
  { name: 'Grece', flag: '🇬🇷', colors: ['#004C98', '#FFFFFF', '#004C98', '#FFFFFF'] },
  { name: 'Roumanie', flag: '🇷🇴', colors: ['#002B7F', '#FCD116', '#CE1126', '#002B7F'] },
  { name: 'Irlande', flag: '🇮🇪', colors: ['#169B62', '#FFFFFF', '#FF883E', '#169B62'] },
  { name: 'Croatie', flag: '🇭🇷', colors: ['#FF0000', '#FFFFFF', '#171796', '#FF0000'] },
  { name: 'Norvege', flag: '🇳🇴', colors: ['#EF2B2D', '#002868', '#FFFFFF', '#EF2B2D'] },
  { name: 'Danemark', flag: '🇩🇰', colors: ['#C60C30', '#FFFFFF', '#C60C30', '#FFFFFF'] },
  { name: 'Finlande', flag: '🇫🇮', colors: ['#FFFFFF', '#003580', '#FFFFFF', '#003580'] },
  { name: 'Russie', flag: '🇷🇺', colors: ['#FFFFFF', '#0039A6', '#D52B1E', '#FFFFFF'] },
  { name: 'Turquie', flag: '🇹🇷', colors: ['#E30A17', '#FFFFFF', '#E30A17', '#FFFFFF'] },
  // Americas
  { name: 'USA', flag: '🇺🇸', colors: ['#3C3B6E', '#B22234', '#FFFFFF', '#B22234'] },
  { name: 'Canada', flag: '🇨🇦', colors: ['#FF0000', '#FFFFFF', '#FF0000', '#FFFFFF'] },
  { name: 'Mexique', flag: '🇲🇽', colors: ['#006341', '#FFFFFF', '#CE1126', '#006341'] },
  { name: 'Bresil', flag: '🇧🇷', colors: ['#009739', '#FEDD00', '#012169', '#009739'] },
  { name: 'Argentine', flag: '🇦🇷', colors: ['#74ACDF', '#FFFFFF', '#F6B40E', '#74ACDF'] },
  { name: 'Colombie', flag: '🇨🇴', colors: ['#FCD116', '#003893', '#CE1126', '#FCD116'] },
  { name: 'Chili', flag: '🇨🇱', colors: ['#FFFFFF', '#D52B1E', '#0039A6', '#FFFFFF'] },
  { name: 'Perou', flag: '🇵🇪', colors: ['#D91023', '#FFFFFF', '#D91023', '#FFFFFF'] },
  { name: 'Jamaique', flag: '🇯🇲', colors: ['#009B3A', '#000000', '#FED100', '#009B3A'] },
  // Africa
  { name: 'Maroc', flag: '🇲🇦', colors: ['#C1272D', '#006233', '#C1272D', '#006233'] },
  { name: 'Algerie', flag: '🇩🇿', colors: ['#006633', '#FFFFFF', '#D21034', '#006633'] },
  { name: 'Tunisie', flag: '🇹🇳', colors: ['#E70013', '#FFFFFF', '#E70013', '#FFFFFF'] },
  { name: 'Egypte', flag: '🇪🇬', colors: ['#CE1126', '#FFFFFF', '#000000', '#CE1126'] },
  { name: 'Senegal', flag: '🇸🇳', colors: ['#00853F', '#FDEF42', '#E31B23', '#00853F'] },
  { name: 'Nigeria', flag: '🇳🇬', colors: ['#008751', '#FFFFFF', '#008751', '#FFFFFF'] },
  { name: 'Afrique du Sud', flag: '🇿🇦', colors: ['#007A4D', '#FFB612', '#DE3831', '#002395'] },
  { name: 'Cameroun', flag: '🇨🇲', colors: ['#007A33', '#CE1126', '#FCD116', '#007A33'] },
  { name: 'Cote d\'Ivoire', flag: '🇨🇮', colors: ['#FF8200', '#FFFFFF', '#009A44', '#FF8200'] },
  { name: 'Ghana', flag: '🇬🇭', colors: ['#EF3340', '#FCD116', '#009739', '#000000'] },
  { name: 'Congo', flag: '🇨🇩', colors: ['#007FFF', '#F7D618', '#CE1021', '#007FFF'] },
  { name: 'Ethiopie', flag: '🇪🇹', colors: ['#078930', '#FCDD09', '#DA121A', '#0F47AF'] },
  // Asia
  { name: 'Japon', flag: '🇯🇵', colors: ['#FFFFFF', '#BC002D', '#FFFFFF', '#BC002D'] },
  { name: 'Chine', flag: '🇨🇳', colors: ['#DE2910', '#FFDE00', '#DE2910', '#FFDE00'] },
  { name: 'Coree du Sud', flag: '🇰🇷', colors: ['#FFFFFF', '#CD2E3A', '#0047A0', '#000000'] },
  { name: 'Inde', flag: '🇮🇳', colors: ['#FF9933', '#FFFFFF', '#138808', '#000080'] },
  { name: 'Pakistan', flag: '🇵🇰', colors: ['#01411C', '#FFFFFF', '#01411C', '#FFFFFF'] },
  { name: 'Indonesie', flag: '🇮🇩', colors: ['#FF0000', '#FFFFFF', '#FF0000', '#FFFFFF'] },
  { name: 'Philippines', flag: '🇵🇭', colors: ['#0038A8', '#CE1126', '#FCD116', '#FFFFFF'] },
  { name: 'Vietnam', flag: '🇻🇳', colors: ['#DA251D', '#FFCD00', '#DA251D', '#FFCD00'] },
  { name: 'Thailande', flag: '🇹🇭', colors: ['#ED1C24', '#FFFFFF', '#241D4F', '#FFFFFF'] },
  { name: 'Arabie Saoudite', flag: '🇸🇦', colors: ['#006C35', '#FFFFFF', '#006C35', '#FFFFFF'] },
  { name: 'Iran', flag: '🇮🇷', colors: ['#239F40', '#FFFFFF', '#DA0000', '#239F40'] },
  // Oceania
  { name: 'Australie', flag: '🇦🇺', colors: ['#00008B', '#FF0000', '#FFFFFF', '#00008B'] },
  { name: 'Nouvelle-Zelande', flag: '🇳🇿', colors: ['#00247D', '#CC142B', '#FFFFFF', '#00247D'] },
  // Caribbean / Islands
  { name: 'Haiti', flag: '🇭🇹', colors: ['#00209F', '#D21034', '#00209F', '#D21034'] },
  { name: 'Cuba', flag: '🇨🇺', colors: ['#002A8F', '#FFFFFF', '#CF142B', '#002A8F'] },
  { name: 'Rep. Dominicaine', flag: '🇩🇴', colors: ['#002D62', '#CE1126', '#FFFFFF', '#002D62'] },
  // Special
  { name: 'Arc-en-ciel', flag: '🏳️‍🌈', colors: ['#FF0000', '#FF8800', '#FFFF00', '#008800'] },
  { name: 'Pan-Africain', flag: '✊🏿', colors: ['#FF0000', '#000000', '#009900', '#FF0000'] },
]

interface ShopScreenProps {
  currentSkin: WormSkin
  onApply: (skin: WormSkin) => void
  onBack: () => void
}

export function ShopScreen({ currentSkin, onApply, onBack }: ShopScreenProps) {
  const { t } = useTranslation()
  const [colors, setColors] = useState<string[]>([...currentSkin.colors])
  const [headType, setHeadType] = useState<HeadType>(currentSkin.headType ?? 'default')
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
  }, [])

  const setSlotColor = (slot: number, color: string) => {
    setColors(prev => {
      const next = [...prev]
      next[slot] = color
      return next
    })
  }

  const applyFlag = (flagColors: string[]) => {
    setColors([...flagColors])
  }

  const applyPreset = (skin: WormSkin) => {
    setColors([...skin.colors])
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

      const bImg = bodyImgs[headType]
      if (bImg) {
        // Textured body
        ctx.save()
        ctx.beginPath()
        ctx.arc(sx, sy, radius, 0, Math.PI * 2)
        ctx.clip()
        const texW = radius * 2
        const texH = radius * 2
        const offsetX = (i * radius * 0.8) % bImg.naturalWidth
        ctx.drawImage(bImg, offsetX, 0, bImg.naturalWidth * 0.5, bImg.naturalHeight, sx - texW / 2, sy - texH / 2, texW, texH)
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
  }, [colors, headType, headImgs, bodyImgs])

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
              onClick={() => applyFlag(f.colors)}
              title={f.name}
            >
              <span style={{ fontSize: 22 }}>{f.flag}</span>
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
              bodyTexture: selectedHead?.bodyTexture,
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 6,
    maxHeight: 240,
    overflow: 'auto',
  },
  flagItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 8px',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  flagName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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
