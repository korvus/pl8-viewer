// Mini-écrivain ZIP sans dépendance (méthode "store", pas de compression).
// Suffisant pour empaqueter des PNG déjà compressés. Renvoie un Blob.

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(bytes) {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

// files: Array<{ name: string, bytes: Uint8Array }>
export function makeZip(files) {
  const enc = new TextEncoder()
  const chunks = []
  const central = []
  let offset = 0

  const u16 = (n) => new Uint8Array([n & 0xff, (n >>> 8) & 0xff])
  const u32 = (n) => new Uint8Array([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff])
  const push = (arr) => { chunks.push(arr); offset += arr.length }

  for (const f of files) {
    const name = enc.encode(f.name)
    const crc = crc32(f.bytes)
    const size = f.bytes.length
    const localOffset = offset

    // Local file header
    push(u32(0x04034b50))
    push(u16(20)); push(u16(0)); push(u16(0)) // version, flags, method=store
    push(u16(0)); push(u16(0))                // time, date
    push(u32(crc)); push(u32(size)); push(u32(size))
    push(u16(name.length)); push(u16(0))
    push(name)
    push(f.bytes)

    // Central directory record (stocké pour la fin)
    const c = []
    const cpush = (a) => c.push(a)
    cpush(u32(0x02014b50))
    cpush(u16(20)); cpush(u16(20)); cpush(u16(0)); cpush(u16(0))
    cpush(u16(0)); cpush(u16(0))
    cpush(u32(crc)); cpush(u32(size)); cpush(u32(size))
    cpush(u16(name.length)); cpush(u16(0)); cpush(u16(0))
    cpush(u16(0)); cpush(u16(0)); cpush(u32(0))
    cpush(u32(localOffset))
    cpush(name)
    central.push({ parts: c, size: c.reduce((s, a) => s + a.length, 0) })
  }

  const cdStart = offset
  let cdSize = 0
  for (const rec of central) { rec.parts.forEach(push); cdSize += rec.size }

  // End of central directory
  push(u32(0x06054b50))
  push(u16(0)); push(u16(0))
  push(u16(files.length)); push(u16(files.length))
  push(u32(cdSize)); push(u32(cdStart)); push(u16(0))

  return new Blob(chunks, { type: 'application/zip' })
}
