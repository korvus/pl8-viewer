// ============================================================================
//  DÉCODEUR .PL8  —  branché sur le moteur porté depuis OpenLotR2
// ============================================================================
//
//  Moteur pur (sans Node/Buffer/pngjs) dans src/pl8/ :
//    - parse.js : en-tête + descripteurs de tuiles (DataView)
//    - draw.js  : décodage iso / brut / RLE vers RGBA
//
//  Contrat attendu par main.js :
//    decodePl8(pl8Bytes, paletteBytes, options?)
//       => Sprite[]   où   Sprite = { name, width, height, rgba: Uint8ClampedArray }
//
//  Entrées = Uint8Array fournis par l'UI (l'utilisateur apporte ses fichiers,
//  rien n'est uploadé). La palette .256 remplace l'ancien readPalette().
//  Sortie = RGBA brut ; main.js le pose sur un <canvas> et fait toBlob().
// ============================================================================

import { parsePl8, availableData } from './pl8/parse.js'
import { decodeTile } from './pl8/draw.js'

export const DECODER_READY = true

const RENDER_OPTIONS = {
  standard: {},
  edges: { edgeExtras: true },
  reversed: { reverseExtraRows: true },
}

// Mesure générique de cohésion : un bon placement conserve généralement les
// pixels opaques dans un grand ensemble raccordé au losange. En cas d'égalité,
// on préfère celui qui écrase le moins de pixels, puis le mode standard.
function spriteGeometryScore(sprite) {
  if (!sprite) return [-Infinity, -Infinity, -Infinity]
  const { width, height, rgba } = sprite
  const opaque = new Uint8Array(width * height)
  let count = 0
  for (let i = 0; i < opaque.length; i++) {
    if (rgba[i * 4 + 3]) { opaque[i] = 1; count++ }
  }

  const seen = new Uint8Array(opaque.length)
  let components = 0
  let largest = 0
  for (let start = 0; start < opaque.length; start++) {
    if (!opaque[start] || seen[start]) continue
    components++
    let size = 0
    const stack = [start]
    seen[start] = 1
    while (stack.length) {
      const current = stack.pop()
      size++
      const x = current % width
      const y = (current / width) | 0
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if ((!dx && !dy) || x + dx < 0 || y + dy < 0 || x + dx >= width || y + dy >= height) continue
        const next = (y + dy) * width + x + dx
        if (opaque[next] && !seen[next]) { seen[next] = 1; stack.push(next) }
      }
    }
    if (size > largest) largest = size
  }
  return [count ? largest / count : 0, -components, count]
}

function betterScore(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] > b[i]
  }
  return false
}

// Palette .256 : 256 triplets RGB en VGA 6 bits (0-63) → remis sur 0-255.
function parsePalette(bytes) {
  if (bytes.length < 256 * 3) {
    throw new Error('PALETTE_TOO_SHORT')
  }
  const palette = new Array(256)
  for (let i = 0; i < 256; i++) {
    palette[i] = [
      Math.round((bytes[i * 3] * 255) / 63),
      Math.round((bytes[i * 3 + 1] * 255) / 63),
      Math.round((bytes[i * 3 + 2] * 255) / 63),
    ]
  }
  return palette
}

export function decodePl8(pl8Bytes, paletteBytes, options = {}) {
  const palette = parsePalette(paletteBytes)
  const { rle, tiles } = parsePl8(pl8Bytes)
  const requestedMode = RENDER_OPTIONS[options.renderMode] ? options.renderMode : 'auto'

  const sprites = []
  tiles.forEach((tile, i) => {
    const avail = availableData(tile, tiles, pl8Bytes.length)
    let renderMode = requestedMode
    let decoded
    if (renderMode === 'auto' && tile.extraRows > 0) {
      const candidates = Object.entries(RENDER_OPTIONS).map(([mode, drawOptions]) => ({
        mode,
        sprite: decodeTile(tile, pl8Bytes, palette, rle, avail, drawOptions),
      }))
      let best = candidates[0]
      let bestScore = spriteGeometryScore(best.sprite)
      for (const candidate of candidates.slice(1)) {
        const score = spriteGeometryScore(candidate.sprite)
        if (betterScore(score, bestScore)) { best = candidate; bestScore = score }
      }
      renderMode = best.mode
      decoded = best.sprite
    } else {
      if (renderMode === 'auto') renderMode = 'standard'
      decoded = decodeTile(tile, pl8Bytes, palette, rle, avail, RENDER_OPTIONS[renderMode])
    }
    if (!decoded) return
    sprites.push({
      name: `sprite_${String(i).padStart(3, '0')}`,
      width: decoded.width,
      height: decoded.height,
      rgba: decoded.rgba,
      renderMode,
    })
  })

  if (sprites.length === 0) {
    throw new Error('NO_SPRITES')
  }
  return sprites
}
