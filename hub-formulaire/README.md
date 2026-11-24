# Hub de navigation — variante « éditeur de formulaires Grist »

Prototype à tester, sur la branche `claude/hub-formulaire`. Le hub y est construit avec **le code de
l'éditeur de formulaires de Grist**, réutilisé tel quel. L'interface et le fonctionnement sont donc
ceux du widget Formulaire :
- blocs sélectionnés au clic ;
- glisser-déposer ;
- bouton vert « + » d'insertion ;
- menu contextuel Copier / Couper / Coller / Supprimer, avec les raccourcis clavier ;
- paragraphes Markdown modifiés sur place ;
- rubriques et colonnes, avec leurs cases « Colonne 2 » à remplir.

Seule différence : le menu « + » propose **Nouveau bouton** (vers une page, un formulaire ou un site
web) à la place de « Nouvelle question ».

## Utilisation

1. Ajoutez un widget personnalisé, avec l'URL de `index.html` de ce dossier et l'**accès complet**.
2. Cliquez sur **Construire le hub**, ou ouvrez **Ouvrir la configuration** dans le menu ⋮ du widget.
3. Pour composer la page :
   - le **+** vert ajoute un bouton ou un bloc ;
   - un clic sélectionne un bloc ;
   - le clic droit ouvre le menu (copier, couper, coller, supprimer) ;
   - glissez les blocs pour les déplacer.
4. Un bouton sélectionné ouvre son panneau à droite : destination, texte, description, icône (celles de
   Grist) et couleur (charte Métropole, palette Metabase ou couleur personnalisée).
5. **Terminé** affiche le hub tel que le voient les lecteurs. Les paragraphes, rubriques et colonnes
   passent par le rendu des formulaires publiés de Grist (`FormRenderer`).

La mise en page est enregistrée dans les options du widget (clé `layout`), au même format JSON que la
mise en page d'un formulaire, avec un type de bloc en plus : `Button`. Comme pour tout widget,
cliquez ensuite sur **Enregistrer** dans le menu du widget.

## Ce qui est réutilisé, ce qui est écrit

| | Fichiers | Lignes |
|---|---|---|
| **Copié de grist-core** (`src/grist/`, Apache-2.0) : `Forms/Model`, `Editor`, `Paragraph`, `Section`, `Columns`, `styles`, `FormRenderer`, `FormRendererCss`, menus, icônes, boutons, champs, variables de thème, utilitaires | 35 | ≈ 10 700 |
| **Cales** (`src/shims/`) : remplacent les modules de Grist liés à l'application, comme les commandes, les traductions, les infobulles et les modales | 14 | ≈ 110 |
| **Adapté de grist-core** : `Forms/Menu.ts` (« Nouveau bouton » au lieu de « Nouvelle question ») et `Forms/elements.ts` (liste des blocs) | 2 | ≈ 135 |
| **Propre au hub** (`src/hub/`) : bloc Bouton, panneau de réglage, vue d'édition (reprend `FormView`), rendu des boutons en lecture, liaison avec Grist | 6 | ≈ 690 |

Les fichiers copiés ne sont pas modifiés, à une exception près. `tools/sync-grist.sh` traduit le
libellé « Column » (écrit en dur en anglais dans `Columns.ts`) en « Colonne ». Pour reprendre une
version plus récente de Grist, changez `GRIST_CORE_COMMIT` dans `tools/sync-grist.sh`, puis lancez :

```bash
npm install
npm run sync    # copie les fichiers de grist-core (commit indiqué dans le script)
npm run build   # produit dist/hub.js (esbuild)
```

`dist/hub.js` est versionné pour que la page puisse être servie telle quelle.

## Limites du prototype

- Pas de thème Métropole : l'apparence est celle de Grist, en attendant le choix du design global.
- Les icônes sont celles de Grist (environ 40 proposées), pas Lucide.
- En lecture, la largeur est limitée à 960 px.
- Hors de Grist, le widget affiche une démonstration avec des pages fictives.

## Licence

Les fichiers de `src/grist/` viennent de [grist-core](https://github.com/gristlabs/grist-core)
(Grist Labs, licence Apache-2.0, texte dans `src/grist/LICENSE.txt`), au commit indiqué dans
`src/grist/COMMIT`. `src/shims/app/client/components/Forms/Menu.ts`, `elements.ts` et
`src/hub/HubView.ts` en sont adaptés et le signalent en tête de fichier.
