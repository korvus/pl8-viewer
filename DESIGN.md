# DESIGN.md — contrat de design de PL8 Viewer

> Inspiré du concept `DESIGN.md` d'open-design : ce fichier est le **contrat de marque**. Tout rendu visuel (par toi ou par un agent) doit le respecter. Les valeurs vivent aussi en variables CSS dans `src/style.css`.

## Intention
- **Pitch** : un outil web qui décode les fichiers de sprites `.PL8` (+ palette `.256`) de jeux DOS et les exporte en PNG, entièrement dans le navigateur (aucun upload).
- **Public** : moddeurs, archivistes du rétro-gaming, développeurs de portages, curieux du reverse-engineering.
- **Ton** : direct, technique mais accessible, un brin ludique (clin d'œil rétro).
- **Ambiance visuelle** : pixel-art clair — fond clair **texturé** (`public/bg.png`, tuile 190px), accent indigo, blocs aux angles nets avec ombre décalée façon 8-bit, damier de transparence sur les sprites. Le **footer** rompt le motif : bande noire pleine largeur (`#0d0d14`, palette inversée, ombres « pixel » claires via `--foot-line`) hébergeant la vitrine de jeux + le bouton de don.

## Palette
| Rôle | Variable CSS | Valeur |
|---|---|---|
| Fond | `--color-bg` | `#f4f4fb` |
| Surface | `--color-surface` | `#ffffff` |
| Texte | `--color-text` | `#1a1a2e` |
| Texte atténué | `--color-muted` | `#6b6b80` |
| Accent | `--color-accent` | `#4f46e5` |
| Accent doux | `--color-accent-soft` | `#ece9fe` |
| Trait/contour | `--color-line` | `#1a1a2e` |

## Typographie
- Police : `--font-base` = `system-ui, sans-serif` (lisible, neutre ; le caractère rétro vient des formes, pas d'une police pixel).
- Échelle titres : `clamp()` fluide, léger `text-shadow` accent-soft sur le H1.
- Hauteur de ligne corps : 1.55

## Layout & espacements
- Unité de base : 8px (0.5rem)
- Largeur de contenu max : 1000px ; bloc outil max 760px, centré.
- Style : aéré, centré, une colonne. L'outil est le héros (au-dessus de la ligne de flottaison).

## Composants (conventions)
- **Blocs "pixel"** : bordure 2px `--color-line` + `box-shadow` décalée (`4–6px 4–6px 0`), angles nets (`--radius: 4px`).
- **Boutons** : pleins accent, contour net, ombre décalée ; hover = léger décalage ; active = "enfoncé".
- **Zones de dépôt** : bordure pointillée, fond accent-soft au survol/drag, passent en trait plein une fois remplies.
- **Sprites** : `image-rendering: pixelated` + damier de transparence en fond.
- États focus visibles (accessibilité) : obligatoire (`:focus-visible` accent).

## Voix / copy
- Langues : français (défaut) + anglais.
- Style d'écriture : direct, tutoiement, concis. Vocabulaire technique assumé (.PL8, RLE, palette).

## À éviter
- Thème sombre "hacker", néons, animations agressives.
- Lisser/anti-aliaser les sprites (toujours `pixelated`).
- Toute ressource de jeu embarquée (sprites, palette Sierra) — voir AGENTS.md.
