// Dessin d'une tuile .PL8 vers du RGBA — porté de OpenLotR2/tools/lib/pl8-draw.js.
//
// Chaque tuile est rendue dans sa propre grille (sprite autonome), index de
// palette 0 = transparent. Trois encodages :
//   - iso (extraType 1/2/3/4) : losange centré + éventuelles « extra rows »
//     (hauts de bâtiments) que pl8image ne dessinait pas ;
//   - brut (extraType 0, données = width*height) : bitmap simple ;
//   - RLE (extraType 0, données plus courtes) : flux de jetons.

// Taille exacte (en octets) des données d'une tuile iso, selon son type.
function isoTileSize(t) {
  switch (t.extraType) {
    case 2: return t.height * t.height + t.extraRows * t.width
    case 3:
    case 4: return t.height * t.height + t.extraRows * (t.width / 2 + 1)
    default: return t.height * t.height // type 1 : losange seul
  }
}

// Losange iso (+ extra rows) dessiné à l'origine via put(x, y, indexPalette).
function drawIso(tile, data, put) {
  const h = tile.height
  const half = h / 2
  let s = 0

  for (let r = 0; r < h; r++) {
    const k = r < half ? r : h - 1 - r
    const start = (half - 1 - k) * 2
    const stop = start + k * 4 + 2
    for (let w = start; w < stop; w++) {
      const v = data[s++]
      if (v) put(w, r, v)
    }
  }

  if (tile.extraType === 2 || tile.extraType === 3 || tile.extraType === 4) {
    const rowW = tile.extraType === 2 ? tile.width : tile.width / 2 + 1
    const offX = tile.extraType === 4 ? tile.width - rowW : 0
    for (let e = 0; e < tile.extraRows; e++) {
      for (let w = 0; w < rowW; w++) {
        const v = data[s++]
        if (v) put(offX + w, half - tile.extraRows + e, v)
      }
    }
  }
}

// Bitmap brut : un octet (index palette) par pixel, 0 = transparent.
function drawRaw(tile, data, put) {
  const w = tile.width
  for (let i = 0; i < w * tile.height; i++) {
    const v = data[i]
    if (v) put(i % w, (i / w) | 0, v)
  }
}

// RLE : `00 XX` = saut transparent de XX pixels ; `NN > 0` = NN octets littéraux.
// Les lignes font exactement `width` pixels.
function drawRle(tile, data, put) {
  let s = 0
  let cx = 0
  let cy = 0
  while (s < data.length && cy < tile.height) {
    const n = data[s++]
    if (n === 0) {
      cx += data[s++]
    } else {
      for (let k = 0; k < n; k++) {
        const v = data[s++]
        if (v) put(cx, cy, v)
        cx++
      }
    }
    while (cx >= tile.width) { cx -= tile.width; cy++ }
  }
}

// Décode une tuile en sprite RGBA autonome.
//   tile     : descripteur issu de parsePl8
//   bytes    : Uint8Array du fichier .PL8 entier
//   palette  : tableau de 256 [r, g, b]
//   rleFile  : bit RLE du fichier
//   avail    : octets disponibles pour cette tuile (cf availableData)
// Renvoie { width, height, rgba } ou null si la tuile est vide.
//
// Les tuiles iso à « extra rows » (hauts de bâtiments) débordent au-dessus du
// losange (y négatif). On dessine d'abord dans une liste de pixels, puis on
// cadre sur leur boîte englobante : la grille s'étend pour tout contenir et le
// sprite est rogné au plus juste. Les tuiles brutes/RLE gardent leurs
// dimensions width×height (cadre prévisible, jamais de débordement).
export function decodeTile(tile, bytes, palette, rleFile, avail) {
  if (!tile.width || !tile.height) return null

  const pixels = []
  const collect = (x, y, v) => { if (v) pixels.push(x, y, v) }

  const iso = tile.extraType >= 1 && tile.extraType <= 4
  if (iso) {
    const len = isoTileSize(tile)
    drawIso(tile, bytes.subarray(tile.offset, tile.offset + len), collect)
  } else {
    const rawLen = tile.width * tile.height
    // RLE si le fichier l'indique, ou si les données sont plus courtes que le
    // bitmap brut attendu (cas des troupeaux/drapeaux dans un fichier mixte).
    const isRle = rleFile || avail < rawLen
    if (isRle) drawRle(tile, bytes.subarray(tile.offset, tile.offset + avail), collect)
    else drawRaw(tile, bytes.subarray(tile.offset, tile.offset + rawLen), collect)
  }

  if (pixels.length === 0) return null

  // Cadre : bbox pour l'iso (déborde), dimensions de la tuile pour brut/RLE.
  let offX = 0
  let offY = 0
  let w = tile.width
  let h = tile.height
  if (iso) {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (let i = 0; i < pixels.length; i += 3) {
      const x = pixels[i]
      const y = pixels[i + 1]
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    offX = -minX
    offY = -minY
    w = maxX - minX + 1
    h = maxY - minY + 1
  }

  const rgba = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < pixels.length; i += 3) {
    const x = pixels[i] + offX
    const y = pixels[i + 1] + offY
    if (x < 0 || y < 0 || x >= w || y >= h) continue
    const c = palette[pixels[i + 2]]
    if (!c) continue
    const di = (y * w + x) * 4
    rgba[di] = c[0]
    rgba[di + 1] = c[1]
    rgba[di + 2] = c[2]
    rgba[di + 3] = 255
  }

  return { width: w, height: h, rgba }
}
