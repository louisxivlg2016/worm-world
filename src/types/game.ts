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
  | 'stpatrick' | 'santa' | 'newyear' | 'valentine' | 'easter' | 'halloween' | 'summer'
  | 'carnival' | 'holi' | 'mayday' | 'bastille' | 'july4th' | 'muertos' | 'diwali' | 'reveillon' | 'cny' | 'thanksgiving' | 'eid'

export type BodyStyle = 'circles' | 'tube'
export type EyeStyle = 'classic' | 'angry' | 'happy' | 'wink'
export type MouthStyle = 'none' | 'smile' | 'grin' | 'angry' | 'surprised'

export interface WormSkin {
  colors: string[]
  eye?: string
  name?: string
  headType?: HeadType
  eyeStyle?: EyeStyle
  mouthStyle?: MouthStyle
  flagName?: string
  bodyTexture?: string // URL to a body texture image
  isFlag?: boolean // true for flag skins (continuous body texture)
  bodyStyle?: BodyStyle
}

export interface Food {
  x: number
  y: number
  radius: number
  emoji: string  // kept for death food fallback
  img?: string   // image path for cartoon food
  value: number
  pulse: number
  special: boolean
  fromDeath?: boolean
  spawnedAt?: number // timestamp for death food decay
}

export type PotionType = 'speed' | 'zoom' | 'magnet'

export interface Potion {
  x: number
  y: number
  radius: number
  type: PotionType
  pulse: number
}

export const POTION_DURATION = 10000 // 10 seconds
export const POTION_COUNT = 30

export interface Coin {
  x: number
  y: number
  radius: number
  pulse: number
  spin: number
  vx?: number // velocity for exploding coins
  vy?: number
  fromChest?: boolean // coins spawned from chest
  friction?: number
}

export interface Chest {
  x: number
  y: number
  radius: number
  pulse: number
  opened: boolean
  openAnim: number // 0-1 open animation progress
}

export const CHEST_COUNT = 60

export interface FlyingCoin {
  wx: number // world X (where the coin was collected)
  wy: number // world Y
  targetX: number // screen X target (coin panel)
  targetY: number // screen Y target
  progress: number // 0-1
  speed: number
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
  trappedSince: number // timestamp when started being surrounded, 0 = not trapped
  // Multiplayer
  peerId?: string
  battleDeaths?: number
}

export interface Camera {
  x: number
  y: number
  zoom: number
}

export type GameMode = 'battle' | 'ctf' | 'ffa' | 'coins' | 'race'
  | 'stpatrick' | 'noel' | 'newyear' | 'valentine' | 'easter' | 'halloween' | 'summer'
  | 'carnival' | 'holi' | 'mayday' | 'bastille' | 'july4th' | 'muertos' | 'diwali' | 'reveillon' | 'cny' | 'thanksgiving' | 'eid' | 'ramadan'
  | 'hispanidad' | 'einheit' | 'repubblica' | 'portugal' | 'russia' | 'china' | 'india' | 'cumhuriyet' | 'koningsdag' | 'japan' | 'korea'
export type GameScreen = 'menu' | 'lobby' | 'shop' | 'profile' | 'playing' | 'dead' | 'event-win'

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

export const FOOD_IMAGES = [
  '/food/banane.png',
  '/food/burger.png',
  '/food/donut.png',
  '/food/fraise.png',
  '/food/gateau.png',
  '/food/hot-dog.png',
  '/food/muffin.png',
  '/food/pizza.png',
  '/food/pomme.png',
  '/food/poulet.png',
  '/food/susette.png',
  '/food/sushi.png',
]

export const SPECIAL_FOOD_IMAGES = [
  '/food/burger.png',
  '/food/pizza.png',
  '/food/poulet.png',
  '/food/donut.png',
  '/food/gateau.png',
  '/food/sushi.png',
]

// Keep emojis as fallback for death food
export const FOOD_EMOJIS = ['🍖','🍗','🍕','🍔','🍩','🍓','🍌','🍎','🍣','🌭','🧁','🍰']
export const SPECIAL_FOOD_EMOJIS = ['🍖','🍕','🍔','🍗','🍩','🍣']

