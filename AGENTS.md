# PL8 Viewer

> Couche projet (voir le `AGENTS.md` racine du homelab pour le contexte serveur global). Lu par Claude Code via le symlink `CLAUDE.md`. Voir `DESIGN.md` pour le contrat de design.

## Résumé
Outil web statique qui décode les fichiers de sprites `.PL8` (+ palette `.256`) de jeux DOS et les exporte en PNG, 100 % côté navigateur (aucun upload serveur). Le moteur de décodage est réutilisé depuis le portage OpenLotR2 (`pl8-draw.js` / `pl8image`).

## Stack
- **Vite** (vanilla JS, sans framework)
- **CSS classique** (variables CSS dans `src/style.css`)
- Hébergement : Hostinger, sous-domaine `pl8.200.work`

## Commandes
| But | Commande |
|---|---|
| Installer les deps | `pnpm install` |
| Dev (hot reload) | `pnpm dev` |
| Build prod | `pnpm build` → `dist/` |
| Prévisualiser le build | `pnpm preview` |
| Déployer | `git push` sur `main` (CI FTPS automatique) |

## Structure
- `index.html` — landing + UI de l'outil (texte via attributs `data-i18n`)
- `src/main.js` — câblage UI : sélection/drag-drop des fichiers, appel du décodeur, rendu canvas, export PNG/ZIP
- `src/decode.js` — **POINT D'INTÉGRATION du décodeur** (stub à porter, voir « Notes spécifiques »)
- `src/zip.js` — mini-écrivain ZIP sans dépendance (méthode store) pour « tout télécharger »
- `src/style.css` — styles (suit `DESIGN.md`)
- `src/i18n/` — traductions : `languages.js` (langues actives), `<code>.json` (dictionnaires), `i18n.js` (moteur)
- `src/analytics.js` — injection analytics provider-agnostic (umami/posthog/ga)
- `.env.example` — modèle des variables d'env (analytics) ; `.env` réel = gitignored
- `.github/workflows/deploy.yml` — déploiement FTPS au push

## Traductions (i18n)
- Pattern vanilla inspiré de drevesa : un JSON par langue + sélecteur + détection/persistance (localStorage).
- **Ajouter du texte traduisible** : `<h1 data-i18n="ma_cle">…</h1>` et ajouter `"ma_cle"` dans chaque `src/i18n/<code>.json`. Attributs : `data-i18n-attr="placeholder:cle"`.
- **Tokens** dans les chaînes : `[br]`, `[a href='url']label[/a]`.
- **Ajouter une langue** : créer `src/i18n/<code>.json`, l'importer dans `languages.js` (`dictionaries` + `languageOptions`).
- Le sélecteur (`#langs`) se masque automatiquement s'il n'y a qu'une langue.

## Analytics (provider-agnostic)
- `src/analytics.js` n'injecte un tag **que si** configuré par variable d'env (sinon rien).
- Provider via `VITE_ANALYTICS` = `umami` | `posthog` | `ga`. Config associée : `VITE_UMAMI_SRC`/`VITE_UMAMI_ID`, `VITE_GA_ID`, `VITE_POSTHOG_KEY`/`VITE_POSTHOG_HOST`.
- **Valeurs JAMAIS versionnées** : variables de repo GitHub (publiques par nature), injectées au build (cf `env:` dans deploy.yml). `.env` local gitignored ; voir `.env.example`.
- Providers eux-mêmes (Umami self-host NUC, PostHog cloud, GA) : NON décidés/installés — à brancher plus tard. Défaut envisagé pour les sites = Umami.

## Working agreement (Claude Code)
- **Plan d'abord** pour toute tâche non triviale ; proposer avant d'implémenter.
- **Changements minimaux**, cohérents avec le style existant.
- **Confirmer** avant toute action destructive ou sortante (suppression, déploiement manuel forcé).
- Respecter `DESIGN.md` pour toute décision visuelle (couleurs, typo, espacements).
- Les règles non négociables (lint/format) → hooks, pas seulement ce fichier.

## Déploiement
- Push sur `main` → GitHub Actions build (`pnpm build`) puis envoie `dist/` en **FTPS** vers Hostinger.
- Cible (`server-dir`) = variable de repo `DEPLOY_DIR` = `/<SOUS_DOMAINE>/`.
- Secrets requis (posés par `/bootstrap`) : `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.

## Notes spécifiques

### Brancher le décodeur (tâche principale restante)
Toute l'UI est prête et appelle `decodePl8(pl8Bytes, paletteBytes)` dans `src/decode.js`, qui est pour l'instant un **stub** (`DECODER_READY = false`, jette `DECODER_NOT_WIRED` → l'UI affiche un message clair). Pour rendre l'outil fonctionnel, porter le moteur depuis le repo du jeu **OpenLotR2** (dossier `tools/`) :
- copier `lib/pl8-draw.js` + le parseur `pl8image` (`Pl8.parse`) dans `src/pl8/` ;
- `pnpm add buffer` puis `import { Buffer } from 'buffer'` (polyfill navigateur du `Buffer` Node) ;
- remplacer les `fs.readFileSync(...)` par les `Uint8Array` reçus en argument ; la palette `.256` remplace `readPalette('LORDS2.256')` ;
- **supprimer `pngjs`** (dépend de zlib/stream Node) : renvoyer le RGBA brut, l'UI fait `canvas.toBlob()` ;
- respecter le contrat de retour documenté en tête de `src/decode.js` (`{name,width,height,rgba}[]`), puis passer `DECODER_READY = true`.

Ce travail se fait côté **Windows** (là où vit OpenLotR2), puis `git push` → déploiement auto. Réfs format : `OpenLotR2/tools/.pl8.rst`, `inspect-pl8.js`, `extract-*.js`.

### ⚠️ Copyright — règle non négociable
Ce repo est **public** et ne doit contenir **AUCUNE ressource de jeu** : pas de `.PL8`, pas de palette `.256`/Sierra, pas de sprite extrait, pas de fichier de `FR/C/LORDS2/`. L'outil fonctionne parce que **l'utilisateur apporte ses propres fichiers** (décodage 100 % local, rien n'est uploadé). Ne jamais committer d'asset de test issu du jeu — utiliser un `.gitignore` strict pour les dossiers de samples locaux.
