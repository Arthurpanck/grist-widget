# Hub de navigation — conception V2

Ce document fixe les choix d'interface avant le code. Il sert de référence pour toute évolution :
une modification de l'interface commence ici.

## 1. Pour qui, pour quoi

| Personne | Ce qu'elle veut | Ce qui la gêne aujourd'hui (V1) |
|---|---|---|
| **Lecteur** du document (agent, partenaire) | Trouver la bonne page en un clic. | Rien : la vue lecture de la V1 fonctionne. On la garde, en plus soigné. |
| **Éditeur** qui crée le hub (non technicien) | Une page d'accueil propre en moins d'une minute, sans réfléchir à la mise en forme. | Un panneau de formulaires à 4 onglets : il faut tout décider, champ par champ, avant de voir un résultat. |
| **Éditeur** qui fait vivre le hub | Ajouter un bouton, le déplacer, le renommer. | Liste de cartes repliables, groupe saisi au clavier, glisser-déposer peu visible. |

## 2. Principes

1. **Commencer par une question, pas par un formulaire.** Comme l'écran « Nouvelle question » de Metabase :
   on demande ce que l'on veut obtenir, avec de grandes cartes visuelles, et l'outil fait le reste.
   - Premier écran : « Que doit faire cette page d'accueil ? »
   - Ajout d'un bouton : « Où mène ce bouton ? »
2. **Montrer, ne pas décrire.** Chaque choix visuel (modèle, forme des boutons, en-tête, fond) est une
   **miniature dessinée par le hub lui-même** : ce que l'on voit dans la carte est exactement ce que l'on obtient.
   Les miniatures réutilisent le composant d'affichage réel, il n'y a donc aucun dessin à maintenir à part.
3. **Des valeurs par défaut qui suffisent.** Un modèle appliqué donne un hub terminé ; chaque réglage est une
   retouche facultative.
4. **Un seul endroit par intention.**
   - *Contenu* : quoi afficher.
   - *Apparence* : à quoi ça ressemble.
   - *Réglages* : le reste (rarement utile).
5. **L'aperçu est l'interface.** En édition, le hub reste visible et cliquable : cliquer un bouton de l'aperçu
   l'ouvre pour modification.
6. **La charte d'abord.**
   - Rouges `#FF0000` / `#C00000` alternés, bleu `#2A3158`, Segoe UI.
   - Titres de rubriques numérotés « 1 - … ».
   - Les couleurs hors charte n'existent pas dans l'outil.
7. **Moins de code maison.**
   - Tout contrôle d'interface vient de **Web Awesome** : boutons, champs, onglets, dialogues, curseurs,
     interrupteurs, notifications, panneau redimensionnable.
   - Les mises en page utilisent ses utilitaires (`wa-stack`, `wa-cluster`, `wa-grid`).
   - Les couleurs, espacements et rayons viennent de ses jetons `--wa-*`.
   - Le CSS maison se limite à l'apparence des boutons du hub.

## 3. Parcours

### 3.1 Premier lancement (hub vide, éditeur)

```
┌──────────────────────────────────────────────────────────────┐
│  Que doit faire cette page d'accueil ?                       │
│  Choisissez un point de départ, tout reste modifiable.       │
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │ miniature  │ │ miniature  │ │ miniature  │ │ miniature  │ │
│  │            │ │            │ │            │ │            │ │
│  │ Sommaire   │ │ Portail    │ │ Accueil    │ │ Barre de   │ │
│  │ automatique│ │ par thèmes │ │ visuel     │ │ raccourcis │ │
│  │ 1 bouton   │ │ rubriques  │ │ image de   │ │ boutons    │ │
│  │ par page   │ │ + liens    │ │ fond       │ │ compacts   │ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
│                         Partir d'une page vierge             │
└──────────────────────────────────────────────────────────────┘
```

- Les miniatures sont des rendus réels du modèle, avec les **vraies pages du document**.
- Un clic applique le modèle et ouvre l'éditeur, avec une notification « Modèle appliqué ».
- Un lecteur seul voit à la place : « Ce hub n'a pas encore été configuré ».

| Modèle | Résultat |
|---|---|
| Sommaire automatique | En-tête sobre ; une tuile par page, avec une icône devinée d'après son nom. |
| Portail par thèmes | Bandeau rouge ; pages réparties en rubriques « Pilotage / Données / Ressources » (selon les mots du nom), plus une rubrique « Liens utiles » vers grandlyon.com. |
| Accueil visuel | Fond photographique sombre ; aplats de couleur centrés ; titre centré. |
| Barre de raccourcis | Sans en-tête ; pastilles compactes sur une ligne. Fait pour un petit widget posé au-dessus d'un tableau. |

### 3.2 Édition

```
┌───────────────────────────────────────┬──────────────────────────┐
│                                       │ Modifier le hub  [Terminé]│
│     APERÇU EN DIRECT                  │ Contenu│Apparence│Réglages│
│     (cliquer un bouton = le modifier) │ ──────────────────────── │
│                                       │ 1 - Pilotage        ⋯    │
│                                       │  ⠿ ● Projets   Page      │
│                                       │  ⠿ ● Budget    Page      │
│                                       │  + Ajouter un bouton     │
│                                       │ 2 - Liens utiles    ⋯    │
│                                       │  ⠿ ● Grand Lyon  Site web│
│                                       │  + Ajouter un bouton     │
│                                       │ + Nouvelle rubrique      │
│                                       │ ⓘ 2 pages n'ont pas de   │
│                                       │   bouton  [Les ajouter]  │
└───────────────────────────────────────┴──────────────────────────┘
```

