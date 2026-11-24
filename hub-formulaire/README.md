# Hub de navigation — variante « éditeur de formulaires Grist »

Prototype à tester, sur la branche `claude/hub-formulaire`. Le hub y est construit avec **le code de
l'éditeur de formulaires de Grist**, réutilisé tel quel. L'interface et le fonctionnement sont donc
ceux du widget Formulaire :
- blocs sélectionnés au clic ;
- glisser-déposer ;
- bouton vert « + » d'insertion ;
- menu contextuel Insérer / Supprimer ;
- paragraphes Markdown modifiés sur place ;
- rubriques et colonnes, avec leurs cases « Colonne 2 » à remplir.

Seule différence : le menu « + » propose **Nouveau bouton** à la place de « Nouvelle question ». Ses
sous-menus listent les pages et les formulaires du document, comme Grist liste les champs non
affichés ; « Vers un site web » ajoute un lien externe.

## Utilisation

1. Ajoutez un widget personnalisé, avec l'URL de `index.html` de ce dossier et l'**accès complet**.
2. Un hub vide s'ouvre directement dans l'éditeur. Ensuite, on y revient par **Ouvrir la
   configuration** dans le menu ⋮ du widget.
3. Pour composer la page :
   - le **+** vert, ou une case « Colonne » vide, ajoute un bouton (choisissez la page ou le
     formulaire dans le sous-menu) ou un bloc ;
   - un clic sélectionne un bloc ; sur un bloc sélectionné, un clic sur un texte le modifie, comme
     le libellé d'une question (Entrée enregistre, Échap annule) ;
   - le clic droit ouvre le menu : insérer au-dessus ou en dessous, supprimer ;
   - glissez les blocs pour les déplacer.
4. Un bouton vers un site web affiche son adresse sous son texte, dans l'éditeur seulement ; elle se
   modifie au clic, comme le texte. Un nouveau bouton de ce type ouvre directement sa saisie.
5. L'icône dépend de la destination : 📄 page, 📝 formulaire, 🌐 site web. Toutes les tuiles ont
   le vert du bouton « Envoyer » des formulaires.
6. **Terminé** affiche le hub tel que le voient les lecteurs. Les paragraphes, rubriques et colonnes
   passent par le rendu des formulaires publiés de Grist (`FormRenderer`).
7. Si la page ou le formulaire d'un bouton est supprimé du document, le bouton reste, grisé et sans
   lien, avec « Page à choisir » ou « Formulaire à choisir » s'il n'a pas de texte. C'est le principe
   du Formulaire, qui retire les questions dont la colonne a été supprimée (`cleanFormLayoutSpec`).

La mise en page est enregistrée dans les options du widget (clé `layout`), au même format JSON que la
mise en page d'un formulaire, avec un type de bloc en plus : `Button`. Comme pour tout widget,
cliquez ensuite sur **Enregistrer** dans le menu du widget.

## Ce qui est réutilisé, ce qui est écrit

| | Fichiers | Lignes |
|---|---|---|
| **Copié de grist-core** (`src/grist/`, Apache-2.0) : l'éditeur de formulaires (`Forms/Model`, `Editor`, `Paragraph`, `Section`, `Columns`, `styles`), le rendu des formulaires publiés (`FormRenderer`), et tout ce qu'ils importent : commandes et raccourcis, traductions (i18next), infobulles, menus, icônes, boutons, thème, adresses… | 131 | ≈ 34 800 |
| **Retouches de ces fichiers** (`tools/grist.patch`), comme Grist Labs les ferait : le type de bloc « Button » et son rendu en lecture dans `FormRenderer.ts`, le libellé « Colonne » dans `Columns.ts` | 2 | 22 modifiées |
| **Traductions et icônes de Grist** (`locales/`, `public/grist-icons.css`) | 3 | — |
| **Remplacés**, car liés à l'application ou au document Grist : `Forms/FormView` et `ui/App` (servent seulement de types), `Forms/Field` (une question = une colonne de table) | 3 | 23 |
| **Adapté de grist-core** : `Forms/Menu.ts` (« Nouveau bouton » et ses sous-menus au lieu de « Nouvelle question ») et `Forms/elements.ts` (liste des blocs) | 2 | ≈ 150 |
| **Propre au hub** (`src/hub/`) : bloc Bouton (`Button.ts`), vue d'édition (`HubView.ts`, reprend `FormView`), tuile (`tile.ts`), hub en lecture (`HubPage.ts`), pages et formulaires du document (`HubContext.ts`), démarrage et liaison avec Grist (`main.ts`) | 6 | ≈ 875 |
| **Déclarations de types** (`src/types/grist.d.ts`) pour les fichiers de Grist non copiés | 1 | 18 |

