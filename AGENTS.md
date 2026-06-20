# <NOM_DU_PROJET>

> Couche projet (voir le `AGENTS.md` racine du homelab pour le contexte serveur global). Lu par Claude Code via le symlink `CLAUDE.md`. Voir `DESIGN.md` pour le contrat de design.

## Résumé
<UNE_PHRASE_DECRIVANT_LE_PROJET>

## Stack
- **Vite** (vanilla JS, sans framework)
- **CSS classique** (variables CSS dans `src/style.css`)
- Hébergement : Hostinger, sous-domaine `<SOUS_DOMAINE>.<DOMAINE>`

## Commandes
| But | Commande |
|---|---|
| Installer les deps | `pnpm install` |
| Dev (hot reload) | `pnpm dev` |
| Build prod | `pnpm build` → `dist/` |
| Prévisualiser le build | `pnpm preview` |
| Déployer | `git push` sur `main` (CI FTPS automatique) |

## Structure
- `index.html` — point d'entrée (texte via attributs `data-i18n`)
- `src/main.js` — logique (initialise l'i18n)
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
<SPECIFICITES>
