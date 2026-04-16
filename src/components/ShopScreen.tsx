import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { translateFlag } from '@/i18n/flagNames'
import { SKINS, type WormSkin } from '@/types/game'
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

// New Europe flags
import andorreFlagBody from '../../drapeau/andorre.png'
import albanieFlagBody from '../../drapeau/albanie.png'
import armenieFlagBody from '../../drapeau/armenie.png'
import azerbaidjanFlagBody from '../../drapeau/azerbaidjan.png'
import bielorussieFlagBody from '../../drapeau/bielorussie.png'
import bosnieFlagBody from '../../drapeau/bosnie.png'
import bulgarieFlagBody from '../../drapeau/bulgarie.png'
import chypreFlagBody from '../../drapeau/chypre.png'
import estonieFlagBody from '../../drapeau/estonie.png'
import georgieFlagBody from '../../drapeau/georgie.png'
import hongrieFlagBody from '../../drapeau/hongrie.png'
import islandeFlagBody from '../../drapeau/islande.png'
import kosovoFlagBody from '../../drapeau/kosovo.png'
import lettonieFlagBody from '../../drapeau/lettonie.png'
import liechtensteinFlagBody from '../../drapeau/liechtenstein.png'
import lituanieFlagBody from '../../drapeau/lituanie.png'
import luxembourgFlagBody from '../../drapeau/luxembourg.png'
import macedoineDuNordFlagBody from '../../drapeau/macedoine-du-nord.png'
import malteFlagBody from '../../drapeau/malte.png'
import moldavieFlagBody from '../../drapeau/moldavie.png'
import monacoFlagBody from '../../drapeau/monaco.png'
import montenegroFlagBody from '../../drapeau/montenegro.png'
import saintMarinFlagBody from '../../drapeau/saint-marin.png'
import serbieFlagBody from '../../drapeau/serbie.png'
import slovaquieFlagBody from '../../drapeau/slovaquie.png'
import slovenieFlagBody from '../../drapeau/slovenie.png'
import tchadFlagBody from '../../drapeau/tchad.png'
import tchequieFlagBody from '../../drapeau/tchequie.png'
import vaticanFlagBody from '../../drapeau/vatican.png'

// New Americas flags
import bolivieFlagBody from '../../drapeau/bolivie.png'
import costaRicaFlagBody from '../../drapeau/costa-rica.png'
import equateurFlagBody from '../../drapeau/equateur.png'
import elSalvadorFlagBody from '../../drapeau/el-salvador.png'
import guatemalaFlagBody from '../../drapeau/guatemala.png'
import guyanaFlagBody from '../../drapeau/guyana.png'
import hondurasFlagBody from '../../drapeau/honduras.png'
import nicaraguaFlagBody from '../../drapeau/nicaragua.png'
import panamaFlagBody from '../../drapeau/panama.png'
import paraguayFlagBody from '../../drapeau/paraguay.png'
import surinameFlagBody from '../../drapeau/suriname.png'
import uruguayFlagBody from '../../drapeau/uruguay.png'
import venezuelaFlagBody from '../../drapeau/venezuela.png'
import triniteEtTobagoFlagBody from '../../drapeau/trinite-et-tobago.png'
import barbadeFlagBody from '../../drapeau/barbade.png'

// New Africa flags
import angolaFlagBody from '../../drapeau/angola.png'
import beninFlagBody from '../../drapeau/benin.png'
import botswanaFlagBody from '../../drapeau/botswana.png'
import burkinaFasoFlagBody from '../../drapeau/burkina-faso.png'
import burundiFlagBody from '../../drapeau/burundi.png'
import capVertFlagBody from '../../drapeau/cap-vert.png'
import centrafiqueFlagBody from '../../drapeau/centrafrique.png'
import djiboutiFlagBody from '../../drapeau/djibouti.png'
import eswatiniFlagBody from '../../drapeau/eswatini.png'
import erythreeFlagBody from '../../drapeau/erythree.png'
import gabonFlagBody from '../../drapeau/gabon.png'
import gambieFlagBody from '../../drapeau/gambie.png'
import guineeFlagBody from '../../drapeau/guinee.png'
import guineeBissauFlagBody from '../../drapeau/guinee-bissau.png'
import guineeEquatorialeFlagBody from '../../drapeau/guinee-equatoriale.png'
import kenyaFlagBody from '../../drapeau/kenya.png'
import lesothoFlagBody from '../../drapeau/lesotho.png'
import liberiaFlagBody from '../../drapeau/liberia.png'
import libyeFlagBody from '../../drapeau/libye.png'
import madagascarFlagBody from '../../drapeau/madagascar.png'
import malawiFlagBody from '../../drapeau/malawi.png'
import maliFlagBody from '../../drapeau/mali.png'
import mauritanieFlagBody from '../../drapeau/mauritanie.png'
import mauriceFlagBody from '../../drapeau/maurice.png'
import mozambiqueFlagBody from '../../drapeau/mozambique.png'
import namibieFlagBody from '../../drapeau/namibie.png'
import nigerFlagBody from '../../drapeau/niger.png'
import ougandaFlagBody from '../../drapeau/ouganda.png'
import rwandaFlagBody from '../../drapeau/rwanda.png'
import seychellesFlagBody from '../../drapeau/seychelles.png'
import sierraLeoneFlagBody from '../../drapeau/sierra-leone.png'
import somalieFlagBody from '../../drapeau/somalie.png'
import soudanFlagBody from '../../drapeau/soudan.png'
import soudanDuSudFlagBody from '../../drapeau/soudan-du-sud.png'
import tanzanieFlagBody from '../../drapeau/tanzanie.png'
import togoFlagBody from '../../drapeau/togo.png'
import zimbabweFlagBody from '../../drapeau/zimbabwe.png'
import zambieFlagBody from '../../drapeau/zambie.png'

