// ============================================
// GAME CONSTANTS
// ============================================
export const WORLD_SIZE = 6000
export const FOOD_COUNT = 4000
export const SPECIAL_FOOD_COUNT = 250
export const AI_WORM_COUNT = 25
export const BASE_SPEED = 2.0
export const BOOST_SPEED = 3.8
export const BASE_SEGMENT_GAP = 5
export const BASE_RADIUS = 14
export const TURN_SPEED = 0.08
export const COIN_COUNT = 200
export const BATTLE_MAX_DEATHS = 3

// ============================================
// TYPES
// ============================================
export interface Segment {
  x: number
  y: number
}

export type HeadType = 'default' | 'queen' | 'king' | 'dragon'

export interface WormSkin {
  colors: string[]
  eye?: string
  name?: string
  headType?: HeadType
  bodyTexture?: string // URL to a body texture image
}

export interface Food {
  x: number
  y: number
  radius: number
  emoji: string
  value: number
  pulse: number
  special: boolean
  fromDeath?: boolean
}

export interface Coin {
  x: number
  y: number
  radius: number
  pulse: number
  spin: number
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  radius: number
}

export type AIStrategy = 'hunter' | 'farmer' | 'explorer' | 'camper'

export interface Worm {
  segments: Segment[]
  angle: number
  targetAngle: number
  speed: number
  skin: WormSkin
  name: string
  score: number
  isPlayer: boolean
  alive: boolean
  boosting: boolean
  boostEnergy: number
  segmentsToAdd: number
  // AI fields
  aiTimer: number
  aiTarget: Food | null
  aiAvoidTimer: number
  aiSkill: number
  aiAggression: number
  aiGreed: number
  aiDistracted: number
  aiStrategy: AIStrategy
  aiDeathFood: Food | null
  aiFrenzy: number
  // Visual
  eyeBlink: number
  invincible: number
  // Multiplayer
  peerId?: string
  battleDeaths?: number
}

export interface Camera {
  x: number
  y: number
  zoom: number
}

export type GameMode = 'battle' | 'ctf' | 'ffa'
export type GameScreen = 'menu' | 'lobby' | 'shop' | 'playing' | 'dead'

export interface GameState {
  screen: GameScreen
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
  controlMode: 'mouse' | 'keyboard'
  mouse: { x: number; y: number }
  keys: { up: boolean; down: boolean; left: boolean; right: boolean }
  selectedSkin: number
  playerName: string
  gameMode: GameMode
  roomSlug: string | null
  roomSeed: number | null
  isGameOver: boolean
  localBattleDeaths: number
}

// ============================================
// SKINS
// ============================================
export const SKINS: WormSkin[] = [
  { colors: ['#ff3366','#ff6b9d','#ff3366','#cc0044'], eye: '#fff', name: 'Rose' },
  { colors: ['#00ccff','#0088ff','#00ccff','#0055cc'], eye: '#fff', name: 'Ocean' },
  { colors: ['#7cff00','#44cc00','#7cff00','#228800'], eye: '#fff', name: 'Viper' },
  { colors: ['#ff6b35','#ffaa00','#ff6b35','#cc4400'], eye: '#fff', name: 'Lava' },
  { colors: ['#cc33ff','#8833ff','#cc33ff','#6600cc'], eye: '#fff', name: 'Mystic' },
  { colors: ['#ffd700','#ffaa00','#ffd700','#cc8800'], eye: '#333', name: 'Gold' },
  { colors: ['#ff1493','#ff69b4','#ff1493','#c71585'], eye: '#fff', name: 'Pink' },
  { colors: ['#00ff88','#00cc66','#00ff88','#009944'], eye: '#fff', name: 'Emerald' },
]

export const AI_SKINS: WormSkin[] = [
  { colors: ['#e74c3c','#c0392b','#e74c3c','#962d22'] },
  { colors: ['#3498db','#2980b9','#3498db','#1f6694'] },
  { colors: ['#2ecc71','#27ae60','#2ecc71','#1e8449'] },
  { colors: ['#f39c12','#e67e22','#f39c12','#ba6318'] },
  { colors: ['#9b59b6','#8e44ad','#9b59b6','#6c3483'] },
  { colors: ['#1abc9c','#16a085','#1abc9c','#0e7a64'] },
  { colors: ['#e91e63','#c2185b','#e91e63','#880e4f'] },
  { colors: ['#ff5722','#e64a19','#ff5722','#bf360c'] },
  { colors: ['#00bcd4','#0097a7','#00bcd4','#006064'] },
  { colors: ['#8bc34a','#689f38','#8bc34a','#33691e'] },
  { colors: ['#ff9800','#f57c00','#ff9800','#e65100'] },
  { colors: ['#607d8b','#455a64','#607d8b','#263238'] },
]

export const AI_NAMES = [
  'Lucas','Emma','Hugo','Léa','Louis','Chloé','Adam','Jade',
  'Nathan','Lina','Tom','Sarah','Alex','Sofia','Max','Inès',
  'Ethan','Camille','Noah','Alice','Raphaël','Zoé','Théo','Mia',
  'Gabriel','Clara','Liam','Eva','Jules','Anna','Arthur','Nina',
  'Mohamed','Stella','Sacha','Rose','Victor','Amira','Oscar','Lily',
  'Dylan','Marie','Kevin','Laura','Sam','Elise','Leo','Nora',
  'Matt','Yasmine','Axel','Manon','Ryan','Lucie','Karim','Hana',
  'Enzo','Olivia','Dave','Margot','Felix','Diane','Ivan','Iris',
]

export const FOOD_EMOJIS = [
  '🧀','🧀',
  '🍖','🍗','🥩','🥓','🌭',
  '🍬','🍭','🍫','🍩','🍪','🧁','🍰','🎂','🍮','🍡','🍦','🍧','🍨',
  '🥖','🍞','🥐','🥯','🧇','🥞',
  '🥕','🥦','🌽','🍅','🫑','🥬','🧅','🥒','🥔','🍆','🌶️','🧄','🫒',
  '🍎','🍊','🍋','🍇','🍓','🍌','🍑','🍒','🥝','🍍','🫐','🥭','🍐','🥥','🍈','🍉',
  '🍕','🍔','🌮','🌯','🥗','🍟','🥚','🍳','🥘','🫕','🥙','🧆',
  '🍣','🍙','🍜','🥟','🍱','🍛','🍝','🍲','🥡','🍘',
  '🥤','🧃','🍿','🥜','🫘','🥨',
]

export const SPECIAL_FOOD_EMOJIS = [
  '🍖','🧀','🍕','🍔','🎂','🍗','🥩','🍰','🍩','🍍','🥐','🍣',
  '🍉','🍳','🥘','🍱','🍝','🌯','🥓','🍦','🍧','🧇','🥞',
]

// ============================================
// MULTIPLAYER EVENT TYPES
// ============================================
export interface PresenceData {
  peerId: string
  username: string
  skin: WormSkin
  x: number
  y: number
  angle: number
  score: number
  segments: number
  health: number
  boosting: boolean
}

export interface MotionDelta {
  x: number
  y: number
  vx: number
  vy: number
  facing: number
  health: number
}

export interface GameEvent {
  type: string
  seq: number
  user_id?: string
  username?: string
  payload?: Record<string, unknown>
}
