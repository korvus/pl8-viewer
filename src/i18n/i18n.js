// Moteur i18n vanilla, sans dépendance (pattern drevesa). Copié tel quel dans src/i18n/ par add-i18n.sh.
//
// HTML : <h1 data-i18n="cle">…</h1> ; attributs : data-i18n-attr="placeholder:cle,title:cle2"
// Sélecteur : <div id="langs"></div> (auto-masqué si une seule langue)
// Tokens dans les chaînes : [br] et [a href='url']label[/a].

import { dictionaries, languageOptions, defaultLanguage } from './languages.js'

const STORAGE_KEY = 'lang'

function detect() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && dictionaries[saved]) return saved
  const nav = (navigator.language || defaultLanguage).slice(0, 2)
  if (dictionaries[nav]) return nav
  return defaultLanguage
}

let current = detect()

export function getLanguage() {
  return current
}

export function t(key) {
  const dict = dictionaries[current] || dictionaries[defaultLanguage]
  return dict[key] ?? dictionaries[defaultLanguage]?.[key] ?? key
}

function renderRich(str) {
  return String(str)
    .replace(/\[br\]/g, '<br>')
    .replace(/\[a href='([^']+)'\]([^[]+)\[\/a\]/g, '<a href="$1" target="_blank" rel="noopener">$2</a>')
}

export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.innerHTML = renderRich(t(el.getAttribute('data-i18n')))
  })
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.getAttribute('data-i18n-attr').split(',').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim())
      if (attr && key) el.setAttribute(attr, t(key))
    })
  })
  document.documentElement.lang = current
}

export function setLanguage(lang) {
  if (!dictionaries[lang]) return
  current = lang
  localStorage.setItem(STORAGE_KEY, lang)
  applyTranslations()
  renderSelector()
}

export function renderSelector(containerId = 'langs') {
  const c = document.getElementById(containerId)
  if (!c) return
  const codes = Object.keys(languageOptions)
  if (codes.length < 2) { c.innerHTML = ''; return }
  c.innerHTML = codes
    .map((code) => `<button type="button" data-lang="${code}" class="${code === current ? 'active' : ''}">${languageOptions[code]}</button>`)
    .join('')
  c.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => setLanguage(b.dataset.lang)))
}

export function initI18n() {
  applyTranslations()
  renderSelector()
}
