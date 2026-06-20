# vite-template

Repo **template** utilisé par `/bootstrap` pour démarrer un projet **Vite** (vanilla JS + CSS) hébergé sur Hostinger.

## Fournit
- **Vite** vanilla (`pnpm dev` / `build` / `preview`), `base: './'` (chemins relatifs).
- `.github/workflows/deploy.yml` — déploiement **FTPS branch-aware** : `main` → prod publique, `dev` → staging verrouillé (Basic Auth). Workflow : bosser sur `dev` (preview privée), merge `dev`→`main` + push = prod. Analytics actif sur main seulement.
- `AGENTS.md` (+ symlink `CLAUDE.md`) — couche projet + working agreement Claude Code.
- `DESIGN.md` — contrat de design (concept open-design).
- `.env.example` — modèle des variables d'env analytics ; `deploy.yml` passe les `VITE_*` au build.
- `src/main.js` (vide) + `src/style.css`.

> Template **bare** : l'i18n et l'analytics ne sont PAS inclus ici. Ils sont **composés par `/bootstrap`** via les skills dédiés (`i18n`, `tracking`) — source de vérité unique, pas de duplication. Utilisables aussi seuls sur un projet existant :
> - `~/.claude/skills/i18n/scripts/add-i18n.sh <dir> <langs>`
> - `~/.claude/skills/tracking/scripts/add-tracking.sh <dir> --provider=umami --repo=… --name=… --domain=…`

## Ce que `/bootstrap` configure par projet
- Crée le sous-domaine Hostinger + variable `DEPLOY_DIR` = `/domains/<domaine>/public_html/<sous-domaine>/`.
- Pose les secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.
- Pré-remplit `AGENTS.md` et `DESIGN.md` via un assistant Q&A.
- Configure les **langues** (ajoute/retire des `src/i18n/<code>.json`) ; une seule langue → sélecteur masqué.

## Usage manuel
`gh repo create mon-app --template korvus/vite-template --private --clone`
