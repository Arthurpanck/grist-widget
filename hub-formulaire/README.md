# Hub de navigation — façon formulaire

Page d'accueil d'un document Grist : des boutons vers ses pages, ses formulaires ou des sites web.
Le hub est construit avec **le code de l'éditeur de formulaires de Grist**, réutilisé tel quel.
L'interface et le fonctionnement sont donc ceux du widget Formulaire :
- blocs sélectionnés au clic ;
- glisser-déposer ;
- « + » vert d'une section, visible au survol ;
- menu contextuel Insérer / Supprimer ;
- paragraphes Markdown modifiés sur place ;
- sections et colonnes, avec leurs cases « Colonne 2 » à remplir ;
- barre du bas, avec **Terminé** à la place de « Publier ».

Seule différence : le menu « + » propose **Nouveau bouton** à la place de « Nouvelle question ». Ses
sous-menus listent les pages et les formulaires du document, comme Grist liste les champs non
affichés ; « Vers un site web » ajoute un lien externe.

## Utilisation

1. Ajoutez un widget personnalisé, avec l'**accès complet**, et cette adresse :
   `https://arthurpanck.github.io/grist-widget/hub-formulaire/index.html`
2. Un hub vide s'ouvre directement dans l'éditeur. Ensuite, on y revient par **Ouvrir la
   configuration** dans le menu ⋮ du widget.
3. Pour composer la page :
   - le **+** d'une section, ou une case « Colonne » vide, ajoute un bouton (choisissez la page ou
     le formulaire dans le sous-menu) ou un bloc ;
   - ce même **+** ajoute une section ci-dessus ou ci-dessous, comme dans le Formulaire ;
   - un clic sélectionne un bloc ; sur un bloc sélectionné, un clic sur un texte le modifie, comme
     le libellé d'une question (Entrée enregistre, Échap annule) ;
   - le clic droit ouvre le menu : insérer ci-dessus ou ci-dessous, supprimer ;
   - glissez les blocs pour les déplacer.
4. Un bouton vers un site web affiche son adresse sous son texte, dans l'éditeur seulement ; elle se
   modifie au clic, comme le texte. Un nouveau bouton de ce type ouvre directement sa saisie.
5. L'icône dépend de la destination : 📄 page, 📝 formulaire, 🌐 site web. Toutes les tuiles ont
   le vert du bouton « Envoyer » des formulaires.
6. **Terminé** affiche le hub tel que le voient les lecteurs. Les paragraphes, sections et colonnes
   passent par le rendu des formulaires publiés de Grist (`FormRenderer`).
7. Si la page ou le formulaire d'un bouton est supprimé du document, le bouton reste, grisé et sans
   lien, avec « Page à choisir » ou « Formulaire à choisir » s'il n'a pas de texte. C'est le principe
   du Formulaire, qui retire les questions dont la colonne a été supprimée (`cleanFormLayoutSpec`).

La mise en page est enregistrée dans les options du widget (clé `layout`) à chaque modification, au
même format JSON que la mise en page d'un formulaire, avec un type de bloc en plus : `Button`. Comme
pour tout widget, cliquez ensuite sur **Enregistrer** dans le menu du widget.

## Ce qui est réutilisé, ce qui est écrit

| | Fichiers | Lignes |
|---|---|---|
| **Copié de grist-core** (`src/grist/`, Apache-2.0) : l'éditeur de formulaires (`Forms/Model`, `Editor`, `Paragraph`, `Section`, `Columns`, `styles`), le rendu des formulaires publiés (`FormRenderer`), et tout ce qu'ils importent : commandes et raccourcis, traductions (i18next), infobulles, menus, icônes, boutons, thème, adresses… | 131 | ≈ 35 000 |
| **Retouches de ces fichiers** (`tools/grist.patch`), comme Grist Labs les ferait : le type de bloc « Button » et son rendu en lecture dans `FormRenderer.ts`, le libellé « Colonne » dans `Columns.ts` | 2 | 22 modifiées |
| **Adapté de grist-core** (`src/shims/`) : `Forms/Menu.ts` (« Nouveau bouton » et ses sous-menus au lieu de « Nouvelle question ») et `Forms/elements.ts` (liste des blocs) | 2 | ≈ 180 |
| **Remplacés** (`src/shims/`), car liés à l'application ou au document Grist : `Forms/FormView` et `ui/App` (servent seulement de types), `Forms/Field` (une question = une colonne de table) | 3 | ≈ 25 |
| **Propre au hub** (`src/hub/`) : bloc Bouton (`Button.ts`), les trois destinations (`destinations.ts`), vue d'édition (`HubView.ts`, reprend `FormView`), tuile (`tile.ts`), hub en lecture (`HubPage.ts`), pages et formulaires du document (`HubContext.ts`), démarrage et liaison avec Grist (`main.ts`) | 7 | ≈ 1 000 |
| **Déclarations de types** (`src/types/grist.d.ts`) pour les fichiers de Grist non copiés | 1 | ≈ 20 |

Le navigateur charge environ 950 Ko : le code (`dist/hub.js`, ≈ 665 Ko), les icônes de Grist
(`public/grist-icons.css`, ≈ 240 Ko) et les traductions de Grist (`locales/`, ≈ 55 Ko).

