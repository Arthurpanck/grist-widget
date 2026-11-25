/**
 * Menu « + » et menu contextuel des blocs.
 *
 * Adapté de grist-core app/client/components/Forms/Menu.ts (Apache-2.0). Tout ce qui ne concerne
 * pas les questions est repris tel quel, avec ses commentaires et ses traductions d'origine. Deux
 * changements :
 * - le groupe « Nouvelle question », qui ajoute des colonnes à une table, devient « Nouveau bouton » :
 *   des sous-menus listent les pages et les formulaires du document, comme Grist liste les champs
 *   non affichés ;
 * - le menu contextuel garde Insérer et Supprimer, sans Copier, Couper, Coller.
 */
import { allCommands } from "app/client/components/commands";
import { FormLayoutNodeType } from "app/client/components/FormRenderer";
import { FormView } from "app/client/components/Forms/FormView";
import { BoxModel, Place } from "app/client/components/Forms/Model";
import { ButtonKind, DESTINATIONS } from "app/client/hub/destinations";
import { makeTestId, stopEvent } from "app/client/lib/domUtils";
import { FocusLayer } from "app/client/lib/FocusLayer";
import { makeT } from "app/client/lib/localization";
import * as menus from "app/client/ui2018/menus";

import { dom, IDomArgs } from "grainjs";

const t = makeT("Menu");
const testId = makeTestId("test-forms-menu-");

// New box to add, either a new button (to a page, a form or a website), or a structure.
export type NewBox = { button: ButtonKind, target: number | null } | { structure: FormLayoutNodeType };

interface Props {
  /**
   * If this menu was shown as a result of clicking on a box. This box will be selected.
   */
  box?: BoxModel;
  /**
   * Parent view (to access GristDoc/selectedBox and others, TODO: this should be turned into events)
   */
  view?: FormView;
  /**
   * Whether this is context menu, so move `Copy` etc in front, and nest new items in its own menu.
   */
  context?: boolean;
  /**
   * Custom menu items to be added at the bottom (below additional separator).
   */
  customItems?: Element[],
  /**
   * Custom logic of finding right spot to insert the new box.
   */
  insertBox?: Place,
}

export function buildMenu(props: Props, ...args: IDomArgs<HTMLElement>): IDomArgs<HTMLElement> {
  const { box, context, customItems } = props;
  const view = box?.view ?? props.view;
  if (!view) { throw new Error("No view provided"); }
  const hub = view.hub;

  // If we are in a column, then we can't insert a new column.
  const disableInsert = box?.parent?.type === "Columns" && box.type !== "Placeholder";

  return [
    menus.menu((ctl) => {
      box?.view.selectedBox.set(box);

      // Same for structure.
      const struct = (structure: FormLayoutNodeType) => ({ structure });

      // Actions:

      // Insert field before and after.
      const above = (el: NewBox) => () => {
        allCommands.insertFieldBefore.run(el);
      };
      const below = (el: NewBox) => () => {
        allCommands.insertFieldAfter.run(el);
      };
      const atEnd = (el: NewBox) => () => {
        allCommands.insertField.run(el);
      };
      const custom = props.insertBox ? (el: NewBox) => () => {
        // Comme une nouvelle question dans Grist (addNewQuestion), le bloc ajouté est sélectionné.
        view.selectedBox.set(props.insertBox!(view.newElement(el)));
        return view.save();
      } : null;

      // Sous-menu d'un type de destination : les pages ou les formulaires du document.
      const targets = (where: typeof above, kind: "page" | "form", list: () => { id: number, name: string }[]) =>
        menus.menuItemSubmenu(
          () => list().length ?
            list().map(({ id, name }) => menus.menuItem(
              where({ button: kind, target: id }),
              menus.menuIcon(DESTINATIONS[kind].menuIcon),
              name,
              testId(`${kind}-item`),
            )) :
            [menus.menuText(DESTINATIONS[kind].menuEmpty ?? "")],
          {},
          menus.menuIcon(DESTINATIONS[kind].menuIcon),
          DESTINATIONS[kind].menuLabel,
          testId(`button-${kind}`),
        );

      const insertMenu = (where: typeof above) => () => {
        return [
          menus.menuGroup(
            "Nouveau bouton",
            targets(where, "page", () => hub.pages.get().filter(page => !page.hasHub)),
            targets(where, "form", () => hub.forms.get()),
            menus.menuItem(
              where({ button: "url", target: null }),
              menus.menuIcon(DESTINATIONS.url.menuIcon),
              DESTINATIONS.url.menuLabel,
              testId("button-url"),
            ),
          ),
          menus.menuDivider(),
          menus.menuGroup(
            t("Building blocks"),
            menus.menuItem(where(struct("Header")), menus.menuIcon("Headband"), t("Header")),
            menus.menuItem(where(struct("Paragraph")), menus.menuIcon("Paragraph"), t("Paragraph")),
            menus.menuItem(where(struct("Columns")), menus.menuIcon("Columns"), t("Columns")),
            menus.menuItem(where(struct("Separator")), menus.menuIcon("Separator"), t("Separator")),
          ),

          props.customItems ? menus.menuDivider() : null,
          ...(props.customItems ?? []),
        ];
      };

      if (!props.context && !disableInsert) {
        return insertMenu(custom ?? atEnd)();
      }

      return [
        disableInsert ? null : [
          menus.menuItemSubmenu(insertMenu(above), {}, "Insérer ci-dessus"),
          menus.menuItemSubmenu(insertMenu(below), {}, "Insérer ci-dessous"),
          menus.menuDivider(),
        ],
        menus.menuItemCmd(allCommands.deleteFields, "Supprimer"),
        elem => void FocusLayer.create(ctl, { defaultFocusElem: elem, pauseMousetrap: true }),
        customItems?.length ? menus.menuDivider(dom.style("min-width", "200px")) : null,
        ...(customItems ?? []),
        ...args,
      ];
    }, { trigger: [context ? "contextmenu" : "click"] }),
    context ? dom.on("contextmenu", stopEvent) : null,
  ];
}
