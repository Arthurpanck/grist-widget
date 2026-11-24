/**
 * Vue d'édition du hub : remplace FormView de Grist (qui dépend du document, des colonnes et des
 * partages) en gardant son fonctionnement. La sélection, les commandes d'insertion et de
 * suppression et la construction du DOM reprennent grist-core
 * app/client/components/Forms/FormView.ts (Apache-2.0).
 */
import * as commands from "app/client/components/commands";
import { FormLayoutNode } from "app/client/components/FormRenderer";
import * as components from "app/client/components/Forms/elements";
import { NewBox } from "app/client/components/Forms/Menu";
import { BoxModel, LayoutModel } from "app/client/components/Forms/Model";
import * as style from "app/client/components/Forms/styles";
import { reportError } from "app/client/models/errors";
import { buildMenu } from "app/client/components/Forms/Menu";
import { primaryButton } from "app/client/ui2018/buttons";
import { theme } from "app/client/ui2018/cssVars";
import { Computed, Disposable, dom, Holder, MultiHolder, Observable, styled } from "grainjs";
import { Button } from "./ButtonModel";

export class HubView extends Disposable {
  public selectedBox: Computed<BoxModel | null>;
  /** FormView expose la section de vue de Grist ; seuls ses indicateurs de focus servent ici. */
  public viewSection = { hasFocus: Observable.create(this, true), hasRegionFocus: Observable.create(this, true) };
  public gristDoc = null;

  private _root: LayoutModel;

  constructor(layout: FormLayoutNode, private _onSave: (layout: FormLayoutNode) => void, private _onDone: () => void) {
    super();

    // Sélection protégée : si le bloc sélectionné disparaît, plus rien n'est sélectionné (comme FormView).
    const selectedBox = Observable.create(this, null as BoxModel | null);
    this.selectedBox = Computed.create(this, use => use(selectedBox));
    const holder = Holder.create(this);
    this.selectedBox.onWrite((box) => {
      const scope = MultiHolder.create(holder);
      if (!box) { selectedBox.set(null); return; }
      if (box.isDisposed()) { throw new Error("Box is disposed"); }
      selectedBox.set(box);
      scope.autoDispose(box.onDispose(() => { if (selectedBox.get() === box) { selectedBox.set(null); } }));
    });

    this._root = this.autoDispose(new LayoutModel(layout, null, async (clb?: () => Promise<void>) => {
      if (clb) { await clb(); }
      await this.save();
    }, this as any));

    // Commandes de Grist qu'utilisent les menus et le bouton Supprimer des blocs.
    commands.createGroup({
      deleteFields: () => this.selectedBox.get()?.deleteSelf().catch(reportError),
      insertFieldBefore: (what: NewBox) => this._insert(what, s => s.placeBeforeMe()),
      insertField: (what: NewBox) => this._insert(what, s => s.placeAfterListChild()),
      insertFieldAfter: (what: NewBox) => this._insert(what, s => s.placeAfterMe()),
    }, this, this.viewSection.hasRegionFocus);
  }

  /** Nouveau bloc pour le menu « + » : bouton ou bloc de structure. */
  public newElement(what: NewBox): FormLayoutNode {
    if ("structure" in what) { return components.defaultElement(what.structure); }
    return Button(what.button.kind, "target" in what.button ? what.button.target : null);
  }

  public async save() {
    this._onSave(this._root.toJSON());
  }

  public buildDom() {
    return cssHubEditor(
      cssToolbar(
        primaryButton("Terminé", dom.on("click", () => this._onDone()), dom.cls("test-hub-done")),
      ),
      cssColumns(
        style.cssFormView(
          style.cssFormEditBodyWrapper(
            style.cssFormEditBody(
              cssWideForm(
                style.cssFormContainer(
                  dom("div", dom.forEach(this._root.children, child => child ? child.render() : dom("div", "?"))),
                  cssAddBlock(
                    style.cssPlusButton(style.cssCircle(style.cssPlusIcon("Plus"),
                      buildMenu({ view: this as any, insertBox: (box: FormLayoutNode) => this._root.append(box) }))),
                  ),
                ),
              ),
            ),
          ),
          dom.on("click", () => this.selectedBox.set(null)),
        ),
      ),
    );
  }

  private _insert(what: NewBox, place: (selected: BoxModel) => (box: FormLayoutNode) => BoxModel) {
    const selected = this.selectedBox.get();
    if (!selected) { return; }
    this.selectedBox.set(place(selected)(this.newElement(what)));
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
const cssColumns = styled("div", `
  flex: 1;
  min-height: 0;
  display: flex;
  & > :first-child { flex: 1; min-width: 0; overflow: auto; }
`);
// Le formulaire de Grist fait 600 px de large ; un hub a besoin de plus de place pour ses tuiles.
const cssWideForm = styled("div", `
  & > div { width: 100%; max-width: 960px; }
`);
const cssAddBlock = styled("div", `
  position: relative;
  height: 48px;
  & > div { opacity: 1; }
`);
