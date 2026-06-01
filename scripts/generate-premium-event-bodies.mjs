import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const outDir = resolve(root, 'public/heads/premium-bodies')

mkdirSync(outDir, { recursive: true })

const WIDTH = 720
const HEIGHT = 220

const defs = [
  ['newyear', 'fireworks', ['#0f1a4f', '#2f3f9b', '#f04db8', '#ffd86c'], ['firework', 'star', 'clock']],
  ['newyear2', 'champagne', ['#6b3f0f', '#b88b2a', '#f3e2a1', '#fff7da'], ['bubbles', 'star', 'ribbon']],
  ['newyear3', 'countdown', ['#201b4a', '#4e3bb8', '#ff4a6f', '#ffd86c'], ['clock', 'gem', 'ribbon']],
  ['newyear4', 'goldmaster', ['#4a2d08', '#9c6f1f', '#f2d06f', '#fff0c0'], ['crown', 'medal', 'star']],
  ['valentine', 'heart', ['#9f133e', '#ff5b8f', '#ffd4e4', '#fbe987'], ['heart', 'lace', 'pearl']],
  ['valentine2', 'rose', ['#b51f45', '#e5587a', '#ffd6df', '#f6e8c6'], ['rose', 'lace', 'gem']],
  ['valentine3', 'letter', ['#f4e6cf', '#f2b8c7', '#d85c7a', '#a54762'], ['seal', 'heart', 'ribbon']],
  ['valentine4', 'cupid', ['#ffe6ea', '#ffadc3', '#f3dca0', '#ffffff'], ['wing', 'heart', 'arrow']],
  ['cny', 'lantern', ['#8b0f16', '#d6382d', '#f6c249', '#fff3d0'], ['lantern', 'coin', 'knot']],
  ['cny2', 'dragon', ['#124c36', '#2d8d56', '#d9c15a', '#e53c2c'], ['scale', 'coin', 'cloud']],
  ['cny3', 'emperor', ['#6a0d12', '#b32122', '#f7d04c', '#f5edd3'], ['crest', 'coin', 'brocade']],
  ['carnival', 'mask', ['#4d1878', '#8f39d8', '#f2cb64', '#f05bb7'], ['mask', 'gem', 'feather']],
  ['carnival2', 'clown', ['#1f67c8', '#ff5ca8', '#ffe06d', '#ffffff'], ['ruffle', 'dot', 'bell']],
  ['carnival3', 'jester', ['#168f5d', '#ffd44e', '#7f3adb', '#f55c6d'], ['diamond', 'bell', 'gem']],
  ['carnival4', 'royalharlequin', ['#35156f', '#d03a7f', '#f5c950', '#22c9c2'], ['crown', 'diamond', 'gem']],
  ['holi', 'paint', ['#ff4a8e', '#ffd34f', '#1ed483', '#33a8ff'], ['splash', 'powder', 'gem']],
  ['holi2', 'balloon', ['#8c42ff', '#ffb03d', '#38d66b', '#ff4a8e'], ['balloon', 'splash', 'dot']],
  ['holi3', 'rainbowmaster', ['#ff3a46', '#ffcd39', '#0dcf7c', '#218bff'], ['powder', 'sun', 'splash']],
  ['stpatrick', 'leprechaun', ['#0e6a39', '#2ab05f', '#f2d56d', '#eff7e2'], ['clover', 'buckle', 'coin']],
  ['stpatrick2', 'gentleman', ['#124f2c', '#1f7a48', '#d7b760', '#f4efd2'], ['hatband', 'coin', 'button']],
  ['stpatrick3', 'queenclover', ['#2a8a52', '#7ed98b', '#f8f3cf', '#efc45d'], ['clover', 'crown', 'pearl']],
  ['stpatrick4', 'lordluck', ['#163f2a', '#2c8c57', '#f0d06a', '#fff7d1'], ['medal', 'coin', 'clover']],
  ['stpatrick5', 'potgold', ['#4c2f14', '#85511d', '#efc35a', '#fff1b8'], ['coin', 'chain', 'clover']],
  ['ramadan', 'crescent', ['#30215c', '#5b43a6', '#f1d48a', '#efe8ca'], ['crescent', 'star', 'bead']],
  ['ramadan2', 'fanous', ['#5a2e6f', '#8e53a9', '#f2cf77', '#fdf5d8'], ['fanous', 'star', 'tassel']],
  ['ramadan3', 'guardianmoon', ['#213265', '#384f9f', '#f2d392', '#dfe8ff'], ['arch', 'crescent', 'gem']],
  ['eid', 'eidcrescent', ['#195343', '#297d65', '#f2d58a', '#f7f2dc'], ['crescent', 'star', 'lace']],
  ['eid2', 'eidfanous', ['#6e2f5b', '#a6558c', '#f3d06b', '#fff6db'], ['fanous', 'pearl', 'tassel']],
  ['eid3', 'eidprince', ['#22426e', '#3b6ca5', '#f1d48d', '#eef6ff'], ['arch', 'gem', 'crescent']],
  ['easter', 'bunny', ['#f6d4de', '#ffeaa3', '#b8f1c6', '#fff7ec'], ['egg', 'lace', 'flower']],
  ['easter2', 'chick', ['#ffd14d', '#fff1a4', '#f7ba71', '#fff7d9'], ['egg', 'feather', 'pearl']],
  ['easter3', 'egg', ['#9bd5ff', '#f7c4e6', '#fff4ab', '#d9ffca'], ['egg', 'ribbon', 'gem']],
  ['easter4', 'dandy', ['#b2d3ff', '#e7d4ff', '#f2d071', '#fbf5ea'], ['bow', 'egg', 'button']],
  ['mayday', 'workerfloral', ['#b82031', '#f7f0df', '#214a8f', '#e1bb53'], ['rosette', 'banner', 'button']],
  ['mayday2', 'springcrown', ['#f2efe3', '#e05674', '#4276b7', '#d8b14c'], ['flowers', 'medal', 'ribbon']],
  ['mayday3', 'rosesherald', ['#cf203e', '#f6f0e7', '#1d315d', '#dcb75f'], ['rose', 'banner', 'medal']],
  ['summer', 'sunbeach', ['#16a3b1', '#ffe173', '#ff8f39', '#e8fff5'], ['sun', 'shell', 'wave']],
  ['summer2', 'sorbet', ['#ff70a6', '#ffb85a', '#7be2cf', '#fff0d5'], ['icecream', 'dot', 'shell']],
  ['summer3', 'tiki', ['#0f8a75', '#ffd06e', '#ff784d', '#f5fff2'], ['leaf', 'shell', 'sun']],
  ['summer4', 'captain', ['#1564af', '#f4f2eb', '#d9b45a', '#24456d'], ['anchor', 'rope', 'button']],
  ['july4th', 'star', ['#0d2e6f', '#d72e44', '#f5f3eb', '#f2c350'], ['star', 'stripe', 'medal']],
  ['july4th2', 'unclesam', ['#0f2b66', '#c52a39', '#f5f5ef', '#d9b763'], ['star', 'ribbon', 'button']],
  ['bastille', 'cockade', ['#234d9f', '#f6f1ea', '#c42b3d', '#d9bb66'], ['cockade', 'button', 'ribbon']],
  ['bastille2', 'beret', ['#103c85', '#f4f0e9', '#d43641', '#cfa759'], ['beret', 'stripe', 'medal']],
  ['bastille3', 'patriot', ['#1d4ea8', '#f7f2ea', '#c92e3f', '#dbb767'], ['banner', 'cockade', 'button']],
  ['halloween', 'pumpkin', ['#ff7b22', '#1d1b1b', '#6b3f11', '#ffc257'], ['pumpkin', 'stitch', 'gem']],
  ['halloween2', 'ghost', ['#d8f1ff', '#9ad1ff', '#6d7ed6', '#ffffff'], ['moon', 'star', 'mist']],
  ['halloween3', 'witch', ['#64207b', '#2d7d54', '#f6ba4b', '#23162f'], ['hat', 'star', 'buckle']],
  ['halloween4', 'lordpumpkin', ['#b82228', '#1d1b1b', '#f0b14b', '#f8efde'], ['crown', 'pumpkin', 'chain']],
  ['muertos', 'skull', ['#27355d', '#f6efe4', '#ff7a5a', '#ffd76d'], ['flower', 'skull', 'lace']],
  ['muertos2', 'marigold', ['#ff8f22', '#f8d46a', '#c83164', '#fff7e4'], ['flower', 'petal', 'gem']],
  ['muertos3', 'catrina', ['#6c2c88', '#f6efe4', '#f46aa5', '#ffd06f'], ['lace', 'flower', 'crown']],
  ['diwali', 'sapphire', ['#234aa6', '#f0bc4b', '#f7f1df', '#c4356b'], ['diya', 'gem', 'chain']],
  ['diwali2', 'rangoli', ['#f04b8f', '#f0bc4b', '#3dcad0', '#fff3dd'], ['rangoli', 'gem', 'pearl']],
  ['diwali3', 'rajah', ['#8f1e29', '#f3c44f', '#1f6ba5', '#f9f1dd'], ['diya', 'crest', 'chain']],
  ['diwali4', 'guardian', ['#6d2b91', '#f1bb4a', '#ff8b35', '#fff2df'], ['lantern', 'gem', 'tassel']],
  ['diwali5', 'peacock', ['#007d7e', '#35b7b6', '#f0bf4e', '#19519d'], ['feather', 'gem', 'pearl']],
  ['thanksgiving', 'turkey', ['#8c4d22', '#d99b4d', '#f4e3b7', '#c9582f'], ['leaf', 'button', 'grain']],
  ['thanksgiving2', 'pilgrim', ['#3d2d21', '#f6efe1', '#c4a15b', '#5f4c36'], ['buckle', 'button', 'leaf']],
  ['thanksgiving3', 'honor', ['#6d3a16', '#f5e2bd', '#b84c29', '#d1ab58'], ['medal', 'grain', 'leaf']],
  ['santa', 'santa', ['#c8333d', '#f6f5f0', '#1f7a6d', '#e7c15f'], ['fur', 'button', 'gift']],
  ['santa2', 'elf', ['#158b49', '#d93c49', '#f5e0a3', '#f4f7ee'], ['zigzag', 'bell', 'leaf']],
  ['santa3', 'snowman', ['#c7eaff', '#f7f7ff', '#6fa8d6', '#ff9b47'], ['snowflake', 'scarf', 'button']],
  ['santa4', 'wintermaster', ['#0e6a79', '#f6f6fb', '#d64953', '#e5c86f'], ['crystal', 'medal', 'fur']],
  ['reveillon', 'champagne', ['#6f4b17', '#d7ab49', '#fff0c7', '#fffaf0'], ['bubble', 'ribbon', 'gem']],
  ['reveillon2', 'fireworks', ['#1f2d71', '#a23adf', '#ff5f8f', '#ffd867'], ['firework', 'star', 'spark']],
  ['reveillon3', 'masterchampagne', ['#7d511a', '#efc360', '#fff2cc', '#f5faf5'], ['medal', 'bubble', 'star']],
  ['reveillon4', 'goldmidnight', ['#4e2a0d', '#b98c2c', '#f1d06d', '#fff7d4'], ['clock', 'star', 'ribbon']],
  ['reveillon5', 'queenchampagne', ['#9d4b6b', '#f0b2d1', '#f6df9f', '#fff8e7'], ['bubble', 'pearl', 'gem']],
  ['reveillon6', 'musemidnight', ['#1c347e', '#8f55df', '#ffd16b', '#fff6e0'], ['star', 'clock', 'spark']],
  ['reveillon7', 'divadisco', ['#f544a2', '#7034d4', '#2dd1d4', '#ffd86c'], ['disc', 'spark', 'gem']],
]

