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
    case 'flowers':
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
    case 'lace':
      return `<g transform="translate(${x} ${y})">${[-18, 0, 18].map((dx) => `<path d="M ${dx - scale * 10} 0 Q ${dx} ${-scale * 10} ${dx + scale * 10} 0" stroke="${c3}" stroke-width="${scale * 3}" fill="none" stroke-linecap="round"/>`).join('')}</g>`
    case 'bead':
      return `<g transform="translate(${x} ${y})">${[-16, 0, 16].map((dx) => `<circle cx="${dx * scale}" cy="0" r="${scale * 5}" fill="${c3}" stroke="${c4}" stroke-width="${scale * 1.5}"/>`).join('')}</g>`
    case 'arch':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 20} ${scale * 18} L ${-scale * 20} ${-scale * 2} Q 0 ${-scale * 22} ${scale * 20} ${-scale * 2} L ${scale * 20} ${scale * 18}" stroke="${c4}" stroke-width="${scale * 4}" fill="none" stroke-linecap="round"/></g>`
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
    case 'balloon':
      return `<g transform="translate(${x} ${y})"><ellipse rx="${scale * 14}" ry="${scale * 18}" fill="${c2}" stroke="${c4}" stroke-width="${scale * 2.5}"/><path d="M 0 ${scale * 18} L ${scale * 2} ${scale * 34}" stroke="${c4}" stroke-width="${scale * 2}" fill="none"/></g>`
    case 'sun':
      return `<g transform="translate(${x} ${y})"><circle r="${scale * 16}" fill="${c4}"/>${Array.from({ length: 8 }, (_, i) => { const a = (Math.PI * 2 * i) / 8; return `<line x1="${Math.cos(a) * scale * 22}" y1="${Math.sin(a) * scale * 22}" x2="${Math.cos(a) * scale * 32}" y2="${Math.sin(a) * scale * 32}" stroke="${c4}" stroke-width="${scale * 4}" stroke-linecap="round"/>` }).join('')}</g>`
    case 'shell':
      return `<g transform="translate(${x} ${y})"><path d="M 0 ${-scale * 18} C ${scale * 18} ${-scale * 12}, ${scale * 20} ${scale * 18}, 0 ${scale * 24} C ${-scale * 20} ${scale * 18}, ${-scale * 18} ${-scale * 12}, 0 ${-scale * 18} Z" fill="${c3}" stroke="${c4}" stroke-width="${scale * 3}"/><path d="M 0 ${-scale * 12} L 0 ${scale * 18}" stroke="${c4}" stroke-width="${scale * 2}"/></g>`
    case 'wave':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 22} ${scale * 4} Q ${-scale * 10} ${-scale * 12} 0 ${scale * 4} T ${scale * 22} ${scale * 4}" stroke="${c4}" stroke-width="${scale * 4}" fill="none" stroke-linecap="round"/></g>`
    case 'anchor':
      return `<g transform="translate(${x} ${y})"><circle cy="${-scale * 18}" r="${scale * 6}" fill="none" stroke="${c4}" stroke-width="${scale * 3}"/><path d="M 0 ${-scale * 12} L 0 ${scale * 18} M ${-scale * 16} ${scale * 8} Q 0 ${scale * 30} ${scale * 16} ${scale * 8}" stroke="${c4}" stroke-width="${scale * 4}" fill="none" stroke-linecap="round"/></g>`
    case 'rope':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 24} ${-scale * 4} Q ${-scale * 12} ${scale * 8} 0 ${-scale * 4} T ${scale * 24} ${-scale * 4}" stroke="${c4}" stroke-width="${scale * 4}" fill="none" stroke-linecap="round"/></g>`
    case 'crescent':
      return `<g transform="translate(${x} ${y})"><circle r="${scale * 16}" fill="${c4}"/><circle cx="${scale * 7}" cy="${-scale * 2}" r="${scale * 14}" fill="${c1}"/></g>`
    case 'clover':
      return `<g transform="translate(${x} ${y})">${[-1, 1].flatMap(sx => [-1, 1].map(sy => `<circle cx="${sx * scale * 7}" cy="${sy * scale * 6}" r="${scale * 8}" fill="${c2}"/>`)).join('')}<path d="M 0 ${scale * 4} L ${scale * 7} ${scale * 26}" stroke="${c4}" stroke-width="${scale * 2.5}"/></g>`
    case 'cockade':
    case 'rosette':
      return `
        <g transform="translate(${x} ${y})">
          ${Array.from({ length: 10 }, (_, i) => {
            const a = (Math.PI * 2 * i) / 10
            const px = Math.cos(a) * scale * 12
            const py = Math.sin(a) * scale * 12
            return `<ellipse cx="${px}" cy="${py}" rx="${scale * 6}" ry="${scale * 10}" fill="${c2}" transform="rotate(${(a * 180) / Math.PI} ${px} ${py})"/>`
          }).join('')}
          <circle r="${scale * 10}" fill="${c3}" stroke="${c4}" stroke-width="${scale * 2.5}"/>
        </g>`
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
    case 'banner':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 20} ${-scale * 10} L ${scale * 20} ${-scale * 10} L ${scale * 12} ${scale * 10} L ${-scale * 12} ${scale * 10} Z" fill="${c2}" stroke="${c4}" stroke-width="${scale * 2.5}"/></g>`
    case 'pearl':
      return `<g transform="translate(${x} ${y})"><circle r="${scale * 12}" fill="${c3}" stroke="${c4}" stroke-width="${scale * 2}"/><circle cx="${-scale * 3}" cy="${-scale * 3}" r="${scale * 4}" fill="#fff"/></g>`
    case 'brocade':
      return `<g transform="translate(${x} ${y})"><path d="M 0 ${-scale * 18} C ${scale * 10} ${-scale * 8}, ${scale * 10} ${scale * 8}, 0 ${scale * 18} C ${-scale * 10} ${scale * 8}, ${-scale * 10} ${-scale * 8}, 0 ${-scale * 18} Z" fill="${c4}" opacity="0.85"/><circle r="${scale * 4}" fill="${c3}"/></g>`
    case 'dot':
      return `<circle cx="${x}" cy="${y}" r="${scale * 10}" fill="${c2}" stroke="${c4}" stroke-width="${scale * 2}"/>`
    case 'icecream':
      return `<g transform="translate(${x} ${y})"><path d="M ${-scale * 10} ${scale * 14} L 0 ${-scale * 18} L ${scale * 10} ${scale * 14} Z" fill="${c4}" stroke="${c3}" stroke-width="${scale * 2}"/><circle cx="${-scale * 8}" cy="${-scale * 6}" r="${scale * 9}" fill="${c2}"/><circle cx="${scale * 1}" cy="${-scale * 10}" r="${scale * 10}" fill="${c3}"/><circle cx="${scale * 10}" cy="${-scale * 5}" r="${scale * 8}" fill="${c1}"/></g>`
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