Le démarrage (`src/hub/main.ts`) fait ce que fait l'application Grist (`app/client/ui/App.ts`) :
- `window.gristConfig` ;
- `commands.init()` ;
- `setupLocale()`, qui charge les traductions officielles de Grist depuis `locales/` ;
- `window.gristApp`, réduit au signal « clipboard_focus » qu'attendent les éditeurs de texte des
  formulaires pour enregistrer quand on clique ailleurs.

Le code de Grist charge certaines parties à la demande, par des imports dynamiques regroupés dans
`app/client/lib/imports.js` : document complet, pages d'administration, éditeur de code,
graphiques, calendrier… Le hub n'emprunte jamais ces chemins. `tools/build.mjs` les remplace donc
par des modules vides au lieu de les embarquer, et en affiche la liste (22) à chaque construction.

`tools/sync-grist.sh` copie les points d'entrée et tout ce qu'ils importent, puis applique les
retouches de `tools/grist.patch`. Si grist-core a changé à ces endroits, la copie s'arrête sur une
erreur au lieu de produire un hub cassé. Il aligne enfin les versions des dépendances de
`package.json` sur celles de grist-core.

Le code du hub s'écrit comme celui des formulaires de Grist : imports `app/client/hub/…` (résolus vers
`src/hub/` par `tools/build.mjs` et `tsconfig.json`), blocs construits sur `BoxModel` et
`buildEditor`, pages et formulaires transmis par la vue (`HubView.hub`) et par le contexte du rendu
(`FormRendererContext.hub`). Comme pour le code de Grist :
- `npm run check` vérifie les types, avec les options de TypeScript de Grist ;
- `npm run lint` applique ses règles de style (sa configuration ESLint, copiée dans `src/grist/`),
  sans aucun avertissement toléré ;
- `npm test` lance les tests (`test/hub.test.js`), écrits sur le modèle de ceux du Formulaire
  (`test/nbrowser/FormView1.ts` dans grist-core) : 16 scénarios qui ouvrent le widget dans Chromium,
  dans une page qui imite Grist avec un document fictif, et l'utilisent comme un utilisateur
  (édition, lecture, destinations supprimées, lecteur, accès limité, cadre étroit). Playwright doit
  disposer de Chromium (`npx playwright install chromium`).

Pour reprendre une version plus récente de Grist, changez `GRIST_CORE_COMMIT`
dans `tools/sync-grist.sh`, puis lancez :

```bash
npm run sync      # copie le code de grist-core et aligne les dépendances
npm install
npm run check     # vérifie les types (tsc, options de Grist)
npm run lint      # vérifie le style (ESLint, règles de Grist)
npm run build     # produit dist/hub.js (esbuild)
npm test          # lance les tests
```

`dist/hub.js` (≈ 650 Ko) est versionné pour que la page puisse être servie telle quelle.

## Limites du prototype

- Pas de thème Métropole : l'apparence est celle de Grist.
- En lecture, la largeur est limitée à 960 px.
- Hors de Grist, le widget affiche une démonstration avec des pages fictives.

## Licence

Les fichiers de `src/grist/` viennent de [grist-core](https://github.com/gristlabs/grist-core)
(Grist Labs, licence Apache-2.0, texte dans `src/grist/LICENSE.txt`), au commit indiqué dans
`src/grist/COMMIT`, avec les retouches de `tools/grist.patch`.
`src/shims/app/client/components/Forms/Menu.ts`, `elements.ts` et `src/hub/HubView.ts` en sont
adaptés et le signalent en tête de fichier.
