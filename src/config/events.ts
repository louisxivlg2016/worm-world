import type { GameMode } from '@/types/game'

export interface EventCostume {
  id: string
  label: string
  preview: string
  bodyTexture: string
}

export interface EventDateRange {
  startMonth: number
  startDay: number
  endMonth: number
  endDay: number
}

export interface GameEvent {
  id: GameMode
  label: string
  emoji: string
  currencyImage?: string
  lang?: string
  costumes: EventCostume[]
  unlockKey: string
  bgImage: string
  startMonth: number
  startDay: number
  endMonth: number
  endDay: number
  datesByYear?: Record<number, EventDateRange>
  bgGradient: [string, string]
  aiColors: [string, string, string, string]
  borderColor: string
  glowColor: string
  btnGradient: string
  btnShadow: string
  winTitle: string
  winMessage: string
}

export const GAME_EVENTS: GameEvent[] = [
  {
    id: 'newyear',
    label: 'Nouvel An',
    emoji: '🎆',
    costumes: [
      { id: 'newyear', label: 'Chapeau Haut', preview: '/heads/newyear.png', bodyTexture: '/heads/newyear-body.png' },
      { id: 'newyear2', label: 'Chapeau Fête', preview: '/heads/newyear2.png', bodyTexture: '/heads/newyear2-body.png' },
      { id: 'newyear3', label: 'Horloge', preview: '/heads/newyear3.png', bodyTexture: '/heads/newyear3-body.png' },
      { id: 'newyear4', label: 'Oncle Or', preview: '/heads/newyear4.png', bodyTexture: '/heads/newyear4-body.png' },
    ],
    unlockKey: 'newyearUnlocked',
    bgImage: '/firework-star.png',
    startMonth: 0, startDay: 1,
    endMonth: 0, endDay: 1,
    bgGradient: ['#1a1a2e', '#0f0f1a'],
    aiColors: ['#FFD700', '#C0C0C0', '#FFD700', '#1a1a2e'],
    borderColor: 'rgba(255,215,0,0.5)',
    glowColor: 'rgba(255,215,0,',
    btnGradient: 'linear-gradient(135deg, #1a1a2e, #FFD700)',
    btnShadow: '0 6px 25px rgba(255,215,0,0.5)',
    winTitle: 'Nouvel An Unlock!',
    winMessage: 'Tu as gagné le costume Nouvel An ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'valentine',
    label: 'St Valentin',
    emoji: '💕',
    costumes: [
      { id: 'valentine', label: 'Coeur', preview: '/heads/valentine.png', bodyTexture: '/heads/valentine-body.png' },
      { id: 'valentine2', label: 'Rose', preview: '/heads/valentine2.png', bodyTexture: '/heads/valentine2-body.png' },
      { id: 'valentine3', label: 'Lettre', preview: '/heads/valentine3.png', bodyTexture: '/heads/valentine3-body.png' },
      { id: 'valentine4', label: 'Oncle Cupidon', preview: '/heads/valentine4.png', bodyTexture: '/heads/valentine4-body.png' },
    ],
    unlockKey: 'valentineUnlocked',
    bgImage: '/heart-bg.png',
    startMonth: 1, startDay: 14,
    endMonth: 1, endDay: 14,
    bgGradient: ['#4a1028', '#2a0818'],
    aiColors: ['#FF1493', '#FF69B4', '#FF1493', '#C71585'],
    borderColor: 'rgba(255,20,147,0.5)',
    glowColor: 'rgba(255,20,147,',
    btnGradient: 'linear-gradient(135deg, #C71585, #FF1493, #FF69B4)',
    btnShadow: '0 6px 25px rgba(255,20,147,0.5)',
    winTitle: 'St Valentin Unlock!',
    winMessage: 'Tu as gagné le costume St Valentin ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'cny',
    label: 'Nouvel An Chinois',
    emoji: '🏮',
    currencyImage: '/cny-coin.png',
    costumes: [
      { id: 'cny', label: 'Lanterne', preview: '/heads/cny.png', bodyTexture: '/heads/cny-body.png' },
      { id: 'cny2', label: 'Dragon', preview: '/heads/cny2.png', bodyTexture: '/heads/cny2-body.png' },
      { id: 'cny3', label: 'Oncle Empereur', preview: '/heads/cny3.png', bodyTexture: '/heads/cny3-body.png' },
    ],
    unlockKey: 'cnyUnlocked',
    bgImage: '/cny-bg.png',
    startMonth: 1, startDay: 8,
    endMonth: 1, endDay: 12,
    bgGradient: ['#3a0a0a', '#2a0505'],
    aiColors: ['#CC0000', '#FFD700', '#CC0000', '#FFD700'],
    borderColor: 'rgba(255,215,0,0.5)',
    glowColor: 'rgba(255,215,0,',
    btnGradient: 'linear-gradient(135deg, #CC0000, #FF0000, #FFD700)',
    btnShadow: '0 6px 25px rgba(204,0,0,0.5)',
    winTitle: 'Nouvel An Chinois Unlock!',
    winMessage: 'Tu as gagné le costume Nouvel An Chinois ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'carnival',
    label: 'Carnaval',
    emoji: '🎭',
    costumes: [
      { id: 'carnival', label: 'Masque', preview: '/heads/carnival.png', bodyTexture: '/heads/carnival-body.png' },
      { id: 'carnival2', label: 'Clown', preview: '/heads/carnival2.png', bodyTexture: '/heads/carnival2-body.png' },
      { id: 'carnival3', label: 'Confetti', preview: '/heads/carnival3.png', bodyTexture: '/heads/carnival3-body.png' },
      { id: 'carnival4', label: 'Oncle Arlequin', preview: '/heads/carnival4.png', bodyTexture: '/heads/carnival4-body.png' },
    ],
    unlockKey: 'carnivalUnlocked',
    bgImage: '/carnival-bg.png',
    startMonth: 2, startDay: 1,
    endMonth: 2, endDay: 4,
    bgGradient: ['#2e1a4a', '#180a2e'],
    aiColors: ['#9400D3', '#FFD700', '#FF1493', '#00CED1'],
    borderColor: 'rgba(148,0,211,0.5)',
    glowColor: 'rgba(148,0,211,',
    btnGradient: 'linear-gradient(135deg, #9400D3, #FF1493, #FFD700)',
    btnShadow: '0 6px 25px rgba(148,0,211,0.5)',
    winTitle: 'Carnaval Unlock!',
    winMessage: 'Tu as gagné le costume Carnaval ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'holi',
    label: 'Holi',
    emoji: '🌈',
    costumes: [
      { id: 'holi', label: 'Couleurs', preview: '/heads/holi.png', bodyTexture: '/heads/holi-body.png' },
      { id: 'holi2', label: 'Ballon', preview: '/heads/holi2.png', bodyTexture: '/heads/holi2-body.png' },
      { id: 'holi3', label: 'Oncle Multicolore', preview: '/heads/holi3.png', bodyTexture: '/heads/holi3-body.png' },
    ],
    unlockKey: 'holiUnlocked',
    bgImage: '/holi-bg.png',
    startMonth: 2, startDay: 8,
    endMonth: 2, endDay: 10,
    bgGradient: ['#2a1a4a', '#1a0a2e'],
    aiColors: ['#FF1493', '#00FF00', '#FFD700', '#1E90FF'],
    borderColor: 'rgba(255,20,147,0.5)',
    glowColor: 'rgba(255,20,147,',
    btnGradient: 'linear-gradient(135deg, #FF1493, #00FF00, #FFD700)',
    btnShadow: '0 6px 25px rgba(255,20,147,0.5)',
    winTitle: 'Holi Unlock!',
    winMessage: 'Tu as gagné le costume Holi ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'stpatrick',
    label: 'St Patrick',
    emoji: '☘️',
    costumes: [
      { id: 'stpatrick', label: 'Leprechaun', preview: '/heads/stpatrick.png', bodyTexture: '/heads/stpatrick-body.png' },
      { id: 'stpatrick2', label: 'Oncle Vert', preview: '/heads/stpatrick2.png', bodyTexture: '/heads/stpatrick2-body.png' },
    ],
    unlockKey: 'stpatrickUnlocked',
    bgImage: '/stpatrick-clover.png',
    startMonth: 2, startDay: 17,
    endMonth: 2, endDay: 17,
    bgGradient: ['#1a6b3a', '#0e4a28'],
    aiColors: ['#00843D', '#2E8B57', '#00843D', '#006400'],
    borderColor: 'rgba(0,255,80,0.5)',
    glowColor: 'rgba(0,255,30,',
    btnGradient: 'linear-gradient(135deg, #006400, #00843D, #2E8B57)',
    btnShadow: '0 6px 25px rgba(0,132,61,0.5)',
    winTitle: 'St Patrick Unlock!',
    winMessage: 'Tu as gagné le costume St Patrick ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'ramadan',
    label: 'Ramadan',
    emoji: '🕌',
    currencyImage: '/ramadan-coin.png',
    costumes: [
      { id: 'ramadan', label: 'Croissant', preview: '/heads/eid.png', bodyTexture: '/heads/eid-body.png' },
      { id: 'ramadan2', label: 'Fanous', preview: '/heads/eid2.png', bodyTexture: '/heads/eid2-body.png' },
      { id: 'ramadan3', label: 'Oncle Lune', preview: '/heads/ramadan3.png', bodyTexture: '/heads/ramadan3-body.png' },
    ],
    unlockKey: 'ramadanUnlocked',
    bgImage: '/eid-bg.png',
    startMonth: 1, startDay: 18,
    endMonth: 2, endDay: 19,
    datesByYear: {
      2025: { startMonth: 1, startDay: 28, endMonth: 2, endDay: 29 },
      2026: { startMonth: 1, startDay: 18, endMonth: 2, endDay: 19 },
      2027: { startMonth: 1, startDay: 8, endMonth: 2, endDay: 9 },
      2028: { startMonth: 0, startDay: 28, endMonth: 1, endDay: 26 },
      2029: { startMonth: 0, startDay: 16, endMonth: 1, endDay: 14 },
      2030: { startMonth: 0, startDay: 6, endMonth: 1, endDay: 4 },
    },
    bgGradient: ['#1a1a4a', '#0a0a2e'],
    aiColors: ['#FFD700', '#8B4789', '#FFD700', '#2d1458'],
    borderColor: 'rgba(255,215,0,0.5)',
    glowColor: 'rgba(255,215,0,',
    btnGradient: 'linear-gradient(135deg, #2d1458, #8B4789, #FFD700)',
    btnShadow: '0 6px 25px rgba(139,71,137,0.5)',
    winTitle: 'Ramadan Unlock!',
    winMessage: 'Tu as gagné le costume Ramadan ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'eid',
    label: 'Eid',
    emoji: '🌙',
    currencyImage: '/eid-coin.png',
    costumes: [
      { id: 'eid', label: 'Croissant', preview: '/heads/eid.png', bodyTexture: '/heads/eid-body.png' },
      { id: 'eid2', label: 'Fanous', preview: '/heads/eid2.png', bodyTexture: '/heads/eid2-body.png' },
      { id: 'eid3', label: 'Oncle Croissant', preview: '/heads/eid3.png', bodyTexture: '/heads/eid3-body.png' },
    ],
    unlockKey: 'eidUnlocked',
    bgImage: '/eid-bg.png',
    startMonth: 2, startDay: 20,
    endMonth: 2, endDay: 22,
    datesByYear: {
      2025: { startMonth: 2, startDay: 30, endMonth: 2, endDay: 31 },
      2026: { startMonth: 2, startDay: 20, endMonth: 2, endDay: 22 },
      2027: { startMonth: 2, startDay: 10, endMonth: 2, endDay: 11 },
      2028: { startMonth: 1, startDay: 27, endMonth: 1, endDay: 28 },
      2029: { startMonth: 1, startDay: 15, endMonth: 1, endDay: 16 },
      2030: { startMonth: 1, startDay: 5, endMonth: 1, endDay: 6 },
    },
    bgGradient: ['#0a2e1a', '#052010'],
    aiColors: ['#006233', '#FFD700', '#006233', '#FFD700'],
    borderColor: 'rgba(255,215,0,0.5)',
    glowColor: 'rgba(255,215,0,',
    btnGradient: 'linear-gradient(135deg, #006233, #00843D, #FFD700)',
    btnShadow: '0 6px 25px rgba(0,98,51,0.5)',
    winTitle: 'Eid Unlock!',
    winMessage: 'Tu as gagné le costume Eid ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'easter',
    label: 'Pâques',
    emoji: '🐰',
    costumes: [
      { id: 'easter', label: 'Lapin', preview: '/heads/easter.png', bodyTexture: '/heads/easter-body.png' },
      { id: 'easter2', label: 'Poussin', preview: '/heads/easter2.png', bodyTexture: '/heads/easter2-body.png' },
      { id: 'easter3', label: 'Oeuf', preview: '/heads/easter3.png', bodyTexture: '/heads/easter3-body.png' },
      { id: 'easter4', label: 'Oncle Pastel', preview: '/heads/easter4.png', bodyTexture: '/heads/easter4-body.png' },
    ],
    unlockKey: 'easterUnlocked',
    bgImage: '/easter-egg-bg.png',
    startMonth: 3, startDay: 5,
    endMonth: 3, endDay: 10,
    datesByYear: {
      2025: { startMonth: 3, startDay: 20, endMonth: 3, endDay: 20 },
      2026: { startMonth: 3, startDay: 5, endMonth: 3, endDay: 10 },
      2027: { startMonth: 2, startDay: 28, endMonth: 3, endDay: 2 },
      2028: { startMonth: 3, startDay: 16, endMonth: 3, endDay: 21 },
      2029: { startMonth: 3, startDay: 1, endMonth: 3, endDay: 6 },
      2030: { startMonth: 3, startDay: 21, endMonth: 3, endDay: 26 },
    },
    bgGradient: ['#2d5a1e', '#1a3a10'],
    aiColors: ['#98FB98', '#FFB6C1', '#87CEEB', '#DDA0DD'],
    borderColor: 'rgba(152,251,152,0.5)',
    glowColor: 'rgba(152,251,152,',
    btnGradient: 'linear-gradient(135deg, #98FB98, #FFB6C1, #87CEEB)',
    btnShadow: '0 6px 25px rgba(152,251,152,0.5)',
    winTitle: 'Pâques Unlock!',
    winMessage: 'Tu as gagné le costume de Pâques ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'mayday',
    label: 'Fête du Travail',
    emoji: '🌹',
    costumes: [
      { id: 'mayday', label: 'Fleur', preview: '/heads/mayday.png', bodyTexture: '/heads/mayday-body.png' },
      { id: 'mayday2', label: 'Couronne', preview: '/heads/mayday2.png', bodyTexture: '/heads/mayday2-body.png' },
      { id: 'mayday3', label: 'Oncle Rose', preview: '/heads/mayday3.png', bodyTexture: '/heads/mayday3-body.png' },
    ],
    unlockKey: 'maydayUnlocked',
    bgImage: '/mayday-bg.png',
    startMonth: 4, startDay: 1,
    endMonth: 4, endDay: 1,
    bgGradient: ['#3a1a1a', '#2a0a0a'],
    aiColors: ['#FF0000', '#FFD700', '#FF0000', '#228B22'],
    borderColor: 'rgba(255,0,0,0.5)',
    glowColor: 'rgba(255,0,0,',
    btnGradient: 'linear-gradient(135deg, #CC0000, #FF0000, #FF4444)',
    btnShadow: '0 6px 25px rgba(255,0,0,0.5)',
    winTitle: 'Fête du Travail Unlock!',
    winMessage: 'Tu as gagné le costume Fête du Travail ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'summer',
    label: 'Été',
    emoji: '☀️',
    costumes: [
      { id: 'summer', label: 'Lunettes', preview: '/heads/summer.png', bodyTexture: '/heads/summer-body.png' },
      { id: 'summer2', label: 'Glace', preview: '/heads/summer2.png', bodyTexture: '/heads/summer2-body.png' },
      { id: 'summer3', label: 'Palmier', preview: '/heads/summer3.png', bodyTexture: '/heads/summer3-body.png' },
      { id: 'summer4', label: 'Oncle Soleil', preview: '/heads/summer4.png', bodyTexture: '/heads/summer4-body.png' },
    ],
    unlockKey: 'summerUnlocked',
    bgImage: '/sun-bg.png',
    startMonth: 5, startDay: 21,
    endMonth: 5, endDay: 21,
    bgGradient: ['#1a6080', '#0e3a50'],
    aiColors: ['#FFD700', '#FF8C00', '#FFD700', '#FFA500'],
    borderColor: 'rgba(255,215,0,0.5)',
    glowColor: 'rgba(255,165,0,',
    btnGradient: 'linear-gradient(135deg, #FF8C00, #FFD700, #FFA500)',
    btnShadow: '0 6px 25px rgba(255,140,0,0.5)',
    winTitle: 'Été Unlock!',
    winMessage: 'Tu as gagné le costume d\'Été ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'july4th',
    label: '4 Juillet',
    emoji: '🗽',
    currencyImage: '/july4th-coin.png',
    lang: 'en',
    costumes: [
      { id: 'july4th', label: 'Étoile', preview: '/heads/july4th.png', bodyTexture: '/heads/july4th-body.png' },
      { id: 'july4th2', label: 'Uncle Sam', preview: '/heads/july4th2.png', bodyTexture: '/heads/july4th2-body.png' },
    ],
    unlockKey: 'july4thUnlocked',
    bgImage: '/july4th-bg.png',
    startMonth: 6, startDay: 4,
    endMonth: 6, endDay: 4,
    bgGradient: ['#1a1a3e', '#0a0a2e'],
    aiColors: ['#3C3B6E', '#B22234', '#FFFFFF', '#B22234'],
    borderColor: 'rgba(178,34,52,0.5)',
    glowColor: 'rgba(178,34,52,',
    btnGradient: 'linear-gradient(135deg, #3C3B6E, #B22234, #FFFFFF)',
    btnShadow: '0 6px 25px rgba(60,59,110,0.5)',
    winTitle: '4th of July Unlock!',
    winMessage: 'Tu as gagné le costume 4 Juillet ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'bastille',
    label: '14 Juillet',
    emoji: '🇫🇷',
    currencyImage: '/bastille-coin.png',
    lang: 'fr',
    costumes: [
      { id: 'bastille', label: 'Cocarde', preview: '/heads/bastille.png', bodyTexture: '/heads/bastille-body.png' },
      { id: 'bastille2', label: 'Béret', preview: '/heads/bastille2.png', bodyTexture: '/heads/bastille2-body.png' },
      { id: 'bastille3', label: 'Oncle Tricolore', preview: '/heads/bastille3.png', bodyTexture: '/heads/bastille3-body.png' },
    ],
    unlockKey: 'bastilleUnlocked',
    bgImage: '/bastille-bg.png',
    startMonth: 6, startDay: 14,
    endMonth: 6, endDay: 14,
    bgGradient: ['#0a1a3e', '#050a2e'],
    aiColors: ['#002395', '#FFFFFF', '#ED2939', '#002395'],
    borderColor: 'rgba(0,35,149,0.5)',
    glowColor: 'rgba(0,35,149,',
    btnGradient: 'linear-gradient(135deg, #002395, #FFFFFF, #ED2939)',
    btnShadow: '0 6px 25px rgba(0,35,149,0.5)',
    winTitle: '14 Juillet Unlock!',
    winMessage: 'Tu as gagné le costume 14 Juillet ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'halloween',
    label: 'Halloween',
    emoji: '🎃',
    costumes: [
      { id: 'halloween', label: 'Citrouille', preview: '/heads/halloween.png', bodyTexture: '/heads/halloween-body.png' },
      { id: 'halloween2', label: 'Fantôme', preview: '/heads/halloween2.png', bodyTexture: '/heads/halloween2-body.png' },
      { id: 'halloween3', label: 'Sorcière', preview: '/heads/halloween3.png', bodyTexture: '/heads/halloween3-body.png' },
      { id: 'halloween4', label: 'Oncle Citrouille', preview: '/heads/halloween4.png', bodyTexture: '/heads/halloween4-body.png' },
    ],
    unlockKey: 'halloweenUnlocked',
    bgImage: '/pumpkin-bg.png',
    startMonth: 9, startDay: 31,
    endMonth: 9, endDay: 31,
    bgGradient: ['#1a0a2e', '#0f0518'],
    aiColors: ['#FF6600', '#000000', '#FF6600', '#228B22'],
    borderColor: 'rgba(255,102,0,0.5)',
    glowColor: 'rgba(255,102,0,',
    btnGradient: 'linear-gradient(135deg, #FF6600, #FF8800, #FFA500)',
    btnShadow: '0 6px 25px rgba(255,102,0,0.5)',
    winTitle: 'Halloween Unlock!',
    winMessage: 'Tu as gagné le costume Halloween ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'muertos',
    label: 'Día de Muertos',
    emoji: '💀',
    costumes: [
      { id: 'muertos', label: 'Crâne', preview: '/heads/muertos.png', bodyTexture: '/heads/muertos-body.png' },
      { id: 'muertos2', label: 'Marigold', preview: '/heads/muertos2.png', bodyTexture: '/heads/muertos2-body.png' },
      { id: 'muertos3', label: 'Oncle Catrina', preview: '/heads/muertos3.png', bodyTexture: '/heads/muertos3-body.png' },
    ],
    unlockKey: 'muertosUnlocked',
    bgImage: '/muertos-bg.png',
    startMonth: 10, startDay: 1,
    endMonth: 10, endDay: 2,
    bgGradient: ['#2e0a3a', '#1a0520'],
    aiColors: ['#FF1493', '#FFD700', '#00CED1', '#FF4500'],
    borderColor: 'rgba(255,20,147,0.5)',
    glowColor: 'rgba(255,20,147,',
    btnGradient: 'linear-gradient(135deg, #FF1493, #FFD700, #00CED1)',
    btnShadow: '0 6px 25px rgba(255,20,147,0.5)',
    winTitle: 'Día de Muertos Unlock!',
    winMessage: 'Tu as gagné le costume Día de Muertos ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'diwali',
    label: 'Diwali',
    emoji: '🪔',
    costumes: [
      { id: 'diwali', label: 'Diya', preview: '/heads/diwali.png', bodyTexture: '/heads/diwali-body.png' },
      { id: 'diwali2', label: 'Rangoli', preview: '/heads/diwali2.png', bodyTexture: '/heads/diwali2-body.png' },
      { id: 'diwali3', label: 'Oncle Diya', preview: '/heads/diwali3.png', bodyTexture: '/heads/diwali3-body.png' },
    ],
    unlockKey: 'diwaliUnlocked',
    bgImage: '/diwali-bg.png',
    startMonth: 10, startDay: 1,
    endMonth: 10, endDay: 3,
    bgGradient: ['#1a0a2e', '#0a0518'],
    aiColors: ['#FFD700', '#FF8C00', '#FF4500', '#FFD700'],
    borderColor: 'rgba(255,215,0,0.5)',
    glowColor: 'rgba(255,215,0,',
    btnGradient: 'linear-gradient(135deg, #FF8C00, #FFD700, #FF4500)',
    btnShadow: '0 6px 25px rgba(255,140,0,0.5)',
    winTitle: 'Diwali Unlock!',
    winMessage: 'Tu as gagné le costume Diwali ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'thanksgiving',
    label: 'Thanksgiving',
    emoji: '🦃',
    costumes: [
      { id: 'thanksgiving', label: 'Dinde', preview: '/heads/thanksgiving.png', bodyTexture: '/heads/thanksgiving-body.png' },
      { id: 'thanksgiving2', label: 'Pèlerin', preview: '/heads/thanksgiving2.png', bodyTexture: '/heads/thanksgiving2-body.png' },
      { id: 'thanksgiving3', label: 'Oncle Pèlerin', preview: '/heads/thanksgiving3.png', bodyTexture: '/heads/thanksgiving3-body.png' },
    ],
    unlockKey: 'thanksgivingUnlocked',
    bgImage: '/thanksgiving-bg.png',
    startMonth: 10, startDay: 27,
    endMonth: 10, endDay: 28,
    bgGradient: ['#2e1a0a', '#1a0a05'],
    aiColors: ['#8B4513', '#FF4500', '#FFD700', '#8B4513'],
    borderColor: 'rgba(255,69,0,0.5)',
    glowColor: 'rgba(255,69,0,',
    btnGradient: 'linear-gradient(135deg, #8B4513, #FF4500, #FFD700)',
    btnShadow: '0 6px 25px rgba(139,69,19,0.5)',
    winTitle: 'Thanksgiving Unlock!',
    winMessage: 'Tu as gagné le costume Thanksgiving ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'noel',
    label: 'Noël',
    emoji: '🎅',
    costumes: [
      { id: 'santa', label: 'Père Noël', preview: '/heads/santa.png', bodyTexture: '/heads/santa-body.png' },
      { id: 'santa2', label: 'Lutin', preview: '/heads/santa2.png', bodyTexture: '/heads/santa2-body.png' },
      { id: 'santa3', label: 'Bonhomme', preview: '/heads/santa3.png', bodyTexture: '/heads/santa3-body.png' },
      { id: 'santa4', label: 'Oncle Noël', preview: '/heads/santa4.png', bodyTexture: '/heads/santa4-body.png' },
    ],
    unlockKey: 'santaUnlocked',
    bgImage: '/snowflake.png',
    startMonth: 11, startDay: 24,
    endMonth: 11, endDay: 25,
    bgGradient: ['#1a2744', '#0a1528'],
    aiColors: ['#CC0000', '#FFFFFF', '#CC0000', '#228B22'],
    borderColor: 'rgba(255,255,255,0.4)',
    glowColor: 'rgba(255,255,255,',
    btnGradient: 'linear-gradient(135deg, #8B0000, #CC0000, #FF2020)',
    btnShadow: '0 6px 25px rgba(204,0,0,0.5)',
    winTitle: 'Père Noël Unlock!',
    winMessage: 'Tu as gagné le costume Père Noël ! Il est maintenant disponible dans la boutique.',
  },
  {
    id: 'reveillon',
    label: 'Réveillon',
    emoji: '🥂',
    costumes: [
      { id: 'reveillon', label: 'Champagne', preview: '/heads/reveillon.png', bodyTexture: '/heads/reveillon-body.png' },
      { id: 'reveillon2', label: 'Feu d\'artifice', preview: '/heads/reveillon2.png', bodyTexture: '/heads/reveillon2-body.png' },
      { id: 'reveillon3', label: 'Oncle Champagne', preview: '/heads/reveillon3.png', bodyTexture: '/heads/reveillon3-body.png' },
    ],
    unlockKey: 'reveillonUnlocked',
    bgImage: '/reveillon-bg.png',
    startMonth: 11, startDay: 31,
    endMonth: 11, endDay: 31,
    bgGradient: ['#1a1a2e', '#0a0a18'],
    aiColors: ['#FFD700', '#C0C0C0', '#FFD700', '#1a1a2e'],
    borderColor: 'rgba(255,215,0,0.5)',
    glowColor: 'rgba(255,215,0,',
    btnGradient: 'linear-gradient(135deg, #1a1a2e, #FFD700, #C0C0C0)',
    btnShadow: '0 6px 25px rgba(255,215,0,0.5)',
    winTitle: 'Réveillon Unlock!',
    winMessage: 'Tu as gagné le costume Réveillon ! Il est maintenant disponible dans la boutique.',
  },
  // === National days (language-specific) ===
  { id: 'hispanidad', label: 'Día de la Hispanidad', emoji: '🇪🇸', lang: 'es',
    costumes: [{ id: 'hispanidad', label: 'Tío España', preview: '/heads/hispanidad.png', bodyTexture: '/heads/hispanidad-body.png' }],
    unlockKey: 'hispanidadUnlocked', bgImage: '', startMonth: 9, startDay: 12, endMonth: 9, endDay: 12,
    bgGradient: ['#AA151B', '#F1BF00'], aiColors: ['#AA151B', '#F1BF00', '#AA151B', '#F1BF00'],
    borderColor: 'rgba(170,21,27,0.5)', glowColor: 'rgba(170,21,27,', btnGradient: 'linear-gradient(135deg, #AA151B, #F1BF00)',
    btnShadow: '0 6px 25px rgba(170,21,27,0.5)', winTitle: 'Hispanidad!', winMessage: 'Costume unlocked!' },
  { id: 'einheit', label: 'Tag der Einheit', emoji: '🇩🇪', lang: 'de',
    costumes: [{ id: 'einheit', label: 'Onkel Deutschland', preview: '/heads/einheit.png', bodyTexture: '/heads/einheit-body.png' }],
    unlockKey: 'einheitUnlocked', bgImage: '', startMonth: 9, startDay: 3, endMonth: 9, endDay: 3,
    bgGradient: ['#000000', '#DD0000'], aiColors: ['#000000', '#DD0000', '#FFCC00', '#000000'],
    borderColor: 'rgba(221,0,0,0.5)', glowColor: 'rgba(221,0,0,', btnGradient: 'linear-gradient(135deg, #000, #DD0000, #FFCC00)',
    btnShadow: '0 6px 25px rgba(221,0,0,0.5)', winTitle: 'Tag der Einheit!', winMessage: 'Costume unlocked!' },
  { id: 'repubblica', label: 'Festa della Repubblica', emoji: '🇮🇹', lang: 'it',
    costumes: [{ id: 'repubblica', label: 'Zio Italia', preview: '/heads/repubblica.png', bodyTexture: '/heads/repubblica-body.png' }],
    unlockKey: 'repubblicaUnlocked', bgImage: '', startMonth: 5, startDay: 2, endMonth: 5, endDay: 2,
    bgGradient: ['#009246', '#CE2B37'], aiColors: ['#009246', '#FFFFFF', '#CE2B37', '#009246'],
    borderColor: 'rgba(0,146,70,0.5)', glowColor: 'rgba(0,146,70,', btnGradient: 'linear-gradient(135deg, #009246, #FFF, #CE2B37)',
    btnShadow: '0 6px 25px rgba(0,146,70,0.5)', winTitle: 'Repubblica!', winMessage: 'Costume unlocked!' },
  { id: 'portugal', label: 'Dia de Portugal', emoji: '🇵🇹', lang: 'pt',
    costumes: [{ id: 'portugal_nat', label: 'Tio Portugal', preview: '/heads/portugal.png', bodyTexture: '/heads/portugal-body.png' }],
    unlockKey: 'portugalUnlocked', bgImage: '', startMonth: 5, startDay: 10, endMonth: 5, endDay: 10,
    bgGradient: ['#006600', '#FF0000'], aiColors: ['#006600', '#FF0000', '#FFCC00', '#006600'],
    borderColor: 'rgba(0,102,0,0.5)', glowColor: 'rgba(0,102,0,', btnGradient: 'linear-gradient(135deg, #006600, #FF0000)',
    btnShadow: '0 6px 25px rgba(0,102,0,0.5)', winTitle: 'Dia de Portugal!', winMessage: 'Costume unlocked!' },
  { id: 'russia', label: 'День России', emoji: '🇷🇺', lang: 'ru',
    costumes: [{ id: 'russia_nat', label: 'Дядя Россия', preview: '/heads/russia.png', bodyTexture: '/heads/russia-body.png' }],
    unlockKey: 'russiaUnlocked', bgImage: '', startMonth: 5, startDay: 12, endMonth: 5, endDay: 12,
    bgGradient: ['#0039A6', '#D52B1E'], aiColors: ['#FFFFFF', '#0039A6', '#D52B1E', '#FFFFFF'],
    borderColor: 'rgba(0,57,166,0.5)', glowColor: 'rgba(0,57,166,', btnGradient: 'linear-gradient(135deg, #FFF, #0039A6, #D52B1E)',
    btnShadow: '0 6px 25px rgba(0,57,166,0.5)', winTitle: 'День России!', winMessage: 'Costume unlocked!' },
  { id: 'china', label: '国庆节', emoji: '🇨🇳', lang: 'zh',
    costumes: [{ id: 'china_nat', label: '中国大叔', preview: '/heads/china.png', bodyTexture: '/heads/china-body.png' }],
    unlockKey: 'chinaUnlocked', bgImage: '', startMonth: 9, startDay: 1, endMonth: 9, endDay: 1,
    bgGradient: ['#EE1C25', '#FFDE00'], aiColors: ['#EE1C25', '#FFDE00', '#EE1C25', '#FFDE00'],
    borderColor: 'rgba(238,28,37,0.5)', glowColor: 'rgba(238,28,37,', btnGradient: 'linear-gradient(135deg, #EE1C25, #FFDE00)',
    btnShadow: '0 6px 25px rgba(238,28,37,0.5)', winTitle: '国庆节!', winMessage: 'Costume unlocked!' },
  { id: 'india', label: 'Independence Day', emoji: '🇮🇳', lang: 'hi',
    costumes: [{ id: 'india_nat', label: 'चाचा भारत', preview: '/heads/india.png', bodyTexture: '/heads/india-body.png' }],
    unlockKey: 'indiaUnlocked', bgImage: '', startMonth: 7, startDay: 15, endMonth: 7, endDay: 15,
    bgGradient: ['#FF9933', '#138808'], aiColors: ['#FF9933', '#FFFFFF', '#138808', '#FF9933'],
    borderColor: 'rgba(255,153,51,0.5)', glowColor: 'rgba(255,153,51,', btnGradient: 'linear-gradient(135deg, #FF9933, #FFF, #138808)',
    btnShadow: '0 6px 25px rgba(255,153,51,0.5)', winTitle: 'Independence Day!', winMessage: 'Costume unlocked!' },
  { id: 'cumhuriyet', label: 'Cumhuriyet Bayramı', emoji: '🇹🇷', lang: 'tr',
    costumes: [{ id: 'cumhuriyet', label: 'Türk Amca', preview: '/heads/cumhuriyet.png', bodyTexture: '/heads/cumhuriyet-body.png' }],
    unlockKey: 'cumhuriyetUnlocked', bgImage: '', startMonth: 9, startDay: 29, endMonth: 9, endDay: 29,
    bgGradient: ['#E30A17', '#FFFFFF'], aiColors: ['#E30A17', '#FFFFFF', '#E30A17', '#FFFFFF'],
    borderColor: 'rgba(227,10,23,0.5)', glowColor: 'rgba(227,10,23,', btnGradient: 'linear-gradient(135deg, #E30A17, #FFF)',
    btnShadow: '0 6px 25px rgba(227,10,23,0.5)', winTitle: 'Cumhuriyet!', winMessage: 'Costume unlocked!' },
  { id: 'koningsdag', label: 'Koningsdag', emoji: '🇳🇱', lang: 'nl',
    costumes: [{ id: 'koningsdag', label: 'Oom Oranje', preview: '/heads/koningsdag.png', bodyTexture: '/heads/koningsdag-body.png' }],
    unlockKey: 'koningsdagUnlocked', bgImage: '', startMonth: 3, startDay: 27, endMonth: 3, endDay: 27,
    bgGradient: ['#FF6600', '#AE1C28'], aiColors: ['#FF6600', '#FFFFFF', '#21468B', '#FF6600'],
    borderColor: 'rgba(255,102,0,0.5)', glowColor: 'rgba(255,102,0,', btnGradient: 'linear-gradient(135deg, #FF6600, #AE1C28)',
    btnShadow: '0 6px 25px rgba(255,102,0,0.5)', winTitle: 'Koningsdag!', winMessage: 'Costume unlocked!' },
  { id: 'japan', label: '建国記念の日', emoji: '🇯🇵', lang: 'ja',
    costumes: [{ id: 'japan_nat', label: '日本おじさん', preview: '/heads/japan.png', bodyTexture: '/heads/japan-body.png' }],
    unlockKey: 'japanUnlocked', bgImage: '', startMonth: 1, startDay: 11, endMonth: 1, endDay: 11,
    bgGradient: ['#FFFFFF', '#BC002D'], aiColors: ['#FFFFFF', '#BC002D', '#FFFFFF', '#BC002D'],
    borderColor: 'rgba(188,0,45,0.5)', glowColor: 'rgba(188,0,45,', btnGradient: 'linear-gradient(135deg, #FFF, #BC002D)',
    btnShadow: '0 6px 25px rgba(188,0,45,0.5)', winTitle: '建国記念!', winMessage: 'Costume unlocked!' },
  { id: 'korea', label: '광복절', emoji: '🇰🇷', lang: 'ko',
    costumes: [{ id: 'korea_nat', label: '한국 아저씨', preview: '/heads/korea.png', bodyTexture: '/heads/korea-body.png' }],
    unlockKey: 'koreaUnlocked', bgImage: '', startMonth: 7, startDay: 15, endMonth: 7, endDay: 15,
    bgGradient: ['#FFFFFF', '#CD2E3A'], aiColors: ['#FFFFFF', '#003478', '#CD2E3A', '#FFFFFF'],
    borderColor: 'rgba(205,46,58,0.5)', glowColor: 'rgba(205,46,58,', btnGradient: 'linear-gradient(135deg, #FFF, #003478, #CD2E3A)',
    btnShadow: '0 6px 25px rgba(0,52,120,0.5)', winTitle: '광복절!', winMessage: 'Costume unlocked!' },
]