function repeatAcross(step, renderer) {
  const parts = []
  for (let x = step / 2; x < WIDTH; x += step) parts.push(renderer(x))
  return parts.join('\n')
}

function styleBodyLayer(style, palette, motifs) {
  const [base, mid, accent, light] = palette
  const gemBand = repeatAcross(86, (x) => makeMotif('gem', x, 110, 0.42, palette))
  const floralBand = repeatAcross(120, (x) => makeMotif('flower', x, 110, 0.58, palette))
  const scaleBand = repeatAcross(62, (x) => makeMotif('scale', x, 132, 0.52, palette))
  const chainBand = repeatAcross(94, (x) => makeMotif('chain', x, 108, 0.46, palette))
  const buttonBand = repeatAcross(84, (x) => makeMotif('button', x, 110, 0.5, palette))
  const cloverBand = repeatAcross(110, (x) => makeMotif('clover', x, 110, 0.55, palette))
  const heartBand = repeatAcross(110, (x) => makeMotif('heart', x, 110, 0.56, palette))
  const shellBand = repeatAcross(112, (x) => makeMotif('shell', x, 112, 0.6, palette))
  const lanternBand = repeatAcross(112, (x) => makeMotif('lantern', x, 112, 0.55, palette))
  const starBand = repeatAcross(96, (x) => makeMotif('star', x, 110, 0.5, palette))
  const fireworkBand = repeatAcross(142, (x) => makeMotif('firework', x, 110, 0.55, palette))
  const scarfBand = repeatAcross(126, (x) => makeMotif('scarf', x, 110, 0.45, palette))

  switch (style) {
    case 'heart':
      return `
        <rect x="98" y="28" width="524" height="164" rx="54" fill="${mid}" opacity="0.28"/>
        <path d="M 150 36 C 260 120, 260 120, 150 184 L 570 184 C 460 120, 460 120, 570 36 Z" fill="${base}" opacity="0.38"/>
        <path d="M 230 30 L 490 30 L 530 110 L 490 190 L 230 190 L 190 110 Z" fill="${light}" opacity="0.24"/>
        ${heartBand}
        ${repeatAcross(120, (x) => makeMotif('pearl', x, 54, 0.34, palette))}
      `
    case 'rose':
      return `
        <rect x="104" y="28" width="512" height="164" rx="52" fill="${light}" opacity="0.22"/>
        <path d="M 140 42 Q 360 -6 580 42 L 558 178 Q 360 212 162 178 Z" fill="${base}" opacity="0.40"/>
        <path d="M 224 24 L 496 24 L 544 110 L 496 196 L 224 196 L 176 110 Z" fill="${mid}" opacity="0.18"/>
        ${floralBand}
        ${repeatAcross(116, (x) => makeMotif('lace', x, 48, 0.34, palette))}
      `
    case 'letter':
      return `
        <rect x="82" y="28" width="556" height="164" rx="56" fill="${light}" opacity="0.28"/>
        <path d="M 84 36 L 636 36 L 360 132 Z" fill="${mid}" opacity="0.34"/>
        <path d="M 84 184 L 636 184 L 360 88 Z" fill="${base}" opacity="0.22"/>
        <rect x="150" y="48" width="420" height="124" rx="26" fill="${accent}" opacity="0.16"/>
        ${repeatAcross(150, (x) => makeMotif('seal', x, 110, 0.52, palette))}
        ${repeatAcross(110, (x) => makeMotif('heart', x, 60, 0.28, palette))}
      `
    case 'cupid':
      return `
        <rect x="100" y="30" width="520" height="160" rx="54" fill="${light}" opacity="0.36"/>
        <path d="M 170 36 C 240 88, 240 132, 170 184 L 550 184 C 480 132, 480 88, 550 36 Z" fill="${mid}" opacity="0.26"/>
        ${repeatAcross(124, (x) => makeMotif('wing', x, 114, 0.5, palette))}
        ${repeatAcross(150, (x) => makeMotif('arrow', x, 64, 0.34, palette))}
      `
    case 'dragon':
      return `
        <rect x="92" y="24" width="536" height="172" rx="58" fill="${base}" opacity="0.38"/>
        ${repeatAcross(52, (x) => makeMotif('scale', x, 150, 0.68, palette))}
        ${repeatAcross(86, (x) => makeMotif('coin', x, 78, 0.30, palette))}
        <path d="M 90 62 Q 360 10 630 62" stroke="${light}" stroke-width="10" opacity="0.28" fill="none"/>
      `
    case 'emperor':
      return `
        <rect x="90" y="22" width="540" height="176" rx="56" fill="${base}" opacity="0.30"/>
        <path d="M 120 34 L 600 34 L 560 186 L 160 186 Z" fill="${mid}" opacity="0.16"/>
        <rect x="314" y="0" width="92" height="220" rx="28" fill="${light}" opacity="0.20"/>
        ${repeatAcross(142, (x) => makeMotif('crest', x, 76, 0.42, palette))}
        ${repeatAcross(108, (x) => makeMotif('brocade', x, 144, 0.5, palette))}
      `
    case 'lantern':
    case 'fanous':
    case 'guardianmoon':
    case 'eidcrescent':
    case 'eidfanous':
    case 'eidprince':
      return `
        <rect x="92" y="26" width="536" height="168" rx="54" fill="${mid}" opacity="0.16"/>
        <path d="M 150 20 L 570 20 L 610 110 L 570 200 L 150 200 L 110 110 Z" fill="${base}" opacity="0.28"/>
        ${lanternBand}
        ${repeatAcross(116, (x) => makeMotif('crescent', x, 60, 0.30, palette))}
        ${repeatAcross(102, (x) => makeMotif('tassel', x, 170, 0.26, palette))}
      `
    case 'mask':
      return `
        <rect x="98" y="26" width="524" height="168" rx="56" fill="${light}" opacity="0.18"/>
        <path d="M 110 50 C 240 8, 480 8, 610 50 L 610 170 C 480 212, 240 212, 110 170 Z" fill="${base}" opacity="0.34"/>
        ${repeatAcross(138, (x) => makeMotif('mask', x, 110, 0.44, palette))}
        ${repeatAcross(138, (x) => makeMotif('feather', x + 24, 56, 0.28, palette))}
      `
    case 'clown':
      return `
        <rect x="100" y="30" width="520" height="160" rx="54" fill="${light}" opacity="0.24"/>
        ${repeatAcross(82, (x) => makeMotif('dot', x, 110, 0.52, palette))}
        ${repeatAcross(132, (x) => makeMotif('bell', x, 60, 0.34, palette))}
        <path d="M 100 156 Q 360 122 620 156" stroke="${base}" stroke-width="18" opacity="0.24" fill="none"/>
      `
    case 'jester':
    case 'royalharlequin':
      return `
        <rect x="96" y="28" width="528" height="164" rx="54" fill="${base}" opacity="0.20"/>
        ${repeatAcross(74, (x) => makeMotif('diamond', x, 110, 0.5, palette))}
        ${repeatAcross(128, (x) => makeMotif('bell', x, 60, 0.32, palette))}
        ${repeatAcross(128, (x) => makeMotif('gem', x, 160, 0.24, palette))}
      `
    case 'paint':
    case 'balloon':
    case 'rainbowmaster':
      return `
        <rect x="92" y="28" width="536" height="164" rx="54" fill="${light}" opacity="0.16"/>
        ${repeatAcross(88, (x) => makeMotif('splash', x, 110, 0.46, palette))}
        ${repeatAcross(150, (x) => makeMotif(style === 'balloon' ? 'balloon' : 'powder', x, 64, 0.36, palette))}
      `
    case 'leprechaun':
    case 'gentleman':
    case 'queenclover':
    case 'lordluck':
    case 'potgold':
      return `
        <rect x="94" y="28" width="532" height="164" rx="56" fill="${light}" opacity="0.14"/>
        <rect x="150" y="28" width="420" height="164" rx="48" fill="${base}" opacity="0.28"/>
        <rect x="282" y="14" width="156" height="192" rx="44" fill="${style === 'queenclover' ? light : mid}" opacity="0.42"/>
        <rect x="0" y="92" width="720" height="34" fill="#151515" opacity="0.94"/>
        <rect x="296" y="78" width="128" height="62" rx="16" fill="none" stroke="${accent}" stroke-width="14"/>
        <path d="M 190 40 L 530 40 L 566 78 L 528 106 L 192 106 L 154 78 Z" fill="${light}" opacity="0.24"/>
        <path d="M 188 176 Q 360 136 532 176" stroke="${accent}" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.64"/>
        ${repeatAcross(120, (x) => makeMotif('clover', x, 58, 0.30, palette))}
        ${repeatAcross(132, (x) => makeMotif(style === 'potgold' ? 'coin' : 'button', x, 156, 0.26, palette))}
      `
    case 'bunny':
    case 'chick':
    case 'egg':
    case 'dandy':
      return `
        <rect x="88" y="26" width="544" height="168" rx="58" fill="${light}" opacity="0.26"/>
        <path d="M 120 34 L 600 34 L 560 186 L 160 186 Z" fill="${mid}" opacity="0.18"/>
        ${repeatAcross(128, (x) => makeMotif('egg', x, 110, 0.40, palette))}
        ${repeatAcross(110, (x) => makeMotif(style === 'dandy' ? 'button' : 'flower', x, 60, 0.28, palette))}
      `
    case 'workerfloral':
    case 'springcrown':
    case 'rosesherald':
      return `
        <rect x="92" y="28" width="536" height="164" rx="54" fill="${light}" opacity="0.14"/>
        <path d="M 116 34 L 604 34 L 572 188 L 148 188 Z" fill="${base}" opacity="0.20"/>
        <rect x="214" y="18" width="292" height="184" rx="58" fill="${light}" opacity="0.62"/>
        <path d="M 260 22 L 460 22 L 516 110 L 460 198 L 260 198 L 204 110 Z" fill="${mid}" opacity="0.28"/>
        <rect x="306" y="8" width="108" height="202" rx="34" fill="${accent}" opacity="0.22"/>
        <rect x="0" y="78" width="720" height="18" fill="${style === 'springcrown' ? light : accent}" opacity="0.82"/>
        <rect x="0" y="126" width="720" height="18" fill="${style === 'rosesherald' ? accent : base}" opacity="0.62"/>
        <path d="M 160 56 C 220 36, 282 36, 332 64 C 360 78, 388 78, 418 64 C 470 36, 530 36, 590 56" stroke="${style === 'springcrown' ? accent : light}" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.92"/>
        <path d="M 214 182 Q 360 146 506 182" stroke="${style === 'workerfloral' ? accent : base}" stroke-width="16" fill="none" stroke-linecap="round" opacity="0.58"/>
        ${repeatAcross(118, (x) => makeMotif(style === 'springcrown' ? 'flower' : 'rosette', x, 58, 0.34, palette))}
        ${repeatAcross(126, (x) => makeMotif(style === 'rosesherald' ? 'rose' : 'medal', x, 110, 0.32, palette))}
        ${repeatAcross(140, (x) => makeMotif('ribbon', x, 158, 0.24, palette))}
      `
    case 'sunbeach':
    case 'sorbet':
    case 'tiki':
    case 'captain':
      return `
        <rect x="96" y="30" width="528" height="160" rx="54" fill="${light}" opacity="0.16"/>
        <path d="M 120 30 L 600 30 L 560 190 L 160 190 Z" fill="${base}" opacity="0.24"/>
        <rect x="260" y="18" width="200" height="180" rx="56" fill="${style === 'captain' ? light : mid}" opacity="0.32"/>
        <path d="M 188 52 Q 360 20 532 52" stroke="${accent}" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.82"/>
        <path d="M 176 170 Q 360 130 544 170" stroke="${style === 'captain' ? light : accent}" stroke-width="16" fill="none" stroke-linecap="round" opacity="0.56"/>
        <rect x="0" y="96" width="720" height="20" fill="${style === 'captain' ? '#ffffff' : light}" opacity="0.56"/>
        ${style === 'captain' ? repeatAcross(120, (x) => makeMotif('anchor', x, 62, 0.30, palette)) : repeatAcross(122, (x) => makeMotif(style === 'tiki' ? 'leaf' : style === 'sorbet' ? 'icecream' : 'sun', x, 60, 0.28, palette))}
        ${style === 'captain' ? repeatAcross(132, (x) => makeMotif('button', x, 152, 0.26, palette)) : shellBand}
      `
    case 'star':
    case 'unclesam':
    case 'cockade':
    case 'beret':
    case 'patriot':
      return `
        <rect x="92" y="26" width="536" height="168" rx="56" fill="${light}" opacity="0.18"/>
        <rect x="0" y="68" width="720" height="26" fill="${mid}" opacity="0.46"/>
        <rect x="0" y="98" width="720" height="26" fill="${accent}" opacity="0.46"/>
        <rect x="0" y="128" width="720" height="26" fill="${mid}" opacity="0.46"/>
        ${repeatAcross(130, (x) => makeMotif(style === 'cockade' ? 'cockade' : 'star', x, 54, 0.28, palette))}
        ${repeatAcross(140, (x) => makeMotif('medal', x, 166, 0.30, palette))}
      `
    case 'pumpkin':
    case 'ghost':
    case 'witch':
    case 'lordpumpkin':
      return `
        <rect x="96" y="28" width="528" height="164" rx="56" fill="${light}" opacity="0.10"/>
        <path d="M 100 40 C 210 4, 510 4, 620 40 L 620 180 C 510 216, 210 216, 100 180 Z" fill="${base}" opacity="0.30"/>
        ${repeatAcross(132, (x) => makeMotif(style === 'ghost' ? 'mist' : 'pumpkin', x, 112, 0.34, palette))}
        ${repeatAcross(146, (x) => makeMotif(style === 'witch' ? 'hat' : 'moon', x, 56, 0.30, palette))}
      `
    case 'skull':
    case 'marigold':
    case 'catrina':
      return `
        <rect x="92" y="26" width="536" height="168" rx="56" fill="${light}" opacity="0.20"/>
        <path d="M 130 34 L 590 34 L 550 186 L 170 186 Z" fill="${base}" opacity="0.24"/>
        ${repeatAcross(126, (x) => makeMotif(style === 'marigold' ? 'flower' : 'skull', x, 110, 0.34, palette))}
        ${repeatAcross(112, (x) => makeMotif('lace', x, 58, 0.28, palette))}
      `
    case 'sapphire':
    case 'rangoli':
    case 'rajah':
    case 'guardian':
    case 'peacock':
      return `
        <rect x="94" y="28" width="532" height="164" rx="56" fill="${light}" opacity="0.12"/>
        <path d="M 140 24 L 580 24 L 610 110 L 580 196 L 140 196 L 110 110 Z" fill="${base}" opacity="0.24"/>
        <rect x="244" y="16" width="232" height="188" rx="48" fill="${mid}" opacity="0.28"/>
        <path d="M 300 18 L 420 18 L 462 110 L 420 202 L 300 202 L 258 110 Z" fill="${light}" opacity="0.16"/>
        <path d="M 178 60 C 250 28, 300 28, 360 64 C 420 28, 470 28, 542 60" stroke="${accent}" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.78"/>
        <path d="M 176 168 Q 360 138 544 168" stroke="${accent}" stroke-width="16" fill="none" stroke-linecap="round" opacity="0.48"/>
        ${repeatAcross(126, (x) => makeMotif(style === 'rangoli' ? 'rangoli' : style === 'peacock' ? 'feather' : 'diya', x, 60, 0.28, palette))}
        ${repeatAcross(116, (x) => makeMotif(style === 'guardian' ? 'lantern' : 'chain', x, 112, 0.26, palette))}
        ${repeatAcross(140, (x) => makeMotif('gem', x, 158, 0.22, palette))}
      `
    case 'turkey':
    case 'pilgrim':
    case 'honor':
      return `
        <rect x="92" y="28" width="536" height="164" rx="56" fill="${light}" opacity="0.18"/>
        <rect x="170" y="38" width="380" height="144" rx="40" fill="${base}" opacity="0.30"/>
        <rect x="0" y="96" width="720" height="30" fill="${accent}" opacity="0.26"/>
        ${repeatAcross(134, (x) => makeMotif(style === 'pilgrim' ? 'buckle' : 'grain', x, 112, 0.34, palette))}
        ${repeatAcross(138, (x) => makeMotif('leaf', x, 60, 0.28, palette))}
      `
    case 'santa':
    case 'elf':
    case 'snowman':
    case 'wintermaster':
      return `
        <rect x="90" y="24" width="540" height="172" rx="58" fill="${light}" opacity="0.20"/>
        <path d="M 118 26 L 602 26 L 570 194 L 150 194 Z" fill="${base}" opacity="0.34"/>
        ${
          style === 'santa'
            ? `
              <rect x="150" y="18" width="420" height="184" rx="58" fill="#c8333d" opacity="0.76"/>
              <rect x="300" y="6" width="120" height="208" rx="34" fill="#fffdf8" opacity="0.94"/>
              <rect x="0" y="64" width="720" height="92" fill="#c8333d" opacity="0.98"/>
              <rect x="228" y="64" width="264" height="92" rx="22" fill="#161719" opacity="0.99"/>
              <rect x="260" y="48" width="200" height="124" rx="22" fill="none" stroke="#f1c84d" stroke-width="28"/>
              <rect x="306" y="76" width="108" height="68" rx="14" fill="#161719" opacity="0.98"/>
              <rect x="-20" y="16" width="760" height="34" fill="#fffdf8" opacity="0.98"/>
              <rect x="-20" y="170" width="760" height="34" fill="#fffdf8" opacity="0.98"/>
              <path d="M 178 24 L 542 24 L 594 78 L 520 108 L 200 108 L 126 78 Z" fill="#ffffff" opacity="0.30"/>
              <path d="M 176 184 Q 360 132 544 184" stroke="#fffdf8" stroke-width="28" fill="none" stroke-linecap="round" opacity="0.74"/>
              <circle cx="196" cy="110" r="18" fill="#f1c84d" opacity="0.92"/>
              <circle cx="524" cy="110" r="18" fill="#f1c84d" opacity="0.92"/>
            `
            : style === 'elf'
              ? `
                <path d="M 126 20 L 594 20 L 552 88 L 594 156 L 540 198 L 180 198 L 126 156 L 168 88 Z" fill="${base}" opacity="0.36"/>
                <rect x="284" y="6" width="152" height="206" rx="42" fill="#f5e0a3" opacity="0.30"/>
                <path d="M 0 54 ${Array.from({ length: 12 }, (_, i) => `L ${i * 60 + 30} ${i % 2 === 0 ? 84 : 40}`).join(' ')} L 720 54 L 720 92 ${Array.from({ length: 12 }, (_, i) => `L ${720 - (i * 60 + 30)} ${i % 2 === 0 ? 118 : 74}`).join(' ')} Z" fill="#f5e0a3" opacity="0.92"/>
                <rect x="0" y="94" width="720" height="32" fill="#b71f32" opacity="0.82"/>
                <path d="M 210 178 Q 360 144 510 178" stroke="#f5e0a3" stroke-width="18" fill="none" stroke-linecap="round" opacity="0.58"/>
                ${repeatAcross(168, (x) => makeMotif('bell', x, 58, 0.34, palette))}
              `
              : style === 'snowman'
                ? `
                  <rect x="118" y="24" width="484" height="172" rx="56" fill="#f9fbff" opacity="0.82"/>
                  <rect x="0" y="80" width="720" height="24" fill="#ff8b47" opacity="0.98"/>
                  <rect x="0" y="104" width="720" height="20" fill="#6fa8d6" opacity="0.96"/>
                  <rect x="0" y="124" width="720" height="20" fill="#ff8b47" opacity="0.98"/>
                  <path d="M 236 30 L 484 30 L 520 64 L 484 92 L 236 92 L 200 64 Z" fill="#ffffff" opacity="0.34"/>
                  ${repeatAcross(170, (x) => makeMotif('button', x, 154, 0.28, palette))}
                `
                : `
                  <path d="M 126 22 L 594 22 L 626 110 L 594 198 L 126 198 L 94 110 Z" fill="${base}" opacity="0.38"/>
                  <rect x="272" y="8" width="176" height="204" rx="38" fill="#f6f6fb" opacity="0.22"/>
                  <rect x="0" y="82" width="720" height="18" fill="#d64953" opacity="0.94"/>
                  <rect x="0" y="120" width="720" height="18" fill="#d64953" opacity="0.94"/>
                  <path d="M 214 42 Q 360 8 506 42" stroke="#f6f6fb" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.56"/>
                  ${repeatAcross(176, (x) => makeMotif('medal', x, 154, 0.32, palette))}
                `
        }
      `
    case 'champagne':
    case 'fireworks':
    case 'masterchampagne':
    case 'goldmidnight':
    case 'queenchampagne':
    case 'musemidnight':
    case 'divadisco':
      return `
        <rect x="92" y="26" width="536" height="168" rx="56" fill="${light}" opacity="0.14"/>
        <path d="M 130 24 L 590 24 L 622 110 L 590 196 L 130 196 L 98 110 Z" fill="${base}" opacity="0.22"/>
        <rect x="246" y="14" width="228" height="192" rx="56" fill="${mid}" opacity="0.24"/>
        <path d="M 194 42 Q 360 4 526 42" stroke="${accent}" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.82"/>
        <path d="M 180 174 Q 360 138 540 174" stroke="${light}" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.46"/>
        ${style === 'champagne' || style === 'masterchampagne' || style === 'queenchampagne' ? repeatAcross(126, (x) => makeMotif('bubble', x, 110, 0.30, palette)) : fireworkBand}
        ${repeatAcross(132, (x) => makeMotif(style === 'goldmidnight' ? 'clock' : style === 'divadisco' ? 'disc' : 'star', x, 60, 0.26, palette))}
        ${repeatAcross(150, (x) => makeMotif('gem', x, 156, 0.22, palette))}
      `
    default:
      return `
        <rect x="98" y="28" width="524" height="164" rx="54" fill="${light}" opacity="0.18"/>
        <rect x="160" y="34" width="400" height="152" rx="44" fill="${base}" opacity="0.26"/>
        ${gemBand}
      `
  }
}