## Conventions

Le code du hub s'écrit comme celui des formulaires de Grist :
- imports `app/client/hub/…`, résolus vers `src/hub/` par `tools/build.mjs` et `tsconfig.json` ;
- blocs construits sur `BoxModel` et `buildEditor`, comme `Forms/Paragraph.ts` ;
- pages et formulaires transmis par la vue (`HubView.hub`) et par le contexte du rendu
  (`FormRendererContext.hub`), comme Grist transmet les champs d'un formulaire ;
- les trois destinations d'un bouton (page, formulaire, site web) sont décrites à un seul endroit,
  `src/hub/destinations.ts` ; les champs d'un bouton, dans `Button()` et dans `FormLayoutNode`.

Textes et commentaires :
- les textes propres au hub sont écrits en français dans le code ; ceux que Grist a déjà
  (« Blocs de construction », « Titre », « Ajouter une section ci-dessus »…) viennent de ses
  traductions ;
- les commentaires du hub sont en français ; le code repris de Grist garde ses commentaires d'origine,
  en anglais, pour rester comparable à l'original.

Le démarrage (`src/hub/main.ts`) prépare ce que prépare l'application Grist (`app/client/ui/App.ts`) :
`window.gristConfig`, les styles et le thème, `commands.init()`, `setupLocale()`, et `window.gristApp`,
réduit au signal « clipboard_focus » qu'attendent les zones de saisie des formulaires pour enregistrer
quand on clique ailleurs.

## Contrôles

Comme pour le code de Grist :
- `npm run check` vérifie les types, avec les options de TypeScript de Grist ;
- `npm run lint` applique ses règles de style (sa configuration ESLint, copiée dans `src/grist/`),
  sans aucun avertissement toléré ;
- `npm test` reconstruit le widget puis lance les tests (`test/hub.test.js`), écrits sur le modèle de
  ceux du Formulaire (`test/nbrowser/FormView1.ts` dans grist-core). Ils ouvrent le widget dans
  Chromium, dans une page qui imite Grist avec un document fictif, et l'utilisent comme un
  utilisateur : édition, sections, lecture, destinations supprimées, lecteur, accès limité, cadre
  étroit. Playwright doit disposer de Chromium (`npx playwright install chromium`).

`.github/workflows/hub-formulaire.yml` lance ces contrôles à chaque modification du dossier, et
vérifie que les fichiers construits et versionnés (`dist/`, `locales/`, `index.html`) correspondent
aux sources.

## Construction et mise à jour depuis Grist

`tools/build.mjs` produit `dist/hub.js` (esbuild), versionné pour que la page soit servie telle quelle.
Il inscrit aussi l'empreinte du fichier dans `index.html` (`dist/hub.js?v=…`), pour qu'une nouvelle
version soit chargée tout de suite, et ne publie dans `locales/` que les traductions de Grist
qu'utilisent les fichiers embarqués.

Le code de Grist charge certaines parties à la demande, par des imports dynamiques regroupés dans
`app/client/lib/imports.js` : document complet, pages d'administration, éditeur de code, graphiques,
calendrier… Le hub n'emprunte jamais ces chemins : `tools/build.mjs` les remplace par des modules
vides et en affiche la liste à chaque construction.

`tools/sync-grist.sh` copie les points d'entrée de grist-core et tout ce qu'ils importent, puis :
- applique les retouches de `tools/grist.patch` ; si grist-core a changé à ces endroits, la copie
  s'arrête sur une erreur ;
- vérifie que les fichiers dont le hub garde une version adaptée (`Forms/Menu.ts`, `elements.ts`) ou
  reprend la logique (`FormView.ts`, `Field.ts`) n'ont pas changé dans grist-core
  (`tools/adapted-from.sha256`) ; sinon il s'arrête avant de rien modifier, le temps de reporter
  leurs changements ;
- aligne les versions des dépendances de `package.json` sur celles de grist-core.

Pour reprendre une version plus récente de Grist, changez `GRIST_CORE_COMMIT` dans
`tools/sync-grist.sh`, puis lancez :

```bash
npm run sync      # copie le code de grist-core et aligne les dépendances
npm install
npm run check     # vérifie les types (tsc, options de Grist)
npm run lint      # vérifie le style (ESLint, règles de Grist)
npm test          # reconstruit le widget et lance les tests
```

## Limites

- Les textes sont en français seulement.
- Pas de thème Métropole : l'apparence est celle de Grist.
- La largeur du hub est limitée à 960 px.
- Un bouton dont la destination a été supprimée se remplace : on le supprime et on en crée un autre.
- Hors de Grist, le widget affiche une démonstration avec des pages fictives.

## Licence

Les fichiers de `src/grist/` viennent de [grist-core](https://github.com/gristlabs/grist-core)
(Grist Labs, licence Apache-2.0, texte dans `src/grist/LICENSE.txt`), au commit indiqué dans
`src/grist/COMMIT`, avec les retouches de `tools/grist.patch`.
`src/shims/app/client/components/Forms/Menu.ts`, `elements.ts` et `src/hub/HubView.ts` en sont
adaptés et le signalent en tête de fichier.