const DEV_MODE = (process.env.VITE_DEV_MODE || process.env.EXPO_PUBLIC_DEV_MODE) === 'true'

export function isEventActive(event: GameEvent): boolean {
  if (DEV_MODE) return true

  // On localhost (dev server), show all events regardless of date so they can be tested
  if (typeof window !== 'undefined') {
    const host = window.location?.hostname || ''
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')) return true
  }

  const today = new Date()
  // All events use exact dates — festivals only show on their actual days
  const WINDOW_DAYS = 0

  const year = today.getFullYear()
  const yearOverride = event.datesByYear?.[year]
  const sMonth = yearOverride?.startMonth ?? event.startMonth
  const sDay = yearOverride?.startDay ?? event.startDay
  const eMonth = yearOverride?.endMonth ?? event.endMonth
  const eDay = yearOverride?.endDay ?? event.endDay

  // Build event date for this year
  const eventStart = new Date(year, sMonth, sDay)
  const eventEnd = new Date(year, eMonth, eDay)

  // Visible window: 14 days before start to 14 days after end
  const windowStart = new Date(eventStart)
  windowStart.setDate(windowStart.getDate() - WINDOW_DAYS)
  const windowEnd = new Date(eventEnd)
  windowEnd.setDate(windowEnd.getDate() + WINDOW_DAYS)

  // Handle year wrap (e.g. checking Dec event in January)
  if (windowStart > windowEnd) {
    return today >= windowStart || today <= windowEnd
  }
  return today >= windowStart && today <= windowEnd
}

export function getEventByMode(mode: GameMode): GameEvent | undefined {
  return GAME_EVENTS.find(e => e.id === mode)
}

export function isEventMode(mode: GameMode): boolean {
  return GAME_EVENTS.some(e => e.id === mode)
}
