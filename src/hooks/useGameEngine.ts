import { useRef, useEffect, useCallback } from 'react'
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
import { MultiplayerService, selfId } from '@/services/MultiplayerService'

// ============================================
// HEAD IMAGE CACHE — load once
// ============================================
const headImageCache = new Map<string, HTMLImageElement>()

function loadHeadImage(src: string): HTMLImageElement | null {
  if (headImageCache.has(src)) return headImageCache.get(src)!
  const img = new Image()
  img.src = src
  img.onload = () => { headImageCache.set(src, img) }
  return null
}

const HEAD_IMAGES: Record<string, string> = {
  queen: '/heads/queen.png',
  king: '/heads/king.png',
  dragon: '/heads/dragon.png',
}

// Body texture cache
const bodyTextureCache = new Map<string, HTMLImageElement>()

function loadBodyTexture(src: string): HTMLImageElement | null {
  if (bodyTextureCache.has(src)) return bodyTextureCache.get(src)!
  const img = new Image()
  img.src = src
  img.onload = () => { bodyTextureCache.set(src, img) }
  return null
}

const BODY_TEXTURES: Record<string, string> = {
  dragon: '/heads/dragon-body.png',
}

// Preload all
Object.values(HEAD_IMAGES).forEach(src => loadHeadImage(src))
Object.values(BODY_TEXTURES).forEach(src => loadBodyTexture(src))

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
  mp: MultiplayerService | null
  roomSlug: string | null
  roomId: string | null
  gameMode: GameMode
  localBattleDeaths: number
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
Object.values(POTION_IMAGES).forEach(src => {
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
  const len = 80
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
    battleDeaths: 0,
  }
}

