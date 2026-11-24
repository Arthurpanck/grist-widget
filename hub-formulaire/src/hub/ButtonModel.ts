/**
 * Bloc « Bouton » de l'éditeur. Il s'appuie sur la classe de base des blocs de Grist (Forms/Model.ts)
 * et sur son éditeur (Forms/Editor.ts) : sélection au clic, glisser-déposer, menu contextuel,
 * bouton Supprimer et surcouche de sélection sont ceux du générateur de formulaires.
 */
import { FormLayoutNode } from "app/client/components/FormRenderer";
import { buildEditor } from "app/client/components/Forms/Editor";
import { BoxModel } from "app/client/components/Forms/Model";
import { not } from "app/common/gutil";
import { Computed, dom, IDomArgs } from "grainjs";
import { v4 as uuidv4 } from "uuid";
import { ButtonData, DEFAULT_ICON, hubContext } from "./context";
import { buttonTile } from "./tile";

export const BUTTON_KEYS = ["label", "description", "kind", "page", "form", "url", "icon", "color"] as const;

export class ButtonModel extends BoxModel {
  private _overlay = Computed.create(this, not(this.selected));

  /** Valeurs actuelles du bouton (observables du modèle de Grist). */
  public data(use: (obs: any) => any = (o: any) => o.get()): ButtonData {
    return Object.fromEntries(BUTTON_KEYS.map(k => [k, use(this.prop(k))])) as ButtonData;
  }

  public render(...args: IDomArgs<HTMLElement>): HTMLElement {
    return buildEditor({
      box: this,
      overlay: this._overlay,
      content: dom.domComputed((use) => {
        use(hubContext.pages); use(hubContext.forms);
        return buttonTile(this.data(use), "div");
      }),
    }, ...args);
  }
}

export function Button(kind: "page" | "form" | "url" = "page"): FormLayoutNode {
  return {
    id: uuidv4(), type: "Button" as any,
    label: "", description: "", kind, page: null, form: null, url: "", icon: DEFAULT_ICON[kind], color: "rouge",
  } as any;
}
