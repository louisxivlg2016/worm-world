import { useRef, useEffect, useCallback } from 'react'
import { getNativeBridge } from '@/expo/bridge'
import { getEventByMode, isEventMode } from '@/config/events'
import {
  WORLD_SIZE, FOOD_COUNT, SPECIAL_FOOD_COUNT, AI_WORM_COUNT,
  BASE_SPEED, BASE_SEGMENT_GAP, BASE_RADIUS, TURN_SPEED, COIN_COUNT,
  BATTLE_MAX_DEATHS,
  SKINS, AI_SKINS, AI_NAMES,
  FOOD_EMOJIS, SPECIAL_FOOD_EMOJIS, FOOD_IMAGES, SPECIAL_FOOD_IMAGES,
  type Worm, type Food, type Coin, type Particle, type Camera, type Potion, type Chest, type FlyingCoin,
  type Segment, type WormSkin, type AIStrategy, type GameMode, type HeadType, type PotionType,
  POTION_DURATION, POTION_COUNT, CHEST_COUNT,
} from '@/types/game'
// Multiplayer now handled by SpacetimeService

// ============================================
// DOM guard — skip Image/Canvas operations outside browser
// ============================================
const IS_DOM = typeof Image !== 'undefined'

// ============================================
// HEAD IMAGE CACHE — load once
// ============================================
const headImageCache = new Map<string, HTMLImageElement>()
const accessoryHeadCache = new Map<string, boolean>()

function loadHeadImage(src: string): HTMLImageElement | null {
  if (!IS_DOM) return null
  if (headImageCache.has(src)) return headImageCache.get(src)!
  const img = new Image()
  img.src = src
  img.onload = () => { headImageCache.set(src, img) }
  return null
}

function isAccessoryHeadImage(src: string, img: HTMLImageElement): boolean {
  if (!IS_DOM) return false
  if (accessoryHeadCache.has(src)) return accessoryHeadCache.get(src)!
  if (!img.naturalWidth || !img.naturalHeight) return false

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return false

  ctx.drawImage(img, 0, 0)

  // Sample the lower-center zone where a face should normally exist.
  const sampleW = Math.max(1, Math.floor(img.naturalWidth * 0.34))
  const sampleH = Math.max(1, Math.floor(img.naturalHeight * 0.28))
  const sampleX = Math.floor((img.naturalWidth - sampleW) / 2)
  const sampleY = Math.floor(img.naturalHeight * 0.48)
  const { data } = ctx.getImageData(sampleX, sampleY, sampleW, sampleH)

  let opaquePixels = 0
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 32) opaquePixels++
  }

  const coverage = opaquePixels / (sampleW * sampleH)
  const isAccessory = coverage < 0.22
  accessoryHeadCache.set(src, isAccessory)
  return isAccessory
}

// Build HEAD_IMAGES dynamically from events + base heads
import { GAME_EVENTS as _EVENTS_FOR_HEADS } from '@/config/events'
const HEAD_IMAGES: Record<string, string> = {
  queen: '/heads/queen.png',
  king: '/heads/king.png',
  dragon: '/heads/dragon.png',
  cat: '/heads/cat.png',
  dog: '/heads/dog.png',
  panda: '/heads/panda.png',
  fox: '/heads/fox.png',
  penguin: '/heads/penguin.png',
  robot: '/heads/robot.png',
  alien: '/heads/alien.png',
  ninja: '/heads/ninja.png',
}
for (const ev of _EVENTS_FOR_HEADS) {
  for (const c of ev.costumes) {
    HEAD_IMAGES[c.id] = c.preview
  }
}

// Body texture cache
const bodyTextureCache = new Map<string, HTMLImageElement>()

function loadBodyTexture(src: string): HTMLImageElement | null {
  if (!IS_DOM) return null
  if (bodyTextureCache.has(src)) return bodyTextureCache.get(src)!
  const img = new Image()
  img.src = src
  img.onload = () => { bodyTextureCache.set(src, img) }
  return null
}

const BODY_TEXTURES: Record<string, string> = {
  dragon: '/heads/dragon-body.png',
  cat: '/heads/cat-body.png',
  dog: '/heads/dog-body.png',
  panda: '/heads/panda-body.png',
  fox: '/heads/fox-body.png',
  penguin: '/heads/penguin-body.png',
  robot: '/heads/robot-body.png',
  alien: '/heads/alien-body.png',
  ninja: '/heads/ninja-body.png',
}
for (const ev of _EVENTS_FOR_HEADS) {
  for (const c of ev.costumes) {
    BODY_TEXTURES[c.id] = c.bodyTexture
  }
}

const DEFAULT_FLAG_TEXTURE_SCALE = 1.4

const BODY_TEXTURE_OFFSETS: Record<string, number> = {
  '/assets/france.png': 0.18,
}

const BODY_TEXTURE_SCALES: Record<string, number> = {
  '/assets/france.png': DEFAULT_FLAG_TEXTURE_SCALE,
}

function drawDefaultHeadFace(
  ctx: CanvasRenderingContext2D,
  hp: { x: number; y: number },
  headR: number,
  colors: string[],
  eyeBlink: number,
) {
  ctx.beginPath()
  ctx.arc(hp.x, hp.y, headR * 0.98, 0, Math.PI * 2)
  ctx.fillStyle = colors[0]
  ctx.fill()

  const eyeR = headR * 0.32
  const pupilR = eyeR * 0.55
  const eyeSpacing = headR * 0.35

  for (let side = -1; side <= 1; side += 2) {
    const ex = hp.x + side * eyeSpacing
    const ey = hp.y - headR * 0.1

    ctx.beginPath()
    ctx.arc(ex, ey, eyeR, 0, Math.PI * 2)
    ctx.fillStyle = eyeBlink > 0 ? colors[0] : '#ffffff'
    ctx.fill()

    if (eyeBlink <= 0) {
      ctx.beginPath()
      ctx.arc(ex, ey, pupilR, 0, Math.PI * 2)
      ctx.fillStyle = '#111'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(ex - pupilR * 0.3, ey - pupilR * 0.3, pupilR * 0.35, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()
    }
  }
}

function drawTexturedHeadFace(
  ctx: CanvasRenderingContext2D,
  hp: { x: number; y: number },
  headR: number,
  img: HTMLImageElement,
  angle: number,
  eyeBlink: number,
) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(hp.x, hp.y, headR * 0.98, 0, Math.PI * 2)
  ctx.clip()
  ctx.translate(hp.x, hp.y)
  ctx.rotate(angle)
  const drawR = headR * 1.9
  ctx.drawImage(img, -drawR * 1.25, -drawR, drawR * 2.5, drawR * 2)
  ctx.restore()

  const eyeR = headR * 0.32
  const pupilR = eyeR * 0.55
  const eyeSpacing = headR * 0.35

  for (let side = -1; side <= 1; side += 2) {
    const ex = hp.x + side * eyeSpacing
    const ey = hp.y - headR * 0.1

    ctx.beginPath()
    ctx.arc(ex, ey, eyeR, 0, Math.PI * 2)
    ctx.fillStyle = eyeBlink > 0 ? 'rgba(255,255,255,0.12)' : '#ffffff'
    ctx.fill()

    if (eyeBlink <= 0) {
      ctx.beginPath()
      ctx.arc(ex, ey, pupilR, 0, Math.PI * 2)
      ctx.fillStyle = '#111'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(ex - pupilR * 0.3, ey - pupilR * 0.3, pupilR * 0.35, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()
    }
  }
}

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

function drawFlagTextureOnBody(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  segR: number,
  img: HTMLImageElement,
) {
  if (points.length < 2 || !img.complete || img.naturalWidth <= 0 || img.naturalHeight <= 0) return

  const R = segR + 1
  const head = points[0]
  const tail = points[points.length - 1]
  const angle = Math.atan2(head.y - tail.y, head.x - tail.x)

  let bodyLength = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    bodyLength += Math.sqrt(dx * dx + dy * dy)
  }

  const normals: { nx: number; ny: number }[] = []
  for (let i = 0; i < points.length; i++) {
    let dx = 0, dy = 0
    const range = 3
    for (let j = Math.max(0, i - range); j < Math.min(points.length - 1, i + range); j++) {
      dx += points[j + 1].x - points[j].x
      dy += points[j + 1].y - points[j].y
    }
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    normals.push({ nx: -dy / len, ny: dx / len })
  }

  const upper: { x: number; y: number }[] = []
  const lower: { x: number; y: number }[] = []
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    const n = normals[i]
    upper.push({ x: p.x + n.nx * R, y: p.y + n.ny * R })
    lower.push({ x: p.x - n.nx * R, y: p.y - n.ny * R })
  }

  const drawSmoothCurve = (curvePoints: { x: number; y: number }[]) => {
    if (curvePoints.length < 2) return
    ctx.moveTo(curvePoints[0].x, curvePoints[0].y)
    for (let i = 0; i < curvePoints.length - 1; i++) {
      const cx = (curvePoints[i].x + curvePoints[i + 1].x) / 2
      const cy = (curvePoints[i].y + curvePoints[i + 1].y) / 2
      ctx.quadraticCurveTo(curvePoints[i].x, curvePoints[i].y, cx, cy)
    }
    const last = curvePoints[curvePoints.length - 1]
    ctx.lineTo(last.x, last.y)
  }

  ctx.save()
  ctx.beginPath()
  drawSmoothCurve(upper)
  ctx.arc(
    tail.x, tail.y, R,
    Math.atan2(upper[upper.length - 1].y - tail.y, upper[upper.length - 1].x - tail.x),
    Math.atan2(lower[lower.length - 1].y - tail.y, lower[lower.length - 1].x - tail.x),
  )
  drawSmoothCurve([...lower].reverse())
  ctx.arc(
    head.x, head.y, R,
    Math.atan2(lower[0].y - head.y, lower[0].x - head.x),
    Math.atan2(upper[0].y - head.y, upper[0].x - head.x),
  )
  ctx.closePath()
  ctx.clip()

  const centerX = (head.x + tail.x) * 0.5
  const centerY = (head.y + tail.y) * 0.5
  const drawW = Math.max(bodyLength + R * 4, R * 10)
  const drawH = R * 2.05
  ctx.translate(centerX, centerY)
  ctx.rotate(angle)
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)

  const shine = ctx.createLinearGradient(0, -drawH / 2, 0, drawH / 2)
  shine.addColorStop(0, 'rgba(255,255,255,0.28)')
  shine.addColorStop(0.32, 'rgba(255,255,255,0.08)')
  shine.addColorStop(0.6, 'rgba(0,0,0,0)')
  shine.addColorStop(1, 'rgba(0,0,0,0.22)')
  ctx.fillStyle = shine
  ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH)
  ctx.restore()

  ctx.save()
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.lineWidth = Math.max(1, R * 0.18)
  ctx.strokeStyle = 'rgba(0,0,0,0.28)'
  ctx.beginPath()
  drawSmoothCurve(points)
  ctx.stroke()
  ctx.restore()
}

// Preload all (only in browser)
if (typeof Image !== 'undefined') {
  Object.values(HEAD_IMAGES).forEach(src => loadHeadImage(src))
  Object.values(BODY_TEXTURES).forEach(src => loadBodyTexture(src))
}

// ============================================
// SPATIAL GRID - O(1) food lookup instead of O(n)
// ============================================
const GRID_CELL = 200 // world units per cell
const MAX_PARTICLES = 500

class SpatialGrid {
  private cells = new Map<number, Food[]>()
  private _foods: Food[] = []

  private key(x: number, y: number): number {
    const cx = Math.floor(x / GRID_CELL) & 0xFFFF
    const cy = Math.floor(y / GRID_CELL) & 0xFFFF
    return (cx << 16) | cy
  }

  rebuild(foods: Food[]) {
    this._foods = foods
    this.cells.clear()
    for (const f of foods) {
      const k = this.key(f.x, f.y)
      const cell = this.cells.get(k)
      if (cell) cell.push(f)
      else this.cells.set(k, [f])
    }
  }

  /** Return foods within `range` of (x,y) */
  query(x: number, y: number, range: number): Food[] {
    const result: Food[] = []
    const r = Math.ceil(range / GRID_CELL)
    const cx0 = Math.floor(x / GRID_CELL)
    const cy0 = Math.floor(y / GRID_CELL)
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        const k = this.key((cx0 + dx) * GRID_CELL, (cy0 + dy) * GRID_CELL)
        const cell = this.cells.get(k)
        if (cell) {
          for (const f of cell) {
            const fdx = f.x - x, fdy = f.y - y
            if (fdx * fdx + fdy * fdy < range * range) result.push(f)
          }
        }
      }
    }
    return result
  }
}

// ============================================
// GAME ENGINE STATE
// ============================================
interface EngineState {
  gameRunning: boolean
  player: Worm | null
  aiWorms: Worm[]
  remotePlayers: Map<string, Worm>
  foods: Food[]
  coins: Coin[]
  particles: Particle[]
  camera: Camera
  playerCoins: number
  boostEnergy: number
  boosting: boolean
  controlMode: 'mouse' | 'keyboard' | 'touch'
  mouse: { x: number; y: number }
  touchStart: { x: number; y: number } | null
  touchVector: { x: number; y: number }
  keys: { up: boolean; down: boolean; left: boolean; right: boolean }
  frameCount: number
  lastTime: number
  spawnTimer: number
  usedAINames: string[]
  guestCounter: number
  // Chests & flying coins
  chests: Chest[]
  flyingCoins: FlyingCoin[]
  // Potions
  potions: Potion[]
  activeEffects: { type: PotionType; expiresAt: number }[]
  // Spatial
  foodGrid: SpatialGrid
  // Multiplayer
  mp: null
  roomSlug: string | null
  roomId: string | null
  gameMode: GameMode
  localBattleDeaths: number
  playerKills: number
  isGameOver: boolean
}

// ============================================
// HELPERS
// ============================================
function createFood(x?: number, y?: number, special?: boolean): Food {
  const images = special ? SPECIAL_FOOD_IMAGES : FOOD_IMAGES
  const img = images[Math.floor(Math.random() * images.length)]
  const emojis = special ? SPECIAL_FOOD_EMOJIS : FOOD_EMOJIS
  const emoji = emojis[Math.floor(Math.random() * emojis.length)]
  return {
    x: x !== undefined ? x : Math.random() * WORLD_SIZE - WORLD_SIZE / 2,
    y: y !== undefined ? y : Math.random() * WORLD_SIZE - WORLD_SIZE / 2,
    radius: special ? 12 + Math.random() * 5 : 7 + Math.random() * 4,
    emoji,
    img,
    value: special ? 5 : 1,
    pulse: Math.random() * Math.PI * 2,
    special: !!special,
  }
}

function createCoin(): Coin {
  return {
    x: Math.random() * WORLD_SIZE - WORLD_SIZE / 2,
    y: Math.random() * WORLD_SIZE - WORLD_SIZE / 2,
    radius: 22,
    pulse: Math.random() * Math.PI * 2,
    spin: Math.random() * Math.PI * 2,
  }
}

const POTION_TYPES: PotionType[] = ['speed', 'zoom', 'magnet']
const POTION_COLORS: Record<PotionType, string> = {
  speed: '#ff4444',
  zoom: '#4488ff',
  magnet: '#aa44ff',
}
const POTION_ICONS: Record<PotionType, string> = {
  speed: '\u26A1',  // lightning
  zoom: '\uD83D\uDD0D',  // magnifying glass
  magnet: '\uD83E\uDDF2', // magnet
}
const POTION_IMAGES: Partial<Record<PotionType, string>> = {
  speed: '/potions/speed.png',
  zoom: '/potions/zoom.png',
  magnet: '/potions/magnet.png',
}