// Image sets for each food pack — selected via foodPack setting
export const FOOD_PACK_IMAGES: Record<string, string[]> = {
  classic: ['/food/burger.png','/food/pizza.png','/food/donut.png','/food/hot-dog.png','/food/muffin.png','/food/sushi.png'],
  fruits: ['/food/fraise.png','/food/banane.png','/food/pomme.png','/food/gateau.png','/food/susette.png','/food/poulet.png'],
  francaise: [
    '/food/baguette.png','/food/borgignon.png','/food/brie.png','/food/camenbert.png',
    '/food/coq-au-vin.png','/food/creme-brule.png','/food/crepe.png','/food/croissant.png',
    '/food/eclair.png','/food/entrecote.png','/food/escargo.png','/food/flan.png',
    '/food/fruit-de-mer.png','/food/gallete.png','/food/macaran.png','/food/mille-feuille.png',
    '/food/pain-au-chocolat.png','/food/paris-brest.png','/food/poulet-a-la-francaise.png',
    '/food/profitorelle.png','/food/purre-de-pomme-de-terre.png','/food/quiche-lorraine.png',
    '/food/raclette.png','/food/ratatouille.png','/food/saussison.png','/food/soupe-au-pain.png',
    '/food/soupe-au-saussice.png','/food/tartarre.png','/food/tarte-au-abricot.png',
  ],
  italienne: [
    '/food/pizza-margherita.png','/food/alasagna-alla-bognese.png','/food/amaretti.png',
    '/food/antipasto-misto.png','/food/aracini.png','/food/bombolone.png',
    '/food/boulette-de-viande.png','/food/caponata-sicilienne.png','/food/carpacio-di-manz.png',
    '/food/cornetto.png','/food/cotoletta-alla-milanese.png','/food/croissant-nutella.png',
    '/food/crostata.png','/food/fromage-bleu.png','/food/gelato.png','/food/osso-buco.png',
    '/food/paneton.png','/food/panna-cotta.png','/food/parmezan.png',
    '/food/pollo-ala-cacciatora.png','/food/pollo-al-limone-.png','/food/ribollita.png',
    '/food/risotto-ai-funghi.png','/food/saltimbocca-alla-romana-.png','/food/tiramisu.png',
    '/food/torta-della-nona.png','/food/zuppa-inglese.png',
  ],
  americaine: [
    '/food/americaine-donut.png','/food/americaine-burger.png','/food/americaine-hot-dog.png',
    '/food/americaine-steak.png','/food/americaine-nugget.png','/food/americaine-pankake.png',
    '/food/americaine-biscuit.png','/food/americaine-chedar.png','/food/americaine-crabe.png',
    '/food/americaine-crevette-frit.png','/food/americaine-dessert.png','/food/americaine-dessert-.png',
    '/food/americaine-donut-vide.png','/food/americaine-gallete.png','/food/americaine-glace.png',
    '/food/americaine-sandhiwh.png','/food/americaine-sandwhich.png','/food/americaine-viande.png',
  ],
  chinoise: [
    '/food/youtiao.png','/food/baozi.png','/food/tangyuan.png','/food/fermented-tofu.png',
    '/food/gong-bao-jiding.png','/food/yangzhou-fried-rice.png','/food/cashew-chicken.png','/food/peking-duck.png',
    '/food/xiaolongbao.png','/food/stir-fried-eggplant-with-garlic.png','/food/jianbing.png','/food/zongzi.png',
    '/food/ma-po-tofu.png','/food/dim-sum-chicken-feet.png','/food/cantonese-roast-chicken.png','/food/dongpo-rou.png',
    '/food/egg-tart.png','/food/wonton-soup.png','/food/hot-and-sour-soup.png','/food/sesame-balls.png',
    '/food/sweet-tofu-with-goji-berries.png','/food/mango-pudding.png','/food/lanzhou-beef-noodle-soup.png','/food/yu-xiang-rou-si.png',
    '/food/egg-tart-alt.png','/food/pineapple-bun.png','/food/chinese-mochi.png','/food/mooncake.png',
    '/food/red-bean-cake.png','/food/nian-gao.png','/food/chinese-fruit-salad.png','/food/fortune-cookies.png',
    '/food/chinese-sausage-platter.png','/food/century-egg-tofu.png','/food/preserved-egg-box.png','/food/oyster-platter.png',
    '/food/hot-pot.png','/food/lo-mein.png','/food/dumpling-greens-soup.png','/food/sweet-and-sour-dish.png',
  ],
}

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
