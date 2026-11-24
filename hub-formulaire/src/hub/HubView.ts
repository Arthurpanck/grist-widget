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
import { textInput } from "app/client/ui/inputs";
import { basicButton, primaryButton } from "app/client/ui2018/buttons";
import { theme } from "app/client/ui2018/cssVars";
import * as menus from "app/client/ui2018/menus";
import { Computed, Disposable, dom, Holder, MultiHolder, Observable, styled } from "grainjs";
import { v4 as uuidv4 } from "uuid";
import { Button, ButtonModel } from "./ButtonModel";
import { COLORS, colorOf, DEFAULT_ICON, hubContext } from "./context";
import { HUB_ICONS, hubIcon } from "./icons";

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
    return "button" in what ? Button(what.button) : components.defaultElement(what.structure);
  }

  public async save() {
    this._onSave(this._root.toJSON());
  }

  public buildDom() {
    return cssHubEditor(
      cssToolbar(
        cssToolbarTitle("Modification du hub"),
        cssToolbarHint("Cliquez sur un bloc pour le sélectionner, glissez-le pour le déplacer, clic droit pour plus d'actions."),
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
        dom.domComputed(this.selectedBox, box => box instanceof ButtonModel ? this._buildButtonPanel(box) : null),
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

  /** Panneau de réglage du bouton sélectionné (à la manière du panneau de droite de Grist). */
  private _buildButtonPanel(box: ButtonModel) {
    const p = (k: string) => box.prop(k);
    const save = () => box.save().catch(reportError);
    const owner = MultiHolder.create(null);
    const kind = p("kind");
    const pageOptions = Computed.create(owner, use => use(hubContext.pages).map(pg => ({ value: pg.id, label: pg.name })));
    const formOptions = Computed.create(owner, use => use(hubContext.forms).map(f => ({ value: f.id, label: f.name })));
    const persist = (obs: Observable<any>) => obs.addListener(save);
    ["kind", "page", "form", "icon", "color"].forEach(k => owner.autoDispose(persist(p(k))));

    return cssPanel(
      dom.autoDispose(owner),
      dom.on("click", ev => ev.stopPropagation()),
      cssPanelTitle("Bouton"),
      cssLabel("Destination"),
      dom("div", dom.cls("test-hub-kind"), menus.select(kind, [
        { value: "page", label: "Une page du document", icon: "Page" },
        { value: "form", label: "Un formulaire", icon: "Pencil" },
        { value: "url", label: "Un site web", icon: "World" },
      ])),
      dom.domComputed(kind, k => k === "url" ?
        textInput(p("url"), { placeholder: "www.exemple.fr" }, dom.on("change", save), dom.cls("test-hub-url")) :
        k === "form" ?
          dom("div", dom.cls("test-hub-target"), menus.select(p("form"), formOptions, { defaultLabel: "Choisir un formulaire" })) :
          dom("div", dom.cls("test-hub-target"), menus.select(p("page"), pageOptions, { defaultLabel: "Choisir une page" }))),
      cssLabel("Texte du bouton"),
      textInput(p("label"), { placeholder: "Nom de la destination" }, dom.on("change", save), dom.cls("test-hub-label")),
      cssLabel("Description"),
      textInput(p("description"), { placeholder: "Facultatif" }, dom.on("change", save)),
      cssLabel("Icône"),
      cssIconGrid(HUB_ICONS.map(ic => cssIconChoice(hubIcon(ic.id, ic.id),
        cssIconChoice.cls("-selected", use => (use(p("icon")) || DEFAULT_ICON[use(kind)]) === ic.id),
        dom.attr("title", ic.label), dom.attr("aria-label", ic.label),
        dom.on("click", () => p("icon").set(ic.id))))),
      cssLabel("Couleur"),
      cssSwatches(
        COLORS.map(c => cssSwatch(dom.style("background", c.bg), dom.attr("title", c.label),
          cssSwatch.cls("-selected", use => use(p("color")) === c.id), dom.on("click", () => p("color").set(c.id)))),
        cssCustomSwatch(
          dom.style("background", use => /^#/.test(use(p("color")) || "") ? use(p("color")) : ""),
          dom("input", { type: "color", title: "Couleur personnalisée" },
            dom.prop("value", use => colorOf(use(p("color"))).bg),
            dom.on("input", (_e, el) => p("color").set((el as HTMLInputElement).value))),
        ),
      ),
      cssPanelFoot(basicButton("Supprimer le bouton", dom.on("click", () => box.deleteSelf().catch(reportError)))),
    );
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
const cssPanel = styled("div", `
  flex: none;
  width: 300px;
  overflow: auto;
  padding: 16px;
  border-left: 1px solid ${theme.menuBorder};
  background: ${theme.mainPanelBg};
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* Sans cela, quand le panneau déborde, ses listes et champs sont écrasés en hauteur. */
  & > * { flex-shrink: 0; }
`);
const cssPanelTitle = styled("div", `
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${theme.lightText};
`);
const cssLabel = styled("div", `
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
`);
const cssIconGrid = styled("div", `
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
`);
const cssIconChoice = styled("div", `
  display: grid;
  place-items: center;
  height: 40px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid ${theme.menuBorder};
  color: ${theme.text};
  & > svg { width: 20px; height: 20px; }
  &:hover { background: ${theme.hover}; }
  &-selected { border: 2px solid ${theme.controlFg}; color: ${theme.controlFg}; background: ${theme.hover}; }
`);
const cssSwatches = styled("div", `
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`);
const cssSwatch = styled("div", `
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 0 1px ${theme.menuBorder};
  &-selected { box-shadow: 0 0 0 2px ${theme.mainPanelBg}, 0 0 0 4px ${theme.controlFg}; }
`);
const cssCustomSwatch = styled("label", `
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  background: conic-gradient(#EF8C8C, #F9D45C, #88BF4D, #98D9D9, #509EE3, #A989C5, #EF8C8C);
  box-shadow: 0 0 0 1px ${theme.menuBorder};
  & input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
`);
const cssPanelFoot = styled("div", `margin-top: 16px;`);
