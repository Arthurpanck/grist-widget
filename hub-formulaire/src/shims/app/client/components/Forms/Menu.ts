/**
 * Menu « + » et menu contextuel des blocs.
 *
 * Adapté de grist-core app/client/components/Forms/Menu.ts (Apache-2.0) : même structure, mêmes
 * commandes et mêmes composants de menu. La seule différence : le groupe « Nouvelle question »,
 * qui ajoute des colonnes à une table, devient « Nouveau bouton » (page, formulaire, site web).
 */
import { allCommands } from "app/client/components/commands";
import { FormLayoutNodeType } from "app/client/components/FormRenderer";
import * as components from "app/client/components/Forms/elements";
import { FormView } from "app/client/components/Forms/FormView";
import { BoxModel, Place } from "app/client/components/Forms/Model";
import { makeTestId, stopEvent } from "app/client/lib/domUtils";
import { FocusLayer } from "app/client/lib/FocusLayer";
import * as menus from "app/client/ui2018/menus";

import { dom, IDomArgs } from "grainjs";

const testId = makeTestId("test-forms-menu-");

export type ButtonKind = "page" | "form" | "url";

// Nouveau bloc : un bouton (vers une page, un formulaire ou un site web) ou un bloc de structure.
export type NewBox = { button: ButtonKind } | { structure: FormLayoutNodeType };

interface Props {
  box?: BoxModel;
  view?: FormView;
  context?: boolean;
  customItems?: Element[],
  insertBox?: Place,
}

export const BUTTON_KINDS: { kind: ButtonKind, label: string, icon: any }[] = [
  { kind: "page", label: "Vers une page", icon: "Page" },
  { kind: "form", label: "Vers un formulaire", icon: "Pencil" },
  { kind: "url", label: "Vers un site web", icon: "World" },
];

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
        // Comme dans Grist : les blocs de structure viennent de elements.defaultElement.
        const inserted = props.insertBox!("structure" in el ? components.defaultElement(el.structure) : view.newElement(el));
        view.selectedBox.set(inserted);
        return view.save();
      } : null;

      const insertMenu = (where: typeof above) => () => [
        menus.menuGroup(
          "Nouveau bouton",
          ...BUTTON_KINDS.map(k => menus.menuItem(where({ button: k.kind }), menus.menuIcon(k.icon), k.label,
            testId("button-" + k.kind))),
        ),
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
        menus.menuItemCmd(allCommands.contextMenuCopy, "Copier"),
        menus.menuItemCmd(allCommands.contextMenuCut, "Couper"),
        menus.menuItemCmd(allCommands.contextMenuPaste, "Coller"),
        menus.menuDivider(),
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