// New Asia flags
import afghanistanFlagBody from '../../drapeau/afghanistan.png'
import bangladeshFlagBody from '../../drapeau/bangladesh.png'
import bhoutanFlagBody from '../../drapeau/bhoutan.png'
import bruneiFlagBody from '../../drapeau/brunei.png'
import cambodgeFlagBody from '../../drapeau/cambodge.png'
import coreeDuNordFlagBody from '../../drapeau/coree-du-nord.png'
import irakFlagBody from '../../drapeau/irak.png'
import jordanieFlagBody from '../../drapeau/jordanie.png'
import kazakhstanFlagBody from '../../drapeau/kazakhstan.png'
import kirghizistanFlagBody from '../../drapeau/kirghizistan.png'
import koweitFlagBody from '../../drapeau/koweit.png'
import laosFlagBody from '../../drapeau/laos.png'
import libanFlagBody from '../../drapeau/liban.png'
import maldivesFlagBody from '../../drapeau/maldives.png'
import mongolieFlagBody from '../../drapeau/mongolie.png'
import myanmarFlagBody from '../../drapeau/myanmar.png'
import nepalFlagBody from '../../drapeau/nepal.png'
import omanFlagBody from '../../drapeau/oman.png'
import qatarFlagBody from '../../drapeau/qatar.png'
import singapourFlagBody from '../../drapeau/singapour.png'
import sriLankaFlagBody from '../../drapeau/sri-lanka.png'
import syrieFlagBody from '../../drapeau/syrie.png'
import tadjikistanFlagBody from '../../drapeau/tadjikistan.png'
import taiwanFlagBody from '../../drapeau/taiwan.png'
import turkmenistanFlagBody from '../../drapeau/turkmenistan.png'
import ouzbekistanFlagBody from '../../drapeau/ouzbekistan.png'
import malaisieFlagBody from '../../drapeau/malaisie.png'
import yemenFlagBody from '../../drapeau/yemen.png'

// New Oceania flags
import fidjiFlagBody from '../../drapeau/fidji.png'
import palaosFlagBody from '../../drapeau/palaos.png'
import papouasieNouvelleGuineeFlagBody from '../../drapeau/papouasie-nouvelle-guinee.png'
import samoaFlagBody from '../../drapeau/samoa.png'
import ilesSalomonFlagBody from '../../drapeau/iles-salomon.png'
import tongaFlagBody from '../../drapeau/tonga.png'
import tuvaluFlagBody from '../../drapeau/tuvalu.png'
import vanuatuFlagBody from '../../drapeau/vanuatu.png'
import timorOrientalFlagBody from '../../drapeau/timor-oriental.png'

// New Caribbean/Islands flags
import antiguaEtBarbudaFlagBody from '../../drapeau/antigua-et-barbuda.png'
import bahamasFlagBody from '../../drapeau/bahamas.png'
import bahreinFlagBody from '../../drapeau/bahrein.png'
import belizeFlagBody from '../../drapeau/belize.png'
import dominiqueFlagBody from '../../drapeau/dominique.png'
import saoTomeFlagBody from '../../drapeau/sao-tome.png'

// New Middle East flags
import israelFlagBody from '../../drapeau/israel.png'
import palestineFlagBody from '../../drapeau/palestine.png'
import emiratsArabesUnisFlagBody from '../../drapeau/emirats-arabes-unis.png'

type FlagSkin = {
  name: string
  preview: string
  colors: [string, string, string, string]
  bodyTexture: string
}

import { getStorage } from '@/services/StorageService'

import { GAME_EVENTS } from '@/config/events'

