// ============================================================================
//  POINT D'INTÉGRATION DU DÉCODEUR .PL8  —  À PORTER DEPUIS OpenLotR2
// ============================================================================
//
// Ce fichier est le SEUL endroit à modifier pour rendre l'outil fonctionnel.
// Toute l'UI (sélection de fichiers, rendu canvas, export PNG/ZIP) est déjà
// branchée dans main.js et appelle `decodePl8()` ci-dessous.
//
//  CONTRAT attendu par main.js :
//  ----------------------------------------------------------------------------
//  decodePl8(pl8Bytes: Uint8Array, paletteBytes: Uint8Array)
//     => Sprite[]   où   Sprite = {
//          name:   string,            // ex. "sprite_000"
//          width:  number,
//          height: number,
//          rgba:   Uint8ClampedArray  // width*height*4, prêt pour ImageData
//        }
//  (sync OU async — main.js fait `await`.)
//
//  COMMENT PORTER (d'après l'analyse du repo OpenLotR2/tools) :
//  ----------------------------------------------------------------------------
//  1. Copier le moteur de décodage pur depuis le jeu dans src/pl8/ :
//       - lib/pl8-draw.js            (décodage tuiles, RLE, cleanFigure, flood-fill)
//       - le parseur `pl8image` (Pl8.parse / Pl8.model.js)
//     Ce sont des calculs sur tableaux d'octets → ils tournent tels quels.
//
//  2. Buffer : `pl8image` utilise `Buffer`. En navigateur, ajouter le polyfill :
//       pnpm add buffer
//       puis dans ce fichier :  import { Buffer } from 'buffer'
//       (Vite/esbuild l'embarque ; pas de Node requis.)
//
//  3. Entrées fichiers : remplacer tout `fs.readFileSync(path)` par les
//     Uint8Array reçus en argument (pl8Bytes, paletteBytes). La palette .256
//     remplace `readPalette('LORDS2.256')`.
//
//  4. Sortie : NE PAS réintroduire `pngjs` (dépend de zlib/stream Node).
//     Le code d'extraction écrit déjà du RGBA brut (png.data[di] = r,g,b,a) :
//     renvoyer ce buffer tel quel dans `rgba`. main.js le pose sur un <canvas>
//     et fait `canvas.toBlob()` (encodeur PNG natif du navigateur).
//
//  5. Si un .PL8 contient plusieurs sprites/pages, renvoyer un Sprite par image.
//
//  Réfs format : OpenLotR2/tools/.pl8.rst, inspect-pl8.js, extract-*.js
// ============================================================================

// Passe à `true` une fois le moteur réellement branché ci-dessous.
export const DECODER_READY = false

// eslint-disable-next-line no-unused-vars
export async function decodePl8(pl8Bytes, paletteBytes) {
  // --- STUB : à remplacer par l'appel au moteur porté ---------------------
  // Exemple de cible une fois porté :
  //   import { Buffer } from 'buffer'
  //   import { Pl8 } from './pl8/pl8image.js'
  //   import { drawTiles } from './pl8/pl8-draw.js'
  //   const pl8 = Pl8.parse(Buffer.from(pl8Bytes))
  //   const palette = parsePalette(paletteBytes)
  //   return pl8.tiles.map((tile, i) => {
  //     const { width, height, rgba } = drawTiles(tile, palette)
  //     return { name: `sprite_${String(i).padStart(3, '0')}`, width, height, rgba }
  //   })
  throw new Error('DECODER_NOT_WIRED')
}
