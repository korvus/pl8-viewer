# PL8 Viewer

Décode les fichiers de sprites **`.PL8`** (+ palette **`.256`**) de jeux DOS et exporte-les en **PNG**, directement dans ton navigateur.

🔗 **En ligne : https://pl8.200.work**

- 🖥️ **100 % local** — tes fichiers ne quittent jamais ta machine, aucun serveur, aucun upload.
- 🎨 Aperçu en planche-contact, export PNG à l'unité ou en ZIP.
- 🌍 Interface FR / EN.

## Comment ça marche

Le format `.PL8` est un format de sprites paginés utilisé par certains jeux DOS. Tout le décodage (RLE, palettisation, découpe) tourne côté client en JavaScript pur. Tu déposes :

1. un fichier **`.PL8`** (les sprites) ;
2. sa palette **`.256`** (les couleurs).

…et tu récupères les sprites en PNG.

## ⚠️ Ressources de jeu

Cet outil **ne distribue aucune ressource de jeu**. Tu apportes tes propres fichiers, extraits d'une copie que tu possèdes légalement. Aucun sprite ni palette d'un jeu n'est inclus dans ce dépôt.

## Développement

```bash
pnpm install
pnpm dev        # serveur de dev avec hot reload
pnpm build      # build de production → dist/
pnpm preview    # prévisualise le build
```

Le moteur de décodage est isolé dans [`src/decode.js`](src/decode.js) — c'est le seul point à brancher pour faire évoluer le format pris en charge.

Pour les tuiles isométriques à « extra rows », le viewer compare plusieurs
géométries directement à partir des pixels : rangées standard, rangées suivant
les arêtes du losange et rangées inversées. Le mode automatique choisit sprite
par sprite le rendu le plus cohérent, sans dépendre du nom du jeu, du fichier
ou de l'index. Le sélecteur permet aussi de forcer l'un des trois modes pour
inspecter les formats inconnus ou corriger une détection ambiguë.

## Licence

MIT — voir [LICENSE](LICENSE).