function makeBodySvg(id, style, palette, motifs) {
  const [base, mid, accent, light] = palette
  const motifXs = [130, 360, 590]
  const motifLayer = motifXs.map((x, idx) => makeMotif(motifs[idx % motifs.length], x, 116, 0.84, [base, mid, accent, light])).join('\n')
  const smallMotifs = motifXs.map((x, idx) => makeMotif(motifs[(idx + 1) % motifs.length], x - 70, 56, 0.44, [base, mid, accent, light])).join('\n')
  const bodyLayer = styleBodyLayer(style, [base, mid, accent, light], motifs)
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
    <pattern id="trim-${esc(id)}" width="72" height="42" patternUnits="userSpaceOnUse">
      <path d="M 0 34 Q 18 8 36 34 T 72 34" stroke="${accent}" stroke-width="6" fill="none" opacity="0.9"/>
      <circle cx="36" cy="20" r="6" fill="${light}" opacity="0.84"/>
    </pattern>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" rx="70" fill="url(#bg)"/>
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" rx="70" fill="url(#brocade-${esc(id)})"/>
  <rect x="0" y="14" width="${WIDTH}" height="22" fill="url(#trim-${esc(id)})" opacity="0.90"/>
  <rect x="0" y="${HEIGHT - 36}" width="${WIDTH}" height="22" fill="url(#trim-${esc(id)})" opacity="0.90"/>
  ${bodyLayer}
  <g opacity="0.74">${smallMotifs}</g>
  <g opacity="0.88">${motifLayer}</g>
  <g opacity="0.74">
    ${Array.from({ length: 8 }, (_, i) => `<circle cx="${64 + i * 84}" cy="38" r="7" fill="${light}" opacity="0.7"/>`).join('\n')}
  </g>
  <g opacity="0.64">
    ${Array.from({ length: 7 }, (_, i) => `<circle cx="${94 + i * 92}" cy="${HEIGHT - 34}" r="8" fill="${accent}" opacity="0.62"/>`).join('\n')}
  </g>
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" rx="70" fill="url(#satin)"/>
  <path d="M 40 34 C 160 8, 560 8, 680 34" stroke="rgba(255,255,255,0.28)" stroke-width="14" stroke-linecap="round" fill="none"/>
  <path d="M 48 168 C 184 194, 536 194, 672 168" stroke="rgba(0,0,0,0.16)" stroke-width="14" stroke-linecap="round" fill="none"/>
</svg>`
}

for (const [id, config] of entryMap) {
  writeFileSync(resolve(outDir, `${id}.svg`), makeBodySvg(id, config.style, config.palette, config.motifs))
}

console.log(`Generated ${entryMap.size} premium event body SVGs in ${outDir}`)
