// Analytics provider-agnostic, configuré par variables d'env Vite (VITE_*). Copié dans src/ par add-tracking.sh.
// AUCUNE valeur en dur/versionnée : si VITE_ANALYTICS absent, rien n'est injecté.
// VITE_ANALYTICS = 'umami' | 'posthog' | 'ga'. Valeurs = variables de repo GitHub (IDs publics).

const provider = import.meta.env.VITE_ANALYTICS

export function initAnalytics() {
  if (provider === 'umami') initUmami()
  else if (provider === 'posthog') initPostHog()
  else if (provider === 'ga') initGA()
}

function initUmami() {
  const src = import.meta.env.VITE_UMAMI_SRC
  const id = import.meta.env.VITE_UMAMI_ID
  if (!src || !id) return
  const s = document.createElement('script')
  s.async = true
  s.src = src
  s.setAttribute('data-website-id', id)
  document.head.appendChild(s)
}

function initGA() {
  const id = import.meta.env.VITE_GA_ID
  if (!id) return
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  function gtag() { window.dataLayer.push(arguments) }
  gtag('js', new Date())
  gtag('config', id)
}

function initPostHog() {
  const key = import.meta.env.VITE_POSTHOG_KEY
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com'
  if (!key) return
  const s = document.createElement('script')
  s.async = true
  s.src = `${host}/static/array.js`
  s.onload = () => window.posthog && window.posthog.init(key, { api_host: host, person_profiles: 'identified_only' })
  document.head.appendChild(s)
}
