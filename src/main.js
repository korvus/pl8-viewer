import { initAnalytics } from './analytics.js'
import { initI18n, t } from './i18n/i18n.js'
import { decodePl8 } from './decode.js'
import { makeZip } from './zip.js'

initI18n()
initAnalytics()

// --- État ---
const state = { pl8: null, pal: null, sprites: [] }

const $ = (id) => document.getElementById(id)
const els = {
  filePl8: $('file-pl8'), filePal: $('file-pal'),
  dropPl8: $('drop-pl8'), dropPal: $('drop-pal'),
  namePl8: $('name-pl8'), namePal: $('name-pal'),
  decode: $('btn-decode'), zip: $('btn-zip'),
  status: $('status'), results: $('results'), count: $('results-count'), sheet: $('sheet'),
}

// --- Sélection de fichiers (input + glisser-déposer) ---
function bindDrop(slot, input, drop, nameEl) {
  const setFile = (file) => {
    if (!file) return
    state[slot] = file
    nameEl.textContent = file.name
    drop.classList.add('filled')
    refresh()
  }
  input.addEventListener('change', () => setFile(input.files[0]))
  ;['dragenter', 'dragover'].forEach((e) =>
    drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.add('dragover') }))
  ;['dragleave', 'drop'].forEach((e) =>
    drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.remove('dragover') }))
  drop.addEventListener('drop', (ev) => setFile(ev.dataTransfer.files[0]))
}
bindDrop('pl8', els.filePl8, els.dropPl8, els.namePl8)
bindDrop('pal', els.filePal, els.dropPal, els.namePal)

function refresh() {
  els.decode.disabled = !(state.pl8 && state.pal)
}

function setStatus(msg, isError = false) {
  els.status.textContent = msg || ''
  els.status.classList.toggle('error', isError)
}

const readBytes = (file) =>
  file.arrayBuffer().then((buf) => new Uint8Array(buf))

// --- Rendu d'un sprite sur canvas ---
function spriteToCanvas(sprite) {
  const c = document.createElement('canvas')
  c.width = sprite.width
  c.height = sprite.height
  const ctx = c.getContext('2d')
  ctx.putImageData(new ImageData(sprite.rgba, sprite.width, sprite.height), 0, 0)
  return c
}

const canvasToPngBytes = (canvas) =>
  new Promise((resolve) =>
    canvas.toBlob((blob) => blob.arrayBuffer().then((b) => resolve(new Uint8Array(b))), 'image/png'))

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// --- Décodage ---
els.decode.addEventListener('click', async () => {
  if (!(state.pl8 && state.pal)) { setStatus(t('err_need_both'), true); return }
  setStatus(t('decoding'))
  els.decode.disabled = true
  try {
    const [pl8Bytes, palBytes] = await Promise.all([readBytes(state.pl8), readBytes(state.pal)])
    state.sprites = await decodePl8(pl8Bytes, palBytes)
    renderResults()
    setStatus('')
  } catch (err) {
    if (err && err.message === 'DECODER_NOT_WIRED') {
      setStatus(t('err_not_ready'), true)
    } else {
      setStatus(t('err_decode').replace('[msg]', err?.message || String(err)), true)
    }
  } finally {
    els.decode.disabled = !(state.pl8 && state.pal)
  }
})

function renderResults() {
  els.sheet.innerHTML = ''
  els.count.textContent = t('results_count').replace('[n]', state.sprites.length)
  state.sprites.forEach((sprite) => {
    const canvas = spriteToCanvas(sprite)
    const fig = document.createElement('figure')
    const cap = document.createElement('figcaption')
    cap.textContent = sprite.name
    fig.append(canvas, cap)
    fig.title = `${sprite.width}×${sprite.height}`
    fig.addEventListener('click', async () => {
      const png = await new Promise((r) => canvas.toBlob(r, 'image/png'))
      downloadBlob(png, `${sprite.name}.png`)
    })
    els.sheet.appendChild(fig)
  })
  els.results.hidden = state.sprites.length === 0
}

// --- Téléchargement ZIP de tous les sprites ---
els.zip.addEventListener('click', async () => {
  if (!state.sprites.length) return
  const files = []
  for (const sprite of state.sprites) {
    const bytes = await canvasToPngBytes(spriteToCanvas(sprite))
    files.push({ name: `${sprite.name}.png`, bytes })
  }
  downloadBlob(makeZip(files), 'pl8-sprites.zip')
})