**Disposition**
- Panneau redimensionnable `wa-split-panel`.
- Sous 700 px, le panneau occupe toute la largeur, avec un bouton « Aperçu ».

**Onglet Contenu : la structure du hub, en rubriques**
- Le titre de rubrique se modifie sur place (vide = pas de titre).
- Le menu `⋯` de la rubrique propose : monter, descendre, supprimer.
- Les boutons se réordonnent par glisser-déposer, y compris d'une rubrique à l'autre.
- Le menu `⋯` d'un bouton propose : modifier, dupliquer, supprimer.
- Encart « pages sans bouton » : ajoute en un clic les pages oubliées.

**Dialogue « Nouveau bouton / Modifier le bouton » : deux questions numérotées, façon notebook Metabase**

1. **Où mène ce bouton ?**
   - Deux grandes cartes : *Une page du document* ou *Un site web*.
   - Page : liste des pages, avec recherche si plus de 8 pages.
   - Site web : adresse, et un interrupteur « nouvel onglet ».
2. **À quoi ressemble-t-il ?**
   - Libellé : le nom de la page est proposé par défaut.
   - Description.
   - Icône : sélection d'icônes Lucide, avec recherche en français.
   - Couleur : pastilles de la charte, plus « Automatique ».

Un **aperçu du bouton** est rendu en temps réel en tête du dialogue. Pied du dialogue : *Supprimer* (à gauche), *Annuler*, *Enregistrer*.

**Onglet Apparence : uniquement des choix visuels (miniatures)**

| Réglage | Valeurs |
|---|---|
| Forme des boutons | Tuiles · Aplats · Liste · Pastilles |
| Couleurs | Métropole (rouge alterné) · Institutionnel (bleu) · Sobre (gris) · Multicolore |
| En-tête | Aucun · Sobre · Encadré · Bandeau rouge, puis titre, sous-titre, logo |
| Fond | Par défaut · Couleur (pastilles) · Image (adresse ou import), puis voile et opacité |
| Disposition | taille S / M / L, alignement, colonnes |

**Onglet Réglages**
- Pied de page.
- Numérotation des rubriques.
- Bouton « Modifier » visible.
- Adresse du document.
- Changer de modèle.
- Export / import JSON.
- Réinitialiser.

**Terminé**
- Applique la configuration et rappelle d'enregistrer le widget dans Grist (ce que l'API Grist impose).
- *Annuler les modifications* se trouve dans le menu du titre du panneau.

### 3.3 Lecture

- Visuellement identique à la V1 (validée), avec un rendu affiné :
  - jetons Web Awesome (rayons, ombres, espacements) ;
  - mode sombre de Grist respecté pour les surfaces.
- Bouton « Modifier » discret au survol, réservé aux éditeurs.

## 4. Modèle de données (V2)

```js
{
  version: 2,
  header:     { style: 'none'|'sobre'|'encadre'|'bandeau', title, subtitle, logo, align: 'left'|'center' },
  background: { type: 'default'|'color'|'image', color, image, veil: 0..0.9, tone: 'dark'|'light', fit: 'cover'|'contain' },
  look:       { shape: 'tuile'|'aplat'|'liste'|'pastille', palette: 'metropole'|'institutionnel'|'sobre'|'multicolore',
                size: 's'|'m'|'l', align: 'left'|'center', columns: 0..6 },
  sections:   [{ id, title, buttons: [{ id, label, description, icon, color, kind: 'page'|'url', page, url, newTab }] }],
  footer, numbering, docUrl, showEditButton
}
```

- Les rubriques deviennent une liste explicite. En V1, la rubrique d'un bouton était un texte libre ; elle
  devient un objet que l'on renomme ou déplace en bloc.
- Une configuration V1 est migrée automatiquement :
  - les groupes deviennent des rubriques ;
  - les icônes V1 deviennent des icônes Lucide ;
  - `clair` devient `sobre`, `carte` devient `encadre`, `plein` devient `aplat`.

## 5. Choix techniques

| Besoin | Librairie | Pourquoi |
|---|---|---|
| Contrôles d'interface | **Web Awesome 3** (MIT, successeur de Shoelace, versions mensuelles) | Plus de 50 composants accessibles, sans compilation, thèmes par jetons CSS, mode sombre. |
| Structure et réactivité | **Vue 3** (version navigateur ESM) | Gabarits déclaratifs plutôt que construction manuelle du DOM ; état réactif unique ; zéro compilation. |
| Icônes | **Lucide** (ISC, via la bibliothèque d'icônes de Web Awesome) | Plus de 1 500 icônes cohérentes, chargées à la demande. |
| Glisser-déposer | **SortableJS** (MIT) | Glisser-déposer tactile et entre listes, en quelques lignes. |

Toutes les versions sont épinglées et copiées dans `vendor/` (script `tools/vendor.sh`) : GitHub Pages sert le widget et ses librairies, sans dépendre d'un CDN.

**Organisation du code**

| Fichier | Rôle |
|---|---|
| `js/config.js` | Schéma, valeurs par défaut, migration, modèles, palettes, catalogue d'icônes. Aucune dépendance. |
| `js/grist.js` | Échanges avec Grist : options, pages, adresse du document. |
| `js/libs.js` | Point d'entrée des librairies copiées dans `vendor/`. |
| `js/app.js` | Application Vue et composants. |
| `index.html` | Gabarits des composants (`<template>`). |
| `hub.css` | Jetons de la charte et apparence des boutons du hub. |
