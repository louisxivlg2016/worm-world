import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  fr: {
    translation: {
      title: 'WORMS ZONE',
      subtitle: '. I O',
      namePlaceholder: 'Ton pseudo...',
      play: 'JOUER',
      retry: 'REJOUER',
      gameOver: 'GAME OVER',
      length: 'Longueur',
      score: 'Score',
      topWorms: 'TOP WORMS',
      controlsHint: 'Souris / ZQSD / WASD / Flèches pour diriger · Clic / Espace pour booster',
      lobby: 'LOBBY',
      createRoom: 'Créer un salon',
      joinRoom: 'Rejoindre',
      publicRooms: 'Salons publics',
      roomName: 'Nom du salon',
      players: 'Joueurs',
      back: 'Retour',
      soloPlay: 'Jouer solo',
      multiplay: 'Multijoueur',
      battle: 'Bataille',
      ffa: 'Chacun pour soi',
    },
  },
  en: {
    translation: {
      title: 'WORMS ZONE',
      subtitle: '. I O',
      namePlaceholder: 'Your name...',
      play: 'PLAY',
      retry: 'RETRY',
      gameOver: 'GAME OVER',
      length: 'Length',
      score: 'Score',
      topWorms: 'TOP WORMS',
      controlsHint: 'Mouse / WASD / Arrows to steer · Click / Space to boost',
      lobby: 'LOBBY',
      createRoom: 'Create room',
      joinRoom: 'Join',
      publicRooms: 'Public rooms',
      roomName: 'Room name',
      players: 'Players',
      back: 'Back',
      soloPlay: 'Play solo',
      multiplay: 'Multiplayer',
      battle: 'Battle',
      ffa: 'Free for all',
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'fr',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