const HEAD_OPTIONS: { id: string; label: string; preview: string; bodyTexture?: string; locked?: boolean }[] = [
  { id: 'default', label: 'Classique', preview: '' },
  { id: 'queen', label: 'Reine', preview: '/heads/queen.png' },
  { id: 'king', label: 'Roi', preview: '/heads/king.png' },
  { id: 'dragon', label: 'Dragon', preview: '/heads/dragon.png', bodyTexture: '/heads/dragon-body.png' },
  { id: 'cat', label: 'Chat', preview: '/heads/cat.png', bodyTexture: '/heads/cat-body.png' },
  { id: 'dog', label: 'Chien', preview: '/heads/dog.png', bodyTexture: '/heads/dog-body.png' },
  { id: 'panda', label: 'Panda', preview: '/heads/panda.png', bodyTexture: '/heads/panda-body.png' },
  { id: 'fox', label: 'Renard', preview: '/heads/fox.png', bodyTexture: '/heads/fox-body.png' },
  { id: 'penguin', label: 'Pingouin', preview: '/heads/penguin.png', bodyTexture: '/heads/penguin-body.png' },
  { id: 'robot', label: 'Robot', preview: '/heads/robot.png', bodyTexture: '/heads/robot-body.png' },
  { id: 'alien', label: 'Alien', preview: '/heads/alien.png', bodyTexture: '/heads/alien-body.png' },
  { id: 'ninja', label: 'Ninja', preview: '/heads/ninja.png', bodyTexture: '/heads/ninja-body.png' },
  ...GAME_EVENTS.flatMap(e => {
    const locked = getStorage().getItem(e.unlockKey) !== 'true'
    return e.costumes.map(c => ({
      id: c.id,
      label: `${c.label} ${e.emoji}`,
      preview: c.preview,
      bodyTexture: c.bodyTexture,
      locked,
    }))
  }),
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
  { name: 'Albanie', preview: albanieFlagBody, bodyTexture: albanieFlagBody, colors: ['#E41E20', '#000000', '#E41E20', '#000000'] },
  { name: 'Andorre', preview: andorreFlagBody, bodyTexture: andorreFlagBody, colors: ['#0032A0', '#FEDF00', '#D1002F', '#0032A0'] },
  { name: 'Armenie', preview: armenieFlagBody, bodyTexture: armenieFlagBody, colors: ['#D90012', '#0033A0', '#F2A800', '#D90012'] },
  { name: 'Azerbaidjan', preview: azerbaidjanFlagBody, bodyTexture: azerbaidjanFlagBody, colors: ['#0092BC', '#E4002B', '#00AF66', '#0092BC'] },
  { name: 'Bielorussie', preview: bielorussieFlagBody, bodyTexture: bielorussieFlagBody, colors: ['#CF101A', '#007C30', '#FFFFFF', '#CF101A'] },
  { name: 'Bosnie', preview: bosnieFlagBody, bodyTexture: bosnieFlagBody, colors: ['#002395', '#FECB00', '#002395', '#FECB00'] },
  { name: 'Bulgarie', preview: bulgarieFlagBody, bodyTexture: bulgarieFlagBody, colors: ['#FFFFFF', '#00966E', '#D62612', '#FFFFFF'] },
  { name: 'Chypre', preview: chypreFlagBody, bodyTexture: chypreFlagBody, colors: ['#FFFFFF', '#D57800', '#FFFFFF', '#D57800'] },
  { name: 'Estonie', preview: estonieFlagBody, bodyTexture: estonieFlagBody, colors: ['#0072CE', '#000000', '#FFFFFF', '#0072CE'] },
  { name: 'Georgie', preview: georgieFlagBody, bodyTexture: georgieFlagBody, colors: ['#FFFFFF', '#FF0000', '#FFFFFF', '#FF0000'] },
  { name: 'Hongrie', preview: hongrieFlagBody, bodyTexture: hongrieFlagBody, colors: ['#CE2939', '#FFFFFF', '#477050', '#CE2939'] },
  { name: 'Islande', preview: islandeFlagBody, bodyTexture: islandeFlagBody, colors: ['#003897', '#FFFFFF', '#D72828', '#003897'] },
  { name: 'Kosovo', preview: kosovoFlagBody, bodyTexture: kosovoFlagBody, colors: ['#244AA5', '#D0A650', '#244AA5', '#D0A650'] },
  { name: 'Lettonie', preview: lettonieFlagBody, bodyTexture: lettonieFlagBody, colors: ['#9E3039', '#FFFFFF', '#9E3039', '#9E3039'] },
  { name: 'Liechtenstein', preview: liechtensteinFlagBody, bodyTexture: liechtensteinFlagBody, colors: ['#002B7F', '#CE1126', '#002B7F', '#CE1126'] },
  { name: 'Lituanie', preview: lituanieFlagBody, bodyTexture: lituanieFlagBody, colors: ['#FDB913', '#006A44', '#C1272D', '#FDB913'] },
  { name: 'Luxembourg', preview: luxembourgFlagBody, bodyTexture: luxembourgFlagBody, colors: ['#EF3340', '#FFFFFF', '#00A2E1', '#EF3340'] },
  { name: 'Macedoine du Nord', preview: macedoineDuNordFlagBody, bodyTexture: macedoineDuNordFlagBody, colors: ['#CE2028', '#F9D616', '#CE2028', '#F9D616'] },
  { name: 'Malte', preview: malteFlagBody, bodyTexture: malteFlagBody, colors: ['#FFFFFF', '#CF142B', '#FFFFFF', '#CF142B'] },
  { name: 'Moldavie', preview: moldavieFlagBody, bodyTexture: moldavieFlagBody, colors: ['#003DA5', '#FFD200', '#CC092F', '#003DA5'] },
  { name: 'Monaco', preview: monacoFlagBody, bodyTexture: monacoFlagBody, colors: ['#CE1126', '#FFFFFF', '#CE1126', '#FFFFFF'] },
  { name: 'Montenegro', preview: montenegroFlagBody, bodyTexture: montenegroFlagBody, colors: ['#C40308', '#D4AF37', '#C40308', '#D4AF37'] },
  { name: 'Saint-Marin', preview: saintMarinFlagBody, bodyTexture: saintMarinFlagBody, colors: ['#FFFFFF', '#5EB6E4', '#FFFFFF', '#5EB6E4'] },
  { name: 'Serbie', preview: serbieFlagBody, bodyTexture: serbieFlagBody, colors: ['#C6363C', '#0C4076', '#FFFFFF', '#C6363C'] },
  { name: 'Slovaquie', preview: slovaquieFlagBody, bodyTexture: slovaquieFlagBody, colors: ['#FFFFFF', '#0B4EA2', '#EE1C25', '#FFFFFF'] },
  { name: 'Slovenie', preview: slovenieFlagBody, bodyTexture: slovenieFlagBody, colors: ['#FFFFFF', '#003DA5', '#ED1C24', '#FFFFFF'] },
  { name: 'Tchad', preview: tchadFlagBody, bodyTexture: tchadFlagBody, colors: ['#002664', '#FECB00', '#C60C30', '#002664'] },
  { name: 'Tchequie', preview: tchequieFlagBody, bodyTexture: tchequieFlagBody, colors: ['#FFFFFF', '#D7141A', '#11457E', '#FFFFFF'] },
  { name: 'Vatican', preview: vaticanFlagBody, bodyTexture: vaticanFlagBody, colors: ['#FFE000', '#FFFFFF', '#FFE000', '#FFFFFF'] },
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
  { name: 'Bolivie', preview: bolivieFlagBody, bodyTexture: bolivieFlagBody, colors: ['#D52B1E', '#F9E300', '#007934', '#D52B1E'] },
  { name: 'Costa Rica', preview: costaRicaFlagBody, bodyTexture: costaRicaFlagBody, colors: ['#002B7F', '#FFFFFF', '#CE1126', '#002B7F'] },
  { name: 'Equateur', preview: equateurFlagBody, bodyTexture: equateurFlagBody, colors: ['#FFD100', '#034EA2', '#CE1126', '#FFD100'] },
  { name: 'El Salvador', preview: elSalvadorFlagBody, bodyTexture: elSalvadorFlagBody, colors: ['#0F47AF', '#FFFFFF', '#0F47AF', '#FFFFFF'] },
  { name: 'Guatemala', preview: guatemalaFlagBody, bodyTexture: guatemalaFlagBody, colors: ['#4997D0', '#FFFFFF', '#4997D0', '#4997D0'] },
  { name: 'Guyana', preview: guyanaFlagBody, bodyTexture: guyanaFlagBody, colors: ['#009E49', '#FCD116', '#000000', '#009E49'] },
  { name: 'Honduras', preview: hondurasFlagBody, bodyTexture: hondurasFlagBody, colors: ['#0073CF', '#FFFFFF', '#0073CF', '#0073CF'] },
  { name: 'Nicaragua', preview: nicaraguaFlagBody, bodyTexture: nicaraguaFlagBody, colors: ['#0067C6', '#FFFFFF', '#0067C6', '#0067C6'] },
  { name: 'Panama', preview: panamaFlagBody, bodyTexture: panamaFlagBody, colors: ['#FFFFFF', '#D21034', '#005293', '#FFFFFF'] },
  { name: 'Paraguay', preview: paraguayFlagBody, bodyTexture: paraguayFlagBody, colors: ['#D52B1E', '#FFFFFF', '#0038A8', '#D52B1E'] },
  { name: 'Suriname', preview: surinameFlagBody, bodyTexture: surinameFlagBody, colors: ['#377E3F', '#B40A2D', '#FFFFFF', '#377E3F'] },
  { name: 'Uruguay', preview: uruguayFlagBody, bodyTexture: uruguayFlagBody, colors: ['#FFFFFF', '#0038A8', '#FCD116', '#FFFFFF'] },
  { name: 'Venezuela', preview: venezuelaFlagBody, bodyTexture: venezuelaFlagBody, colors: ['#CF142B', '#00247D', '#FFCC00', '#CF142B'] },
  { name: 'Trinite-et-Tobago', preview: triniteEtTobagoFlagBody, bodyTexture: triniteEtTobagoFlagBody, colors: ['#CE1126', '#000000', '#FFFFFF', '#CE1126'] },
  { name: 'Barbade', preview: barbadeFlagBody, bodyTexture: barbadeFlagBody, colors: ['#00267F', '#FFC726', '#00267F', '#00267F'] },
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
  { name: 'Angola', preview: angolaFlagBody, bodyTexture: angolaFlagBody, colors: ['#CC092F', '#000000', '#CC092F', '#000000'] },
  { name: 'Benin', preview: beninFlagBody, bodyTexture: beninFlagBody, colors: ['#008751', '#FCD116', '#E8112D', '#008751'] },
  { name: 'Botswana', preview: botswanaFlagBody, bodyTexture: botswanaFlagBody, colors: ['#6DA9E4', '#000000', '#FFFFFF', '#6DA9E4'] },
  { name: 'Burkina Faso', preview: burkinaFasoFlagBody, bodyTexture: burkinaFasoFlagBody, colors: ['#EF2B2D', '#009E49', '#EF2B2D', '#009E49'] },
  { name: 'Burundi', preview: burundiFlagBody, bodyTexture: burundiFlagBody, colors: ['#CE1126', '#1EB53A', '#FFFFFF', '#CE1126'] },
  { name: 'Cap-Vert', preview: capVertFlagBody, bodyTexture: capVertFlagBody, colors: ['#003893', '#CF2027', '#FFFFFF', '#003893'] },
  { name: 'Centrafrique', preview: centrafiqueFlagBody, bodyTexture: centrafiqueFlagBody, colors: ['#003082', '#FFFFFF', '#289728', '#FFCB00'] },
  { name: 'Djibouti', preview: djiboutiFlagBody, bodyTexture: djiboutiFlagBody, colors: ['#6AB2E7', '#12AD2B', '#FFFFFF', '#6AB2E7'] },
  { name: 'Eswatini', preview: eswatiniFlagBody, bodyTexture: eswatiniFlagBody, colors: ['#3E5EB9', '#FED100', '#B10C0C', '#3E5EB9'] },
  { name: 'Erythree', preview: erythreeFlagBody, bodyTexture: erythreeFlagBody, colors: ['#4189DD', '#12AD2B', '#EA0437', '#4189DD'] },
  { name: 'Gabon', preview: gabonFlagBody, bodyTexture: gabonFlagBody, colors: ['#009E60', '#FCD116', '#3A75C4', '#009E60'] },
  { name: 'Gambie', preview: gambieFlagBody, bodyTexture: gambieFlagBody, colors: ['#CE1126', '#0C1C8C', '#3A7728', '#CE1126'] },
  { name: 'Guinee', preview: guineeFlagBody, bodyTexture: guineeFlagBody, colors: ['#CE1126', '#FCD116', '#009460', '#CE1126'] },
  { name: 'Guinee-Bissau', preview: guineeBissauFlagBody, bodyTexture: guineeBissauFlagBody, colors: ['#CE1126', '#FCD116', '#009E49', '#CE1126'] },
  { name: 'Guinee Equatoriale', preview: guineeEquatorialeFlagBody, bodyTexture: guineeEquatorialeFlagBody, colors: ['#3E9A00', '#FFFFFF', '#E32118', '#0073CE'] },
  { name: 'Kenya', preview: kenyaFlagBody, bodyTexture: kenyaFlagBody, colors: ['#000000', '#BB0000', '#006600', '#FFFFFF'] },
  { name: 'Lesotho', preview: lesothoFlagBody, bodyTexture: lesothoFlagBody, colors: ['#00209F', '#FFFFFF', '#009543', '#00209F'] },
  { name: 'Liberia', preview: liberiaFlagBody, bodyTexture: liberiaFlagBody, colors: ['#BF0A30', '#FFFFFF', '#002868', '#BF0A30'] },
  { name: 'Libye', preview: libyeFlagBody, bodyTexture: libyeFlagBody, colors: ['#E70013', '#000000', '#239E46', '#E70013'] },
  { name: 'Madagascar', preview: madagascarFlagBody, bodyTexture: madagascarFlagBody, colors: ['#FFFFFF', '#FC3D32', '#007E3A', '#FFFFFF'] },
  { name: 'Malawi', preview: malawiFlagBody, bodyTexture: malawiFlagBody, colors: ['#000000', '#CE1126', '#339E35', '#000000'] },
  { name: 'Mali', preview: maliFlagBody, bodyTexture: maliFlagBody, colors: ['#14B53A', '#FCD116', '#CE1126', '#14B53A'] },
  { name: 'Mauritanie', preview: mauritanieFlagBody, bodyTexture: mauritanieFlagBody, colors: ['#006233', '#C09300', '#006233', '#C09300'] },
  { name: 'Maurice', preview: mauriceFlagBody, bodyTexture: mauriceFlagBody, colors: ['#EA2839', '#1A206D', '#FFD500', '#00A551'] },
  { name: 'Mozambique', preview: mozambiqueFlagBody, bodyTexture: mozambiqueFlagBody, colors: ['#009544', '#000000', '#FCE100', '#E71D36'] },
  { name: 'Namibie', preview: namibieFlagBody, bodyTexture: namibieFlagBody, colors: ['#003580', '#009A44', '#C7002A', '#003580'] },
  { name: 'Niger', preview: nigerFlagBody, bodyTexture: nigerFlagBody, colors: ['#E05206', '#FFFFFF', '#0DB02B', '#E05206'] },
  { name: 'Ouganda', preview: ougandaFlagBody, bodyTexture: ougandaFlagBody, colors: ['#000000', '#FCDC04', '#D90000', '#000000'] },
  { name: 'Rwanda', preview: rwandaFlagBody, bodyTexture: rwandaFlagBody, colors: ['#00A1DE', '#FAD201', '#20603D', '#00A1DE'] },
  { name: 'Seychelles', preview: seychellesFlagBody, bodyTexture: seychellesFlagBody, colors: ['#003F87', '#FCD856', '#CE1126', '#007A3D'] },
  { name: 'Sierra Leone', preview: sierraLeoneFlagBody, bodyTexture: sierraLeoneFlagBody, colors: ['#1EB53A', '#FFFFFF', '#0072C6', '#1EB53A'] },
  { name: 'Somalie', preview: somalieFlagBody, bodyTexture: somalieFlagBody, colors: ['#4189DD', '#FFFFFF', '#4189DD', '#4189DD'] },
  { name: 'Soudan', preview: soudanFlagBody, bodyTexture: soudanFlagBody, colors: ['#D21034', '#FFFFFF', '#000000', '#007229'] },
  { name: 'Soudan du Sud', preview: soudanDuSudFlagBody, bodyTexture: soudanDuSudFlagBody, colors: ['#000000', '#CE1126', '#078930', '#0F47AF'] },
  { name: 'Tanzanie', preview: tanzanieFlagBody, bodyTexture: tanzanieFlagBody, colors: ['#1EB53A', '#00A3DD', '#000000', '#FCD116'] },
  { name: 'Togo', preview: togoFlagBody, bodyTexture: togoFlagBody, colors: ['#006A4E', '#FFCE00', '#CE1126', '#006A4E'] },
  { name: 'Zimbabwe', preview: zimbabweFlagBody, bodyTexture: zimbabweFlagBody, colors: ['#006400', '#FFD200', '#D40000', '#000000'] },
  { name: 'Zambie', preview: zambieFlagBody, bodyTexture: zambieFlagBody, colors: ['#198A00', '#DE2010', '#000000', '#EF7D00'] },
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
  { name: 'Afghanistan', preview: afghanistanFlagBody, bodyTexture: afghanistanFlagBody, colors: ['#000000', '#AF0000', '#009900', '#000000'] },
  { name: 'Bangladesh', preview: bangladeshFlagBody, bodyTexture: bangladeshFlagBody, colors: ['#006A4E', '#F42A41', '#006A4E', '#006A4E'] },
  { name: 'Bhoutan', preview: bhoutanFlagBody, bodyTexture: bhoutanFlagBody, colors: ['#FF4E12', '#FFD520', '#FF4E12', '#FFD520'] },
  { name: 'Brunei', preview: bruneiFlagBody, bodyTexture: bruneiFlagBody, colors: ['#F7E017', '#FFFFFF', '#000000', '#F7E017'] },
  { name: 'Cambodge', preview: cambodgeFlagBody, bodyTexture: cambodgeFlagBody, colors: ['#032EA1', '#E00025', '#032EA1', '#032EA1'] },
  { name: 'Coree du Nord', preview: coreeDuNordFlagBody, bodyTexture: coreeDuNordFlagBody, colors: ['#024FA2', '#ED1C27', '#FFFFFF', '#024FA2'] },
  { name: 'Irak', preview: irakFlagBody, bodyTexture: irakFlagBody, colors: ['#CE1126', '#FFFFFF', '#000000', '#CE1126'] },
  { name: 'Jordanie', preview: jordanieFlagBody, bodyTexture: jordanieFlagBody, colors: ['#000000', '#FFFFFF', '#007A3D', '#CE1126'] },
  { name: 'Kazakhstan', preview: kazakhstanFlagBody, bodyTexture: kazakhstanFlagBody, colors: ['#00AFCA', '#FEC50C', '#00AFCA', '#00AFCA'] },
  { name: 'Kirghizistan', preview: kirghizistanFlagBody, bodyTexture: kirghizistanFlagBody, colors: ['#E8112D', '#FFC61E', '#E8112D', '#E8112D'] },
  { name: 'Koweit', preview: koweitFlagBody, bodyTexture: koweitFlagBody, colors: ['#007A3D', '#FFFFFF', '#CE1126', '#000000'] },
  { name: 'Laos', preview: laosFlagBody, bodyTexture: laosFlagBody, colors: ['#CE1126', '#002868', '#FFFFFF', '#002868'] },
  { name: 'Liban', preview: libanFlagBody, bodyTexture: libanFlagBody, colors: ['#EF1B2D', '#FFFFFF', '#00A651', '#EF1B2D'] },
  { name: 'Maldives', preview: maldivesFlagBody, bodyTexture: maldivesFlagBody, colors: ['#D21034', '#007E3A', '#FFFFFF', '#D21034'] },
  { name: 'Mongolie', preview: mongolieFlagBody, bodyTexture: mongolieFlagBody, colors: ['#C4272E', '#015197', '#C4272E', '#C4272E'] },
  { name: 'Myanmar', preview: myanmarFlagBody, bodyTexture: myanmarFlagBody, colors: ['#FECB00', '#34B233', '#EA2839', '#FECB00'] },
  { name: 'Nepal', preview: nepalFlagBody, bodyTexture: nepalFlagBody, colors: ['#003893', '#DC143C', '#003893', '#DC143C'] },
  { name: 'Oman', preview: omanFlagBody, bodyTexture: omanFlagBody, colors: ['#FFFFFF', '#CE1126', '#008000', '#CE1126'] },
  { name: 'Qatar', preview: qatarFlagBody, bodyTexture: qatarFlagBody, colors: ['#8D1B3D', '#FFFFFF', '#8D1B3D', '#8D1B3D'] },
  { name: 'Singapour', preview: singapourFlagBody, bodyTexture: singapourFlagBody, colors: ['#EF3340', '#FFFFFF', '#EF3340', '#FFFFFF'] },
  { name: 'Sri Lanka', preview: sriLankaFlagBody, bodyTexture: sriLankaFlagBody, colors: ['#FFBE29', '#8B0000', '#00534E', '#EB7400'] },
  { name: 'Syrie', preview: syrieFlagBody, bodyTexture: syrieFlagBody, colors: ['#CE1126', '#FFFFFF', '#000000', '#CE1126'] },
  { name: 'Tadjikistan', preview: tadjikistanFlagBody, bodyTexture: tadjikistanFlagBody, colors: ['#CE1126', '#FFFFFF', '#007A3D', '#CE1126'] },
  { name: 'Taiwan', preview: taiwanFlagBody, bodyTexture: taiwanFlagBody, colors: ['#FE0000', '#000095', '#FFFFFF', '#FE0000'] },
  { name: 'Turkmenistan', preview: turkmenistanFlagBody, bodyTexture: turkmenistanFlagBody, colors: ['#00843D', '#CE1126', '#00843D', '#00843D'] },
  { name: 'Ouzbekistan', preview: ouzbekistanFlagBody, bodyTexture: ouzbekistanFlagBody, colors: ['#1EB53A', '#FFFFFF', '#0099B5', '#CE1126'] },
  { name: 'Malaisie', preview: malaisieFlagBody, bodyTexture: malaisieFlagBody, colors: ['#CC0001', '#FFFFFF', '#010066', '#FFCC00'] },
  { name: 'Yemen', preview: yemenFlagBody, bodyTexture: yemenFlagBody, colors: ['#CE1126', '#FFFFFF', '#000000', '#CE1126'] },
  // Oceania
  { name: 'Australie', preview: australiaFlagBody, bodyTexture: australiaFlagBody, colors: ['#00008B', '#FF0000', '#FFFFFF', '#00008B'] },
  { name: 'Nouvelle-Zelande', preview: newZealandFlagBody, bodyTexture: newZealandFlagBody, colors: ['#00247D', '#CC142B', '#FFFFFF', '#00247D'] },
  { name: 'Fidji', preview: fidjiFlagBody, bodyTexture: fidjiFlagBody, colors: ['#68BFE5', '#002868', '#CF142B', '#FFFFFF'] },
  { name: 'Palaos', preview: palaosFlagBody, bodyTexture: palaosFlagBody, colors: ['#4AADD6', '#FFDE00', '#4AADD6', '#4AADD6'] },
  { name: 'Papouasie-Nouvelle-Guinee', preview: papouasieNouvelleGuineeFlagBody, bodyTexture: papouasieNouvelleGuineeFlagBody, colors: ['#000000', '#CE1126', '#000000', '#CE1126'] },
  { name: 'Samoa', preview: samoaFlagBody, bodyTexture: samoaFlagBody, colors: ['#CE1126', '#002B7F', '#CE1126', '#CE1126'] },
  { name: 'Iles Salomon', preview: ilesSalomonFlagBody, bodyTexture: ilesSalomonFlagBody, colors: ['#0051A5', '#009B48', '#FCD116', '#0051A5'] },
  { name: 'Tonga', preview: tongaFlagBody, bodyTexture: tongaFlagBody, colors: ['#C10000', '#FFFFFF', '#C10000', '#C10000'] },
  { name: 'Tuvalu', preview: tuvaluFlagBody, bodyTexture: tuvaluFlagBody, colors: ['#009FCA', '#00247D', '#CF142B', '#009FCA'] },
  { name: 'Vanuatu', preview: vanuatuFlagBody, bodyTexture: vanuatuFlagBody, colors: ['#D21034', '#009543', '#000000', '#FDCE12'] },
  { name: 'Timor Oriental', preview: timorOrientalFlagBody, bodyTexture: timorOrientalFlagBody, colors: ['#DC241F', '#FFC726', '#000000', '#DC241F'] },
  // Caribbean / Islands
  { name: 'Haiti', preview: haitiFlagBody, bodyTexture: haitiFlagBody, colors: ['#00209F', '#D21034', '#00209F', '#D21034'] },
  { name: 'Cuba', preview: cubaFlagBody, bodyTexture: cubaFlagBody, colors: ['#002A8F', '#FFFFFF', '#CF142B', '#002A8F'] },
  { name: 'Rep. Dominicaine', preview: dominicanRepFlagBody, bodyTexture: dominicanRepFlagBody, colors: ['#002D62', '#CE1126', '#FFFFFF', '#002D62'] },
  { name: 'Antigua-et-Barbuda', preview: antiguaEtBarbudaFlagBody, bodyTexture: antiguaEtBarbudaFlagBody, colors: ['#CE1126', '#000000', '#FCD116', '#CE1126'] },
  { name: 'Bahamas', preview: bahamasFlagBody, bodyTexture: bahamasFlagBody, colors: ['#00778B', '#FFC72C', '#000000', '#00778B'] },
  { name: 'Bahrein', preview: bahreinFlagBody, bodyTexture: bahreinFlagBody, colors: ['#CE1126', '#FFFFFF', '#CE1126', '#CE1126'] },
  { name: 'Belize', preview: belizeFlagBody, bodyTexture: belizeFlagBody, colors: ['#003F87', '#CE1126', '#FFFFFF', '#003F87'] },
  { name: 'Dominique', preview: dominiqueFlagBody, bodyTexture: dominiqueFlagBody, colors: ['#006B3F', '#FCD116', '#D41C30', '#006B3F'] },
  { name: 'Sao Tome', preview: saoTomeFlagBody, bodyTexture: saoTomeFlagBody, colors: ['#12AD2B', '#FFCE00', '#D21034', '#12AD2B'] },
  // Middle East
  { name: 'Israel', preview: israelFlagBody, bodyTexture: israelFlagBody, colors: ['#FFFFFF', '#0038B8', '#FFFFFF', '#0038B8'] },
  { name: 'Palestine', preview: palestineFlagBody, bodyTexture: palestineFlagBody, colors: ['#000000', '#FFFFFF', '#009736', '#CE1126'] },
  { name: 'Emirats Arabes Unis', preview: emiratsArabesUnisFlagBody, bodyTexture: emiratsArabesUnisFlagBody, colors: ['#00843D', '#FFFFFF', '#000000', '#CE1126'] },
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

const FLAG_PRICE = 200
const DRAGON_PRICE = 2000
const TUBE_PRICE = 500

interface ShopScreenProps {
  currentSkin: WormSkin
  playerCoins: number
  onApply: (skin: WormSkin, cost: number) => void
  onBack: () => void
}

export function ShopScreen({ currentSkin, playerCoins, onApply, onBack }: ShopScreenProps) {
  const { t, i18n } = useTranslation()
  const lang = (i18n.language || 'fr').split('-')[0]
  const [colors, setColors] = useState<string[]>(['#888888', '#999999', '#888888', '#999999'])
  const [headType, setHeadType] = useState('default')
  const [selectedBodyTexture, setSelectedBodyTexture] = useState<string | undefined>(undefined)
  const [activeSlot, setActiveSlot] = useState(0)
  const [bodyStyle, setBodyStyle] = useState<'circles' | 'tube'>('circles')
  const [headSearch, setHeadSearch] = useState('')
  const [flagSearch, setFlagSearch] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const flagPreviewRef = useRef<HTMLCanvasElement>(null)
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
        img.onload = () => setBodyImgs(prev => ({ ...prev, [opt.bodyTexture!]: img }))
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

  const [isFlagSkin, setIsFlagSkin] = useState(false)

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

  // Draw flag body preview — wavy worm with texture
  useEffect(() => {
    const canvas = flagPreviewRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const bodyTextureKey = selectedBodyTexture
    const bImg = bodyTextureKey ? bodyImgs[bodyTextureKey] : undefined
    if (!bImg && !isFlagSkin) return

    const segCount = 30
    const segR = 14
    const time = Date.now() * 0.002

    // Build wavy path
    const points: { x: number; y: number }[] = []
    for (let i = 0; i < segCount; i++) {
      const t = i / (segCount - 1)
      const x = 30 + t * (w - 60)
      const y = h / 2 + Math.sin(t * Math.PI * 2 + time) * 20
      points.push({ x, y })
    }

    if (bImg) {
      // Clip to worm shape, then draw texture
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      ctx.save()
      ctx.beginPath()
      for (const p of points) {
        ctx.moveTo(p.x + segR, p.y)
        ctx.arc(p.x, p.y, segR, 0, Math.PI * 2)
        if (p.x - segR < minX) minX = p.x - segR
        if (p.y - segR < minY) minY = p.y - segR
        if (p.x + segR > maxX) maxX = p.x + segR
        if (p.y + segR > maxY) maxY = p.y + segR
      }
      ctx.clip()

      // Dark outline
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(minX, minY, maxX - minX, maxY - minY)

      // Texture
      const bw = maxX - minX, bh = maxY - minY
      const aspect = bImg.naturalWidth / bImg.naturalHeight
      let drawW = bw, drawH = bw / aspect
      if (drawH < bh) { drawH = bh; drawW = bh * aspect }
      const dx = minX + (bw - drawW) / 2
      const dy = minY + (bh - drawH) / 2
      ctx.drawImage(bImg, dx, dy, drawW, drawH)

      // 3D shading on each segment
      for (const p of points) {
        const grad = ctx.createRadialGradient(p.x - segR * 0.3, p.y - segR * 0.3, 0, p.x, p.y, segR)
        grad.addColorStop(0, 'rgba(255,255,255,0.15)')
        grad.addColorStop(0.7, 'rgba(0,0,0,0)')
        grad.addColorStop(1, 'rgba(0,0,0,0.2)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, segR, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // Dark border
      ctx.save()
      ctx.lineWidth = 2
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'
      for (const p of points) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, segR, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()
    } else {
      // Solid color preview
      for (const [i, p] of points.entries()) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, segR, 0, Math.PI * 2)
        ctx.fillStyle = colors[i % colors.length]
        ctx.fill()
      }
    }
  }, [selectedBodyTexture, bodyImgs, isFlagSkin, colors])

  return (
    <div style={shopStyles.container}>
      <style>{`
        .shop-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .shop-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
        .shop-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
        .shop-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
      `}</style>
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
        <input
          type="text"
          placeholder="🔍 Rechercher un costume..."
          value={headSearch}
          onChange={e => setHeadSearch(e.target.value)}
          style={shopStyles.searchInput}
        />
        <div className="shop-scroll" style={shopStyles.headRow}>
          {HEAD_OPTIONS.filter(h => !headSearch || h.label.toLowerCase().includes(headSearch.toLowerCase())).map((h) => (
            <div
              key={h.id}
              style={{
                ...shopStyles.headOption,
                borderColor: headType === h.id ? '#ffd700' : 'rgba(255,255,255,0.2)',
                boxShadow: headType === h.id ? '0 0 15px rgba(255,215,0,0.4)' : 'none',
                opacity: h.locked ? 0.35 : 1,
                cursor: h.locked ? 'not-allowed' : 'pointer',
              }}
              onClick={() => { if (h.locked) return; setHeadType(h.id); setSelectedBodyTexture(undefined); setIsFlagSkin(false) }}
            >
              {h.preview ? (
                <img src={h.preview} alt={h.label} style={{ width: 48, height: 48, objectFit: 'contain' }} />
              ) : (
                <div style={shopStyles.defaultEyes}>
                  <div style={shopStyles.eyeDot} />
                  <div style={shopStyles.eyeDot} />
                </div>
              )}
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 }}>
                {h.locked ? '🔒' : ''} {h.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Body style */}
      <div style={shopStyles.section}>
        <div style={shopStyles.sectionTitle}>Style de corps</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div
            style={{
              ...shopStyles.bodyStyleOption,
              borderColor: bodyStyle === 'circles' ? '#ffd700' : 'rgba(255,255,255,0.2)',
              boxShadow: bodyStyle === 'circles' ? '0 0 15px rgba(255,215,0,0.4)' : 'none',
            }}
            onClick={() => setBodyStyle('circles')}
          >
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ff6b35' }} />
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ff3366' }} />
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ff6b35' }} />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 6 }}>Classique</span>
            <span style={{ color: '#7cff00', fontSize: 11 }}>Gratuit</span>
          </div>
          <div
            style={{
              ...shopStyles.bodyStyleOption,
              borderColor: bodyStyle === 'tube' ? '#ffd700' : 'rgba(255,255,255,0.2)',
              boxShadow: bodyStyle === 'tube' ? '0 0 15px rgba(255,215,0,0.4)' : 'none',
            }}
            onClick={() => setBodyStyle('tube')}
          >
            <div style={{
              width: 60, height: 14, borderRadius: 7,
              background: 'linear-gradient(90deg, #ff3366, #ff6b35, #ffd700)',
              boxShadow: 'inset 0 -3px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)',
              border: '1px solid rgba(0,0,0,0.4)',
            }} />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 6 }}>Tube</span>
            <span style={{ color: '#ffd700', fontSize: 11 }}>{TUBE_PRICE} 🪙</span>
          </div>
        </div>
      </div>

      {/* Flag presets */}
      <div style={shopStyles.section}>
        <div style={shopStyles.sectionTitle}>{t('shopFlags')}</div>
        <input
          type="text"
          placeholder="🔍 Rechercher un drapeau..."
          value={flagSearch}
          onChange={e => setFlagSearch(e.target.value)}
          style={shopStyles.searchInput}
        />
        <div className="shop-scroll" style={shopStyles.flagGrid}>
          {FLAG_SKINS.filter(f => {
            if (!flagSearch) return true
            const q = flagSearch.toLowerCase()
            return f.name.toLowerCase().includes(q) || translateFlag(f.name, lang).toLowerCase().includes(q)
          }).map((f, i) => {
            const displayName = translateFlag(f.name, lang)
            return (
              <div
                key={i}
                style={shopStyles.flagItem}
                onClick={() => applyFlag(f.colors, f.bodyTexture)}
                title={displayName}
              >
                <img src={f.preview} alt={displayName} style={shopStyles.flagPreview} />
                <span style={shopStyles.flagName}>{displayName}</span>
              </div>
            )
          })}
        </div>
        {/* Flag body preview */}
        {isFlagSkin && selectedBodyTexture && (
          <canvas ref={flagPreviewRef} width={500} height={80} style={shopStyles.flagBodyPreview} />
        )}
      </div>

      {/* Buttons */}
      {(() => {
        const isDragon = headType === 'dragon'
        const isFlag = isFlagSkin && !!selectedBodyTexture
        const isTube = bodyStyle === 'tube'
        let cost = 0
        if (isDragon) cost += DRAGON_PRICE
        if (isFlag) cost += FLAG_PRICE
        if (isTube) cost += TUBE_PRICE
        const canAfford = playerCoins >= cost
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 16, marginBottom: 30 }}>
            {/* Coin balance */}
            <div style={{ color: '#ffd700', fontFamily: "'Bungee', cursive", fontSize: 18 }}>
              &#x1FA99; {playerCoins}
            </div>
            {cost > 0 && (
              <div style={{ color: canAfford ? 'rgba(255,255,255,0.7)' : '#ff4444', fontSize: 14, fontFamily: "'Fredoka', sans-serif" }}>
                {[isDragon && 'Dragon', isFlag && 'Drapeau', isTube && 'Tube'].filter(Boolean).join(' + ')}: {cost} &#x1FA99;
                {!canAfford && ` — ${t('shopNotEnough') ?? 'pas assez de pièces'}`}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                style={{
                  ...shopStyles.applyBtn,
                  opacity: cost > 0 && !canAfford ? 0.4 : 1,
                  cursor: cost > 0 && !canAfford ? 'not-allowed' : 'pointer',
                }}
                disabled={cost > 0 && !canAfford}
                onClick={() => {
                  if (cost > 0 && !canAfford) return
                  const selectedHead = HEAD_OPTIONS.find(h => h.id === headType)
                  onApply({
                    colors: [...colors],
                    eye: '#fff',
                    name: 'Custom',
                    headType,
                    bodyTexture: selectedBodyTexture ?? selectedHead?.bodyTexture,
                    isFlag,
                    bodyStyle,
                  }, cost)
                }}
              >
                {t('shopApply')}{cost > 0 ? ` (${cost} 🪙)` : ''}
              </button>
              <button style={shopStyles.backBtn} onClick={onBack}>
                {t('back')}
              </button>
            </div>
          </div>
        )
      })()}
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
    width: 44,
    height: 44,
    objectFit: 'cover',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.15)',
    flexShrink: 0,
  },
  flagBodyPreview: {
    width: '100%',
    maxWidth: 500,
    height: 80,
    marginTop: 12,
    borderRadius: 12,
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  searchInput: {
    width: '100%',
    maxWidth: 300,
    padding: '8px 14px',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.08)',
    color: 'white',
    fontSize: 14,
    fontFamily: "'Fredoka', sans-serif",
    outline: 'none',
    marginBottom: 10,
  } as React.CSSProperties,
  bodyStyleOption: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '14px 20px',
    borderRadius: 14,
    border: '3px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minWidth: 100,
    gap: 2,
  },
  headRow: {
    display: 'flex',
    gap: 12,
    overflowX: 'auto',
    maxWidth: '100%',
    padding: '8px 4px',
    scrollbarWidth: 'thin',
    WebkitOverflowScrolling: 'touch',
  } as React.CSSProperties,
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
