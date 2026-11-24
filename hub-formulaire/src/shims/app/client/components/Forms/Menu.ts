/**
 * Menu « + » et menu contextuel des blocs.
 *
 * Adapté de grist-core app/client/components/Forms/Menu.ts (Apache-2.0) : même structure, mêmes
 * commandes et mêmes composants de menu. Le groupe « Nouvelle question », qui ajoute des colonnes à
 * une table, devient « Nouveau bouton » : des sous-menus listent les pages et les formulaires du
 * document, comme Grist liste les champs non affichés. Le menu contextuel garde Insérer et
 * Supprimer, sans Copier, Couper, Coller.
 */
import { allCommands } from "app/client/components/commands";
import { FormLayoutNodeType } from "app/client/components/FormRenderer";
import { FormView } from "app/client/components/Forms/FormView";
import { BoxModel, Place } from "app/client/components/Forms/Model";
import { makeTestId, stopEvent } from "app/client/lib/domUtils";
import { FocusLayer } from "app/client/lib/FocusLayer";
import * as menus from "app/client/ui2018/menus";

import { dom, IDomArgs } from "grainjs";

const testId = makeTestId("test-forms-menu-");

/** Destination d'un bouton : une page ou un formulaire du document, ou un site web. */
export type Destination = { kind: "page" | "form", target: number } | { kind: "url" };

// Nouveau bloc : un bouton (vers une destination) ou un bloc de structure.
export type NewBox = { button: Destination } | { structure: FormLayoutNodeType };

interface Props {
  box?: BoxModel;
  view?: FormView;
  context?: boolean;
  customItems?: Element[],
  insertBox?: Place,
}

/**
 * Choix d'une destination : sous-menus des pages et des formulaires du document, puis site web.
 */
export function destinationItems(view: FormView, choose: (dest: Destination) => void) {
  const { forms } = view.hub;
  const pages = () => view.hub.pages.get().filter(page => !page.hasHub);
  const pageItems = () => pages().length ?
    pages().map(page => menus.menuItem(
      () => choose({ kind: "page", target: page.id }),
      menus.menuIcon("Page"),
      page.name,
      testId("page-item"),
    )) :
    [menus.menuText("Aucune page dans ce document")];
  const formItems = () => forms.get().length ?
    forms.get().map(form => menus.menuItem(
      () => choose({ kind: "form", target: form.id }),
      menus.menuIcon("Pencil"),
      form.name,
      testId("form-item"),
    )) :
    [menus.menuText("Aucun formulaire dans ce document")];
  return [
    menus.menuItemSubmenu(pageItems, {}, menus.menuIcon("Page"), "Vers une page", testId("button-page")),
    menus.menuItemSubmenu(formItems, {}, menus.menuIcon("Pencil"), "Vers un formulaire", testId("button-form")),
    menus.menuItem(() => choose({ kind: "url" }), menus.menuIcon("World"), "Vers un site web", testId("button-url")),
  ];
}

export function buildMenu(props: Props, ...args: IDomArgs<HTMLElement>): IDomArgs<HTMLElement> {
  const { box, context, customItems } = props;
  const view = box?.view ?? props.view;
  if (!view) { throw new Error("No view provided"); }

  // Dans une colonne, on n'insère pas au-dessus ou en dessous (comme dans Grist).
  const disableInsert = box?.parent?.type === "Columns" && box.type !== "Placeholder";

  return [
    menus.menu((ctl) => {
      box?.view.selectedBox.set(box);

      const struct = (structure: FormLayoutNodeType) => ({ structure });

      const above = (el: NewBox) => () => { allCommands.insertFieldBefore.run(el); };
      const below = (el: NewBox) => () => { allCommands.insertFieldAfter.run(el); };
      const atEnd = (el: NewBox) => () => { allCommands.insertField.run(el); };
      const custom = props.insertBox ? (el: NewBox) => () => {
        const inserted = props.insertBox!(view.newElement(el));
        view.selectedBox.set(inserted);
        return view.save();
      } : null;

      const insertMenu = (where: typeof above) => () => [
        menus.menuGroup("Nouveau bouton", ...destinationItems(view, dest => where({ button: dest })())),
        menus.menuDivider(),
        menus.menuGroup(
          "Blocs",
          menus.menuItem(where(struct("Header")), menus.menuIcon("Headband"), "En-tête"),
          menus.menuItem(where(struct("Paragraph")), menus.menuIcon("Paragraph"), "Paragraphe"),
          menus.menuItem(where(struct("Columns")), menus.menuIcon("Columns"), "Colonnes"),
          menus.menuItem(where(struct("Separator")), menus.menuIcon("Separator"), "Séparateur"),
        ),
        props.customItems ? menus.menuDivider() : null,
        ...(props.customItems ?? []),
      ];

      if (!props.context && !disableInsert) {
        return insertMenu(custom ?? atEnd)();
      }

      return [
        disableInsert ? null : [
          menus.menuItemSubmenu(insertMenu(above), {}, "Insérer au-dessus"),
          menus.menuItemSubmenu(insertMenu(below), {}, "Insérer en dessous"),
          menus.menuDivider(),
        ],
        menus.menuItemCmd(allCommands.deleteFields, "Supprimer"),
        (elem: HTMLElement) => void FocusLayer.create(ctl, { defaultFocusElem: elem, pauseMousetrap: true }),
        customItems?.length ? menus.menuDivider(dom.style("min-width", "200px")) : null,
        ...(customItems ?? []),
        ...args,
      ];
    }, { trigger: [context ? "contextmenu" : "click"] }),
    context ? dom.on("contextmenu", stopEvent) : null,
  ];
}
