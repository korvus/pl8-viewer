# DESIGN.md — contrat de design de <NOM_DU_PROJET>

> Inspiré du concept `DESIGN.md` d'open-design : ce fichier est le **contrat de marque**. Tout rendu visuel (par toi ou par un agent) doit le respecter. Pré-rempli par `/bootstrap`, à affiner ensuite. Les valeurs vivent aussi en variables CSS dans `src/style.css`.

## Intention
- **Pitch** : <CE_QUE_FAIT_LE_SITE>
- **Public** : <CIBLE>
- **Ton** : <ex. sobre / ludique / pro / chaleureux>
- **Ambiance visuelle** : <ex. minimaliste, contrasté, doux, brutaliste>

## Palette
| Rôle | Variable CSS | Valeur |
|---|---|---|
| Fond | `--color-bg` | `#ffffff` |
| Texte | `--color-text` | `#1a1a1a` |
| Accent | `--color-accent` | `#4f46e5` |

## Typographie
- Police : `--font-base` = `system-ui, sans-serif` (<remplacer si police custom>)
- Échelle titres : `clamp()` fluide
- Hauteur de ligne corps : 1.5

## Layout & espacements
- Unité de base : 8px (0.5rem)
- Largeur de contenu max : <ex. 1100px>
- Style : <ex. aéré, dense, centré>

## Composants (conventions)
- Boutons : <forme, rayon, états hover/focus>
- Cartes : <ombre, bordure, rayon>
- États focus visibles (accessibilité) : obligatoire

## Voix / copy
- Langue : français
- Style d'écriture : <ex. direct, tutoiement, concis>

## À éviter
- <anti-patterns visuels : ex. trop de couleurs, animations agressives>
