// ============================================================================
//  DÉCODEUR .PL8  —  branché sur le moteur porté depuis OpenLotR2
// ============================================================================
//
//  Moteur pur (sans Node/Buffer/pngjs) dans src/pl8/ :
//    - parse.js : en-tête + descripteurs de tuiles (DataView)
//    - draw.js  : décodage iso / brut / RLE vers RGBA
//
//  Contrat attendu par main.js :
//    decodePl8(pl8Bytes, paletteBytes)
//       => Sprite[]   où   Sprite = { name, width, height, rgba: Uint8ClampedArray }
//
//  Entrées = Uint8Array fournis par l'UI (l'utilisateur apporte ses fichiers,
//  rien n'est uploadé). La palette .256 remplace l'ancien readPalette().
//  Sortie = RGBA brut ; main.js le pose sur un <canvas> et fait toBlob().
// ============================================================================

import { parsePl8, availableData } from './pl8/parse.js'
import { decodeTile } from './pl8/draw.js'

export const DECODER_READY = true

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

export function decodePl8(pl8Bytes, paletteBytes) {
  const palette = parsePalette(paletteBytes)
  const { rle, tiles } = parsePl8(pl8Bytes)

  const sprites = []
  tiles.forEach((tile, i) => {
    const avail = availableData(tile, tiles, pl8Bytes.length)
    const decoded = decodeTile(tile, pl8Bytes, palette, rle, avail)
    if (!decoded) return
    sprites.push({
      name: `sprite_${String(i).padStart(3, '0')}`,
      width: decoded.width,
      height: decoded.height,
      rgba: decoded.rgba,
    })
  })

  if (sprites.length === 0) {
    throw new Error('NO_SPRITES')
  }
  return sprites
}