// Preload potion images
const potionImgCache = new Map<string, HTMLImageElement>()
if (IS_DOM) Object.values(POTION_IMAGES).forEach(src => {
  if (!src) return
  const img = new Image()
  img.src = src
  img.onload = () => { potionImgCache.set(src, img) }
})

function createPotion(): Potion {
  return {
    x: Math.random() * WORLD_SIZE - WORLD_SIZE / 2,
    y: Math.random() * WORLD_SIZE - WORLD_SIZE / 2,
    radius: 18,
    type: POTION_TYPES[Math.floor(Math.random() * POTION_TYPES.length)],
    pulse: Math.random() * Math.PI * 2,
  }
}

function createChest(): Chest {
  return {
    x: Math.random() * WORLD_SIZE - WORLD_SIZE / 2,
    y: Math.random() * WORLD_SIZE - WORLD_SIZE / 2,
    radius: 30,
    pulse: Math.random() * Math.PI * 2,
    opened: false,
    openAnim: 0,
  }
}

function createWorm(x: number, y: number, skin: WormSkin, name: string, isPlayer: boolean): Worm {
  const segments: Segment[] = []
  const len = isPlayer ? 20 : 80
  for (let i = 0; i < len; i++) {
    segments.push({ x: x - i * BASE_SEGMENT_GAP, y })
  }
  return {
    segments,
    angle: 0,
    targetAngle: 0,
    speed: BASE_SPEED,
    skin,
    name,
    score: 0,
    isPlayer,
    alive: true,
    boosting: false,
    boostEnergy: 100,
    segmentsToAdd: 0,
    aiTimer: 0,
    aiTarget: null,
    aiAvoidTimer: 0,
    aiSkill: 0.35 + Math.random() * 0.55,
    aiAggression: Math.random(),
    aiGreed: 0.3 + Math.random() * 0.7,
    aiDistracted: 0,
    aiStrategy: (['hunter', 'farmer', 'explorer', 'camper'] as AIStrategy[])[Math.floor(Math.random() * 4)],
    aiDeathFood: null,
    aiFrenzy: 0,
    eyeBlink: 0,
    invincible: isPlayer ? 120 : 60,
    trappedSince: 0,
    battleDeaths: 0,
  }
}

function getWormRadius(worm: Worm): number {
  const len = worm.segments.length
  const growth = Math.pow(len / 300, 2) * 5
  return BASE_RADIUS + Math.min(growth, 10)
}

function getWormSpeed(worm: Worm): number {
  const len = worm.segments.length
  const slowdown = Math.pow(len / 80000, 2) * 1.3
  const base = Math.max(BASE_SPEED - slowdown, 0.7)
  return worm.boosting ? base * 1.8 : base
}

// ============================================
// WORLD TO SCREEN
// ============================================
function worldToScreen(wx: number, wy: number, camera: Camera, canvasW: number, canvasH: number) {
  return {
    x: (wx - camera.x) * camera.zoom + canvasW / 2,
    y: (wy - camera.y) * camera.zoom + canvasH / 2,
  }
}

// ============================================
// FOOD HOTSPOT DETECTION
// ============================================
function findFoodHotspot(x: number, y: number, range: number, foods: Food[]) {
  let count = 0, totalX = 0, totalY = 0, totalValue = 0
  for (const f of foods) {
    if (f.fromDeath) continue // AI ignores death food
    const dx = x - f.x, dy = y - f.y
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d < range) {
      count++
      totalX += f.x
      totalY += f.y
      totalValue += f.value
      if (f.fromDeath) { count += 3; totalValue += 10 }
    }
  }
  if (count < 8) return null
  return { x: totalX / count, y: totalY / count, score: totalValue, count }
}

// ============================================
// UPDATE WORM
// ============================================
interface EffectMods { speedMult: number; magnetRange: number }
const NO_EFFECTS: EffectMods = { speedMult: 1, magnetRange: 0 }

function updateWorm(worm: Worm, dt: number, foods: Food[], coins: Coin[], particles: Particle[], playerCoinsRef: { value: number }, foodGrid?: SpatialGrid, effects?: EffectMods, flyingCoins?: FlyingCoin[], camera?: Camera, canvasW?: number, canvasH?: number) {
  if (!worm.alive) return
  if (worm.invincible > 0) worm.invincible -= dt

  // Boost
  if (worm.boosting && worm.boostEnergy > 0 && worm.segments.length > 10) {
    worm.boostEnergy -= 0.5 * dt
    if (worm.boostEnergy <= 0) worm.boosting = false
    if (Math.random() < 0.03 * dt && worm.segments.length > 10) {
      const tail = worm.segments.pop()!
      foods.push({ ...createFood(tail.x + (Math.random() - 0.5) * 20, tail.y + (Math.random() - 0.5) * 20, false), fromDeath: false })
    }
  } else if (!worm.boosting) {
    worm.boostEnergy = Math.min(100, worm.boostEnergy + 0.15 * dt)
  }

  // Smooth turning
  let angleDiff = worm.targetAngle - worm.angle
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
  const turnRate = worm.boosting ? TURN_SPEED * 0.7 : TURN_SPEED
  let turnMult: number
  if (worm.isPlayer) {
    turnMult = worm.segments.length > 0 ? 3 : 3
  } else {
    turnMult = 1.8 + (worm.aiSkill || 0.5) * 1.2
  }
  worm.angle += angleDiff * turnRate * turnMult * dt

  // Move head
  const eff = effects ?? NO_EFFECTS
  const speed = getWormSpeed(worm) * eff.speedMult * dt
  const head = worm.segments[0]
  head.x += Math.cos(worm.angle) * speed
  head.y += Math.sin(worm.angle) * speed

  // World bounds
  const half = WORLD_SIZE / 2
  if (head.x < -half || head.x > half || head.y < -half || head.y > half) {
    head.x = Math.max(-half + 20, Math.min(half - 20, head.x))
    head.y = Math.max(-half + 20, Math.min(half - 20, head.y))
    if (!worm.isPlayer) {
      worm.targetAngle = Math.atan2(-head.y, -head.x)
    }
  }

  // Move segments
  const gap = BASE_SEGMENT_GAP + Math.min(Math.pow(Math.max(worm.segments.length - 30, 0) / 50, 2) * 6, 10)
  for (let i = 1; i < worm.segments.length; i++) {
    const prev = worm.segments[i - 1]
    const curr = worm.segments[i]
    const dx = prev.x - curr.x
    const dy = prev.y - curr.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > gap) {
      const ratio = gap / dist
      curr.x = prev.x - dx * ratio
      curr.y = prev.y - dy * ratio
    }
  }

  // Add queued segments
  if (worm.segmentsToAdd >= 1) {
    const last = worm.segments[worm.segments.length - 1]
    worm.segments.push({ x: last.x, y: last.y })
    worm.segmentsToAdd -= 1
  }

  // Eat food — use spatial grid for O(nearby) instead of O(all)
  const headR = getWormRadius(worm)
  const attractRange = headR + 35 + eff.magnetRange
  const nearby = foodGrid ? foodGrid.query(head.x, head.y, attractRange) : foods
  for (const f of nearby) {
    // AI worms ignore death food — only player can eat it
    if (f.fromDeath && !worm.isPlayer) continue
    const dx = head.x - f.x, dy = head.y - f.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < attractRange && dist > 0.001) {
      const pull = 0.1 + (1 - dist / attractRange) * 0.22
      f.x += dx * pull
      f.y += dy * pull
    }

    const collectedDx = head.x - f.x, collectedDy = head.y - f.y
    const collectedDist = Math.sqrt(collectedDx * collectedDx + collectedDy * collectedDy)
    if (collectedDist < headR + f.radius + 4) {
      worm.score += f.value
      worm.segmentsToAdd += f.fromDeath ? 0.4 : 0.11
      if (particles.length < MAX_PARTICLES) {
        for (let p = 0; p < 3; p++) {
          particles.push({
            x: f.x, y: f.y,
            vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
            life: 20, maxLife: 20,
            color: ['#ffd700', '#ff6b35', '#ff3366', '#7cff00', '#00ccff', '#ff69b4'][Math.floor(Math.random() * 6)],
            radius: f.radius * 0.6,
          })
        }
      }
      const idx = foods.indexOf(f)
      if (idx >= 0) {
        foods.splice(idx, 1)
        if (!f.fromDeath) {
          // Respawn as diamond if original was diamond, otherwise regular food
          if ((f as any)._diamondIdx !== undefined) {
            const nf = createFood()
            nf.emoji = '💎'
            nf.img = undefined
            nf.value = 2
            nf.radius = 12 + Math.random() * 8
            ;(nf as any)._diamondIdx = Math.floor(Math.random() * DIAMOND_COLORS.length)
            foods.push(nf)
          } else {
            foods.push(createFood(undefined, undefined, f.special))
          }
        }
      }
    }
  }

  // Collect coins (player only)
  if (worm.isPlayer) {
    const coinAttractRange = headR + 20 + eff.magnetRange
    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i]
      const dx = head.x - c.x, dy = head.y - c.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      // Magnet: pull coins toward player head
      if (eff.magnetRange > 0 && dist < coinAttractRange && dist > 0.001) {
        const pull = 0.12 + (1 - dist / coinAttractRange) * 0.25
        c.x += dx * pull
        c.y += dy * pull
      }
      // Check head OR any body segment (so coins on body get collected)
      let touching = dist < headR + c.radius
      if (!touching) {
        // Check every 4th segment for perf
        for (let si = 0; si < worm.segments.length; si += 4) {
          const seg = worm.segments[si]
          const sdx = seg.x - c.x, sdy = seg.y - c.y
          if (sdx * sdx + sdy * sdy < (headR + c.radius) * (headR + c.radius)) {
            touching = true
            break
          }
        }
      }
      if (touching) {
        playerCoinsRef.value++
        getNativeBridge().haptic('light')
        getNativeBridge().playSound('coin')
        // Play coin pickup sound (instant via Web Audio, fallback HTMLAudio)
        if (typeof window !== 'undefined') {
          try {
            const ctx = (window as any).__audioCtx as AudioContext | undefined
            const buffer = (window as any).__coinBuffer as AudioBuffer | undefined
            if (ctx && buffer) {
              if (ctx.state === 'suspended') ctx.resume()
              const source = ctx.createBufferSource()
              source.buffer = buffer
              const gain = ctx.createGain()
              let vol = 0.6
              try { const v = localStorage.getItem('sfxVolume'); if (v) vol = parseFloat(v) } catch {}
              gain.gain.value = vol
              source.connect(gain).connect(ctx.destination)
              source.start(0)
            } else {
              const sfx = (window as any).__coinSfx as HTMLAudioElement | undefined
              if (sfx) { sfx.currentTime = 0; sfx.play().catch(() => {}) }
            }
          } catch {}
        }
        // Spawn flying coin animation toward the coin panel (bottom-left)
        if (flyingCoins && canvasH) {
          flyingCoins.push({
            wx: c.x,
            wy: c.y,
            targetX: 50,
            targetY: canvasH - 30,
            progress: 0,
            speed: 0.06 + Math.random() * 0.04,
          })
        }
        if (particles.length < MAX_PARTICLES) {
          for (let p = 0; p < 3; p++) {
            particles.push({
              x: c.x, y: c.y,
              vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5,
              life: 20, maxLife: 20,
              color: '#ffd700',
              radius: 2 + Math.random() * 2,
            })
          }
        }
        coins.splice(i, 1)
        // Only respawn loose coins (not chest coins)
        if (!c.fromChest) coins.push(createCoin())
      }
    }
  }

  // Eye blink
  worm.eyeBlink = Math.max(0, worm.eyeBlink - 1)
  if (Math.random() < 0.003) worm.eyeBlink = 8
}

