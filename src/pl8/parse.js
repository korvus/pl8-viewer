// Parseur .PL8 — pur JavaScript (DataView), sans dépendance.
//
// Réimplémente `Pl8.parse` de la lib `pl8image` (binary-parser + Buffer Node)
// directement sur l'ArrayBuffer du navigateur. Le format est documenté dans
// OpenLotR2/tools/.pl8.rst :
//
//   En-tête (8 octets)
//     0-1  type           uint16LE  (bit 0 = encodage RLE pour tout le fichier)
//     2-3  numberOfTile   uint16LE
//     4-7  inconnu        uint32LE
//   Puis numberOfTile descripteurs de 16 octets :
//     width    uint16LE
//     height   uint16LE
//     offset   uint32LE   (position des données pixel dans le fichier)
//     x, y     uint16LE   (position dans la planche, pour les tuiles iso)
//     extraType uint8     (0 brut, 1 iso, 2 iso+rangées, 3 gauche, 4 droite)
//     extraRows uint8
//     inconnu  uint16LE

const HEADER = 8
const TILE_DESC = 16

export function parsePl8(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const type = dv.getUint16(0, true)
  const numberOfTile = dv.getUint16(2, true)

  const tiles = []
  for (let i = 0; i < numberOfTile; i++) {
    const p = HEADER + i * TILE_DESC
    tiles.push({
      width: dv.getUint16(p, true),
      height: dv.getUint16(p + 2, true),
      offset: dv.getUint32(p + 4, true),
      x: dv.getUint16(p + 8, true),
      y: dv.getUint16(p + 10, true),
      extraType: dv.getUint8(p + 12),
      extraRows: dv.getUint8(p + 13),
    })
  }

  // `rle` au niveau fichier : bit 0 du type. Sert d'indice principal pour
  // décider raw vs RLE sur les tuiles extraType 0 (voir draw.js).
  return { type, rle: (type & 1) === 1, tiles }
}

// Longueur de données disponible pour une tuile = jusqu'au prochain offset de
// tuile supérieur, sinon jusqu'à la fin du fichier. Utilisé pour distinguer
// une tuile brute (width*height octets) d'une tuile RLE (données plus courtes).
export function availableData(tile, tiles, totalLength) {
  let next = totalLength
  for (const t of tiles) {
    if (t.offset > tile.offset && t.offset < next) next = t.offset
  }
  return next - tile.offset
}
