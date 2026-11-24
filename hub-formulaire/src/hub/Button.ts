/**
 * Bloc « Bouton » de l'éditeur, construit comme les blocs de Grist (Forms/Paragraph.ts) : la classe
 * de base des blocs (Forms/Model.ts) et l'éditeur (Forms/Editor.ts) apportent la sélection au clic,
 * le glisser-déposer, le menu contextuel, le bouton Supprimer et la surcouche de sélection.
 *
 * Le texte, la description et l'adresse d'un site se modifient sur la tuile, comme le libellé d'une
 * question (Forms/Field.ts, Question.renderLabel) : bouton sélectionné, un clic sur le texte l'ouvre ;
 * Entrée enregistre, Échap annule, un clic ailleurs enregistre (Forms/styles.ts, saveControls).
 */
import { FormLayoutNode } from "app/client/components/FormRenderer";
import { buildEditor } from "app/client/components/Forms/Editor";
import { FormView } from "app/client/components/Forms/FormView";
import { BoxModel } from "app/client/components/Forms/Model";
import * as css from "app/client/components/Forms/styles";
import { buttonTile, cssTileDesc, cssTileLabel } from "app/client/hub/tile";
import { stopEvent } from "app/client/lib/domUtils";
import { reportError } from "app/client/models/errors";
import { autoGrow } from "app/client/ui/forms";
import { theme } from "app/client/ui2018/cssVars";
import { not } from "app/common/gutil";

import { Computed, dom, IDomArgs, makeTestId, Observable, styled, UseCBOwner } from "grainjs";
import { v4 as uuidv4 } from "uuid";

const testId = makeTestId("test-hub-");

/** Textes modifiables d'un bouton. */
type ButtonText = "label" | "description" | "url";

const BUTTON_PROPS = ["label", "description", "kind", "page", "form", "url"] as const;

export class ButtonModel extends BoxModel {
  /** Texte en cours de modification, s'il y en a un. */
  public editing = Observable.create<ButtonText | null>(this, null);

  private _overlay = Computed.create(this, not(this.selected));
  private _editMode = Computed.create(this, use => use(this.editing) !== null);
  private _editModes = {
    label: this._editModeOf("label"),
    description: this._editModeOf("description"),
    url: this._editModeOf("url"),
  };

  constructor(box: FormLayoutNode, parent: BoxModel | null, view: FormView) {
    super(box, parent, view);

    this.autoDispose(
      this.selected.addListener((now, then) => {
        // Comme Field.ts : un bouton désélectionné quitte l'édition.
        if (!now && then) {
          setTimeout(() => !this.editing.isDisposed() && this.editing.set(null));
        }
        // Un bouton vers un site web sans adresse ouvre directement la saisie de l'adresse.
        if (now && !then && this.prop("kind").get() === "url" && !this.prop("url").get()) {
          this.editing.set("url");
        }
      }),
    );
  }

  public override render(...args: IDomArgs<HTMLElement>): HTMLElement {
    const hub = this.view.hub;
    return buildEditor({
      box: this,
      overlay: this._overlay,
      editMode: this._editMode,
      content: dom.domComputed((use) => {
        // Redessiné quand Grist fournit les pages et les formulaires (textes par défaut).
        use(hub.pages);
        use(hub.forms);
        const button = this._toNode(use);
        return buttonTile(button, {
          label: this._buildText("label", hub.labelOf(button), cssTileLabel, "Texte du bouton"),
          description: [
            this._buildText("description", button.description || "", cssTileDesc, "Ajouter une description"),
            // Site web : l'adresse, sous le texte, se modifie de la même façon (éditeur seulement).
            button.kind === "url" ?
              this._buildText("url", button.url || "", cssTileUrl, "Adresse du site (www.…)") :
              null,
          ],
        });
      }),
    }, ...args);
  }

