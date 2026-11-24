/**
 * Vue d'édition du hub : remplace FormView de Grist (qui dépend du document, des colonnes et des
 * partages) en gardant son fonctionnement. La sélection, les actions clavier (copier, couper,
 * coller, bloc suivant ou précédent, supprimer, insérer) et la construction du DOM reprennent
 * grist-core app/client/components/Forms/FormView.ts (Apache-2.0).
 */
import * as commands from "app/client/components/commands";
import { FormLayoutNode } from "app/client/components/FormRenderer";
import * as components from "app/client/components/Forms/elements";
import { NewBox } from "app/client/components/Forms/Menu";
import { BoxModel, LayoutModel, parseBox } from "app/client/components/Forms/Model";
import * as style from "app/client/components/Forms/styles";
import { reportError } from "app/client/models/errors";
import { buildMenu } from "app/client/components/Forms/Menu";
import { primaryButton } from "app/client/ui2018/buttons";
import { theme } from "app/client/ui2018/cssVars";
import { Computed, Disposable, dom, Holder, MultiHolder, Observable, styled } from "grainjs";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./ButtonModel";

export class HubView extends Disposable {
  public selectedBox: Computed<BoxModel | null>;
  /** FormView expose la section de vue de Grist ; seuls ses indicateurs de focus servent ici. */
  public viewSection = { hasFocus: Observable.create(this, true), hasRegionFocus: Observable.create(this, true) };
  public gristDoc = null;

  private _root: LayoutModel;
  private _clipboard = "";

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

    const keyboardActions = {
      // Un widget Grist n'a pas accès au presse-papiers du système (permissions du cadre) : la copie
      // est gardée dans le widget, et écrite dans le presse-papiers seulement s'il est autorisé.
      copy: () => this._copy(false),
      cut: () => this._copy(true),
      paste: () => {
        const doPaste = async () => {
          const fromSystem = clipboardAllowed("clipboard-read") ? await navigator.clipboard.readText().catch(() => "") : "";
          const boxInClipboard = parseBox(fromSystem) || parseBox(this._clipboard);
          if (!boxInClipboard) { return; }
          // Bloc copié (et non coupé) : nouveaux identifiants, sinon deux blocs auraient le même.
          const wasCut = Boolean(this._root.find(boxInClipboard.id)?.cut.get());
          if (!wasCut) { renewIds(boxInClipboard); }
          if (!this.selectedBox.get()) {
            this.selectedBox.set(this._root.insert(boxInClipboard, 0));
          } else {
            this.selectedBox.set(this.selectedBox.get()!.insertBefore(boxInClipboard));
          }
          if (wasCut) {
            const cutBox = [...this._root.traverse()].find(b => b.id === boxInClipboard.id && b.cut.get());
            cutBox?.removeSelf();
            this._clipboard = "";
            if (clipboardAllowed("clipboard-write")) { await navigator.clipboard.writeText("").catch(() => {}); }
          }
          await this._root.save();
        };
        doPaste().catch(reportError);
      },
      nextField: () => this._step(1),
      prevField: () => this._step(-1),
      edit: () => { (this.selectedBox.get() as any)?.edit?.set(true); },
      clearValues: () => {
        const selected = this.selectedBox.get();
        if (!selected || selected.canRemove?.() === false) { return; }
        keyboardActions.nextField();
        selected.deleteSelf().catch(reportError);
      },
      insertFieldBefore: (what: NewBox) => this._insert(what, s => s.placeBeforeMe()),
      insertField: (what: NewBox) => this._insert(what, s => s.placeAfterListChild()),
      insertFieldAfter: (what: NewBox) => this._insert(what, s => s.placeAfterMe()),
    };
    commands.createGroup({
      ...keyboardActions,
      contextMenuCopy: keyboardActions.copy,
      contextMenuCut: keyboardActions.cut,
      contextMenuPaste: keyboardActions.paste,
      cursorDown: keyboardActions.nextField,
      cursorUp: keyboardActions.prevField,
      editField: keyboardActions.edit,
      deleteFields: keyboardActions.clearValues,
    }, this, this.viewSection.hasRegionFocus);

    // Suppr, flèches, Entrée et Tab : liés par les commandes de Grist (Mousetrap). Copier, couper et
    // coller passent dans Grist par son composant Presse-papiers, propre au document : on les relie ici.
    const onKey = (ev: KeyboardEvent) => {
      const target = ev.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]")) { return; }
      const mod = ev.ctrlKey || ev.metaKey;
      const run = (name: string) => { ev.preventDefault(); commands.allCommands[name].run(); };
      if (mod && ev.key === "c") { run("copy"); }
      else if (mod && ev.key === "x") { run("cut"); }
      else if (mod && ev.key === "v") { run("paste"); }
      else if (ev.key === "Escape") { this.selectedBox.set(null); }
    };
    document.addEventListener("keydown", onKey);
    this.onDispose(() => document.removeEventListener("keydown", onKey));
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
        cssToolbarTitle("Modification du hub"),
        cssToolbarHint("Cliquez sur un bloc pour le sélectionner, puis sur un texte pour le modifier. Glissez pour déplacer, clic droit pour plus d'actions."),
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

  private _copy(cut: boolean) {
    const selected = this.selectedBox.get();
    if (!selected) { return; }
    [...this._root.traverse()].forEach(box => box.cut.set(false));
    this._clipboard = JSON.stringify(selected.toJSON());
    if (clipboardAllowed("clipboard-write")) { navigator.clipboard.writeText(this._clipboard).catch(() => {}); }
    if (cut) { selected.cut.set(true); }
  }

  private _step(delta: number) {
    const all = [...this._root.traverse()];
    if (!all.length) { return; }
    const current = this.selectedBox.get();
    const index = current ? all.indexOf(current) + delta : (delta > 0 ? 0 : all.length - 1);
    this.selectedBox.set(all[(index + all.length) % all.length]);
  }

  private _insert(what: NewBox, place: (selected: BoxModel) => (box: FormLayoutNode) => BoxModel) {
    const selected = this.selectedBox.get();
    if (!selected) { return; }
    this.selectedBox.set(place(selected)(this.newElement(what)));
    this.save().catch(reportError);
  }
}

/** Le cadre du widget autorise-t-il le presse-papiers ? (Grist ne l'accorde pas aux widgets.) */
function clipboardAllowed(feature: string): boolean {
  const policy = (document as any).permissionsPolicy || (document as any).featurePolicy;
  return policy?.allowsFeature ? policy.allowsFeature(feature) : Boolean(navigator.clipboard);
}

function renewIds(node: FormLayoutNode) {
  node.id = uuidv4();
  node.children?.forEach(renewIds);
}

const cssHubEditor = styled("div", `
  display: flex;
  flex-direction: column;
  height: 100%;
  color: ${theme.text};
`);
const cssToolbar = styled("div", `
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-bottom: 1px solid ${theme.menuBorder};
  background: ${theme.mainPanelBg};
`);
const cssToolbarTitle = styled("div", `font-weight: 600;`);
const cssToolbarHint = styled("div", `flex: 1; color: ${theme.lightText}; font-size: 12px;`);
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
