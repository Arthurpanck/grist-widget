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

Seule différence : le menu « + » propose **Nouveau bouton** à la place de « Nouvelle question ». Ses
sous-menus listent les pages et les formulaires du document, comme Grist liste les champs non
affichés ; « Vers un site web » ajoute un lien externe.

## Utilisation

1. Ajoutez un widget personnalisé, avec l'URL de `index.html` de ce dossier et l'**accès complet**.
2. Cliquez sur **Construire le hub**, ou ouvrez **Ouvrir la configuration** dans le menu ⋮ du widget.
3. Pour composer la page :
   - le **+** vert, ou une case « Colonne » vide, ajoute un bouton (choisissez la page ou le
     formulaire dans le sous-menu) ou un bloc ;
   - un clic sélectionne un bloc ; sur un bloc sélectionné, un clic sur un texte le modifie, comme
     le libellé d'une question (Entrée enregistre, Échap annule) ;
   - le clic droit ouvre le menu : changer la destination d'un bouton, copier, couper, coller,
     supprimer ;
   - glissez les blocs pour les déplacer.
4. Un bouton vers un site web affiche son adresse sous son texte, dans l'éditeur seulement ; elle se
   modifie au clic, comme le texte. Un nouveau bouton de ce type ouvre directement sa saisie.
5. Sur un bouton sélectionné, un clic sur son icône ouvre la fenêtre de Grist **Renommer et définir
   l'icône**, celle des documents : nom, couleurs (texte et fond) et emoji. Par défaut, l'icône a le
   vert du bouton « Envoyer » des formulaires et un emoji selon la destination : 📄 page, 📝
   formulaire, 🌐 site web. « Réinitialiser l'icône » affiche les initiales du nom, comme pour un
   document.
6. **Terminé** affiche le hub tel que le voient les lecteurs. Les paragraphes, rubriques et colonnes
   passent par le rendu des formulaires publiés de Grist (`FormRenderer`).

La mise en page est enregistrée dans les options du widget (clé `layout`), au même format JSON que la
mise en page d'un formulaire, avec un type de bloc en plus : `Button`. Comme pour tout widget,
cliquez ensuite sur **Enregistrer** dans le menu du widget.

## Ce qui est réutilisé, ce qui est écrit

| | Fichiers | Lignes |
|---|---|---|
| **Copié de grist-core sans modification** (`src/grist/`, Apache-2.0) : l'éditeur de formulaires (`Forms/Model`, `Editor`, `Paragraph`, `Section`, `Columns`, `styles`), le rendu des formulaires publiés (`FormRenderer`), la fenêtre « Renommer et définir l'icône » des documents (`RenameDocModal`, `DocIcon`, `ColorSelect`, `EmojiPicker`), et tout ce qu'ils importent : commandes et raccourcis, traductions (i18next), infobulles, menus, icônes, boutons, thème, adresses… | 142 | ≈ 37 200 |
| **Traductions et icônes de Grist** (`locales/`, `public/grist-icons.css`) | 3 | — |
| **Remplacés**, car liés au document Grist ouvert ou à toute l'application : `Forms/FormView` (sert seulement de type), `Forms/Field` (une question = une colonne de table) et `ui/HomeLeftPane` (panneau de l'accueil, dont seul un style de champ est importé, par `ui2018/pages`) | 3 | ≈ 20 |
| **Adapté de grist-core** : `Forms/Menu.ts` (« Nouveau bouton » et ses sous-menus au lieu de « Nouvelle question ») et `Forms/elements.ts` (liste des blocs) | 2 | ≈ 155 |
| **Propre au hub** (`src/hub/`) : bloc Bouton, vue d'édition (reprend `FormView`), rendu des boutons en lecture, démarrage et liaison avec Grist | 6 | ≈ 760 |

Le démarrage (`src/hub/main.ts`) fait ce que fait l'application Grist (`app/client/ui/App.ts`) :
- `window.gristConfig` ;
- `commands.init()` ;
- `setupLocale()`, qui charge les traductions officielles de Grist depuis `locales/` ;
- `window.gristApp`, réduit au signal « clipboard_focus » qu'attendent les éditeurs de texte des
  formulaires pour enregistrer quand on clique ailleurs.

Le code de Grist charge certaines parties à la demande, par des imports dynamiques regroupés dans
`app/client/lib/imports.js` : document complet, pages d'administration, éditeur de code,
graphiques, calendrier… Le hub n'emprunte jamais ces chemins. `tools/build.mjs` les remplace donc
par des modules vides au lieu de les embarquer, et en affiche la liste (21) à chaque construction.
Seul le sélecteur d'emoji est embarqué ; comme dans Grist, il est dans un fichier à part
(`dist/chunks/EmojiPicker-….js`, ≈ 500 Ko) chargé au premier clic sur « Choisir l'icône ».

Les fichiers copiés ne sont pas modifiés, à une exception près. `tools/sync-grist.sh` traduit le
libellé « Column » (écrit en dur en anglais dans `Columns.ts`) en « Colonne ». Il copie les points
d'entrée et tout ce qu'ils importent, puis aligne les versions des dépendances de `package.json` sur
celles de grist-core. Pour reprendre une version plus récente de Grist, changez `GRIST_CORE_COMMIT`
dans `tools/sync-grist.sh`, puis lancez :

```bash
npm run sync      # copie le code de grist-core et aligne les dépendances
npm install
npm run build     # produit dist/ (esbuild, modules ES, mêmes options TypeScript que Grist)
```

`dist/` (`hub.js` ≈ 700 Ko, plus les fichiers chargés à la demande) est versionné pour que la page puisse être servie telle quelle.

## Limites du prototype

- Grist ne donne pas à ses widgets l'accès au presse-papiers du système. Copier, couper et coller
  fonctionnent donc à l'intérieur du hub (clic droit ou Ctrl+C, X, V), mais pas vers une autre
  application.
- Thème sombre de Grist : pas encore vérifié dans un vrai Grist.

- Pas de thème Métropole : l'apparence est celle de Grist.
- Le sélecteur d'emoji est en anglais, comme dans Grist (qui ne lui passe pas de langue).
- En lecture, la largeur est limitée à 960 px.
- Hors de Grist, le widget affiche une démonstration avec des pages fictives.

## Licence

Les fichiers de `src/grist/` viennent de [grist-core](https://github.com/gristlabs/grist-core)
(Grist Labs, licence Apache-2.0, texte dans `src/grist/LICENSE.txt`), au commit indiqué dans
`src/grist/COMMIT`. `src/shims/app/client/components/Forms/Menu.ts`, `elements.ts` et
`src/hub/HubView.ts` en sont adaptés et le signalent en tête de fichier.
