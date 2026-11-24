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
4. Un bouton sélectionné ouvre son panneau à droite : destination, texte, description, icône (24 icônes
   Lucide choisies pour un hub : accueil, page, tableau, statistiques, agenda, équipe, formulaire,
   courriel, téléphone, lieu, site web, aide…) et couleur (charte Métropole, palette Metabase ou
   couleur personnalisée).
5. **Terminé** affiche le hub tel que le voient les lecteurs. Les paragraphes, rubriques et colonnes
   passent par le rendu des formulaires publiés de Grist (`FormRenderer`).

La mise en page est enregistrée dans les options du widget (clé `layout`), au même format JSON que la
mise en page d'un formulaire, avec un type de bloc en plus : `Button`. Comme pour tout widget,
cliquez ensuite sur **Enregistrer** dans le menu du widget.

## Ce qui est réutilisé, ce qui est écrit

| | Fichiers | Lignes |
|---|---|---|
| **Copié de grist-core sans modification** (`src/grist/`, Apache-2.0) : l'éditeur de formulaires (`Forms/Model`, `Editor`, `Paragraph`, `Section`, `Columns`, `styles`), le rendu des formulaires publiés (`FormRenderer`), et tout ce qu'ils importent : commandes et raccourcis, traductions (i18next), infobulles, menus, icônes, boutons, thème, adresses… | 131 | ≈ 34 800 |
| **Traductions et icônes de Grist** (`locales/`, `public/grist-icons.css`) | 3 | — |
| **Icônes des boutons** : 24 icônes de [Lucide](https://lucide.dev) (licence ISC), dans `src/hub/icons.ts` | 1 | — |
| **Remplacés**, car liés au document Grist ouvert : `Forms/FormView` (sert seulement de type) et `Forms/Field` (une question = une colonne de table) | 2 | 4 |
| **Adapté de grist-core** : `Forms/Menu.ts` (« Nouveau bouton » au lieu de « Nouvelle question ») et `Forms/elements.ts` (liste des blocs) | 2 | ≈ 135 |
| **Propre au hub** (`src/hub/`) : bloc Bouton, panneau de réglage, vue d'édition (reprend `FormView`), rendu des boutons en lecture, démarrage et liaison avec Grist | 6 | ≈ 720 |

Le démarrage (`src/hub/main.ts`) fait ce que fait l'application Grist (`app/client/ui/App.ts`) :
- `window.gristConfig` ;
- `commands.init()` ;
- `setupLocale()`, qui charge les traductions officielles de Grist depuis `locales/`.

Le code de Grist charge certaines parties à la demande, par des imports dynamiques regroupés dans
`app/client/lib/imports.js` : document complet, pages d'administration, éditeur de code,
graphiques, calendrier… Le hub n'emprunte jamais ces chemins. `tools/build.mjs` les remplace donc
par des modules vides au lieu de les embarquer, et en affiche la liste (22) à chaque construction.

Les fichiers copiés ne sont pas modifiés, à une exception près. `tools/sync-grist.sh` traduit le
libellé « Column » (écrit en dur en anglais dans `Columns.ts`) en « Colonne ». Il copie les points
d'entrée et tout ce qu'ils importent, puis aligne les versions des dépendances de `package.json` sur
celles de grist-core. Pour reprendre une version plus récente de Grist, changez `GRIST_CORE_COMMIT`
dans `tools/sync-grist.sh`, puis lancez :

```bash
npm run sync      # copie le code de grist-core et aligne les dépendances
npm install
npm run build     # produit dist/hub.js (esbuild, mêmes options TypeScript que Grist)
```

`dist/hub.js` (≈ 650 Ko) est versionné pour que la page puisse être servie telle quelle.

## Limites du prototype

- Grist ne donne pas à ses widgets l'accès au presse-papiers du système. Copier, couper et coller
  fonctionnent donc à l'intérieur du hub (clic droit ou Ctrl+C, X, V), mais pas vers une autre
  application.
- Thème sombre de Grist : pas encore vérifié dans un vrai Grist.

- Pas de thème Métropole : l'apparence est celle de Grist, en attendant le choix du design global.
- En lecture, la largeur est limitée à 960 px.
- Hors de Grist, le widget affiche une démonstration avec des pages fictives.

## Licence

Les fichiers de `src/grist/` viennent de [grist-core](https://github.com/gristlabs/grist-core)
(Grist Labs, licence Apache-2.0, texte dans `src/grist/LICENSE.txt`), au commit indiqué dans
`src/grist/COMMIT`. `src/shims/app/client/components/Forms/Menu.ts`, `elements.ts` et
`src/hub/HubView.ts` en sont adaptés et le signalent en tête de fichier.