  /**
   * Valeurs actuelles du bouton, lues dans les observables du modèle de Grist.
   */
  private _toNode(use: UseCBOwner): FormLayoutNode {
    const props = Object.fromEntries(BUTTON_PROPS.map(key => [key, use(this.prop(key))]));
    return { id: this.id, type: "Button", ...props };
  }

  /**
   * Texte de la tuile, modifiable sur place quand le bouton est sélectionné.
   */
  private _buildText(part: ButtonText, shown: string, look: typeof cssTileLabel, placeholder: string) {
    return dom.domComputed(this._editModes[part], (editing) => {
      if (editing) {
        return look(this._buildTextEditor(part, shown, placeholder));
      }
      // Texte vide (description, adresse) : son emplacement n'apparaît que sur le bloc sélectionné.
      if (!shown) {
        return dom.maybe(this.selected, () => cssPlaceholder(placeholder, this._startEdit(part), testId(part)));
      }
      return look(shown, this._startEdit(part), testId(part));
    });
  }

  /**
   * Zone de saisie : celle du libellé d'une question (Forms/Field.ts, Question.renderLabel), avec les
   * mêmes commandes et le même agrandissement automatique. La seule différence : on enregistre dans
   * le bloc au lieu de la colonne de la table.
   */
  private _buildTextEditor(part: ButtonText, value: string, placeholder: string) {
    const editMode = this._editModes[part];
    // Brouillon non libéré avec la zone de texte, comme dans Paragraph.ts : à sa suppression,
    // celle-ci émet encore « change » et y écrit.
    const draft = Observable.create(null, value);
    return cssInlineEdit(
      css.cssEditableLabel(
        draft,
        { onInput: true },
        { placeholder, rows: "1" },
        css.saveControls(editMode, (ok) => {
          if (!ok || !editMode.get() || this.isDisposed()) {
            return;
          }
          this.prop(part).set(draft.get().trim());
          this.save().catch(reportError);
        }),
        autoGrow(draft),
        dom.on("contextmenu", stopEvent),
        dom.style("resize", "none"),
        css.cssEditableLabel.cls("-edit"),
        (elem) => {
          setTimeout(() => {
            elem.focus();
            elem.select();
          }, 10);
        },
        testId(`${part}-editor`),
      ),
    );
  }

  /**
   * Sur un bouton sélectionné, un clic sur un texte l'ouvre en édition.
   */
  private _startEdit(part: ButtonText) {
    return [
      dom.style("cursor", use => use(this.selected) ? "text" : ""),
      dom.on("click", (ev) => {
        if (this.selected.get() && this.editing.get() !== part) {
          this.editing.set(part);
          ev.stopPropagation();
        }
      }),
    ];
  }

  /**
   * Interrupteur « ce texte est en édition », tel que l'attendent les commandes de saisie de Grist.
   */
  private _editModeOf(part: ButtonText) {
    const editMode = Computed.create(this, use => use(this.editing) === part);
    editMode.onWrite((on) => {
      if (on) {
        this.editing.set(part);
      } else if (this.editing.get() === part) {
        this.editing.set(null);
      }
    });
    return editMode;
  }
}

export function Button(kind: "page" | "form" | "url" = "page", target: number | null = null): FormLayoutNode {
  return {
    id: uuidv4(),
    type: "Button",
    label: "",
    description: "",
    kind,
    page: kind === "page" ? target : null,
    form: kind === "form" ? target : null,
    url: "",
  };
}

// La zone de texte de Grist garde ici la police de la tuile (et non celle des libellés de questions).
const cssInlineEdit = styled("div", `
  & > textarea {
    font: inherit;
    color: inherit;
    line-height: inherit;
    min-height: 0;
    overflow: hidden;
  }
`);

const cssTileUrl = styled("div", `
  font-size: 12px;
  color: ${theme.lightText};
  overflow-wrap: anywhere;
`);

const cssPlaceholder = styled("div", `
  font-size: 13px;
  font-style: italic;
  color: ${theme.lightText};
  cursor: text;
`);