// ============================================
// AI LOGIC
// ============================================
function updateAI(worm: Worm, allWorms: Worm[], foods: Food[], foodGrid?: SpatialGrid) {
  if (!worm.alive) return
  worm.aiTimer--
  if (worm.aiDistracted > 0) worm.aiDistracted--

  const head = worm.segments[0]
  // Avoid allocating a new array every call — iterate and skip inline
  const others: Worm[] = []
  for (const w of allWorms) { if (w !== worm && w.alive) others.push(w) }
  const mySize = worm.segments.length

  // --- SMART DANGER DETECTION ---
  // Skilled worms see further and check more segments
  const visionRange = 120 + worm.aiSkill * 180 // 120-300 range based on skill
  const dangers: { x: number; y: number; dist: number; angle: number }[] = []
  let closestDangerDist = visionRange

  if (Math.random() < worm.aiGreed * 0.02) worm.aiDistracted = 15 + Math.floor(Math.random() * 20)

  const canSeeDanger = worm.aiDistracted <= 0 && Math.random() < (0.5 + worm.aiSkill * 0.5)
  if (canSeeDanger) {
    for (const other of others) {
      // Check MORE segments — skilled worms scan the full body
      const checkLimit = Math.min(other.segments.length, 40 + Math.floor(worm.aiSkill * 160))
      const step = Math.max(1, Math.floor((1 - worm.aiSkill) * 4))
      for (let i = 0; i < checkLimit; i += step) {
        const seg = other.segments[i]
        const dx = head.x - seg.x, dy = head.y - seg.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < visionRange) {
          dangers.push({ x: seg.x, y: seg.y, dist: d, angle: Math.atan2(dy, dx) })
          if (d < closestDangerDist) closestDangerDist = d
        }
      }
    }

    // LOOK AHEAD — predict where we'll be in ~20 frames and check for danger there
    const lookAheadDist = 60 + worm.aiSkill * 80
    const futureX = head.x + Math.cos(worm.angle) * lookAheadDist
    const futureY = head.y + Math.sin(worm.angle) * lookAheadDist
    for (const other of others) {
      const checkLimit = Math.min(other.segments.length, 60 + Math.floor(worm.aiSkill * 140))
      const step = Math.max(1, Math.floor((1 - worm.aiSkill) * 5))
      for (let i = 0; i < checkLimit; i += step) {
        const seg = other.segments[i]
        const dx = futureX - seg.x, dy = futureY - seg.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 60 + worm.aiSkill * 40) {
          // Danger ahead! Treat it as closer than it really is to trigger early avoidance
          const urgency = d * 0.5
          dangers.push({ x: seg.x, y: seg.y, dist: urgency, angle: Math.atan2(head.y - seg.y, head.x - seg.x) })
          if (urgency < closestDangerDist) closestDangerDist = urgency
        }
      }
    }

    // Detect walls as danger
    const half = WORLD_SIZE / 2
    const wallDist = 100 + worm.aiSkill * 100
    if (head.x < -half + wallDist) dangers.push({ x: -half, y: head.y, dist: head.x + half, angle: Math.PI })
    if (head.x > half - wallDist) dangers.push({ x: half, y: head.y, dist: half - head.x, angle: 0 })
    if (head.y < -half + wallDist) dangers.push({ x: head.x, y: -half, dist: head.y + half, angle: Math.PI / 2 })
    if (head.y > half - wallDist) dangers.push({ x: head.x, y: half, dist: half - head.y, angle: -Math.PI / 2 })
  }

  const inFrenzy = (worm.aiFrenzy ?? 0) > 0
  const reactionDist = inFrenzy ? 40 + worm.aiSkill * 30 : 60 + worm.aiSkill * 80

  if (dangers.length > 0 && closestDangerDist < reactionDist) {
    if (dangers.length >= 4 && worm.aiSkill > 0.4) {
      // SURROUNDED — circle tightly to survive
      const now = Date.now()

      // Start trapped timer if not already set
      if (worm.trappedSince === 0) worm.trappedSince = now

      const trappedSeconds = (now - worm.trappedSince) / 1000

      if (trappedSeconds < 34) {
        // LOOK FOR A GAP — test 12 directions, find the clearest escape route
        let bestGapAngle = -1
        let bestGapClearance = 0
        const escapeCheckDist = 120
        for (let a = 0; a < 12; a++) {
          const testAngle = (a / 12) * Math.PI * 2
          const testX = head.x + Math.cos(testAngle) * escapeCheckDist
          const testY = head.y + Math.sin(testAngle) * escapeCheckDist
          // Also check a second point further out to confirm the gap is real
          const testX2 = head.x + Math.cos(testAngle) * escapeCheckDist * 2
          const testY2 = head.y + Math.sin(testAngle) * escapeCheckDist * 2
          let minDist = Infinity
          for (const d of dangers) {
            const dd1 = (testX - d.x) ** 2 + (testY - d.y) ** 2
            const dd2 = (testX2 - d.x) ** 2 + (testY2 - d.y) ** 2
            const dd = Math.min(dd1, dd2)
            if (dd < minDist) minDist = dd
          }
          if (minDist > bestGapClearance) {
            bestGapClearance = minDist
            bestGapAngle = testAngle
          }
        }

        // If there's a clear gap (clearance > 80^2 = 6400), DASH for it!
        if (bestGapClearance > 6400 && bestGapAngle >= 0) {
          worm.targetAngle = bestGapAngle
          worm.boosting = worm.boostEnergy > 10 // boost through the gap
          worm.aiTimer = 6
          worm.trappedSince = 0 // escaping!
        } else {
          // No gap found — circle tightly and wait
          let avgDx = 0, avgDy = 0
          for (const d of dangers) {
            const weight = 1 / (d.dist + 1)
            avgDx += (d.x - head.x) * weight
            avgDy += (d.y - head.y) * weight
          }
          const awayAngle = Math.atan2(-avgDy, -avgDx)
          const circleDir = Math.sin(worm.angle - awayAngle) > 0 ? 1 : -1
          worm.targetAngle = awayAngle + circleDir * Math.PI * 0.45
          worm.boosting = false
          worm.aiTimer = 4
        }
      } else {
        // EXHAUSTED — been trapped 34+ seconds, desperately try to break out
        // Pick a random direction and boost through (will likely die)
        worm.targetAngle = Math.random() * Math.PI * 2
        worm.boosting = worm.boostEnergy > 5
        worm.aiTimer = 15
        worm.trappedSince = 0 // reset for next time
      }
    } else if (dangers.length >= 2) {
      // Not fully surrounded — reset trapped timer
      worm.trappedSince = 0
      // MULTIPLE DANGERS — find the safest escape direction
      // Try 8 directions, pick the one furthest from all dangers
      let bestAngle = worm.angle
      let bestMinDist = 0
      for (let a = 0; a < 8; a++) {
        const testAngle = (a / 8) * Math.PI * 2
        const testX = head.x + Math.cos(testAngle) * 80
        const testY = head.y + Math.sin(testAngle) * 80
        let minDist = Infinity
        for (const d of dangers) {
          const dx = testX - d.x, dy = testY - d.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < minDist) minDist = dist
        }
        if (minDist > bestMinDist) {
          bestMinDist = minDist
          bestAngle = testAngle
        }
      }
      worm.targetAngle = bestAngle
      worm.boosting = closestDangerDist < 50 && worm.aiSkill > 0.5 && worm.boostEnergy > 20
      worm.aiTimer = 5 + Math.floor(Math.random() * 8)
    } else {
      // SINGLE DANGER — flee smartly
      worm.trappedSince = 0
      const closest = dangers.reduce((a, b) => a.dist < b.dist ? a : b)
      const avoidAngle = Math.atan2(head.y - closest.y, head.x - closest.x)
      const error = (1 - worm.aiSkill) * (Math.random() - 0.5) * 0.8
      worm.targetAngle = avoidAngle + error
      worm.boosting = closestDangerDist < 40 && worm.aiSkill > 0.5 && worm.boostEnergy > 20
      worm.aiTimer = 4 + Math.floor(Math.random() * 8)
    }
    if (inFrenzy) worm.aiFrenzy = Math.max(0, worm.aiFrenzy - 10)
    return
  }

  // Not in danger — reset trapped timer
  worm.trappedSince = 0

  // --- DEATH FOOD RUSH — AI eats nearby death food ---
  if (worm.aiTimer <= 0) {
    let bestDeathFood: Food | null = null
    let bestDeathDist = 300
    for (const f of foods) {
      if (!f.fromDeath) continue
      const dx = head.x - f.x, dy = head.y - f.y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < bestDeathDist) {
        bestDeathDist = d
        bestDeathFood = f
      }
    }
    if (bestDeathFood) {
      worm.targetAngle = Math.atan2(bestDeathFood.y - head.y, bestDeathFood.x - head.x)
      worm.boosting = bestDeathDist > 50 && worm.boostEnergy > 20
      worm.aiTimer = 8 + Math.floor(Math.random() * 6)
      return
    }
  }

  // --- ENCIRCLE — big worms try to surround smaller players ---
  if (mySize > 150 && worm.aiSkill > 0.5) {
    for (const other of others) {
      if (!other.isPlayer && Math.random() > 0.3) continue
      if (other.segments.length >= mySize * 0.7) continue
      const oh = other.segments[0]
      const dx = oh.x - head.x, dy = oh.y - head.y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < 400 && d > 30) {

        // CRITICAL: Is the target heading TOWARD us? If yes, DODGE immediately
        const targetToMe = Math.atan2(head.y - oh.y, head.x - oh.x)
        let angleDiffToMe = other.angle - targetToMe
        while (angleDiffToMe > Math.PI) angleDiffToMe -= Math.PI * 2
        while (angleDiffToMe < -Math.PI) angleDiffToMe += Math.PI * 2
        const targetComingAtMe = Math.abs(angleDiffToMe) < 0.6 && d < 200

        if (targetComingAtMe) {
          // Target reversed or is heading right at us — DODGE perpendicular immediately
          const escapeDir = worm.name.charCodeAt(0) % 2 === 0 ? 1 : -1
          worm.targetAngle = targetToMe + Math.PI + escapeDir * Math.PI * 0.5
          worm.boosting = worm.boostEnergy > 10
          worm.aiTimer = 5
          return
        }

        // Also check: am I about to hit the TARGET's body? (not just other worms)
        const lookDist = 60
        const myFutX = head.x + Math.cos(worm.angle) * lookDist
        const myFutY = head.y + Math.sin(worm.angle) * lookDist
        let aboutToHitTarget = false
        const targetCheckLimit = Math.min(other.segments.length, 100)
        for (let si = 4; si < targetCheckLimit; si += 3) {
          const seg = other.segments[si]
          const sdx = myFutX - seg.x, sdy = myFutY - seg.y
          if (sdx * sdx + sdy * sdy < 50 * 50) {
            aboutToHitTarget = true
            break
          }
        }
        if (aboutToHitTarget) {
          // About to crash into the target we're circling — swerve away
          const awayFromTarget = Math.atan2(head.y - oh.y, head.x - oh.x)
          const swerveDir = worm.name.charCodeAt(0) % 2 === 0 ? 1 : -1
          worm.targetAngle = awayFromTarget + swerveDir * 0.5
          worm.boosting = false // don't boost into them
          worm.aiTimer = 4
          return
        }

        // Check if another big worm is already encircling this target
        let competitorCloser = false
        for (const rival of others) {
          if (rival === worm) continue
          if (rival.segments.length < 150) continue
          const rdx = oh.x - rival.segments[0].x
          const rdy = oh.y - rival.segments[0].y
          const rivalDist = Math.sqrt(rdx * rdx + rdy * rdy)
          if (rivalDist < d && rivalDist < 200) {
            // A rival is closer and already encircling — go to opposite side
            competitorCloser = true
            break
          }
        }

        const toTarget = Math.atan2(dy, dx)
        const orbitDir = worm.name.charCodeAt(0) % 2 === 0 ? 1 : -1

        let desiredAngle: number
        if (competitorCloser) {
          // Rival is closer — approach from the OPPOSITE side and boost to get there first
          desiredAngle = toTarget + Math.PI + orbitDir * 0.4
          worm.boosting = worm.boostEnergy > 15
          worm.aiTimer = 6
        } else if (d > 150) {
          // Approach fast — boost to close in before others
          desiredAngle = toTarget + orbitDir * 0.25
          worm.boosting = worm.boostEnergy > 20
        } else {
          // Orbiting — go perpendicular, boost to close the trap
          desiredAngle = toTarget + orbitDir * Math.PI * 0.5
          worm.boosting = worm.boostEnergy > 10
        }

        // CHECK PATH — look ahead at multiple distances for obstacles
        // Also check own body to avoid self-collision while circling
        let pathBlocked = false
        let blockAngle = 0
        for (let checkDist = 40; checkDist <= 140; checkDist += 50) {
          const futX = head.x + Math.cos(desiredAngle) * checkDist
          const futY = head.y + Math.sin(desiredAngle) * checkDist
          // Check other worms
          for (const o of others) {
            if (o === other) continue
            const cl = Math.min(o.segments.length, 120)
            for (let si = 0; si < cl; si += 3) {
              const seg = o.segments[si]
              const sdx = futX - seg.x, sdy = futY - seg.y
              if (sdx * sdx + sdy * sdy < 60 * 60) {
                pathBlocked = true
                blockAngle = Math.atan2(head.y - seg.y, head.x - seg.x)
                break
              }
            }
            if (pathBlocked) break
          }
          // Check own body (skip first 20 segments — that's the head area)
          if (!pathBlocked) {
            for (let si = 20; si < worm.segments.length; si += 3) {
              const seg = worm.segments[si]
              const sdx = futX - seg.x, sdy = futY - seg.y
              if (sdx * sdx + sdy * sdy < 40 * 40) {
                pathBlocked = true
                blockAngle = Math.atan2(head.y - seg.y, head.x - seg.x)
                break
              }
            }
          }
          if (pathBlocked) break
        }

        if (pathBlocked) {
          // Dodge — try multiple escape angles, pick the clearest one
          let bestDodge = desiredAngle + orbitDir * 0.8
          let bestClear = 0
          for (let try_a = 0; try_a < 6; try_a++) {
            const tryAngle = blockAngle + (try_a - 3) * 0.4
            const tryX = head.x + Math.cos(tryAngle) * 100
            const tryY = head.y + Math.sin(tryAngle) * 100
            let minObstDist = Infinity
            for (const o of others) {
              if (o === other) continue
              for (let si = 0; si < Math.min(o.segments.length, 60); si += 4) {
                const seg = o.segments[si]
                const dd = (tryX - seg.x) ** 2 + (tryY - seg.y) ** 2
                if (dd < minObstDist) minObstDist = dd
              }
            }
            if (minObstDist > bestClear) {
              bestClear = minObstDist
              bestDodge = tryAngle
            }
          }
          desiredAngle = bestDodge
        }

        worm.targetAngle = desiredAngle
        worm.boosting = !pathBlocked && worm.boostEnergy > 20
        worm.aiTimer = pathBlocked ? 3 : 8 + Math.floor(Math.random() * 6)
        return
      }
    }
  }

  // Food frenzy — only nearby worms react, short duration, no long-range kamikaze
  if (worm.aiFrenzy === undefined) worm.aiFrenzy = 0
  if (worm.aiFrenzy > 0) worm.aiFrenzy--

  if (worm.aiTimer <= 0 && worm.aiFrenzy <= 0) {
    const hotspot = findFoodHotspot(head.x, head.y, 250, foods)
    if (hotspot && hotspot.count > 12) {
      const dx = hotspot.x - head.x, dy = hotspot.y - head.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 300) {
        worm.aiFrenzy = 25
        worm.targetAngle = Math.atan2(dy, dx)
        if (dist > 50 && dist < 200 && worm.boostEnergy > 30) {
          worm.boosting = true
          worm.aiDistracted = 8
        }
        worm.aiTimer = 10 + Math.floor(Math.random() * 10)
        return
      }
    }
  }

  worm.boosting = false

  // Hunter — chase smaller worms to cut them off
  if (worm.aiStrategy === 'hunter' && worm.aiAggression > 0.4 && mySize > 25) {
    for (const other of others) {
      if (other.segments.length < mySize * 0.6) {
        const oh = other.segments[0]
        const dx = oh.x - head.x, dy = oh.y - head.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 300) {
          // Predict where the target will be
          const predX = oh.x + Math.cos(other.angle) * 80
          const predY = oh.y + Math.sin(other.angle) * 80
          worm.targetAngle = Math.atan2(predY - head.y, predX - head.x)
          worm.boosting = d < 200 && worm.boostEnergy > 20
          worm.aiTimer = 12
          return
        }
      }
    }
  }

  // Camper
  if (worm.aiStrategy === 'camper' && worm.aiTimer <= 0) {
    worm.targetAngle += (Math.random() - 0.5) * 0.3
    worm.aiTimer = 20 + Math.random() * 20
    const nearbyFood = foodGrid ? foodGrid.query(head.x, head.y, 120) : foods
    for (const f of nearbyFood) {
      const dx = head.x - f.x, dy = head.y - f.y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < 120) {
        worm.targetAngle = Math.atan2(f.y - head.y, f.x - head.x)
        worm.aiTimer = 8
        break
      }
    }
    return
  }

  // Explorer
  if (worm.aiStrategy === 'explorer' && worm.aiTimer <= 0) {
    if (Math.random() < 0.05) {
      const rx = (Math.random() - 0.5) * WORLD_SIZE * 0.6
      const ry = (Math.random() - 0.5) * WORLD_SIZE * 0.6
      worm.targetAngle = Math.atan2(ry - head.y, rx - head.x)
      worm.aiTimer = 40 + Math.random() * 40
      return
    }
  }

  // Farmer (fallback)
  if (worm.aiTimer <= 0) {
    let bestFood: Food | null = null
    let bestScore = -Infinity
    const searchRange = Math.min(300 + mySize * 2, 600)

    const farmFood = foodGrid ? foodGrid.query(head.x, head.y, searchRange) : foods
    for (const f of farmFood) {
      const dx = head.x - f.x, dy = head.y - f.y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d > searchRange) continue
      let score = f.value * 15 - d
      if (f.special) score += 80
      if (f.fromDeath) continue // AI ignores death food
      if (score > bestScore) { bestScore = score; bestFood = f }
    }

    if (bestFood) {
      worm.targetAngle = Math.atan2(bestFood.y - head.y, bestFood.x - head.x)
      // Only boost toward special food, not death food from across the map
      if (bestFood.special && worm.aiGreed > 0.4 && worm.boostEnergy > 30) {
        worm.boosting = true
        worm.aiDistracted = 12
      }
    } else {
      worm.targetAngle += (Math.random() - 0.5) * 0.6
    }
    worm.aiTimer = 8 + Math.random() * 18
  }

  // Head-to-head chicken game
  if (mySize > 15 && Math.random() < 0.008) {
    for (const other of others) {
      if (!other.isPlayer) continue
      const oh = other.segments[0]
      const dx = oh.x - head.x, dy = oh.y - head.y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < 400 && d > 100 && Math.random() < 0.3) {
        worm.targetAngle = Math.atan2(dy, dx)
        worm.aiTimer = 20 + Math.random() * 15
        worm.aiDistracted = 25
        break
      }
    }
  }

  // === GLOBAL SAFETY CHECK ===
  // After ANY strategy sets targetAngle, verify the path is clear.
  // If we're about to crash into someone, override with a safe angle.
  if (worm.aiDistracted <= 0) {
    const safeCheckDist = 50 + worm.aiSkill * 50
    const futX = head.x + Math.cos(worm.targetAngle) * safeCheckDist
    const futY = head.y + Math.sin(worm.targetAngle) * safeCheckDist
    let aboutToCrash = false
    let crashSegX = 0, crashSegY = 0
    for (const other of others) {
      const checkSegs = Math.min(other.segments.length, 100)
      for (let si = 0; si < checkSegs; si += 3) {
        const seg = other.segments[si]
        const sdx = futX - seg.x, sdy = futY - seg.y
        if (sdx * sdx + sdy * sdy < 45 * 45) {
          aboutToCrash = true
          crashSegX = seg.x
          crashSegY = seg.y
          break
        }
      }
      if (aboutToCrash) break
    }

    if (aboutToCrash) {
      // Find safest direction away from the obstacle
      const awayFromCrash = Math.atan2(head.y - crashSegY, head.x - crashSegX)
      // Test 3 angles: away, left of away, right of away — pick clearest
      let bestSafe = awayFromCrash
      let bestSafeDist = 0
      for (let t = -1; t <= 1; t++) {
        const tryAngle = awayFromCrash + t * 0.6
        const tx = head.x + Math.cos(tryAngle) * 80
        const ty = head.y + Math.sin(tryAngle) * 80
        let minD = Infinity
        for (const other of others) {
          for (let si = 0; si < Math.min(other.segments.length, 60); si += 4) {
            const seg = other.segments[si]
            const dd = (tx - seg.x) ** 2 + (ty - seg.y) ** 2
            if (dd < minD) minD = dd
          }
        }
        if (minD > bestSafeDist) { bestSafeDist = minD; bestSafe = tryAngle }
      }
      worm.targetAngle = bestSafe
      worm.boosting = false
    }
  }
}