const entryMap = new Map(defs.map(([id, style, palette, motifs]) => [id, { style, palette, motifs }]))

function esc(text) {
  return String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

function makeMotif(kind, x, y, scale, colors) {
  const [c1, c2, c3, c4] = colors
  switch (kind) {
    case 'heart':
      return `<path d="M ${x} ${y + scale * 8} C ${x - scale * 16} ${y - scale * 8}, ${x - scale * 30} ${y + scale * 10}, ${x} ${y + scale * 30} C ${x + scale * 30} ${y + scale * 10}, ${x + scale * 16} ${y - scale * 8}, ${x} ${y + scale * 8} Z" fill="${c2}" stroke="${c4}" stroke-width="${scale * 3}"/>`
    case 'rose':
    case 'flower':
      return `
        <g transform="translate(${x} ${y})">
          ${Array.from({ length: 8 }, (_, i) => {
            const a = (Math.PI * 2 * i) / 8
            const px = Math.cos(a) * scale * 14
            const py = Math.sin(a) * scale * 14
            return `<ellipse cx="${px}" cy="${py}" rx="${scale * 10}" ry="${scale * 14}" fill="${c2}" opacity="0.95" transform="rotate(${(a * 180) / Math.PI} ${px} ${py})"/>`
          }).join('')}
          <circle cx="0" cy="0" r="${scale * 11}" fill="${c4}"/>
          <circle cx="${-scale * 3}" cy="${-scale * 3}" r="${scale * 4}" fill="${c3}" opacity="0.65"/>
        </g>`
    case 'seal':
      return `<g transform="translate(${x} ${y})"><circle r="${scale * 20}" fill="${c2}" stroke="${c4}" stroke-width="${scale * 4}"/><path d="M ${-scale * 6} ${-scale * 8} L ${scale * 8} 0 L ${-scale * 6} ${scale * 8}" fill="${c3}"/></g>`
    case 'wing':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 18} 0 C ${-scale * 28} ${-scale * 12}, ${-scale * 28} ${scale * 16}, ${-scale * 10} ${scale * 14} C ${-scale * 2} ${scale * 18}, ${scale * 8} ${scale * 8}, ${scale * 4} 0 C ${scale * 2} ${-scale * 10}, ${-scale * 10} ${-scale * 8}, ${-scale * 18} 0 Z" fill="${c3}" stroke="${c4}" stroke-width="${scale * 2.5}"/></g>`
    case 'arrow':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 20} 0 L ${scale * 12} 0" stroke="${c4}" stroke-width="${scale * 4}" stroke-linecap="round"/><path d="M ${scale * 12} 0 L ${scale * 2} ${-scale * 8} L ${scale * 2} ${scale * 8} Z" fill="${c2}"/></g>`
    case 'lantern':
    case 'fanous':
      return `<g transform="translate(${x} ${y})"><rect x="${-scale * 4}" y="${-scale * 24}" width="${scale * 8}" height="${scale * 8}" rx="${scale * 2}" fill="${c4}"/><rect x="${-scale * 16}" y="${-scale * 18}" width="${scale * 32}" height="${scale * 38}" rx="${scale * 10}" fill="${c2}" stroke="${c4}" stroke-width="${scale * 3}"/><rect x="${-scale * 4}" y="${20 * scale}" width="${scale * 8}" height="${scale * 10}" rx="${scale * 2}" fill="${c4}"/><path d="M 0 ${scale * 30} L 0 ${scale * 42}" stroke="${c4}" stroke-width="${scale * 2.5}"/><path d="M ${-scale * 8} ${scale * 42} L ${scale * 8} ${scale * 42}" stroke="${c3}" stroke-width="${scale * 2}"/></g>`
    case 'coin':
      return `<g transform="translate(${x} ${y})"><circle r="${scale * 18}" fill="${c4}" stroke="${c3}" stroke-width="${scale * 4}"/><circle r="${scale * 10}" fill="none" stroke="${c3}" stroke-width="${scale * 2.5}"/></g>`
    case 'knot':
      return `<g transform="translate(${x} ${y})"><circle r="${scale * 8}" fill="${c4}"/><path d="M 0 ${scale * 8} C ${scale * 18} ${scale * 16}, ${scale * 12} ${scale * 34}, 0 ${scale * 40} C ${-scale * 12} ${scale * 34}, ${-scale * 18} ${scale * 16}, 0 ${scale * 8}" fill="${c2}"/></g>`
    case 'scale':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 18} ${scale * 4} C ${-scale * 18} ${-scale * 14}, ${scale * 18} ${-scale * 14}, ${scale * 18} ${scale * 4} C ${scale * 14} ${scale * 18}, ${-scale * 14} ${scale * 18}, ${-scale * 18} ${scale * 4} Z" fill="${c2}" stroke="${c4}" stroke-width="${scale * 3}"/></g>`
    case 'cloud':
      return `<g transform="translate(${x} ${y})"><circle cx="${-scale * 12}" cy="0" r="${scale * 10}" fill="${c3}"/><circle cx="0" cy="${-scale * 6}" r="${scale * 12}" fill="${c3}"/><circle cx="${scale * 14}" cy="0" r="${scale * 10}" fill="${c3}"/></g>`
    case 'crest':
    case 'crown':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 22} ${scale * 14} L ${-scale * 16} ${-scale * 8} L 0 ${scale * 2} L ${scale * 16} ${-scale * 8} L ${scale * 22} ${scale * 14} Z" fill="${c4}" stroke="${c3}" stroke-width="${scale * 3}"/><rect x="${-scale * 22}" y="${scale * 12}" width="${scale * 44}" height="${scale * 10}" rx="${scale * 4}" fill="${c2}"/></g>`
    case 'mask':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 20} 0 C ${-scale * 16} ${-scale * 16}, ${scale * 16} ${-scale * 16}, ${scale * 20} 0 C ${scale * 16} ${scale * 16}, ${-scale * 16} ${scale * 16}, ${-scale * 20} 0 Z" fill="${c2}" stroke="${c4}" stroke-width="${scale * 3}"/><ellipse cx="${-scale * 8}" cy="0" rx="${scale * 4}" ry="${scale * 6}" fill="${c3}"/><ellipse cx="${scale * 8}" cy="0" rx="${scale * 4}" ry="${scale * 6}" fill="${c3}"/></g>`
    case 'feather':
      return `<g transform="translate(${x} ${y}) rotate(-18)"><path d="M 0 ${scale * 22} C ${scale * 12} 0, ${scale * 26} ${-scale * 26}, 0 ${-scale * 44} C ${-scale * 18} ${-scale * 20}, ${-scale * 16} ${scale * 12}, 0 ${scale * 22} Z" fill="${c2}" stroke="${c4}" stroke-width="${scale * 2.5}"/><path d="M 0 ${scale * 18} L 0 ${-scale * 34}" stroke="${c3}" stroke-width="${scale * 2}"/></g>`
    case 'bell':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 16} ${scale * 10} C ${-scale * 16} ${-scale * 8}, ${scale * 16} ${-scale * 8}, ${scale * 16} ${scale * 10} Z" fill="${c4}" stroke="${c3}" stroke-width="${scale * 3}"/><circle cx="0" cy="${scale * 12}" r="${scale * 4}" fill="${c2}"/></g>`
    case 'diamond':
      return `<g transform="translate(${x} ${y}) rotate(45)"><rect x="${-scale * 14}" y="${-scale * 14}" width="${scale * 28}" height="${scale * 28}" fill="${c2}" stroke="${c4}" stroke-width="${scale * 3}"/></g>`
    case 'splash':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 24} ${scale * 6} C ${-scale * 28} ${-scale * 10}, ${-scale * 10} ${-scale * 18}, 0 ${-scale * 10} C ${scale * 6} ${-scale * 24}, ${scale * 24} ${-scale * 18}, ${scale * 20} 0 C ${scale * 34} ${scale * 8}, ${scale * 18} ${scale * 24}, 0 ${scale * 18} C ${-scale * 8} ${scale * 30}, ${-scale * 26} ${scale * 20}, ${-scale * 24} ${scale * 6} Z" fill="${c2}" opacity="0.95"/></g>`
    case 'sun':
      return `<g transform="translate(${x} ${y})"><circle r="${scale * 16}" fill="${c4}"/>${Array.from({ length: 8 }, (_, i) => { const a = (Math.PI * 2 * i) / 8; return `<line x1="${Math.cos(a) * scale * 22}" y1="${Math.sin(a) * scale * 22}" x2="${Math.cos(a) * scale * 32}" y2="${Math.sin(a) * scale * 32}" stroke="${c4}" stroke-width="${scale * 4}" stroke-linecap="round"/>` }).join('')}</g>`
    case 'shell':
      return `<g transform="translate(${x} ${y})"><path d="M 0 ${-scale * 18} C ${scale * 18} ${-scale * 12}, ${scale * 20} ${scale * 18}, 0 ${scale * 24} C ${-scale * 20} ${scale * 18}, ${-scale * 18} ${-scale * 12}, 0 ${-scale * 18} Z" fill="${c3}" stroke="${c4}" stroke-width="${scale * 3}"/><path d="M 0 ${-scale * 12} L 0 ${scale * 18}" stroke="${c4}" stroke-width="${scale * 2}"/></g>`
    case 'anchor':
      return `<g transform="translate(${x} ${y})"><circle cy="${-scale * 18}" r="${scale * 6}" fill="none" stroke="${c4}" stroke-width="${scale * 3}"/><path d="M 0 ${-scale * 12} L 0 ${scale * 18} M ${-scale * 16} ${scale * 8} Q 0 ${scale * 30} ${scale * 16} ${scale * 8}" stroke="${c4}" stroke-width="${scale * 4}" fill="none" stroke-linecap="round"/></g>`
    case 'rope':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 24} ${-scale * 4} Q ${-scale * 12} ${scale * 8} 0 ${-scale * 4} T ${scale * 24} ${-scale * 4}" stroke="${c4}" stroke-width="${scale * 4}" fill="none" stroke-linecap="round"/></g>`
    case 'crescent':
      return `<g transform="translate(${x} ${y})"><circle r="${scale * 16}" fill="${c4}"/><circle cx="${scale * 7}" cy="${-scale * 2}" r="${scale * 14}" fill="${c1}"/></g>`
    case 'clover':
      return `<g transform="translate(${x} ${y})">${[-1, 1].flatMap(sx => [-1, 1].map(sy => `<circle cx="${sx * scale * 7}" cy="${sy * scale * 6}" r="${scale * 8}" fill="${c2}"/>`)).join('')}<path d="M 0 ${scale * 4} L ${scale * 7} ${scale * 26}" stroke="${c4}" stroke-width="${scale * 2.5}"/></g>`
    case 'buckle':
      return `<g transform="translate(${x} ${y})"><rect x="${-scale * 20}" y="${-scale * 14}" width="${scale * 40}" height="${scale * 28}" rx="${scale * 4}" fill="${c4}"/><rect x="${-scale * 8}" y="${-scale * 10}" width="${scale * 16}" height="${scale * 20}" rx="${scale * 3}" fill="${c1}"/></g>`
    case 'button':
      return `<g transform="translate(${x} ${y})"><circle r="${scale * 12}" fill="${c4}" stroke="${c3}" stroke-width="${scale * 3}"/><circle r="${scale * 4}" fill="${c3}"/></g>`
    case 'star':
      return `<g transform="translate(${x} ${y})"><path d="M 0 ${-scale * 18} L ${scale * 5} ${-scale * 5} L ${scale * 18} ${-scale * 5} L ${scale * 8} ${scale * 4} L ${scale * 12} ${scale * 18} L 0 ${scale * 10} L ${-scale * 12} ${scale * 18} L ${-scale * 8} ${scale * 4} L ${-scale * 18} ${-scale * 5} L ${-scale * 5} ${-scale * 5} Z" fill="${c4}" stroke="${c3}" stroke-width="${scale * 2.5}"/></g>`
    case 'clock':
      return `<g transform="translate(${x} ${y})"><circle r="${scale * 18}" fill="${c3}" stroke="${c4}" stroke-width="${scale * 3}"/><path d="M 0 0 L 0 ${-scale * 8} M 0 0 L ${scale * 7} ${scale * 5}" stroke="${c4}" stroke-width="${scale * 3}" stroke-linecap="round"/></g>`
    case 'bubbles':
      return `<g transform="translate(${x} ${y})"><circle r="${scale * 12}" fill="${c3}" opacity="0.8"/><circle cx="${scale * 18}" cy="${-scale * 12}" r="${scale * 8}" fill="${c3}" opacity="0.65"/><circle cx="${-scale * 16}" cy="${scale * 8}" r="${scale * 6}" fill="${c3}" opacity="0.58"/></g>`
    case 'ribbon':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 20} ${-scale * 10} L ${scale * 20} ${-scale * 10} L ${scale * 12} ${scale * 10} L ${-scale * 12} ${scale * 10} Z" fill="${c2}" stroke="${c4}" stroke-width="${scale * 2.5}"/></g>`
    case 'pearl':
      return `<g transform="translate(${x} ${y})"><circle r="${scale * 12}" fill="${c3}" stroke="${c4}" stroke-width="${scale * 2}"/><circle cx="${-scale * 3}" cy="${-scale * 3}" r="${scale * 4}" fill="#fff"/></g>`
    case 'brocade':
      return `<g transform="translate(${x} ${y})"><path d="M 0 ${-scale * 18} C ${scale * 10} ${-scale * 8}, ${scale * 10} ${scale * 8}, 0 ${scale * 18} C ${-scale * 10} ${scale * 8}, ${-scale * 10} ${-scale * 8}, 0 ${-scale * 18} Z" fill="${c4}" opacity="0.85"/><circle r="${scale * 4}" fill="${c3}"/></g>`
    case 'dot':
      return `<circle cx="${x}" cy="${y}" r="${scale * 10}" fill="${c2}" stroke="${c4}" stroke-width="${scale * 2}"/>`
    case 'powder':
      return `<g transform="translate(${x} ${y})">${[-18, -6, 8, 20].map((dx, i) => `<circle cx="${dx * scale}" cy="${(i % 2 === 0 ? -6 : 8) * scale}" r="${scale * (6 + i)}" fill="${[c2, c3, c4, c1][i]}" opacity="0.78"/>`).join('')}</g>`
    case 'hat':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 24} ${scale * 10} L ${scale * 24} ${scale * 10} L ${scale * 16} ${-scale * 16} L ${-scale * 16} ${-scale * 16} Z" fill="${c2}" stroke="${c4}" stroke-width="${scale * 3}"/><rect x="${-scale * 28}" y="${scale * 10}" width="${scale * 56}" height="${scale * 6}" rx="${scale * 3}" fill="${c4}"/></g>`
    case 'pumpkin':
      return `<g transform="translate(${x} ${y})"><ellipse rx="${scale * 18}" ry="${scale * 16}" fill="${c2}" stroke="${c4}" stroke-width="${scale * 3}"/><path d="M ${-scale * 8} ${-scale * 18} Q 0 ${-scale * 28} ${scale * 7} ${-scale * 16}" stroke="${c4}" stroke-width="${scale * 3}" fill="none"/><path d="M ${-scale * 7} ${-scale * 2} L ${-scale * 2} ${scale * 4} L ${-scale * 12} ${scale * 4} Z M ${scale * 7} ${-scale * 2} L ${scale * 2} ${scale * 4} L ${scale * 12} ${scale * 4} Z" fill="${c3}"/></g>`
    case 'moon':
      return `<g transform="translate(${x} ${y})"><circle r="${scale * 14}" fill="${c3}"/><circle cx="${scale * 7}" cy="${-scale * 1}" r="${scale * 12}" fill="${c1}"/></g>`
    case 'mist':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 26} 0 Q ${-scale * 16} ${-scale * 8} ${-scale * 6} 0 T ${scale * 14} 0 T ${scale * 26} 0" stroke="${c3}" stroke-width="${scale * 5}" fill="none" stroke-linecap="round" opacity="0.8"/></g>`
    case 'leaf':
      return `<g transform="translate(${x} ${y})"><path d="M 0 ${-scale * 20} C ${scale * 18} ${-scale * 10}, ${scale * 18} ${scale * 10}, 0 ${scale * 20} C ${-scale * 18} ${scale * 10}, ${-scale * 18} ${-scale * 10}, 0 ${-scale * 20} Z" fill="${c2}" stroke="${c4}" stroke-width="${scale * 2.5}"/><path d="M 0 ${-scale * 12} L 0 ${scale * 14}" stroke="${c3}" stroke-width="${scale * 2}"/></g>`
    case 'medal':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 10} ${-scale * 24} L ${-scale * 2} ${-scale * 4} L ${-scale * 14} ${-scale * 4} Z M ${scale * 10} ${-scale * 24} L ${scale * 2} ${-scale * 4} L ${scale * 14} ${-scale * 4} Z" fill="${c2}"/><circle r="${scale * 16}" fill="${c4}" stroke="${c3}" stroke-width="${scale * 3}"/><circle r="${scale * 7}" fill="${c3}"/></g>`
    case 'grain':
      return `<g transform="translate(${x} ${y})">${[-12, -4, 4, 12].map((dx, i) => `<ellipse cx="${dx * scale}" cy="${(i % 2 === 0 ? -4 : 6) * scale}" rx="${scale * 6}" ry="${scale * 10}" fill="${c4}" transform="rotate(${dx > 0 ? 18 : -18} ${dx * scale} ${(i % 2 === 0 ? -4 : 6) * scale})"/>`).join('')}</g>`
    case 'gift':
      return `<g transform="translate(${x} ${y})"><rect x="${-scale * 18}" y="${-scale * 14}" width="${scale * 36}" height="${scale * 28}" rx="${scale * 4}" fill="${c2}" stroke="${c4}" stroke-width="${scale * 3}"/><path d="M 0 ${-scale * 14} L 0 ${scale * 14} M ${-scale * 18} 0 L ${scale * 18} 0" stroke="${c3}" stroke-width="${scale * 3}"/></g>`
    case 'fur':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 24} ${scale * 10} Q ${-scale * 16} ${-scale * 12} ${-scale * 6} ${scale * 8} T ${scale * 14} ${scale * 8} T ${scale * 24} ${scale * 10}" fill="${c3}" stroke="${c4}" stroke-width="${scale * 2}"/></g>`
    case 'snowflake':
      return `<g transform="translate(${x} ${y})">${[0, 60, 120].map((deg) => `<g transform="rotate(${deg})"><line x1="0" y1="${-scale * 16}" x2="0" y2="${scale * 16}" stroke="${c3}" stroke-width="${scale * 3}" stroke-linecap="round"/></g>`).join('')}</g>`
    case 'scarf':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 24} ${-scale * 8} L ${scale * 24} ${-scale * 8} L ${scale * 18} ${scale * 8} L ${-scale * 18} ${scale * 8} Z" fill="${c2}" stroke="${c4}" stroke-width="${scale * 2.5}"/></g>`
    case 'crystal':
      return `<g transform="translate(${x} ${y})"><path d="M 0 ${-scale * 20} L ${scale * 14} 0 L 0 ${scale * 20} L ${-scale * 14} 0 Z" fill="${c3}" stroke="${c4}" stroke-width="${scale * 3}"/></g>`
    case 'bubble':
      return `<g transform="translate(${x} ${y})"><circle r="${scale * 14}" fill="${c3}" opacity="0.72"/><circle cx="${scale * 18}" cy="${-scale * 10}" r="${scale * 8}" fill="${c3}" opacity="0.55"/></g>`
    case 'firework':
      return `<g transform="translate(${x} ${y})">${Array.from({ length: 10 }, (_, i) => { const a = (Math.PI * 2 * i) / 10; return `<line x1="0" y1="0" x2="${Math.cos(a) * scale * 26}" y2="${Math.sin(a) * scale * 26}" stroke="${i % 2 ? c2 : c4}" stroke-width="${scale * 3}" stroke-linecap="round"/>` }).join('')}<circle r="${scale * 7}" fill="${c3}"/></g>`
    case 'spark':
      return `<g transform="translate(${x} ${y})"><path d="M 0 ${-scale * 18} L ${scale * 4} ${-scale * 4} L ${scale * 18} 0 L ${scale * 4} ${scale * 4} L 0 ${scale * 18} L ${-scale * 4} ${scale * 4} L ${-scale * 18} 0 L ${-scale * 4} ${-scale * 4} Z" fill="${c4}" opacity="0.92"/></g>`
    case 'disc':
      return `<g transform="translate(${x} ${y})"><circle r="${scale * 16}" fill="${c4}" stroke="${c2}" stroke-width="${scale * 3}"/><circle r="${scale * 7}" fill="${c3}"/></g>`
    case 'rangoli':
      return `<g transform="translate(${x} ${y})">${[0, 90].map((deg) => `<g transform="rotate(${deg})"><path d="M 0 ${-scale * 18} C ${scale * 10} ${-scale * 6}, ${scale * 10} ${scale * 6}, 0 ${scale * 18} C ${-scale * 10} ${scale * 6}, ${-scale * 10} ${-scale * 6}, 0 ${-scale * 18} Z" fill="${c2}" opacity="0.88"/></g>`).join('')}<circle r="${scale * 7}" fill="${c4}"/></g>`
    case 'diya':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 18} ${scale * 8} Q 0 ${-scale * 8} ${scale * 18} ${scale * 8} Q 0 ${scale * 18} ${-scale * 18} ${scale * 8} Z" fill="${c2}" stroke="${c4}" stroke-width="${scale * 2.5}"/><path d="M 0 ${-scale * 18} C ${scale * 8} ${-scale * 10}, ${scale * 6} 0, 0 ${scale * 4} C ${-scale * 6} 0, ${-scale * 8} ${-scale * 10}, 0 ${-scale * 18} Z" fill="${c4}"/></g>`
    case 'chain':
      return `<g transform="translate(${x} ${y})">${[-18, 0, 18].map((dx) => `<circle cx="${dx * scale}" cy="0" r="${scale * 8}" fill="none" stroke="${c4}" stroke-width="${scale * 3}"/>`).join('')}</g>`
    default:
      return `<circle cx="${x}" cy="${y}" r="${scale * 8}" fill="${c4}"/>`
  }
}