function getWormRadius(worm: Worm): number {
  const len = worm.segments.length
  const growth = Math.pow(len / 150, 2) * 8
  return BASE_RADIUS + Math.min(growth, 28)
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

function updateWorm(worm: Worm, _dt: number, foods: Food[], coins: Coin[], particles: Particle[], playerCoinsRef: { value: number }, foodGrid?: SpatialGrid, effects?: EffectMods, flyingCoins?: FlyingCoin[], camera?: Camera, canvasW?: number, canvasH?: number) {
  if (!worm.alive) return
  if (worm.invincible > 0) worm.invincible--

  // Boost
  if (worm.boosting && worm.boostEnergy > 0 && worm.segments.length > 10) {
    worm.boostEnergy -= 0.5
    if (worm.boostEnergy <= 0) worm.boosting = false
    if (Math.random() < 0.03 && worm.segments.length > 10) {
      const tail = worm.segments.pop()!
      foods.push({ ...createFood(tail.x + (Math.random() - 0.5) * 20, tail.y + (Math.random() - 0.5) * 20, false), fromDeath: false })
    }
  } else if (!worm.boosting) {
    worm.boostEnergy = Math.min(100, worm.boostEnergy + 0.15)
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
  worm.angle += angleDiff * turnRate * turnMult

  // Move head
  const eff = effects ?? NO_EFFECTS
  const speed = getWormSpeed(worm) * eff.speedMult
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
            nf.radius = 8 + Math.random() * 6
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
      // Magnet: pull coins toward player
      if (eff.magnetRange > 0 && dist < coinAttractRange && dist > 0.001) {
        const pull = 0.12 + (1 - dist / coinAttractRange) * 0.25
        c.x += dx * pull
        c.y += dy * pull
      }
      if (dist < headR + c.radius) {
        playerCoinsRef.value++
        // Spawn flying coin animation toward the coin panel (bottom-left)
        if (flyingCoins && camera && canvasW && canvasH) {
          const screenPos = worldToScreen(c.x, c.y, camera, canvasW, canvasH)
          flyingCoins.push({
            x: screenPos.x,
            y: screenPos.y,
            targetX: 50, // coin panel is bottom-left
            targetY: canvasH - 30,
            progress: 0,
            speed: 0.025 + Math.random() * 0.015,
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

  // Danger detection
  let danger: { x: number; y: number; worm: Worm } | null = null
  let dangerDist = 200

  if (Math.random() < worm.aiGreed * 0.03) worm.aiDistracted = 20 + Math.floor(Math.random() * 30)

  const canSeeDanger = worm.aiDistracted <= 0 && Math.random() < worm.aiSkill
  if (canSeeDanger) {
    for (const other of others) {
      const checkLimit = Math.min(other.segments.length, 60)
      const step = Math.max(1, Math.floor((1 - worm.aiSkill) * 5))
      for (let i = 0; i < checkLimit; i += step) {
        const seg = other.segments[i]
        const dx = head.x - seg.x, dy = head.y - seg.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < dangerDist) {
          danger = { x: seg.x, y: seg.y, worm: other }
          dangerDist = d
        }
      }
    }
  }

  const inFrenzy = (worm.aiFrenzy ?? 0) > 0
  const reactionDist = inFrenzy ? 30 + worm.aiSkill * 25 : 50 + worm.aiSkill * 60

  if (danger && dangerDist < reactionDist) {
    const avoidAngle = Math.atan2(head.y - danger.y, head.x - danger.x)
    const error = (1 - worm.aiSkill) * (Math.random() - 0.5) * 2.5
    const frenzyError = inFrenzy ? (Math.random() - 0.5) * 1.5 : 0
    worm.targetAngle = avoidAngle + error + frenzyError
    worm.boosting = dangerDist < 40 && worm.aiSkill > 0.6 && worm.boostEnergy > 20
    worm.aiTimer = 5 + Math.floor(Math.random() * 10)
    if (inFrenzy) worm.aiFrenzy = Math.max(0, worm.aiFrenzy - 10)
    return
  }

  // Food frenzy — only nearby worms react, short duration, no long-range kamikaze
  if (worm.aiFrenzy === undefined) worm.aiFrenzy = 0
  if (worm.aiFrenzy > 0) worm.aiFrenzy--

  if (worm.aiTimer <= 0 && worm.aiFrenzy <= 0) {
    // Only search nearby (250 range, not 500) so distant worms don't converge
    const hotspot = findFoodHotspot(head.x, head.y, 250, foods)
    if (hotspot && hotspot.count > 12) {
      const dx = hotspot.x - head.x, dy = hotspot.y - head.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      // Only frenzy if actually close enough
      if (dist < 300) {
        worm.aiFrenzy = 25 // short burst, not permanent lock-on
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

  // Hunter
  if (worm.aiStrategy === 'hunter' && worm.aiAggression > 0.4 && mySize > 25) {
    for (const other of others) {
      if (other.segments.length < mySize * 0.6) {
        const oh = other.segments[0]
        const dx = oh.x - head.x, dy = oh.y - head.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 250) {
          const predX = oh.x + Math.cos(other.angle) * 60
          const predY = oh.y + Math.sin(other.angle) * 60
          worm.targetAngle = Math.atan2(predY - head.y, predX - head.x)
          worm.boosting = d < 150 && worm.boostEnergy > 25
          worm.aiTimer = 15
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
function drawBackground(ctx: CanvasRenderingContext2D, camera: Camera, w: number, h: number, player: Worm) {
  const grd = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w)
  grd.addColorStop(0, '#1a5c8a')
  grd.addColorStop(1, '#0e3a5c')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, w, h)

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
  ctx.strokeStyle = 'rgba(255,80,80,0.5)'
  ctx.lineWidth = 4 * camera.zoom
  ctx.setLineDash([20 * camera.zoom, 10 * camera.zoom])
  ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y)
  ctx.setLineDash([])

  // Border glow
  const head = player.segments[0]
  const edgeDist = Math.min(Math.abs(head.x) - half, Math.abs(head.y) - half)
  if (edgeDist > -300) {
    const alpha = Math.max(0, (300 + edgeDist) / 300) * 0.3
    ctx.fillStyle = `rgba(255,30,30,${alpha})`
    ctx.fillRect(0, 0, w, h)
  }
}

// Food image cache — preload all cartoon food images
const foodImgCache = new Map<string, HTMLImageElement>()

function preloadFoodImages() {
  const allPaths = [...new Set([...FOOD_IMAGES, ...SPECIAL_FOOD_IMAGES])]
  for (const src of allPaths) {
    if (foodImgCache.has(src)) continue
    const img = new Image()
    img.src = src
    img.onload = () => { foodImgCache.set(src, img) }
  }
}
preloadFoodImages()

// Diamond rendering for coins mode
const DIAMOND_COLORS = [
  { top: '#88d8ff', mid: '#2196F3', bot: '#0D47A1', shine: '#e0f7ff' }, // blue
  { top: '#ff88aa', mid: '#E91E63', bot: '#880E4F', shine: '#ffe0ec' }, // pink
  { top: '#88ffaa', mid: '#4CAF50', bot: '#1B5E20', shine: '#e0ffe8' }, // green
  { top: '#d088ff', mid: '#9C27B0', bot: '#4A148C', shine: '#f3e0ff' }, // purple
  { top: '#ffffff', mid: '#e0e0e0', bot: '#9e9e9e', shine: '#ffffff' }, // white/diamond
  { top: '#fff888', mid: '#FFC107', bot: '#FF6F00', shine: '#fff8e0' }, // amber
  { top: '#ff8888', mid: '#F44336', bot: '#B71C1C', shine: '#ffe0e0' }, // red
]

const diamondCanvases: HTMLCanvasElement[] = []

function generateDiamonds() {
  for (const color of DIAMOND_COLORS) {
    const size = 64
    const c = document.createElement('canvas')
    c.width = size; c.height = size
    const ctx = c.getContext('2d')!
    const cx = size / 2, cy = size / 2

    // Diamond shape points
    const top = { x: cx, y: 6 }
    const left = { x: 8, y: cy - 4 }
    const right = { x: size - 8, y: cy - 4 }
    const bottom = { x: cx, y: size - 8 }

    // Main body gradient
    const grad = ctx.createLinearGradient(0, 0, 0, size)
    grad.addColorStop(0, color.top)
    grad.addColorStop(0.4, color.mid)
    grad.addColorStop(1, color.bot)

    // Draw diamond shape
    ctx.beginPath()
    ctx.moveTo(top.x, top.y)
    ctx.lineTo(right.x, right.y)
    ctx.lineTo(bottom.x, bottom.y)
    ctx.lineTo(left.x, left.y)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    // Top facet (lighter)
    ctx.beginPath()
    ctx.moveTo(top.x, top.y)
    ctx.lineTo(right.x, right.y)
    ctx.lineTo(cx + 8, cy - 6)
    ctx.lineTo(cx - 8, cy - 6)
    ctx.lineTo(left.x, left.y)
    ctx.closePath()
    ctx.fillStyle = color.top + 'aa'
    ctx.fill()

    // Center facet line
    ctx.beginPath()
    ctx.moveTo(left.x, left.y)
    ctx.lineTo(cx - 8, cy - 6)
    ctx.lineTo(bottom.x, bottom.y)
    ctx.strokeStyle = color.bot + '66'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(right.x, right.y)
    ctx.lineTo(cx + 8, cy - 6)
    ctx.lineTo(bottom.x, bottom.y)
    ctx.strokeStyle = color.bot + '66'
    ctx.lineWidth = 1
    ctx.stroke()

    // Bright shine spot
    ctx.beginPath()
    ctx.arc(cx - 6, cy - 10, 5, 0, Math.PI * 2)
    ctx.fillStyle = color.shine + 'cc'
    ctx.fill()

    // Small sparkle
    ctx.beginPath()
    ctx.arc(cx + 8, top.y + 8, 2.5, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffffcc'
    ctx.fill()

    // Outline
    ctx.beginPath()
    ctx.moveTo(top.x, top.y)
    ctx.lineTo(right.x, right.y)
    ctx.lineTo(bottom.x, bottom.y)
    ctx.lineTo(left.x, left.y)
    ctx.closePath()
    ctx.strokeStyle = color.bot + '88'
    ctx.lineWidth = 1.5
    ctx.stroke()

    diamondCanvases.push(c)
  }
}
generateDiamonds()

// Emoji fallback for death food
const emojiCache = new Map<string, HTMLCanvasElement>()
function getEmojiCanvas(emoji: string): HTMLCanvasElement {
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
  for (const f of foods) {
    const p = worldToScreen(f.x, f.y, camera, w, h)
    if (p.x < -40 || p.x > w + 40 || p.y < -40 || p.y > h + 40) continue
    const r = f.radius * camera.zoom
    const pulse = 1 + Math.sin(time + f.pulse) * 0.1
    const size = r * 4.0 * pulse

    // Glow for special food
    if (f.special && size > 6) {
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

    // Draw diamond or food image
    const diamondIdx = (f as any)._diamondIdx as number | undefined
    if (diamondIdx !== undefined && diamondCanvases[diamondIdx]) {
      if (decayAlpha < 1) ctx.globalAlpha = decayAlpha
      ctx.drawImage(diamondCanvases[diamondIdx], p.x - size / 2, p.y - size / 2, size, size)
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
const _coinImg = new Image()
_coinImg.src = '/ui/coin.png'
_coinImg.onload = () => { coinImg = _coinImg }

function drawCoins(ctx: CanvasRenderingContext2D, coins: Coin[], camera: Camera, w: number, h: number) {
  const time = Date.now() * 0.004
  for (const c of coins) {
    const p = worldToScreen(c.x, c.y, camera, w, h)
    if (p.x < -30 || p.x > w + 30 || p.y < -30 || p.y > h + 30) continue
    const r = c.radius * camera.zoom
    const pulse = 1 + Math.sin(time + c.pulse) * 0.15
    const size = r * pulse

    // Glow
    if (size > 5) {
      ctx.beginPath()
      const glowGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2.5)
      glowGrd.addColorStop(0, 'rgba(255,215,0,0.2)')
      glowGrd.addColorStop(1, 'rgba(255,215,0,0)')
      ctx.fillStyle = glowGrd
      ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw coin image
    if (coinImg) {
      ctx.drawImage(coinImg, p.x - size, p.y - size, size * 2, size * 2)
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
const _chestClosed = new Image()
_chestClosed.src = '/ui/chest-closed.png'
_chestClosed.onload = () => { chestClosedImg = _chestClosed }
const _chestOpen = new Image()
_chestOpen.src = '/ui/chest-open.png'
_chestOpen.onload = () => { chestOpenImg = _chestOpen }

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

function drawFlyingCoins(ctx: CanvasRenderingContext2D, flyingCoins: FlyingCoin[]) {
  for (const fc of flyingCoins) {
    const t = fc.progress
    // Curved path (arc toward target)
    const cx = fc.x + (fc.targetX - fc.x) * t
    const cy = fc.y + (fc.targetY - fc.y) * t - Math.sin(t * Math.PI) * 80
    const size = 12 * (1 - t * 0.4)

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

  // Quick cull: skip worm entirely if head is way off-screen
  // (body can extend, so use generous margin based on segment count)
  const headP = worldToScreen(segments[0].x, segments[0].y, camera, w, h)
  const bodyMargin = Math.min(segments.length * 6 * camera.zoom, w + h)
  if (headP.x < -bodyMargin || headP.x > w + bodyMargin ||
      headP.y < -bodyMargin || headP.y > h + bodyMargin) return

  const invincible = worm.invincible > 0
  const invAlpha = invincible ? 0.3 * Math.sin(Date.now() * 0.01) : 0

  // Check for body texture (dragon etc.)
  const bodyTexKey = worm.skin.bodyTexture
  const bodyTexImg = bodyTexKey ? bodyTextureCache.get(bodyTexKey) : null

  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i]
    const p = worldToScreen(seg.x, seg.y, camera, w, h)
    if (p.x < -50 || p.x > w + 50 || p.y < -50 || p.y > h + 50) continue

    if (bodyTexImg) {
      // Textured body — same circle as solid color, just filled with texture
      ctx.save()
      ctx.beginPath()
      ctx.arc(p.x, p.y, segR, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(bodyTexImg, p.x - segR, p.y - segR, segR * 2, segR * 2)
      ctx.restore()
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
    const headImg = headImageCache.get(HEAD_IMAGES[headType])
    if (headImg) {
      // Always upright — no rotation
      const aspect = headImg.naturalHeight / headImg.naturalWidth
      const imgW = headR * 5
      const imgH = imgW * aspect
      // Push up so the face sits above the body, crown visible
      ctx.drawImage(headImg, hp.x - imgW / 2, hp.y - imgH * 0.75, imgW, imgH)
    }
  } else {
    // Default eyes — always upright (fixed position, no rotation)
    const eyeR = headR * 0.32
    const pupilR = eyeR * 0.55
    const eyeSpacing = headR * 0.35

    for (let side = -1; side <= 1; side += 2) {
      const ex = hp.x + side * eyeSpacing
      const ey = hp.y - headR * 0.1

      // Eye white
      ctx.beginPath()
      ctx.arc(ex, ey, eyeR, 0, Math.PI * 2)
      ctx.fillStyle = worm.eyeBlink > 0 ? colors[0] : '#ffffff'
      ctx.fill()

      if (worm.eyeBlink <= 0) {
        // Pupil
        ctx.beginPath()
        ctx.arc(ex, ey, pupilR, 0, Math.PI * 2)
        ctx.fillStyle = '#111'
        ctx.fill()

        // Eye shine
        ctx.beginPath()
        ctx.arc(ex - pupilR * 0.3, ey - pupilR * 0.3, pupilR * 0.35, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()
      }
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
  const w = 160, h = 160
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
  onDeath: (score: number, length: number, coins: number) => void
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

  const spawnAIWorm = useCallback((forceSmall?: boolean) => {
    const s = stateRef.current
    const ax = (Math.random() - 0.5) * WORLD_SIZE * 0.8
    const ay = (Math.random() - 0.5) * WORLD_SIZE * 0.8
    const skin = AI_SKINS[Math.floor(Math.random() * AI_SKINS.length)]
    const name = getUniqueAIName()
    const w = createWorm(ax, ay, skin, name, false)

    if (!forceSmall && Math.random() > 0.45) {
      const extraSegs = Math.floor(Math.random() * 40)
      for (let j = 0; j < extraSegs; j++) {
        const last = w.segments[w.segments.length - 1]
        w.segments.push({ x: last.x, y: last.y })
      }
      w.score = extraSegs * 2
    }
    w.angle = Math.random() * Math.PI * 2
    s.aiWorms.push(w)
  }, [getUniqueAIName])

  const startGame = useCallback((playerName: string, playerSkin: WormSkin, roomSlug?: string, roomId?: string, gameMode?: GameMode, seed?: number) => {
    const s = stateRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const px = (Math.random() - 0.5) * WORLD_SIZE * 0.5
    const py = (Math.random() - 0.5) * WORLD_SIZE * 0.5
    s.player = createWorm(px, py, playerSkin, playerName, true)

    // Preload body texture if the skin has one
    if (playerSkin.bodyTexture) loadBodyTexture(playerSkin.bodyTexture)

    const isCoinsMode = (gameMode ?? 'ffa') === 'coins'

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
        f.radius = 8 + Math.random() * 6
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
    s.gameMode = gameMode ?? 'ffa'
    s.localBattleDeaths = 0
    s.isGameOver = false
    s.remotePlayers = new Map()

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

        // Update flying coins (screen-space animation toward coin panel)
        for (let i = s.flyingCoins.length - 1; i >= 0; i--) {
          const fc = s.flyingCoins[i]
          fc.progress += fc.speed
          if (fc.progress >= 1) {
            s.flyingCoins.splice(i, 1)
          }
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

      // In coins mode: player is invincible, AI can still die
      if (s.gameMode === 'coins') s.player.invincible = 999

      checkCollisions(
        [s.player, ...s.aiWorms],
        s.foods,
        s.particles,
        () => {
          if (s.gameMode === 'coins') return // player can't die in coins mode
          s.gameRunning = false
          callbacksRef.current.onDeath(s.player!.score, s.player!.segments.length, s.playerCoins)
        },
        (_worm, _idx) => {
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
        let targetZoom = Math.max(0.5, 1 - s.player.segments.length * 0.001)
        if (hasZoom) targetZoom *= 0.55 // zoom out effect
        s.camera.zoom += (targetZoom - s.camera.zoom) * 0.05
      }

      s.boostEnergy = s.player.boostEnergy

      // Draw
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawBackground(ctx, s.camera, canvas.width, canvas.height, s.player)
      drawFood(ctx, s.foods, s.camera, canvas.width, canvas.height)
      drawChests(ctx, s.chests, s.camera, canvas.width, canvas.height)
      drawCoins(ctx, s.coins, s.camera, canvas.width, canvas.height)
      drawPotions(ctx, s.potions, s.camera, canvas.width, canvas.height)
      drawParticles(ctx, s.particles, s.camera, canvas.width, canvas.height)

      for (const ai of s.aiWorms) drawWorm(ctx, ai, s.camera, canvas.width, canvas.height)

      // Remote players
      for (const [, rp] of s.remotePlayers) {
        drawWorm(ctx, rp, s.camera, canvas.width, canvas.height)
      }

      if (s.player.alive) drawWorm(ctx, s.player, s.camera, canvas.width, canvas.height)

      // Active potion effect indicators
      drawActiveEffects(ctx, s.activeEffects, canvas.width)
      drawFlyingCoins(ctx, s.flyingCoins)

      // UI updates
      if (s.frameCount % 5 === 0) {
        callbacksRef.current.onScoreUpdate(s.gameMode === 'coins' ? s.playerCoins : s.player.score)
        callbacksRef.current.onBoostUpdate(s.boostEnergy)
        callbacksRef.current.onCoinsUpdate(s.playerCoins)
      }

      if (s.frameCount % 30 === 0) {
        const all = [s.player, ...s.aiWorms].filter(w => w.alive)
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
    }

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const s = stateRef.current
      const touch = e.touches[0]
      if (!touch) return
      s.boosting = true
      s.controlMode = 'touch'
      s.touchStart = { x: touch.clientX, y: touch.clientY }
      s.touchVector.x = 0
      s.touchVector.y = 0
    }

    const handleTouchEnd = () => {
      stateRef.current.boosting = false
      stateRef.current.touchStart = null
      stateRef.current.touchVector.x = 0
      stateRef.current.touchVector.y = 0
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