// ============================================
// COLLISION DETECTION
// ============================================
function checkCollisions(
  allWorms: Worm[],
  foods: Food[],
  particles: Particle[],
  onPlayerDeath: () => void,
  onAIDeath: (worm: Worm, idx: number) => void,
) {
  const alive = allWorms.filter(w => w.alive)

  for (const worm of alive) {
    if (worm.invincible > 0) continue
    const head = worm.segments[0]
    const headR = getWormRadius(worm)

    for (const other of alive) {
      if (other === worm || !other.alive) continue
      // Distance-cull: skip collision if heads are too far apart
      // Max possible collision range = other's body length (segments * gap ~15px)
      const otherHead = other.segments[0]
      const hdx = head.x - otherHead.x, hdy = head.y - otherHead.y
      const headDist2 = hdx * hdx + hdy * hdy
      const maxBodySpread = Math.min(other.segments.length * 15, 3000)
      if (headDist2 > (maxBodySpread + headR) * (maxBodySpread + headR)) continue

      const otherR = getWormRadius(other) * 0.9
      // Skip segments in steps for very long worms (check every 2nd segment past 200)
      const step = other.segments.length > 200 ? 2 : 1
      for (let i = 4; i < other.segments.length; i += step) {
        const seg = other.segments[i]
        const dx = head.x - seg.x, dy = head.y - seg.y
        const dist2 = dx * dx + dy * dy
        const threshold = headR + otherR - 4
        if (dist2 < threshold * threshold) {
          killWorm(worm, foods, particles)
          other.score += Math.floor(worm.score * 0.3)
          other.segmentsToAdd += Math.floor(worm.segments.length * 0.1)
          if (worm.isPlayer) onPlayerDeath()
          else {
            const idx = allWorms.indexOf(worm)
            if (idx >= 0) onAIDeath(worm, idx)
          }
          break
        }
      }
      if (!worm.alive) break
    }

    // World border
    if (worm.alive) {
      const half = WORLD_SIZE / 2 - 10
      if (Math.abs(head.x) > half || Math.abs(head.y) > half) {
        killWorm(worm, foods, particles)
        if (worm.isPlayer) onPlayerDeath()
        else {
          const idx = allWorms.indexOf(worm)
          if (idx >= 0) onAIDeath(worm, idx)
        }
      }
    }
  }
}

function killWorm(worm: Worm, foods: Food[], particles: Particle[]) {
  worm.alive = false
  for (let i = 0; i < worm.segments.length; i += 2) {
    const seg = worm.segments[i]
    const f = createFood(
      seg.x + (Math.random() - 0.5) * 30,
      seg.y + (Math.random() - 0.5) * 30,
      i % 6 === 0,
    )
    f.radius = 5 + Math.random() * 5
    f.value = 3
    f.fromDeath = true
    f.spawnedAt = Date.now()
    foods.push(f)
  }
  if (particles.length < MAX_PARTICLES) {
    const deathParticles = Math.min(20, MAX_PARTICLES - particles.length)
    for (let i = 0; i < deathParticles; i++) {
      particles.push({
        x: worm.segments[0].x, y: worm.segments[0].y,
        vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8,
        life: 40, maxLife: 40,
        color: worm.skin.colors[0],
        radius: 4 + Math.random() * 4,
      })
    }
  }
}

// ============================================
// DRAWING
// ============================================
// Event background image cache
const eventBgCache = new Map<string, HTMLImageElement>()
import { GAME_EVENTS } from '@/config/events'
if (IS_DOM) for (const ev of GAME_EVENTS) {
  const img = new Image()
  img.src = ev.bgImage
  img.onload = () => { eventBgCache.set(ev.id, img) }
}

function drawBackground(ctx: CanvasRenderingContext2D, camera: Camera, w: number, h: number, player: Worm, gameMode?: GameMode) {
  const event = gameMode ? getEventByMode(gameMode) : undefined

  const grd = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w)
  if (event) {
    grd.addColorStop(0, event.bgGradient[0])
    grd.addColorStop(1, event.bgGradient[1])
  } else {
    const bgThemes: Record<string, [string, string]> = {
      ocean: ['#1a5c8a', '#0e3a5c'],
      forest: ['#1a6b3a', '#0e3d22'],
      sunset: ['#8a3a1a', '#5c1e0e'],
      purple: ['#5c1a8a', '#360e5c'],
      night: ['#1a1a3a', '#0a0a1e'],
      red: ['#8a1a1a', '#5c0e0e'],
      pink: ['#8a1a6b', '#5c0e45'],
      gold: ['#8a7a1a', '#5c500e'],
      cyan: ['#1a8a8a', '#0e5c5c'],
      grey: ['#4a4a4a', '#2a2a2a'],
      lime: ['#4a8a1a', '#2e5c0e'],
      black: ['#111111', '#000000'],
    }
    let userBg: [string, string] = ['#1a5c8a', '#0e3a5c']
    try {
      const saved = (typeof localStorage !== 'undefined' ? localStorage : null)?.getItem('gameBgColor')
      if (saved && bgThemes[saved]) userBg = bgThemes[saved]
    } catch {}
    grd.addColorStop(0, userBg[0])
    grd.addColorStop(1, userBg[1])
  }
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, w, h)

  // Event: draw themed images scattered in the world (capped for performance)
  if (event) {
    const bgImg = eventBgCache.get(event.id)
    if (bgImg) {
      const effectiveZoom = Math.max(camera.zoom, 0.4) // clamp to avoid too many draws
      const spacing = 380
      const startWX = Math.floor((camera.x - w / 2 / effectiveZoom) / spacing) * spacing
      const startWY = Math.floor((camera.y - h / 2 / effectiveZoom) / spacing) * spacing
      const endWX = camera.x + w / 2 / effectiveZoom
      const endWY = camera.y + h / 2 / effectiveZoom
      ctx.globalAlpha = 0.12
      let count = 0
      for (let wx = startWX; wx <= endWX; wx += spacing) {
        for (let wy = startWY; wy <= endWY; wy += spacing) {
          if (++count > 60) break // hard cap
          const hash = ((wx * 73856093) ^ (wy * 19349663)) >>> 0
          const ox = (hash % 200) - 100
          const oy = ((hash * 31) % 200) - 100
          const rot = ((hash * 17) % 360) * Math.PI / 180
          const size = 35 + (hash % 30)
          const p = worldToScreen(wx + ox, wy + oy, camera, w, h)
          if (p.x < -size || p.x > w + size || p.y < -size || p.y > h + size) continue
          const s = size * camera.zoom
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(rot)
          ctx.drawImage(bgImg, -s / 2, -s / 2, s, s)
          ctx.restore()
        }
        if (count > 60) break
      }
      ctx.globalAlpha = 1
    }
  }

  // Carpet texture (reduced for performance)
  const seed = Math.floor(camera.x * 0.1) + Math.floor(camera.y * 0.1) * 1000
  for (let i = 0; i < 80; i++) {
    const hash = (i * 2654435761 + seed) >>> 0
    const px = ((hash % w) + w) % w
    const py = (((hash * 31) % h) + h) % h
    ctx.fillStyle = hash % 3 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'
    ctx.fillRect(px, py, 1, 1)
  }

  // World border
  const half = WORLD_SIZE / 2
  const tl = worldToScreen(-half, -half, camera, w, h)
  const br = worldToScreen(half, half, camera, w, h)
  ctx.strokeStyle = event ? event.borderColor : 'rgba(255,80,80,0.5)'
  ctx.lineWidth = 4 * camera.zoom
  ctx.setLineDash([20 * camera.zoom, 10 * camera.zoom])
  ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y)
  ctx.setLineDash([])

  // Border glow
  const head = player.segments[0]
  const edgeDist = Math.min(Math.abs(head.x) - half, Math.abs(head.y) - half)
  if (edgeDist > -300) {
    const alpha = Math.max(0, (300 + edgeDist) / 300) * 0.3
    ctx.fillStyle = event ? `${event.glowColor}${alpha})` : `rgba(255,30,30,${alpha})`
    ctx.fillRect(0, 0, w, h)
  }
}

// Food image cache — preload all cartoon food images
const foodImgCache = new Map<string, HTMLImageElement>()

function preloadFoodImages() {
  if (!IS_DOM) return
  const allPaths = [...new Set([...FOOD_IMAGES, ...SPECIAL_FOOD_IMAGES])]
  for (const src of allPaths) {
    if (foodImgCache.has(src)) continue
    const img = new Image()
    img.src = src
    img.onload = () => { foodImgCache.set(src, img) }
  }
}
preloadFoodImages()

// Food style setting — read from storage
let currentFoodStyle: 'images' | 'circles' | 'emojis' = 'images'
function loadFoodStyle() {
  try {
    const s = (typeof localStorage !== 'undefined' ? localStorage : null)?.getItem('foodStyle')
    if (s === 'circles' || s === 'emojis') currentFoodStyle = s
    else currentFoodStyle = 'images'
  } catch { currentFoodStyle = 'images' }
}
loadFoodStyle()

// Circle food colors
const CIRCLE_COLORS = ['#ff3366','#00ccff','#7cff00','#ff6b35','#ffd700','#cc33ff','#ff69b4','#00ff88','#ff4444','#44bbff']

// Diamond rendering for coins mode — realistic brilliant cut
const DIAMOND_COLORS = [
  { h: 210, s: 90, name: 'sapphire' },   // blue sapphire
  { h: 340, s: 80, name: 'ruby' },        // red ruby
  { h: 145, s: 75, name: 'emerald' },     // green emerald
  { h: 280, s: 70, name: 'amethyst' },    // purple amethyst
  { h: 180, s: 10, name: 'diamond' },     // clear diamond
  { h: 45,  s: 85, name: 'topaz' },       // golden topaz
  { h: 190, s: 95, name: 'aqua' },        // aquamarine
]

const diamondCanvases: HTMLCanvasElement[] = []

function hsl(h: number, s: number, l: number, a = 1) {
  return `hsla(${h},${s}%,${l}%,${a})`
}

