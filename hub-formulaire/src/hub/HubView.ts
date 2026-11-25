/**
 * Vue d'édition du hub. Elle remplace FormView de Grist, qui dépend du document ouvert (colonnes,
 * enregistrements, partage), et en garde le fonctionnement : la sélection, les commandes d'insertion
 * et de suppression et la construction de la page reprennent grist-core
 * app/client/components/Forms/FormView.ts (Apache-2.0).
 */
import * as commands from "app/client/components/commands";
import { FormLayoutNode } from "app/client/components/FormRenderer";
import * as components from "app/client/components/Forms/elements";
import { NewBox } from "app/client/components/Forms/Menu";
import { BoxModel, LayoutModel, Place } from "app/client/components/Forms/Model";
import * as style from "app/client/components/Forms/styles";
import { Button } from "app/client/hub/Button";
import { HubContext } from "app/client/hub/HubContext";
import { reportError } from "app/client/models/errors";
import { primaryButton } from "app/client/ui2018/buttons";
import { theme } from "app/client/ui2018/cssVars";

import { Computed, Disposable, dom, Holder, makeTestId, MultiHolder, Observable, styled } from "grainjs";

const testId = makeTestId("test-hub-");

export class HubView extends Disposable {
  public selectedBox: Computed<BoxModel | null>;
  /** FormView expose la section de Grist ; les blocs n'en lisent que les indicateurs de focus. */
  public viewSection = {
    hasFocus: Observable.create(this, true),
    hasRegionFocus: Observable.create(this, true),
    // Appelé par Section et Columns pour retirer les questions d'un bloc supprimé : jamais ici.
    removeField: async (_fieldRefs: number[]) => {},
  };

  private _root: LayoutModel;

  constructor(
    layout: FormLayoutNode,
    public readonly hub: HubContext,
    private _onSave: (layout: FormLayoutNode) => void,
    private _onDone: () => void,
  ) {
    super();

    // We will store selected box here.
    const selectedBox = Observable.create(this, null as BoxModel | null);

    // But we will guard it with a computed, so that if box is disposed we will clear it.
    this.selectedBox = Computed.create(this, use => use(selectedBox));

    // Prepare scope for the method calls.
    const holder = Holder.create(this);

    this.selectedBox.onWrite((box) => {
      // Create new scope and dispose the previous one (using holder).
      const scope = MultiHolder.create(holder);
      if (!box) {
        selectedBox.set(null);
        return;
      }
      if (box.isDisposed()) {
        throw new Error("Box is disposed");
      }
      selectedBox.set(box);

      // Now subscribe to the new box, if it is disposed, remove it from the selected box.
      scope.autoDispose(box.onDispose(() => {
        if (selectedBox.get() === box) {
          selectedBox.set(null);
        }
      }));
    });

    this._root = this.autoDispose(new LayoutModel(layout, null, async (clb?: () => Promise<void>) => {
      if (clb) {
        await clb();
      }
      await this.save();
    }, this));

    // Commandes de Grist qu'appellent les menus et le bouton Supprimer des blocs.
    this.autoDispose(commands.createGroup({
      deleteFields: () => {
        this.selectedBox.get()?.deleteSelf().catch(reportError);
      },
      insertFieldBefore: (what: NewBox) => this._insert(what, selected => selected.placeBeforeMe()),
      insertField: (what: NewBox) => this._insert(what, selected => selected.placeAfterListChild()),
      insertFieldAfter: (what: NewBox) => this._insert(what, selected => selected.placeAfterMe()),
    }, this, this.viewSection.hasRegionFocus));
  }

  /**
   * Nouveau bloc pour le menu « + » : un bouton ou un bloc de structure.
   */
  public newElement(what: NewBox): FormLayoutNode {
    if ("structure" in what) {
      return components.defaultElement(what.structure);
    }
    const dest = what.button;
    return Button(dest.kind, dest.kind === "url" ? null : dest.target);
  }

  /**
   * Appelé par l'éditeur quand on dépose une colonne de table pour en faire une question : jamais ici.
   */
  public async showColumn(_colId: string): Promise<number> {
    throw new Error("Le hub n'a pas de questions");
  }

  public async save() {
    this._onSave(this._root.toJSON());
  }

  public buildDom() {
    return cssHubEditor(
      cssToolbar(
        primaryButton("Terminé", dom.on("click", () => this._onDone()), testId("done")),
      ),
      cssEditorBody(
        style.cssFormView(
          style.cssFormEditBodyWrapper(
            style.cssFormEditBody(
              cssWideForm(
                style.cssFormContainer(
                  dom("div", dom.forEach(this._root.children, (child) => {
                    if (!child) {
                      return dom("div", "Empty node");
                    }
                    return child.render();
                  })),
                ),
              ),
            ),
          ),
          dom.on("click", () => this.selectedBox.set(null)),
        ),
      ),
    );
  }

  private _insert(what: NewBox, placeFor: (selected: BoxModel) => Place) {
    const selected = this.selectedBox.get();
    if (!selected) {
      return;
    }
    this.selectedBox.set(placeFor(selected)(this.newElement(what)));
    this.save().catch(reportError);
  }
}

const cssHubEditor = styled("div", `
  display: flex;
  flex-direction: column;
  height: 100%;
  color: ${theme.text};
`);

const cssToolbar = styled("div", `
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px;
  border-bottom: 1px solid ${theme.menuBorder};
  background: ${theme.mainPanelBg};
`);

const cssEditorBody = styled("div", `
  flex: 1;
  min-height: 0;
  display: flex;
  & > :first-child {
    flex: 1;
    min-width: 0;
    overflow: auto;
  }
`);

// Le formulaire de Grist fait 600 px de large ; un hub a besoin de plus de place pour ses tuiles.
const cssWideForm = styled("div", `
  & > div {
    width: 100%;
    max-width: 960px;
  }
`);
