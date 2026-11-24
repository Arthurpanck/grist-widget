/**
 * Bloc « Bouton » de l'éditeur. Il s'appuie sur la classe de base des blocs de Grist (Forms/Model.ts)
 * et sur son éditeur (Forms/Editor.ts) : sélection au clic, glisser-déposer, menu contextuel,
 * bouton Supprimer et surcouche de sélection sont ceux du générateur de formulaires.
 *
 * Le texte et la description se modifient sur la tuile, comme le libellé d'une question dans
 * Grist (Forms/Field.ts) : bouton sélectionné, un clic sur le texte l'ouvre en édition ; Entrée
 * enregistre, Échap annule, un clic ailleurs enregistre (Forms/styles.ts, saveControls).
 */
import { FormLayoutNode } from "app/client/components/FormRenderer";
import { buildEditor } from "app/client/components/Forms/Editor";
import type { Destination } from "app/client/components/Forms/Menu";
import { BoxModel } from "app/client/components/Forms/Model";
import * as css from "app/client/components/Forms/styles";
import { stopEvent } from "app/client/lib/domUtils";
import { reportError } from "app/client/models/errors";
import { textarea } from "app/client/ui/inputs";
import { theme } from "app/client/ui2018/cssVars";
import { not } from "app/common/gutil";
import { Computed, dom, IDomArgs, Observable, styled } from "grainjs";
import { v4 as uuidv4 } from "uuid";
import { ButtonData, hubContext, labelOf } from "./context";
import { buttonTile, cssTileDesc, cssTileLabel } from "./tile";

export const BUTTON_KEYS = ["label", "description", "kind", "page", "form", "url", "icon"] as const;

export class ButtonModel extends BoxModel {
  /** Texte du bouton en édition (Entrée sur un bouton sélectionné, ou clic sur son texte). */
  public edit = Observable.create(this, false);
  /** Description en édition. */
  public editDescription = Observable.create(this, false);

  private _overlay = Computed.create(this, not(this.selected));
  private _editing = Computed.create(this, use => use(this.edit) || use(this.editDescription));

  constructor(box: FormLayoutNode, parent: BoxModel | null, view: any) {
    super(box, parent, view);
    // Comme Field.ts : un bouton désélectionné quitte l'édition.
    this.autoDispose(this.selected.addListener((now, then) => {
      if (!now && then) {
        setTimeout(() => {
          if (this.isDisposed()) { return; }
          this.edit.set(false); this.editDescription.set(false);
        });
      }
    }));
  }

  /** Valeurs actuelles du bouton (observables du modèle de Grist). */
  public data(use: (obs: any) => any = (o: any) => o.get()): ButtonData {
    return Object.fromEntries(BUTTON_KEYS.map(k => [k, use(this.prop(k))])) as ButtonData;
  }

  /** Nouvelle destination, choisie dans le menu contextuel (« Changer la destination »). */
  public setDestination(dest: Destination) {
    this.prop("kind").set(dest.kind);
    if (dest.kind === "page") { this.prop("page").set(dest.target); }
    if (dest.kind === "form") { this.prop("form").set(dest.target); }
    this.view.selectedBox.set(this);
    this.save().catch(reportError);
  }

  public render(...args: IDomArgs<HTMLElement>): HTMLElement {
    return buildEditor({
      box: this,
      overlay: this._overlay,
      editMode: this._editing,
      content: dom.domComputed((use) => {
        use(hubContext.pages); use(hubContext.forms);
        const data = this.data(use);
        return buttonTile(data, "div", {
          label: this._text("label", this.edit, labelOf(data), cssTileLabel, "Texte du bouton"),
          description: this._text("description", this.editDescription, data.description || "", cssTileDesc,
            "Ajouter une description"),
        });
      }),
    }, ...args);
  }

  /** Texte modifiable sur place (même fonctionnement que le libellé d'une question de formulaire). */
  private _text(key: "label" | "description", edit: Observable<boolean>, shown: string,
                look: typeof cssTileLabel, placeholder: string) {
    return dom.domComputed(edit, (editing) => {
      if (editing) {
        // Brouillon non libéré avec la zone de texte (comme Paragraph.ts) : à sa suppression, celle-ci
        // émet encore « change » et y écrit.
        const draft = Observable.create(null, shown);
        return look(cssTextEdit(draft, { autoGrow: true, onInput: true },
          { placeholder, rows: "1" },
          (elem) => { setTimeout(() => { elem.focus(); elem.select(); }, 10); },
          css.saveControls(edit, (ok) => {
            if (!ok || !edit.get() || this.isDisposed()) { return; }
            this.prop(key).set(draft.get().trim());
            this.save().catch(reportError);
          }),
          dom.on("contextmenu", stopEvent),
          dom.cls(`test-hub-${key}-editor`),
        ));
      }
      // Description vide : on n'affiche son emplacement que sur le bouton sélectionné.
      if (!shown) {
        return dom.maybe(this.selected, () => cssPlaceholder(placeholder, this._startEdit(edit),
          dom.cls(`test-hub-${key}`)));
      }
      return look(shown, this._startEdit(edit), dom.cls(`test-hub-${key}`));
    });
  }

  private _startEdit(edit: Observable<boolean>) {
    return [
      dom.style("cursor", use => use(this.selected) ? "text" : ""),
      dom.on("click", (ev) => {
        if (this.selected.get() && !edit.get()) {
          (edit === this.edit ? this.editDescription : this.edit).set(false);
          edit.set(true);
          ev.stopPropagation();
        }
      }),
    ];
  }
}

export function Button(kind: "page" | "form" | "url" = "page", target: number | null = null): FormLayoutNode {
  return {
    id: uuidv4(), type: "Button" as any,
    label: "", description: "", kind,
    page: kind === "page" ? target : null, form: kind === "form" ? target : null, url: "", icon: "",
  } as any;
}

const cssTextEdit = styled(textarea, `
  display: block;
  width: 100%;
  padding: 0;
  margin: 0;
  border: 0;
  outline: none;
  resize: none;
  overflow: hidden;
  font: inherit;
  color: inherit;
  line-height: inherit;
  background: ${theme.hover};
  border-radius: 2px;
  box-shadow: 0 0 0 3px ${theme.hover};
`);
const cssPlaceholder = styled("div", `
  font-size: 13px;
  font-style: italic;
  color: ${theme.lightText};
  cursor: text;
`);