function generateDiamonds() {
  for (const gem of DIAMOND_COLORS) {
    const S = 128
    const c = document.createElement('canvas')
    c.width = S; c.height = S
    const ctx = c.getContext('2d')!
    const cx = S / 2, cy = S / 2
    const { h, s } = gem

    // Brilliant cut proportions
    const crownTop = S * 0.12
    const girdle = S * 0.42
    const pavilionBot = S * 0.88
    const tableW = S * 0.32
    const crownW = S * 0.48
    const girdleW = S * 0.50

    // --- PAVILION (bottom triangle) ---
    const pavGrad = ctx.createLinearGradient(0, girdle, 0, pavilionBot)
    pavGrad.addColorStop(0, hsl(h, s, 50))
    pavGrad.addColorStop(0.4, hsl(h, s, 30))
    pavGrad.addColorStop(1, hsl(h, s, 15))
    ctx.beginPath()
    ctx.moveTo(cx - girdleW, girdle)
    ctx.lineTo(cx + girdleW, girdle)
    ctx.lineTo(cx, pavilionBot)
    ctx.closePath()
    ctx.fillStyle = pavGrad
    ctx.fill()

    // Pavilion facets
    const pavFacets = [
      [cx - girdleW, girdle, cx - girdleW * 0.3, pavilionBot * 0.92, cx, pavilionBot],
      [cx + girdleW, girdle, cx + girdleW * 0.3, pavilionBot * 0.92, cx, pavilionBot],
      [cx - girdleW * 0.5, girdle, cx, pavilionBot, cx, girdle + (pavilionBot - girdle) * 0.5],
      [cx + girdleW * 0.5, girdle, cx, pavilionBot, cx, girdle + (pavilionBot - girdle) * 0.5],
    ]
    pavFacets.forEach((f, i) => {
      ctx.beginPath()
      ctx.moveTo(f[0], f[1]); ctx.lineTo(f[2], f[3]); ctx.lineTo(f[4], f[5])
      ctx.closePath()
      ctx.fillStyle = hsl(h, s, 25 + i * 8, 0.3)
      ctx.fill()
    })

    // --- CROWN (top trapezoid) ---
    const crownGrad = ctx.createLinearGradient(0, crownTop, 0, girdle)
    crownGrad.addColorStop(0, hsl(h, s, 85))
    crownGrad.addColorStop(0.3, hsl(h, s, 70))
    crownGrad.addColorStop(0.7, hsl(h, s, 55))
    crownGrad.addColorStop(1, hsl(h, s, 45))
    ctx.beginPath()
    ctx.moveTo(cx - tableW, crownTop)
    ctx.lineTo(cx + tableW, crownTop)
    ctx.lineTo(cx + crownW, girdle)
    ctx.lineTo(cx - crownW, girdle)
    ctx.closePath()
    ctx.fillStyle = crownGrad
    ctx.fill()

    // Crown facets — star facets + bezel facets
    const crownFacets = [
      // Left bezel
      { pts: [cx - tableW, crownTop, cx - crownW, girdle, cx - crownW * 0.6, girdle], l: 65 },
      // Right bezel
      { pts: [cx + tableW, crownTop, cx + crownW, girdle, cx + crownW * 0.6, girdle], l: 60 },
      // Left star
      { pts: [cx - tableW, crownTop, cx - tableW * 0.3, crownTop + (girdle - crownTop) * 0.5, cx - crownW * 0.6, girdle], l: 75 },
      // Right star
      { pts: [cx + tableW, crownTop, cx + tableW * 0.3, crownTop + (girdle - crownTop) * 0.5, cx + crownW * 0.6, girdle], l: 72 },
      // Center upper
      { pts: [cx - tableW * 0.5, crownTop, cx + tableW * 0.5, crownTop, cx, crownTop + (girdle - crownTop) * 0.4], l: 88 },
    ]
    crownFacets.forEach(f => {
      ctx.beginPath()
      ctx.moveTo(f.pts[0], f.pts[1]); ctx.lineTo(f.pts[2], f.pts[3]); ctx.lineTo(f.pts[4], f.pts[5])
      ctx.closePath()
      ctx.fillStyle = hsl(h, s * 0.6, f.l, 0.35)
      ctx.fill()
    })

    // --- TABLE (top flat face) ---
    const tableGrad = ctx.createLinearGradient(cx - tableW, crownTop, cx + tableW, crownTop + 10)
    tableGrad.addColorStop(0, hsl(h, s * 0.4, 92, 0.6))
    tableGrad.addColorStop(0.5, hsl(h, s * 0.3, 85, 0.3))
    tableGrad.addColorStop(1, hsl(h, s * 0.5, 78, 0.5))
    ctx.beginPath()
    ctx.moveTo(cx - tableW * 0.85, crownTop + 2)
    ctx.lineTo(cx + tableW * 0.85, crownTop + 2)
    ctx.lineTo(cx + tableW * 0.6, crownTop + 12)
    ctx.lineTo(cx - tableW * 0.6, crownTop + 12)
    ctx.closePath()
    ctx.fillStyle = tableGrad
    ctx.fill()

    // --- GIRDLE (thin line) ---
    ctx.beginPath()
    ctx.moveTo(cx - girdleW, girdle)
    ctx.lineTo(cx + girdleW, girdle)
    ctx.strokeStyle = hsl(h, s, 40, 0.6)
    ctx.lineWidth = 1.5
    ctx.stroke()

    // --- LIGHT REFLECTIONS ---
    // Big internal reflection
    ctx.beginPath()
    const refGrad = ctx.createRadialGradient(cx - S * 0.1, girdle - S * 0.08, 0, cx - S * 0.1, girdle - S * 0.08, S * 0.2)
    refGrad.addColorStop(0, `hsla(${(h + 30) % 360},100%,95%,0.5)`)
    refGrad.addColorStop(1, `hsla(${(h + 30) % 360},100%,95%,0)`)
    ctx.fillStyle = refGrad
    ctx.arc(cx - S * 0.1, girdle - S * 0.08, S * 0.2, 0, Math.PI * 2)
    ctx.fill()

    // Rainbow dispersion flash
    ctx.beginPath()
    const rainGrad = ctx.createLinearGradient(cx - S * 0.15, crownTop + 5, cx + S * 0.15, crownTop + 15)
    rainGrad.addColorStop(0, 'hsla(0,100%,80%,0.2)')
    rainGrad.addColorStop(0.2, 'hsla(60,100%,80%,0.15)')
    rainGrad.addColorStop(0.5, 'hsla(180,100%,80%,0.2)')
    rainGrad.addColorStop(0.8, 'hsla(240,100%,80%,0.15)')
    rainGrad.addColorStop(1, 'hsla(300,100%,80%,0.2)')
    ctx.fillStyle = rainGrad
    ctx.fillRect(cx - S * 0.2, crownTop + 3, S * 0.4, 14)

    // --- SPARKLE HIGHLIGHTS ---
    // Main bright spot (top-left)
    ctx.beginPath()
    const shineGrad = ctx.createRadialGradient(cx - S * 0.12, crownTop + 8, 0, cx - S * 0.12, crownTop + 8, S * 0.09)
    shineGrad.addColorStop(0, 'rgba(255,255,255,0.95)')
    shineGrad.addColorStop(0.5, 'rgba(255,255,255,0.4)')
    shineGrad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = shineGrad
    ctx.arc(cx - S * 0.12, crownTop + 8, S * 0.09, 0, Math.PI * 2)
    ctx.fill()

    // Secondary sparkle
    ctx.beginPath()
    ctx.arc(cx + S * 0.15, crownTop + 14, S * 0.04, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fill()

    // Star sparkle cross
    const starX = cx + S * 0.08, starY = crownTop + 6
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'
    ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(starX - 5, starY); ctx.lineTo(starX + 5, starY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(starX, starY - 5); ctx.lineTo(starX, starY + 5); ctx.stroke()

    // --- OUTLINE ---
    ctx.beginPath()
    ctx.moveTo(cx - tableW, crownTop)
    ctx.lineTo(cx + tableW, crownTop)
    ctx.lineTo(cx + crownW, girdle)
    ctx.lineTo(cx + girdleW, girdle)
    ctx.lineTo(cx, pavilionBot)
    ctx.lineTo(cx - girdleW, girdle)
    ctx.lineTo(cx - crownW, girdle)
    ctx.closePath()
    ctx.strokeStyle = hsl(h, s, 25, 0.5)
    ctx.lineWidth = 1
    ctx.stroke()

    diamondCanvases.push(c)
  }
}
if (IS_DOM) generateDiamonds()

// Emoji fallback for death food
const emojiCache = new Map<string, HTMLCanvasElement>()
function getEmojiCanvas(emoji: string): HTMLCanvasElement | null {
  if (!IS_DOM) return null
  if (emojiCache.has(emoji)) return emojiCache.get(emoji)!
  const c = document.createElement('canvas')
  c.width = 80; c.height = 80
  const cx = c.getContext('2d')!
  cx.font = '64px serif'
  cx.textAlign = 'center'
  cx.textBaseline = 'middle'
  cx.fillText(emoji, 40, 40)
  emojiCache.set(emoji, c)
  return c
}

function drawFood(ctx: CanvasRenderingContext2D, foods: Food[], camera: Camera, w: number, h: number) {
  const time = Date.now() * 0.003
  const margin = 40
  for (const f of foods) {
    const p = worldToScreen(f.x, f.y, camera, w, h)
    if (p.x < -margin || p.x > w + margin || p.y < -margin || p.y > h + margin) continue
    const r = f.radius * camera.zoom
    if (r < 1) continue // skip tiny items when zoomed out
    const pulse = 1 + Math.sin(time + f.pulse) * 0.1
    const size = r * 4.0 * pulse

    // Glow for special food (skip glow when zoomed out for perf)
    if (f.special && size > 6 && camera.zoom > 0.35) {
      ctx.beginPath()
      const glowGrd = ctx.createRadialGradient(p.x, p.y, size * 0.3, p.x, p.y, size * 1.5)
      glowGrd.addColorStop(0, 'rgba(255,100,200,0.35)')
      glowGrd.addColorStop(1, 'rgba(255,100,200,0)')
      ctx.fillStyle = glowGrd
      ctx.arc(p.x, p.y, size * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // Subtle glow for all food
    if (size > 8) {
      ctx.beginPath()
      const glow = ctx.createRadialGradient(p.x, p.y, size * 0.2, p.x, p.y, size * 1.1)
      glow.addColorStop(0, 'rgba(100,200,255,0.15)')
      glow.addColorStop(1, 'rgba(100,200,255,0)')
      ctx.fillStyle = glow
      ctx.arc(p.x, p.y, size * 1.1, 0, Math.PI * 2)
      ctx.fill()
    }

    // Fade out decaying death food
    let decayAlpha = 1
    if (f.fromDeath && f.spawnedAt) {
      const age = (Date.now() - f.spawnedAt) / 1000
      if (age >= 50) decayAlpha = Math.max(0, 1 - (age - 50) / 70)
    }

    // Draw diamond or food based on style
    const diamondIdx = (f as any)._diamondIdx as number | undefined
    if (diamondIdx !== undefined && diamondCanvases[diamondIdx]) {
      // Diamond sparkle glow
      if (size > 6) {
        const dColor = DIAMOND_COLORS[diamondIdx]
        ctx.beginPath()
        const dGlow = ctx.createRadialGradient(p.x, p.y, size * 0.2, p.x, p.y, size * 1.8)
        dGlow.addColorStop(0, hsl(dColor.h, dColor.s, 60, 0.25))
        dGlow.addColorStop(1, hsl(dColor.h, dColor.s, 60, 0))
        ctx.fillStyle = dGlow
        ctx.arc(p.x, p.y, size * 1.8, 0, Math.PI * 2)
        ctx.fill()
      }
      if (decayAlpha < 1) ctx.globalAlpha = decayAlpha
      ctx.drawImage(diamondCanvases[diamondIdx], p.x - size / 2, p.y - size / 2, size, size)
      if (decayAlpha < 1) ctx.globalAlpha = 1
    } else if (currentFoodStyle === 'circles') {
      if (decayAlpha < 1) ctx.globalAlpha = decayAlpha
      const colorIdx = Math.abs(Math.round(f.x * 7 + f.y * 3)) % CIRCLE_COLORS.length
      ctx.beginPath()
      ctx.arc(p.x, p.y, size * 0.45, 0, Math.PI * 2)
      ctx.fillStyle = CIRCLE_COLORS[colorIdx]
      ctx.fill()
      if (decayAlpha < 1) ctx.globalAlpha = 1
    } else if (currentFoodStyle === 'emojis') {
      if (decayAlpha < 1) ctx.globalAlpha = decayAlpha
      ctx.font = `${size}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(f.emoji, p.x, p.y)
      if (decayAlpha < 1) ctx.globalAlpha = 1
    } else if (f.img && foodImgCache.has(f.img)) {
      const img = foodImgCache.get(f.img)!
      if (decayAlpha < 1) ctx.globalAlpha = decayAlpha
      ctx.drawImage(img, p.x - size / 2, p.y - size / 2, size, size)
      if (decayAlpha < 1) ctx.globalAlpha = 1
    }
  }
}

function drawPotions(ctx: CanvasRenderingContext2D, potions: Potion[], camera: Camera, w: number, h: number) {
  const time = Date.now() * 0.004
  for (const pot of potions) {
    const p = worldToScreen(pot.x, pot.y, camera, w, h)
    if (p.x < -40 || p.x > w + 40 || p.y < -40 || p.y > h + 40) continue
    const r = pot.radius * camera.zoom
    const pulse = 1 + Math.sin(time + pot.pulse) * 0.2
    const size = r * 3.0 * pulse
    const color = POTION_COLORS[pot.type]

    // Outer glow
    ctx.beginPath()
    const glow = ctx.createRadialGradient(p.x, p.y, size * 0.3, p.x, p.y, size * 2.0)
    glow.addColorStop(0, color + '55')
    glow.addColorStop(1, color + '00')
    ctx.fillStyle = glow
    ctx.arc(p.x, p.y, size * 2.0, 0, Math.PI * 2)
    ctx.fill()

    // Draw image if available, otherwise drawn bottle
    const potImgSrc = POTION_IMAGES[pot.type]
    const potImg = potImgSrc ? potionImgCache.get(potImgSrc) : null
    if (potImg) {
      ctx.drawImage(potImg, p.x - size, p.y - size, size * 2, size * 2)
    } else {
      // Bottle shape
      ctx.beginPath()
      ctx.arc(p.x, p.y + size * 0.1, size * 0.85, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // Bottle neck
      ctx.beginPath()
      ctx.roundRect(p.x - size * 0.25, p.y - size * 1.0, size * 0.5, size * 0.6, size * 0.1)
      ctx.fillStyle = color
      ctx.fill()

      // Cork
      ctx.beginPath()
      ctx.roundRect(p.x - size * 0.3, p.y - size * 1.15, size * 0.6, size * 0.25, size * 0.08)
      ctx.fillStyle = '#daa520'
      ctx.fill()

      // Highlight
      ctx.beginPath()
      ctx.arc(p.x - size * 0.2, p.y - size * 0.1, size * 0.3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.fill()

      // Icon
      ctx.font = `${Math.round(size * 0.7)}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(POTION_ICONS[pot.type], p.x, p.y + size * 0.15)
    }
  }
}

// Coin image
let coinImg: HTMLImageElement | null = null
if (IS_DOM) {
  const _coinImg = new Image()
  _coinImg.src = '/ui/coin.png'
  _coinImg.onload = () => { coinImg = _coinImg }
}

// Cache for event-specific coin images
const eventCoinCache = new Map<string, HTMLImageElement>()
function getEventCoinImg(src: string): HTMLImageElement | null {
  if (!IS_DOM) return null
  const cached = eventCoinCache.get(src)
  if (cached) return cached
  const img = new Image()
  img.src = src
  eventCoinCache.set(src, img)
  return img
}

function drawCoins(ctx: CanvasRenderingContext2D, coins: Coin[], camera: Camera, w: number, h: number, eventCoinSrc?: string) {
  const activeCoinImg = eventCoinSrc ? getEventCoinImg(eventCoinSrc) : coinImg
  const time = Date.now() * 0.004
  for (const c of coins) {
    const p = worldToScreen(c.x, c.y, camera, w, h)
    if (p.x < -30 || p.x > w + 30 || p.y < -30 || p.y > h + 30) continue
    const r = c.radius * camera.zoom
    if (r < 1.5) continue // skip tiny coins when zoomed out
    const pulse = 1 + Math.sin(time + c.pulse) * 0.15
    const size = r * pulse

    // Glow (skip when zoomed out)
    if (size > 5 && camera.zoom > 0.35) {
      ctx.beginPath()
      const glowGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2.5)
      glowGrd.addColorStop(0, 'rgba(255,215,0,0.2)')
      glowGrd.addColorStop(1, 'rgba(255,215,0,0)')
      ctx.fillStyle = glowGrd
      ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw coin image
    if (activeCoinImg && activeCoinImg.complete && activeCoinImg.naturalWidth > 0) {
      ctx.drawImage(activeCoinImg, p.x - size, p.y - size, size * 2, size * 2)
    } else {
      ctx.beginPath()
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
      ctx.fillStyle = '#ffd700'
      ctx.fill()
    }
  }
}

// Chest images
let chestClosedImg: HTMLImageElement | null = null
let chestOpenImg: HTMLImageElement | null = null
if (IS_DOM) {
  const _chestClosed = new Image()
  _chestClosed.src = '/ui/chest-closed.png'
  _chestClosed.onload = () => { chestClosedImg = _chestClosed }
  const _chestOpen = new Image()
  _chestOpen.src = '/ui/chest-open.png'
  _chestOpen.onload = () => { chestOpenImg = _chestOpen }
}

function drawChests(ctx: CanvasRenderingContext2D, chests: Chest[], camera: Camera, w: number, h: number) {
  const time = Date.now() * 0.003
  for (const ch of chests) {
    if (ch.opened && ch.openAnim >= 1) continue
    const p = worldToScreen(ch.x, ch.y, camera, w, h)
    if (p.x < -80 || p.x > w + 80 || p.y < -80 || p.y > h + 80) continue
    const r = ch.radius * camera.zoom
    const pulse = ch.opened ? 1 : 1 + Math.sin(time + ch.pulse) * 0.1
    const size = r * 2.5 * pulse

    // Glow
    if (!ch.opened) {
      ctx.beginPath()
      const glow = ctx.createRadialGradient(p.x, p.y, size * 0.2, p.x, p.y, size * 2)
      glow.addColorStop(0, 'rgba(255,215,0,0.25)')
      glow.addColorStop(1, 'rgba(255,215,0,0)')
      ctx.fillStyle = glow
      ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2)
      ctx.fill()
    }

    const alpha = ch.opened ? Math.max(0, 1 - ch.openAnim) : 1
    if (alpha <= 0) continue
    ctx.globalAlpha = alpha

    // Draw chest image
    const img = ch.opened ? chestOpenImg : chestClosedImg
    if (img) {
      ctx.drawImage(img, p.x - size, p.y - size, size * 2, size * 2)
    }

    ctx.globalAlpha = 1
  }
}

function drawFlyingCoins(ctx: CanvasRenderingContext2D, flyingCoins: FlyingCoin[], camera: Camera, w: number, h: number) {
  for (const fc of flyingCoins) {
    const t = fc.progress
    const eased = 1 - Math.pow(1 - t, 3)
    // Convert world origin to current screen position each frame
    const startScreen = worldToScreen(fc.wx, fc.wy, camera, w, h)
    const cx = startScreen.x + (fc.targetX - startScreen.x) * eased
    const cy = startScreen.y + (fc.targetY - startScreen.y) * eased - Math.sin(eased * Math.PI) * 40
    const size = 10 * (1 - eased * 0.6)

    if (coinImg) {
      ctx.drawImage(coinImg, cx - size, cy - size, size * 2, size * 2)
    } else {
      ctx.beginPath()
      ctx.arc(cx, cy, size, 0, Math.PI * 2)
      ctx.fillStyle = '#ffd700'
      ctx.fill()
    }
  }
}

function drawWorm(ctx: CanvasRenderingContext2D, worm: Worm, camera: Camera, w: number, h: number) {
  if (!worm.alive) return
  const segments = worm.segments
  const radius = getWormRadius(worm)
  const colors = worm.skin.colors
  const segR = radius * camera.zoom

  // Quick cull: sample many points along the body to get an accurate bounding box
  // Long curvy worms need multiple samples — 3 points miss S-shapes where the middle is visible
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  const sampleStep = Math.max(1, Math.floor(segments.length / 12))
  for (let i = 0; i < segments.length; i += sampleStep) {
    const sp = worldToScreen(segments[i].x, segments[i].y, camera, w, h)
    if (sp.x < minX) minX = sp.x
    if (sp.x > maxX) maxX = sp.x
    if (sp.y < minY) minY = sp.y
    if (sp.y > maxY) maxY = sp.y
  }
  // Always include tail
  const tailP = worldToScreen(segments[segments.length - 1].x, segments[segments.length - 1].y, camera, w, h)
  if (tailP.x < minX) minX = tailP.x
  if (tailP.x > maxX) maxX = tailP.x
  if (tailP.y < minY) minY = tailP.y
  if (tailP.y > maxY) maxY = tailP.y
  const margin = segR + 40
  if (maxX < -margin || minX > w + margin || maxY < -margin || minY > h + margin) return

  const invincible = worm.invincible > 0
  const invAlpha = invincible ? 0.3 * Math.sin(Date.now() * 0.01) : 0

  // Check for body texture (dragon etc.)
  const bodyTexKey = worm.skin.bodyTexture
  const bodyTexImg = bodyTexKey ? (bodyTextureCache.get(bodyTexKey) ?? loadBodyTexture(bodyTexKey)) : null

  // Smooth tube body rendering
  const isTube = worm.skin.bodyStyle === 'tube'
  const isFlag = worm.skin.isFlag === true

  if (isTube || isFlag) {
    // Build screen-space points (skip every other for perf on long worms)
    const step = segments.length > 200 ? 2 : 1
    const pts: { x: number; y: number }[] = []
    for (let i = 0; i < segments.length; i += step) {
      const seg = segments[i]
      const p = worldToScreen(seg.x, seg.y, camera, w, h)
      pts.push(p)
    }

    if (pts.length >= 3) {
      const R = segR + 1 // slightly larger for smooth look

      // Compute smoothed normals
      const normals: { nx: number; ny: number }[] = []
      for (let i = 0; i < pts.length; i++) {
        let dx = 0, dy = 0
        // Average direction from neighbors
        const range = 3
        for (let j = Math.max(0, i - range); j < Math.min(pts.length - 1, i + range); j++) {
          dx += pts[j + 1].x - pts[j].x
          dy += pts[j + 1].y - pts[j].y
        }
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        normals.push({ nx: -dy / len, ny: dx / len })
      }

      // Build upper/lower edges with smoothed normals
      const upper: { x: number; y: number }[] = []
      const lower: { x: number; y: number }[] = []
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i], n = normals[i]
        upper.push({ x: p.x + n.nx * R, y: p.y + n.ny * R })
        lower.push({ x: p.x - n.nx * R, y: p.y - n.ny * R })
        const ex = R + 4
        if (p.x - ex < minX) minX = p.x - ex
        if (p.y - ex < minY) minY = p.y - ex
        if (p.x + ex > maxX) maxX = p.x + ex
        if (p.y + ex > maxY) maxY = p.y + ex
      }

      // Helper: draw smooth curve through points
      const drawSmoothCurve = (points: { x: number; y: number }[]) => {
        if (points.length < 2) return
        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 0; i < points.length - 1; i++) {
          const cx = (points[i].x + points[i + 1].x) / 2
          const cy = (points[i].y + points[i + 1].y) / 2
          ctx.quadraticCurveTo(points[i].x, points[i].y, cx, cy)
        }
        const last = points[points.length - 1]
        ctx.lineTo(last.x, last.y)
      }

      const traceTubePath = () => {
        ctx.beginPath()
        drawSmoothCurve(upper)
        const tail = pts[pts.length - 1]
        ctx.arc(tail.x, tail.y, R,
          Math.atan2(upper[upper.length - 1].y - tail.y, upper[upper.length - 1].x - tail.x),
          Math.atan2(lower[lower.length - 1].y - tail.y, lower[lower.length - 1].x - tail.x))
        const lowerRev = [...lower].reverse()
        drawSmoothCurve(lowerRev)
        const headPt = pts[0]
        ctx.arc(headPt.x, headPt.y, R,
          Math.atan2(lower[0].y - headPt.y, lower[0].x - headPt.x),
          Math.atan2(upper[0].y - headPt.y, upper[0].x - headPt.x))
        ctx.closePath()
      }

      // === 1) Dark outline (drawn first, thicker) ===
      if (!isFlag) {
        ctx.save()
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.lineWidth = (R * 2 + 8) * camera.zoom / segR
        ctx.strokeStyle = 'rgba(0,0,0,0.95)'
        ctx.beginPath()
        drawSmoothCurve(pts)
        ctx.stroke()
        ctx.restore()
      }

      // === 2) Clip to tube shape and fill ===
      ctx.save()
      traceTubePath()
      ctx.clip()

      if (isFlag && bodyTexImg && bodyTexImg.complete && bodyTexImg.naturalWidth > 0) {
        const lengths = [0]
        for (let i = 1; i < pts.length; i++) {
          const dx = pts[i].x - pts[i - 1].x
          const dy = pts[i].y - pts[i - 1].y
          lengths.push(lengths[lengths.length - 1] + Math.sqrt(dx * dx + dy * dy))
        }
        const totalLength = lengths[lengths.length - 1] || 1
        for (let i = 0; i < pts.length - 1; i++) {
          const p = pts[i]
          const next = pts[i + 1]
          const dx = next.x - p.x
          const dy = next.y - p.y
          const sliceLen = Math.max(1, Math.sqrt(dx * dx + dy * dy) + R * 0.85)
          const angle = Math.atan2(dy, dx)
          const sx = (lengths[i] / totalLength) * bodyTexImg.naturalWidth
          const sw = Math.max(1, ((sliceLen / totalLength) * bodyTexImg.naturalWidth) + 2)
          ctx.save()
          ctx.translate((p.x + next.x) * 0.5, (p.y + next.y) * 0.5)
          ctx.rotate(angle)
          ctx.drawImage(
            bodyTexImg,
            sx, 0, Math.min(sw, bodyTexImg.naturalWidth - sx), bodyTexImg.naturalHeight,
            -sliceLen / 2, -R * 1.04, sliceLen, R * 2.08,
          )
          ctx.restore()
        }

        const shine = ctx.createLinearGradient(0, minY, 0, maxY)
        shine.addColorStop(0, 'rgba(255,255,255,0.22)')
        shine.addColorStop(0.28, 'rgba(255,255,255,0.08)')
        shine.addColorStop(0.55, 'rgba(255,255,255,0)')
        shine.addColorStop(1, 'rgba(0,0,0,0.18)')
        ctx.fillStyle = shine
        ctx.fillRect(minX, minY, maxX - minX, maxY - minY)
      } else {
        // Fill tube with color stripes running across the body
        const stripeCount = colors.length
        for (let s = 0; s < stripeCount; s++) {
          ctx.fillStyle = colors[s]
          ctx.beginPath()
          const off1 = -R + (s / stripeCount) * R * 2
          const off2 = -R + ((s + 1) / stripeCount) * R * 2
          const p0 = pts[0], n0 = normals[0]
          ctx.moveTo(p0.x + n0.nx * off1, p0.y + n0.ny * off1)
          for (let i = 1; i < pts.length; i++) {
            const p = pts[i], n = normals[i]
            ctx.lineTo(p.x + n.nx * off1, p.y + n.ny * off1)
          }
          for (let i = pts.length - 1; i >= 0; i--) {
            const p = pts[i], n = normals[i]
            ctx.lineTo(p.x + n.nx * off2, p.y + n.ny * off2)
          }
          ctx.closePath()
          ctx.fill()
        }
      }

      ctx.restore()

      if (isFlag) {
        const tail = pts[pts.length - 1]
        const prevTail = pts[Math.max(0, pts.length - 2)]
        const tailAngle = Math.atan2(tail.y - prevTail.y, tail.x - prevTail.x)
        const tailDrawW = R * 2.5
        const tailDrawH = R * 1.95
        ctx.save()
        ctx.beginPath()
        ctx.arc(tail.x, tail.y, R * 1.02, 0, Math.PI * 2)
        ctx.clip()
        ctx.translate(tail.x, tail.y)
        ctx.rotate(tailAngle)
        ctx.drawImage(bodyTexImg!, -tailDrawW / 2, -tailDrawH / 2, tailDrawW, tailDrawH)
        ctx.restore()
      }

      // Invincible glow
      if (invincible) {
        ctx.save()
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.lineWidth = isFlag ? Math.max(2, R * 0.4) : (R * 2 + 8) * camera.zoom / segR
        ctx.strokeStyle = `rgba(255,255,255,${invAlpha})`
        if (isFlag) traceTubePath()
        else {
          ctx.beginPath()
          drawSmoothCurve(pts)
        }
        ctx.stroke()
        ctx.restore()
      }
    }
  }

  for (let i = segments.length - 1; i >= 0; i--) {
    if (isTube || isFlag) break // already drawn above
    const seg = segments[i]
    const p = worldToScreen(seg.x, seg.y, camera, w, h)
    if (p.x < -50 || p.x > w + 50 || p.y < -50 || p.y > h + 50) continue

    if (bodyTexImg && bodyTexImg.complete && bodyTexImg.naturalWidth > 0) {
      // Calculate body direction angle from adjacent segments
      let angle = 0
      if (i > 0) {
        const prev = segments[i - 1]
        const pp = worldToScreen(prev.x, prev.y, camera, w, h)
        angle = Math.atan2(pp.y - p.y, pp.x - p.x)
      } else if (segments.length > 1) {
        const next = segments[1]
        const np = worldToScreen(next.x, next.y, camera, w, h)
        angle = Math.atan2(p.y - np.y, p.x - np.x)
      }
      // Flag skins use larger overlapping textured capsules so the seams disappear
      // without forcing the whole flag into a single straight strip.
      const bigR = isFlag ? segR * 1.62 : segR * 1.3
      const drawW = isFlag ? bigR * 2.7 : bigR * 2.8
      const drawH = isFlag ? bigR * 1.9 : bigR * 2.8
      ctx.save()
      ctx.beginPath()
      ctx.arc(p.x, p.y, bigR, 0, Math.PI * 2)
      ctx.clip()
      ctx.translate(p.x, p.y)
      ctx.rotate(angle)
      ctx.drawImage(bodyTexImg, -drawW / 2, -drawH / 2, drawW, drawH)
      ctx.restore()

      if (isFlag) {
        ctx.save()
        const gloss = ctx.createRadialGradient(
          p.x - bigR * 0.35, p.y - bigR * 0.45, 0,
          p.x, p.y, bigR * 1.15,
        )
        gloss.addColorStop(0, 'rgba(255,255,255,0.12)')
        gloss.addColorStop(0.55, 'rgba(255,255,255,0.03)')
        gloss.addColorStop(1, 'rgba(0,0,0,0.10)')
        ctx.fillStyle = gloss
        ctx.beginPath()
        ctx.arc(p.x, p.y, bigR, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    } else {
      // Shadow
      ctx.beginPath()
      ctx.arc(p.x, p.y + segR * 0.3, segR * 1.05, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.fill()

      // Solid color body
      const colorIdx = i % colors.length
      ctx.beginPath()
      ctx.arc(p.x, p.y, segR, 0, Math.PI * 2)
      ctx.fillStyle = colors[colorIdx]
      ctx.fill()

      // Highlight — skip every other segment for perf on big worms
      if (i % 2 === 0 || segments.length < 100) {
        ctx.beginPath()
        ctx.arc(p.x - segR * 0.2, p.y - segR * 0.25, segR * 0.45, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.fill()
      }
    }

    if (invincible) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, segR + 3 * camera.zoom, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255,255,255,${invAlpha})`
      ctx.lineWidth = 2 * camera.zoom
      ctx.stroke()
    }
  }

  // Head features
  const head = segments[0]
  const hp = worldToScreen(head.x, head.y, camera, w, h)
  const headR = radius * camera.zoom
  const angle = worm.angle
  const headType = worm.skin.headType ?? 'default'

  if (headType !== 'default' && HEAD_IMAGES[headType]) {
    // Custom head image — draw as the worm's actual head, big and clear
    const headSrc = HEAD_IMAGES[headType]
    const headImg = headImageCache.get(headSrc)
    if (headImg) {
      let imageTopOffset = 0.75
      if (isAccessoryHeadImage(headSrc, headImg)) {
        drawDefaultHeadFace(ctx, hp, headR, colors, worm.eyeBlink)
        // Accessory-only heads should sit on the worm face instead of floating above it.
        imageTopOffset = 0.48
      }
      // Always upright — no rotation
      const aspect = headImg.naturalHeight / headImg.naturalWidth
      const imgW = headR * 5
      const imgH = imgW * aspect
      // Full heads sit higher; accessory hats sit lower so they attach to the worm head.
      ctx.drawImage(headImg, hp.x - imgW / 2, hp.y - imgH * imageTopOffset, imgW, imgH)
    }
  } else {
    if (worm.skin.isFlag && bodyTexImg && bodyTexImg.complete && bodyTexImg.naturalWidth > 0) {
      drawTexturedHeadFace(ctx, hp, headR, bodyTexImg, angle, worm.eyeBlink)
    } else {
      // Default eyes — always upright (fixed position, no rotation)
      drawDefaultHeadFace(ctx, hp, headR, colors, worm.eyeBlink)
    }
  }

  // Boost trail
  if (worm.boosting && worm.boostEnergy > 0) {
    for (let i = 0; i < 3; i++) {
      const tail = segments[segments.length - 1 - i * 2]
      if (!tail) break
      const tp = worldToScreen(tail.x + (Math.random() - 0.5) * 10, tail.y + (Math.random() - 0.5) * 10, camera, w, h)
      ctx.beginPath()
      ctx.arc(tp.x, tp.y, (4 - i) * camera.zoom, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,200,50,${0.6 - i * 0.2})`
      ctx.fill()
    }
  }

  // Name tag — push higher for queen head (crown is tall)
  const nameOffset = headType !== 'default' ? radius + 40 : radius + 18
  const np = worldToScreen(head.x, head.y - nameOffset, camera, w, h)
  ctx.font = `${Math.round(13 * camera.zoom)}px Fredoka`
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.fillText(worm.name, np.x + 1, np.y + 1)
  ctx.fillStyle = '#fff'
  ctx.fillText(worm.name, np.x, np.y)
}

function drawCelebrationBubble(ctx: CanvasRenderingContext2D, worm: Worm, camera: Camera, w: number, h: number) {
  let emoji = '😜'
  try {
    const saved = (typeof localStorage !== 'undefined' ? localStorage : null)?.getItem('celebrationEmoji')
    if (saved) emoji = saved
  } catch {}

  const head = worm.segments[0]
  const radius = getWormRadius(worm)
  const hp = worldToScreen(head.x, head.y - radius - 45, camera, w, h)

  const z = camera.zoom
  const bw = 40 * z, bh = 36 * z, br = 12 * z

  // Pulsing animation
  const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.05
  const cx = hp.x, cy = hp.y

  ctx.save()
  ctx.scale(pulse, pulse)
  const sx = cx / pulse, sy = cy / pulse

  // Speech bubble
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#4a9cd6'
  ctx.lineWidth = 2.5 * z
  ctx.beginPath()
  ctx.moveTo(sx - bw / 2 + br, sy - bh / 2)
  ctx.lineTo(sx + bw / 2 - br, sy - bh / 2)
  ctx.quadraticCurveTo(sx + bw / 2, sy - bh / 2, sx + bw / 2, sy - bh / 2 + br)
  ctx.lineTo(sx + bw / 2, sy + bh / 2 - br)
  ctx.quadraticCurveTo(sx + bw / 2, sy + bh / 2, sx + bw / 2 - br, sy + bh / 2)
  ctx.lineTo(sx + 5 * z, sy + bh / 2)
  ctx.lineTo(sx, sy + bh / 2 + 10 * z)
  ctx.lineTo(sx - 5 * z, sy + bh / 2)
  ctx.lineTo(sx - bw / 2 + br, sy + bh / 2)
  ctx.quadraticCurveTo(sx - bw / 2, sy + bh / 2, sx - bw / 2, sy + bh / 2 - br)
  ctx.lineTo(sx - bw / 2, sy - bh / 2 + br)
  ctx.quadraticCurveTo(sx - bw / 2, sy - bh / 2, sx - bw / 2 + br, sy - bh / 2)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Emoji
  ctx.font = `${Math.round(22 * z)}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#000'
  ctx.fillText(emoji, sx, sy)
  ctx.restore()
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[], camera: Camera, w: number, h: number) {
  for (const p of particles) {
    const sp = worldToScreen(p.x, p.y, camera, w, h)
    const alpha = p.life / p.maxLife
    ctx.beginPath()
    ctx.arc(sp.x, sp.y, p.radius * camera.zoom * alpha, 0, Math.PI * 2)
    ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
    ctx.fill()
  }
}

function drawActiveEffects(ctx: CanvasRenderingContext2D, effects: { type: PotionType; expiresAt: number }[], w: number) {
  const now = Date.now()
  const active = effects.filter(e => e.expiresAt > now)
  if (active.length === 0) return

  let x = w / 2 - active.length * 35
  const y = 60
  for (const eff of active) {
    const remaining = (eff.expiresAt - now) / POTION_DURATION
    const color = POTION_COLORS[eff.type]
    const icon = POTION_ICONS[eff.type]

    // Background circle
    ctx.beginPath()
    ctx.arc(x, y, 22, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fill()

    // Progress arc
    ctx.beginPath()
    ctx.arc(x, y, 22, -Math.PI / 2, -Math.PI / 2 + remaining * Math.PI * 2)
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.stroke()

    // Icon
    ctx.font = '18px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'white'
    ctx.fillText(icon, x, y)

    x += 50
  }
}

function drawMinimap(
  mc: CanvasRenderingContext2D,
  player: Worm,
  aiWorms: Worm[],
  remotePlayers: Map<string, Worm>,
) {
  const w = mc.canvas.width, h = mc.canvas.height
  mc.clearRect(0, 0, w, h)
  mc.fillStyle = 'rgba(0,0,0,0.3)'
  mc.fillRect(0, 0, w, h)
  mc.strokeStyle = 'rgba(255,50,50,0.3)'
  mc.lineWidth = 1
  mc.strokeRect(2, 2, w - 4, h - 4)

  const scale = w / WORLD_SIZE
  const ox = w / 2, oy = h / 2

  for (const ai of aiWorms) {
    if (!ai.alive) continue
    const mx = ai.segments[0].x * scale + ox
    const my = ai.segments[0].y * scale + oy
    mc.beginPath()
    mc.arc(mx, my, 2, 0, Math.PI * 2)
    mc.fillStyle = ai.skin.colors[0] + '99'
    mc.fill()
  }

  // Remote players
  for (const [, rp] of remotePlayers) {
    if (!rp.alive) continue
    const mx = rp.segments[0].x * scale + ox
    const my = rp.segments[0].y * scale + oy
    mc.beginPath()
    mc.arc(mx, my, 3, 0, Math.PI * 2)
    mc.fillStyle = rp.skin.colors[0]
    mc.fill()
  }

  if (player.alive) {
    const mx = player.segments[0].x * scale + ox
    const my = player.segments[0].y * scale + oy
    mc.beginPath()
    mc.arc(mx, my, 4, 0, Math.PI * 2)
    mc.fillStyle = '#ffd700'
    mc.fill()
    mc.beginPath()
    mc.arc(mx, my, 6, 0, Math.PI * 2)
    mc.strokeStyle = '#ffd700'
    mc.lineWidth = 1
    mc.stroke()
  }
}

// ============================================
// HOOK
// ============================================
export interface GameEngineCallbacks {
  onScoreUpdate: (score: number) => void
  onCoinsUpdate: (coins: number) => void
  onBoostUpdate: (energy: number) => void
  onLeaderboardUpdate: (entries: { name: string; score: number; isPlayer: boolean }[]) => void
  onDeath: (score: number, length: number, coins: number, kills: number) => void
  onWin?: () => void
}

export function useGameEngine(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  minimapRef: React.RefObject<HTMLCanvasElement | null>,
  callbacks: GameEngineCallbacks,
) {
  const stateRef = useRef<EngineState>({
    gameRunning: false,
    player: null,
    aiWorms: [],
    remotePlayers: new Map(),
    foods: [],
    coins: [],
    particles: [],
    camera: { x: 0, y: 0, zoom: 1 },
    playerCoins: 0,
    boostEnergy: 100,
    boosting: false,
    controlMode: 'mouse',
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    touchStart: null,
    touchVector: { x: 0, y: 0 },
    keys: { up: false, down: false, left: false, right: false },
    frameCount: 0,
    lastTime: 0,
    spawnTimer: 0,
    usedAINames: [],
    guestCounter: 0,
    chests: [],
    flyingCoins: [],
    potions: [],
    activeEffects: [],
    foodGrid: new SpatialGrid(),
    mp: null,
    roomSlug: null,
    roomId: null,
    gameMode: 'ffa',
    localBattleDeaths: 0,
    playerKills: 0,
    isGameOver: false,
  })

  const animFrameRef = useRef<number>(0)
  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks

  const getUniqueAIName = useCallback(() => {
    const s = stateRef.current
    const available = AI_NAMES.filter(n => !s.usedAINames.includes(n))
    if (available.length === 0) {
      s.usedAINames = []
      return AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)]
    }
    const name = available[Math.floor(Math.random() * available.length)]
    s.usedAINames.push(name)
    return name
  }, [])

  // AI costume options (30% chance to get a costume)
  const AI_COSTUMES: { headType: HeadType; bodyTexture?: string }[] = [
    { headType: 'queen' },
    { headType: 'king' },
    { headType: 'dragon', bodyTexture: '/heads/dragon-body.png' },
    { headType: 'stpatrick', bodyTexture: '/heads/stpatrick-body.png' },
    { headType: 'santa', bodyTexture: '/heads/santa-body.png' },
    { headType: 'cat' as any, bodyTexture: '/heads/cat-body.png' },
    { headType: 'dog' as any, bodyTexture: '/heads/dog-body.png' },
    { headType: 'panda' as any, bodyTexture: '/heads/panda-body.png' },
    { headType: 'fox' as any, bodyTexture: '/heads/fox-body.png' },
    { headType: 'penguin' as any, bodyTexture: '/heads/penguin-body.png' },
    { headType: 'robot' as any, bodyTexture: '/heads/robot-body.png' },
    { headType: 'alien' as any, bodyTexture: '/heads/alien-body.png' },
    { headType: 'ninja' as any, bodyTexture: '/heads/ninja-body.png' },
  ]

  const spawnAIWorm = useCallback((forceSmall?: boolean) => {
    const s = stateRef.current
    const ax = (Math.random() - 0.5) * WORLD_SIZE * 0.8
    const ay = (Math.random() - 0.5) * WORLD_SIZE * 0.8
    const baseSkin = AI_SKINS[Math.floor(Math.random() * AI_SKINS.length)]
    const name = getUniqueAIName()

    // Event mode: all AI get event-themed skins
    let skin: WormSkin = { ...baseSkin }
    const activeEvent = getEventByMode(s.gameMode)
    if (activeEvent && activeEvent.costumes.length > 0) {
      const randCostume = activeEvent.costumes[Math.floor(Math.random() * activeEvent.costumes.length)]
      skin = { colors: [...activeEvent.aiColors], eye: '#fff' }
      skin.headType = randCostume.id as any
      skin.bodyTexture = randCostume.bodyTexture
    } else if (Math.random() < 0.3) {
      // 30% chance to get a shop costume
      const costume = AI_COSTUMES[Math.floor(Math.random() * AI_COSTUMES.length)]
      skin.headType = costume.headType
      if (costume.bodyTexture) skin.bodyTexture = costume.bodyTexture
    }

    const w = createWorm(ax, ay, skin, name, false)

    // Smarter AI: higher base skill
    w.aiSkill = 0.45 + Math.random() * 0.5 // 0.45-0.95 (was 0.35-0.9)

    if (!forceSmall && s.gameMode !== 'race') {
      // Varied sizes: 30% tiny, 30% medium, 25% large, 15% massive
      const roll = Math.random()
      let extraSegs: number
      if (roll < 0.30) {
        extraSegs = 0 // tiny — just the base 80 segments
      } else if (roll < 0.60) {
        extraSegs = 20 + Math.floor(Math.random() * 60) // medium
      } else if (roll < 0.85) {
        extraSegs = 100 + Math.floor(Math.random() * 200) // large
      } else {
        extraSegs = 400 + Math.floor(Math.random() * 600) // massive (8000+ score)
      }
      for (let j = 0; j < extraSegs; j++) {
        const last = w.segments[w.segments.length - 1]
        w.segments.push({ x: last.x, y: last.y })
      }
      w.score = extraSegs * 8
    }
    w.angle = Math.random() * Math.PI * 2
    s.aiWorms.push(w)
  }, [getUniqueAIName])

  const startGame = useCallback((playerName: string, playerSkin: WormSkin, roomSlug?: string, roomId?: string, gameMode?: GameMode, seed?: number) => {
    loadFoodStyle()
    const s = stateRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const px = (Math.random() - 0.5) * WORLD_SIZE * 0.5
    const py = (Math.random() - 0.5) * WORLD_SIZE * 0.5
    s.player = createWorm(px, py, playerSkin, playerName, true)
    s.player.invincible = 180 // 3 seconds of spawn protection

    // Preload body texture if the skin has one
    if (playerSkin.bodyTexture) loadBodyTexture(playerSkin.bodyTexture)

    // Set gameMode BEFORE spawning AI (affects their size/score)
    s.gameMode = gameMode ?? 'ffa'

    const isCoinsMode = s.gameMode === 'coins'

    s.usedAINames = []
    s.aiWorms = []
    for (let i = 0; i < AI_WORM_COUNT; i++) spawnAIWorm()

    s.foods = []
    if (isCoinsMode) {
      // Diamonds instead of food in coins mode
      for (let i = 0; i < 500; i++) {
        const f = createFood()
        f.emoji = '💎'
        f.img = undefined // will use diamond canvas
        f.value = 2
        f.radius = 12 + Math.random() * 8
        ;(f as any)._diamondIdx = Math.floor(Math.random() * DIAMOND_COLORS.length)
        s.foods.push(f)
      }
    } else {
      for (let i = 0; i < FOOD_COUNT; i++) s.foods.push(createFood())
      for (let i = 0; i < SPECIAL_FOOD_COUNT; i++) s.foods.push(createFood(undefined, undefined, true))
    }

    s.coins = []
    s.chests = []
    s.flyingCoins = []
    if (isCoinsMode) {
      // Coins mode: mostly chests, some loose coins
      for (let i = 0; i < CHEST_COUNT; i++) s.chests.push(createChest())
      for (let i = 0; i < 100; i++) s.coins.push(createCoin()) // some loose coins
    } else {
      for (let i = 0; i < COIN_COUNT; i++) s.coins.push(createCoin())
    }

    // DEV: spawn a dead worm's food near player to test decay
    const deathX = s.player!.segments[0].x + 200
    const deathY = s.player!.segments[0].y + 100
    for (let i = 0; i < 40; i++) {
      const f = createFood(
        deathX + (Math.random() - 0.5) * 150,
        deathY + (Math.random() - 0.5) * 150,
        i % 6 === 0,
      )
      f.radius = 5 + Math.random() * 5
      f.value = 3
      f.fromDeath = true
      f.spawnedAt = Date.now()
      s.foods.push(f)
    }

    s.potions = []
    for (let i = 0; i < POTION_COUNT; i++) s.potions.push(createPotion())
    s.activeEffects = []

    s.playerCoins = 0
    s.particles = []
    s.boostEnergy = 100
    s.camera.zoom = 1
    s.foodGrid = new SpatialGrid()
    s.gameRunning = true
    s.frameCount = 0
    s.spawnTimer = 0
    s.lastTime = performance.now()
    s.controlMode = 'mouse'
    s.touchStart = null
    s.touchVector = { x: 0, y: 0 }
    s.keys = { up: false, down: false, left: false, right: false }
    s.roomSlug = roomSlug ?? null
    s.roomId = roomId ?? null
    s.localBattleDeaths = 0
    s.playerKills = 0
    s.isGameOver = false
    s.remotePlayers = new Map()

    // Wire up multiplayer if in a room
    if (s.roomSlug && typeof window !== 'undefined') {
      try {
        const { spacetimeService } = require('@/services/SpacetimeService')
        console.log('[MP] Setting up multiplayer, roomSlug:', s.roomSlug, 'roomId:', s.roomId, 'connected:', !!(spacetimeService as any).conn)

        // Make sure we're connected and subscribed
        if (!(spacetimeService as any).connected) {
          console.log('[MP] Not connected, attempting connect...')
          spacetimeService.connect().then(() => {
            console.log('[MP] Connected, subscribing to game data...')
            const rid = spacetimeService.getCurrentRoomId()
            if (rid) spacetimeService.subscribeToGameData(rid)
          }).catch((e: any) => console.error('[MP] Connect failed:', e))
        } else {
          const rid = spacetimeService.getCurrentRoomId()
          console.log('[MP] Already connected, currentRoomId:', rid)
          if (rid) spacetimeService.subscribeToGameData(rid)
        }

        // Start broadcasting our state at 12Hz
        spacetimeService.startUpdateLoop(() => {
          if (!s.player || !s.player.alive) return {
            x: 0, y: 0, angle: 0, score: 0, alive: false,
            segmentsCount: 0, boosting: false, skinJson: '{}', name: playerName,
          }
          return {
            x: s.player.segments[0].x,
            y: s.player.segments[0].y,
            angle: s.player.angle,
            score: s.player.score,
            alive: s.player.alive,
            segmentsCount: s.player.segments.length,
            boosting: s.player.boosting,
            skinJson: JSON.stringify(playerSkin),
            name: playerName,
          }
        })

        // Listen for remote player updates
        spacetimeService.updateCallbacks({
          onRemotePlayerUpdate: (identityHex: string, data: any) => {
            // Remove dead players
            if (!data.alive) {
              s.remotePlayers.delete(identityHex)
              return
            }

            let rp = s.remotePlayers.get(identityHex)
            if (!rp) {
              let remoteSkin = playerSkin
              try { if (data.skinJson) remoteSkin = JSON.parse(data.skinJson) } catch {}
              rp = createWorm(data.x, data.y, remoteSkin, data.name || 'Player', false)
              rp.isPlayer = false
              s.remotePlayers.set(identityHex, rp)
            }

            // Snap head to server position (fast, no lag)
            const head = rp.segments[0]
            head.x = data.x
            head.y = data.y
            rp.angle = data.angle
            rp.score = data.score
            rp.alive = data.alive
            rp.name = data.name || 'Player'
            rp.boosting = data.boosting

            // Body follows head — same gap logic as local worm
            const gap = BASE_SEGMENT_GAP + Math.min(Math.pow(Math.max(rp.segments.length - 30, 0) / 50, 2) * 6, 10)
            for (let i = 1; i < rp.segments.length; i++) {
              const prev = rp.segments[i - 1]
              const seg = rp.segments[i]
              const dx = prev.x - seg.x
              const dy = prev.y - seg.y
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist > gap) {
                const ratio = gap / dist
                seg.x = prev.x - dx * ratio
                seg.y = prev.y - dy * ratio
              }
            }

            // Match segment count — grow AND shrink
            const targetSegs = Math.max(10, Math.min(data.segmentsCount || 80, 500))
            while (rp.segments.length < targetSegs) {
              const last = rp.segments[rp.segments.length - 1]
              rp.segments.push({ x: last.x, y: last.y })
            }
            if (rp.segments.length > targetSegs) {
              rp.segments.length = targetSegs
            }
          },
          onRemotePlayerLeft: (identityHex: string) => {
            console.log('[MP] Remote player left:', identityHex)
            s.remotePlayers.delete(identityHex)
          },
        })
      } catch (e) {
        console.error('[MP] Failed to setup multiplayer:', e)
      }
    }

    // Start loop
    const loop = (timestamp: number) => {
      if (!s.gameRunning) return
      animFrameRef.current = requestAnimationFrame(loop)

      const dt = Math.min((timestamp - s.lastTime) / 16.67, 3)
      s.lastTime = timestamp
      s.frameCount++

      if (!s.player || !s.player.alive) return

      // Player input
      if (s.controlMode === 'keyboard') {
        let kx = 0, ky = 0
        if (s.keys.up) ky -= 1
        if (s.keys.down) ky += 1
        if (s.keys.left) kx -= 1
        if (s.keys.right) kx += 1
        if (kx !== 0 || ky !== 0) s.player.targetAngle = Math.atan2(ky, kx)
      } else if (s.controlMode === 'touch') {
        const touchDeadzone = 12
        const { x, y } = s.touchVector
        if (Math.abs(x) > touchDeadzone || Math.abs(y) > touchDeadzone) {
          s.player.targetAngle = Math.atan2(y, x)
        }
      } else {
        const head = s.player.segments[0]
        const hp = worldToScreen(head.x, head.y, s.camera, canvas.width, canvas.height)
        s.player.targetAngle = Math.atan2(s.mouse.y - hp.y, s.mouse.x - hp.x)
      }
      s.player.boosting = s.boosting && s.boostEnergy > 0 && s.player.segments.length > 10

      const playerCoinsRef = { value: s.playerCoins }

      // Rebuild spatial grid once per frame
      s.foodGrid.rebuild(s.foods)

      // Compute active effect modifiers for player
      const now2 = Date.now()
      const hasSpeed = s.activeEffects.some(e => e.type === 'speed' && e.expiresAt > now2)
      const hasMagnet = s.activeEffects.some(e => e.type === 'magnet' && e.expiresAt > now2)
      const hasZoom = s.activeEffects.some(e => e.type === 'zoom' && e.expiresAt > now2)
      const playerEffects: EffectMods = {
        speedMult: hasSpeed ? 1.8 : 1,
        magnetRange: hasMagnet ? 150 : 0,
      }

      // Update — pass spatial grid for O(nearby) food lookups
      updateWorm(s.player, dt, s.foods, s.coins, s.particles, playerCoinsRef, s.foodGrid, playerEffects, s.flyingCoins, s.camera, canvas.width, canvas.height)
      s.playerCoins = playerCoinsRef.value

      // Cache allWorms array once instead of re-creating per AI
      const allWormsForAI = [s.player, ...s.aiWorms]

      for (const ai of s.aiWorms) {
        if (ai.alive) {
          updateAI(ai, allWormsForAI, s.foods, s.foodGrid)
          updateWorm(ai, dt, s.foods, s.coins, s.particles, playerCoinsRef, s.foodGrid)
        }
      }

      // Chest opening (coins mode)
      if (s.gameMode === 'coins') {
        const pHead = s.player.segments[0]
        const pR = getWormRadius(s.player)
        for (const ch of s.chests) {
          if (ch.opened) {
            // Animate open
            if (ch.openAnim < 1) ch.openAnim += 0.02
            continue
          }
          const dx = pHead.x - ch.x, dy = pHead.y - ch.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < pR + ch.radius) {
            // Open chest!
            ch.opened = true
            ch.openAnim = 0
            // Explode 16 coins outward
            for (let ci = 0; ci < 16; ci++) {
              const angle = (ci / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
              const force = 8 + Math.random() * 10
              s.coins.push({
                x: ch.x,
                y: ch.y,
                radius: 16,
                pulse: Math.random() * Math.PI * 2,
                spin: Math.random() * Math.PI * 2,
                vx: Math.cos(angle) * force,
                vy: Math.sin(angle) * force,
                fromChest: true,
                friction: 0.985,
              })
            }
            // Gold particles
            if (s.particles.length < MAX_PARTICLES) {
              for (let pi = 0; pi < 12; pi++) {
                s.particles.push({
                  x: ch.x, y: ch.y,
                  vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8,
                  life: 35, maxLife: 35,
                  color: '#ffd700', radius: 2 + Math.random() * 4,
                })
              }
            }
            // Respawn chest after 15s
            setTimeout(() => {
              const idx = s.chests.indexOf(ch)
              if (idx >= 0) {
                s.chests[idx] = createChest()
              }
            }, 15000)
          }
        }

        // Move exploding coins (apply velocity + friction)
        for (const c of s.coins) {
          if (c.vx !== undefined && c.vy !== undefined) {
            c.x += c.vx
            c.y += c.vy
            c.vx *= c.friction ?? 0.96
            c.vy *= c.friction ?? 0.96
            // Stop when slow enough
            if (Math.abs(c.vx) < 0.05 && Math.abs(c.vy) < 0.05) {
              c.vx = undefined
              c.vy = undefined
            }
          }
        }

      }

      // Update flying coins (all modes)
      for (let i = s.flyingCoins.length - 1; i >= 0; i--) {
        const fc = s.flyingCoins[i]
        fc.progress += fc.speed
        if (fc.progress >= 1) {
          s.flyingCoins.splice(i, 1)
        }
      }

      // Potion collection (player only)
      const now = Date.now()
      const playerHead = s.player.segments[0]
      const playerR = getWormRadius(s.player)
      for (let i = s.potions.length - 1; i >= 0; i--) {
        const pot = s.potions[i]
        const dx = playerHead.x - pot.x, dy = playerHead.y - pot.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < playerR + pot.radius) {
          // Activate effect
          s.activeEffects.push({ type: pot.type, expiresAt: now + POTION_DURATION })
          // Particles
          if (s.particles.length < MAX_PARTICLES) {
            const color = POTION_COLORS[pot.type]
            for (let p = 0; p < 8; p++) {
              s.particles.push({
                x: pot.x, y: pot.y,
                vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
                life: 30, maxLife: 30, color, radius: 3 + Math.random() * 3,
              })
            }
          }
          s.potions.splice(i, 1)
          // Respawn after 10s
          setTimeout(() => { s.potions.push(createPotion()) }, 10000)
        }
      }

      // Clean expired effects
      s.activeEffects = s.activeEffects.filter(e => e.expiresAt > now)

      checkCollisions(
        [s.player, ...s.aiWorms, ...s.remotePlayers.values()],
        s.foods,
        s.particles,
        () => {
          s.gameRunning = false
          getNativeBridge().haptic('error')
          getNativeBridge().playSound('death')
          callbacksRef.current.onDeath(s.player!.score, s.player!.segments.length, s.playerCoins, s.playerKills)
        },
        (_worm, _idx) => {
          // Check if player killed this worm (player's body was the obstacle)
          if (s.player && s.player.alive) {
            s.playerKills++
            getNativeBridge().haptic('success')
            getNativeBridge().playSound('kill')
          }
          setTimeout(() => {
            const idx = s.aiWorms.indexOf(_worm)
            if (idx >= 0) {
              s.aiWorms.splice(idx, 1)
              spawnAIWorm(true)
            }
          }, 3000)
        },
      )

      // Update particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i]
        p.x += p.vx; p.y += p.vy
        p.vx *= 0.95; p.vy *= 0.95
        p.life--
        if (p.life <= 0) s.particles.splice(i, 1)
      }

      // Death food decay — decompose after 50s, gone at 120s
      if (s.frameCount % 30 === 0) {
        const decayNow = Date.now()
        for (let i = s.foods.length - 1; i >= 0; i--) {
          const f = s.foods[i]
          if (!f.fromDeath || !f.spawnedAt) continue
          const age = (decayNow - f.spawnedAt) / 1000
          if (age >= 120) {
            // Fully gone
            s.foods.splice(i, 1)
          } else if (age >= 50) {
            // Shrink progressively: at 50s = full size, at 120s = 0
            const decay = 1 - (age - 50) / 70
            f.radius = Math.max(2, f.radius * (0.995 + decay * 0.005))
          }
        }
      }

      // Camera
      if (s.player.alive) {
        const head = s.player.segments[0]
        s.camera.x += (head.x - s.camera.x) * 0.08
        s.camera.y += (head.y - s.camera.y) * 0.08
        let targetZoom = Math.max(0.8, 1.6 - s.player.segments.length * 0.0008)
        if (hasZoom) targetZoom *= 0.55 // zoom out effect
        s.camera.zoom += (targetZoom - s.camera.zoom) * 0.05
      }

      s.boostEnergy = s.player.boostEnergy

      // Draw
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawBackground(ctx, s.camera, canvas.width, canvas.height, s.player, s.gameMode)
      drawFood(ctx, s.foods, s.camera, canvas.width, canvas.height)
      drawChests(ctx, s.chests, s.camera, canvas.width, canvas.height)
      drawCoins(ctx, s.coins, s.camera, canvas.width, canvas.height, s.gameMode ? getEventByMode(s.gameMode)?.currencyImage : undefined)
      drawPotions(ctx, s.potions, s.camera, canvas.width, canvas.height)
      drawParticles(ctx, s.particles, s.camera, canvas.width, canvas.height)

      for (const ai of s.aiWorms) drawWorm(ctx, ai, s.camera, canvas.width, canvas.height)

      // Remote players
      for (const [, rp] of s.remotePlayers) {
        drawWorm(ctx, rp, s.camera, canvas.width, canvas.height)
      }

      if (s.player.alive) {
        drawWorm(ctx, s.player, s.camera, canvas.width, canvas.height)
        // Celebration emoji bubble when player is big
        if (s.player.segments.length >= 50) {
          drawCelebrationBubble(ctx, s.player, s.camera, canvas.width, canvas.height)
        }
      }

      // Active potion effect indicators
      drawActiveEffects(ctx, s.activeEffects, canvas.width)
      drawFlyingCoins(ctx, s.flyingCoins, s.camera, canvas.width, canvas.height)

      // Event mode win condition: score >= 500
      if (isEventMode(s.gameMode) && s.player.score >= 500 && !s.isGameOver) {
        s.isGameOver = true
        s.gameRunning = false
        callbacksRef.current.onWin?.()
        return
      }

      // Race mode win condition: first to 500 points
      if (s.gameMode === 'race' && !s.isGameOver) {
        if (s.player.score >= 500) {
          s.isGameOver = true
          s.gameRunning = false
          callbacksRef.current.onWin?.()
          return
        }
        // Check if any AI reached 500 first
        for (const ai of s.aiWorms) {
          if (ai.score >= 500) {
            s.isGameOver = true
            s.gameRunning = false
            callbacksRef.current.onDeath(s.player.score, s.player.segments.length, s.playerCoins, s.playerKills)
            return
          }
        }
      }

      // UI updates
      if (s.frameCount % 5 === 0) {
        callbacksRef.current.onScoreUpdate(s.gameMode === 'coins' ? s.playerCoins : s.player.score)
        callbacksRef.current.onBoostUpdate(s.boostEnergy)
        callbacksRef.current.onCoinsUpdate(s.playerCoins)
      }

      if (s.frameCount % 30 === 0) {
        const all = [s.player, ...s.aiWorms, ...s.remotePlayers.values()].filter(w => w.alive)
        all.sort((a, b) => b.score - a.score)
        callbacksRef.current.onLeaderboardUpdate(
          all.slice(0, 8).map(w => ({ name: w.name, score: w.score, isPlayer: w.isPlayer })),
        )

        const mc = minimapRef.current?.getContext('2d')
        if (mc && s.player) drawMinimap(mc, s.player, s.aiWorms, s.remotePlayers)
      }

      // Spawn timer
      s.spawnTimer++
      if (s.spawnTimer >= 7200) {
        s.spawnTimer = 0
        spawnAIWorm(Math.random() < 0.5)
      }
    }

    animFrameRef.current = requestAnimationFrame(loop)
  }, [canvasRef, minimapRef, spawnAIWorm])

  const stopGame = useCallback(() => {
    stateRef.current.gameRunning = false
    cancelAnimationFrame(animFrameRef.current)
    // Stop multiplayer broadcast
    try {
      const { spacetimeService } = require('@/services/SpacetimeService')
      spacetimeService.stopUpdateLoop()
    } catch {}
  }, [])

  // Input handlers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      const s = stateRef.current
      const dx = e.clientX - s.mouse.x
      const dy = e.clientY - s.mouse.y
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) s.controlMode = 'mouse'
      s.mouse.x = e.clientX
      s.mouse.y = e.clientY
    }

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      if (!stateRef.current.boosting) getNativeBridge().haptic('medium')
      stateRef.current.boosting = true
    }

    const handleMouseUp = () => {
      stateRef.current.boosting = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const s = stateRef.current
      const touch = e.touches[0]
      if (!touch) return
      if (!s.touchStart) {
        s.touchStart = { x: touch.clientX, y: touch.clientY }
      }
      s.controlMode = 'touch'
      s.touchVector.x = touch.clientX - s.touchStart.x
      s.touchVector.y = touch.clientY - s.touchStart.y
      // Boost only with two fingers
      s.boosting = e.touches.length >= 2
    }

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const s = stateRef.current
      const touch = e.touches[0]
      if (!touch) return
      // Only boost with two fingers
      const wasBoosting = s.boosting
      s.boosting = e.touches.length >= 2
      if (s.boosting && !wasBoosting) getNativeBridge().haptic('medium')
      s.controlMode = 'touch'
      if (!s.touchStart) {
        s.touchStart = { x: touch.clientX, y: touch.clientY }
      }
      s.touchVector.x = touch.clientX - s.touchStart.x
      s.touchVector.y = touch.clientY - s.touchStart.y
    }

    const handleTouchEnd = (e: TouchEvent) => {
      // Stop boosting when fewer than 2 fingers remain
      stateRef.current.boosting = e.touches.length >= 2
      if (e.touches.length === 0) {
        stateRef.current.touchStart = null
        stateRef.current.touchVector.x = 0
        stateRef.current.touchVector.y = 0
      }
    }

    const handleContextMenu = (e: Event) => e.preventDefault()

    const KEY_MAP: Record<string, string> = {
      'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right',
      'w': 'up', 's': 'down', 'a': 'left', 'd': 'right',
      'W': 'up', 'S': 'down', 'A': 'left', 'D': 'right',
      'z': 'up', 'q': 'left', 'Z': 'up', 'Q': 'left',
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!stateRef.current.gameRunning) return
      const dir = KEY_MAP[e.key]
      if (dir) {
        ;(stateRef.current.keys as Record<string, boolean>)[dir] = true
        stateRef.current.controlMode = 'keyboard'
        e.preventDefault()
      }
      if (e.key === ' ' || e.key === 'Shift') {
        if (!stateRef.current.boosting) getNativeBridge().haptic('medium')
        stateRef.current.boosting = true
        e.preventDefault()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key]
      if (dir) {
        ;(stateRef.current.keys as Record<string, boolean>)[dir] = false
        e.preventDefault()
      }
      if (e.key === ' ' || e.key === 'Shift') {
        stateRef.current.boosting = false
        e.preventDefault()
      }
    }

    window.addEventListener('resize', handleResize)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd)
    canvas.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [canvasRef])

  return { startGame, stopGame, stateRef }
}
