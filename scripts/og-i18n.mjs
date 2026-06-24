// Post-build : génère un HTML par langue avec un <head> traduit (OG/Twitter/title/lang),
// pour que les crawlers (Discord, Facebook…) voient la bonne langue selon l'URL partagée.
//
// Pourquoi : le site est une page unique servie pour /fr et /en (cf public/.htaccess) ; le
// moteur i18n choisit la langue côté JS, mais les crawlers n'exécutent pas le JS → ils lisent
// le <head> statique. On produit donc dist/<lang>.html (à la RACINE, pour que les chemins
// d'assets relatifs « ./assets/… » restent valides) que .htaccess sert sur /<lang>.
//
// dist/index.html garde la langue par défaut (racine "/", le JS y redirige vers /fr ou /en).
import { readFileSync, writeFileSync } from 'node:fs'

const SITE = 'https://pl8.200.work'
const LANGS = ['fr', 'en']                 // 1er = défaut (sert aussi de x-default)
const LOCALES = { fr: 'fr_FR', en: 'en_US' }

const distUrl = (name) => new URL(`../dist/${name}`, import.meta.url)
const i18nUrl = (lang) => new URL(`../src/i18n/${lang}.json`, import.meta.url)

const base = readFileSync(distUrl('index.html'), 'utf8')
const esc = (s) => String(s ?? '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const strings = Object.fromEntries(LANGS.map((l) => {
  const d = JSON.parse(readFileSync(i18nUrl(l), 'utf8'))
  return [l, { title: d.meta_title, desc: d.meta_description, alt: d.og_image_alt }]
}))

function headForLang(src, lang) {
  const { title, desc, alt } = strings[lang]
  const url = `${SITE}/${lang}`
  const altLocales = LANGS.filter((l) => l !== lang).map((l) => LOCALES[l])
  const setAttr = (s, re, value) => s.replace(re, (_m, p1, _old, p2) => `${p1}${esc(value)}${p2}`)

  let out = src
    .replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
    .replace(/<title[^>]*>[\s\S]*?<\/title>/, `<title data-i18n="meta_title">${esc(title)}</title>`)
  out = setAttr(out, /(<meta name="description"[^>]*content=")([^"]*)(")/, desc)
  out = setAttr(out, /(<meta property="og:url" content=")([^"]*)(")/, url)
  out = setAttr(out, /(<meta property="og:title" content=")([^"]*)(")/, title)
  out = setAttr(out, /(<meta property="og:description" content=")([^"]*)(")/, desc)
  out = setAttr(out, /(<meta property="og:image:alt" content=")([^"]*)(")/, alt)
  out = setAttr(out, /(<meta property="og:locale" content=")([^"]*)(")/, LOCALES[lang])
  // Remplace les og:locale:alternate existants par ceux des autres langues.
  out = out.replace(/[ \t]*<meta property="og:locale:alternate"[^>]*>\n?/g, '')
  out = out.replace(/(<meta property="og:locale" content="[^"]*" \/>)/,
    `$1\n    ${altLocales.map((a) => `<meta property="og:locale:alternate" content="${a}" />`).join('\n    ')}`)
  out = setAttr(out, /(<meta name="twitter:title" content=")([^"]*)(")/, title)
  out = setAttr(out, /(<meta name="twitter:description" content=")([^"]*)(")/, desc)

  // canonical + hreflang (idempotent : on retire d'éventuels liens déjà posés).
  out = out.replace(/[ \t]*<link rel="(canonical|alternate)"[^>]*hreflang?[^>]*>\n?/g, '')
  out = out.replace(/[ \t]*<link rel="canonical"[^>]*>\n?/g, '')
  const links = [
    `<link rel="canonical" href="${url}" />`,
    ...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE}/${l}" />`),
    `<link rel="alternate" hreflang="x-default" href="${SITE}/${LANGS[0]}" />`,
  ].map((s) => `    ${s}`).join('\n')
  out = out.replace('</head>', `${links}\n  </head>`)
  return out
}

for (const lang of LANGS) {
  writeFileSync(distUrl(`${lang}.html`), headForLang(base, lang))
  console.log(`✔ dist/${lang}.html (${LOCALES[lang]}) — ${strings[lang].title}`)
}