function makeBodySvg(id, style, palette, motifs) {
  const [base, mid, accent, light] = palette
  const motifXs = [90, 230, 370, 510, 650]
  const motifLayer = motifXs.map((x, idx) => makeMotif(motifs[idx % motifs.length], x, 110, 1, [base, mid, accent, light])).join('\n')
  const smallMotifs = motifXs.map((x, idx) => makeMotif(motifs[(idx + 1) % motifs.length], x - 55, 54, 0.6, [base, mid, accent, light])).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${base}"/>
      <stop offset="52%" stop-color="${mid}"/>
      <stop offset="100%" stop-color="${base}"/>
    </linearGradient>
    <linearGradient id="satin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.30)"/>
      <stop offset="24%" stop-color="rgba(255,255,255,0.12)"/>
      <stop offset="70%" stop-color="rgba(0,0,0,0.06)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.22)"/>
    </linearGradient>
    <pattern id="brocade-${esc(id)}" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M 40 8 C 56 22, 56 58, 40 72 C 24 58, 24 22, 40 8 Z" fill="${light}" opacity="0.10"/>
      <path d="M 8 40 C 22 26, 58 26, 72 40 C 58 54, 22 54, 8 40 Z" fill="${accent}" opacity="0.10"/>
    </pattern>
    <pattern id="trim-${esc(id)}" width="46" height="34" patternUnits="userSpaceOnUse">
      <path d="M 0 28 Q 11 6 23 28 T 46 28" stroke="${accent}" stroke-width="4" fill="none" opacity="0.85"/>
      <circle cx="23" cy="18" r="4" fill="${light}" opacity="0.8"/>
    </pattern>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" rx="70" fill="url(#bg)"/>
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" rx="70" fill="url(#brocade-${esc(id)})"/>
  <rect x="0" y="18" width="${WIDTH}" height="24" fill="url(#trim-${esc(id)})" opacity="0.95"/>
  <rect x="0" y="${HEIGHT - 42}" width="${WIDTH}" height="24" fill="url(#trim-${esc(id)})" opacity="0.95"/>
  <rect x="68" y="26" width="${WIDTH - 136}" height="${HEIGHT - 52}" rx="52" fill="${light}" opacity="0.18"/>
  <rect x="118" y="18" width="${WIDTH - 236}" height="${HEIGHT - 36}" rx="44" fill="${base}" opacity="0.22"/>
  <rect x="155" y="0" width="22" height="${HEIGHT}" fill="${accent}" opacity="0.85"/>
  <rect x="543" y="0" width="22" height="${HEIGHT}" fill="${accent}" opacity="0.85"/>
  <rect x="334" y="0" width="52" height="${HEIGHT}" fill="${light}" opacity="0.18"/>
  <g opacity="0.98">${motifLayer}</g>
  <g opacity="0.82">${smallMotifs}</g>
  <g opacity="0.82">
    ${Array.from({ length: 10 }, (_, i) => `<circle cx="${48 + i * 68}" cy="38" r="6" fill="${light}" opacity="0.72"/>`).join('\n')}
  </g>
  <g opacity="0.72">
    ${Array.from({ length: 9 }, (_, i) => `<circle cx="${82 + i * 72}" cy="${HEIGHT - 32}" r="7" fill="${accent}" opacity="0.65"/>`).join('\n')}
  </g>
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" rx="70" fill="url(#satin)"/>
  <path d="M 40 34 C 160 8, 560 8, 680 34" stroke="rgba(255,255,255,0.28)" stroke-width="12" stroke-linecap="round" fill="none"/>
  <path d="M 48 168 C 184 194, 536 194, 672 168" stroke="rgba(0,0,0,0.16)" stroke-width="12" stroke-linecap="round" fill="none"/>
</svg>`
}

for (const [id, config] of entryMap) {
  writeFileSync(resolve(outDir, `${id}.svg`), makeBodySvg(id, config.style, config.palette, config.motifs))
}

console.log(`Generated ${entryMap.size} premium event body SVGs in ${outDir}`)
