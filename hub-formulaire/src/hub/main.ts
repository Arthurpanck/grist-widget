/**
 * Point d'entrée : thème et styles de base de Grist, liaison avec Grist (options du widget, pages,
 * formulaires), bascule entre la lecture et l'édition.
 */
import { FormLayoutNode } from "app/client/components/FormRenderer";
import { Columns, Placeholder } from "app/client/components/Forms/Columns";
import { Paragraph } from "app/client/components/Forms/Paragraph";
import { attachCssRootVars } from "app/client/ui2018/cssVars";
import { setupLocale } from "app/client/lib/localization";
import * as gristCommands from "app/client/components/commands";
import { convertThemeKeysToCssVars } from "app/common/ThemePrefs";
import { GristLight } from "app/common/themes/GristLight";
import { getOrCreateStyleElement } from "app/client/lib/getOrCreateStyleElement";
import { dom, Observable } from "grainjs";
import { v4 as uuidv4 } from "uuid";
import { hubContext } from "./context";
import { HubView } from "./HubView";
import { buildView } from "./view";

declare const grist: any;
(window as any).gristConfig = { supportedLngs: ["fr", "en"], namespaces: ["client"], userLocale: "fr" };
export const VERSION = "0.1.0";
console.info(`Hub (éditeur de formulaires Grist) ${VERSION}`);

// Styles de base de Grist, puis thème clair par défaut ; Grist remplace ce dernier par le thème
// de l'utilisateur (couche « grist-theme », prioritaire) dès que le widget est connecté.
attachCssRootVars("grist");
const defaults = convertThemeKeysToCssVars({ appearance: "light", colors: GristLight } as any);
getOrCreateStyleElement("hub-default-theme", { element: document.getElementById("grist-root-css"), position: "afterend" })
  .textContent = `@layer grist-base { :root { ${Object.entries(defaults.colors).map(([k, v]) => `--grist-theme-${k}: ${v};`).join(" ")} } }`;

// Les éditeurs de texte de Grist (Forms/styles.ts, saveControls) enregistrent quand l'application
// signale « clipboard_focus », c'est-à-dire quand l'utilisateur clique ailleurs que dans un champ
// (dans Grist, le focus revient alors à son presse-papiers). Le widget n'a pas l'application
// Grist : il émet le même signal au clic hors d'un champ.
const appListeners = new Set<() => void>();
(window as any).gristApp = {
  on(name: string, cb: () => void) { if (name === "clipboard_focus") { appListeners.add(cb); } },
  off(name: string, cb: () => void) { appListeners.delete(cb); },
};
document.addEventListener("mousedown", (ev) => {
  if (!(ev.target as Element).closest?.("textarea, input, select, [contenteditable]")) {
    [...appListeners].forEach(cb => cb());
  }
}, true);

const inGrist = typeof grist !== "undefined" && window.parent !== window;
const readonly = new URLSearchParams(location.search).get("readonly") === "true";
const OPTION_KEY = "layout";

function starterLayout(): FormLayoutNode {
  return {
    id: uuidv4(), type: "Layout", children: [
      Paragraph("# **Accueil**"),
      {
        id: uuidv4(), type: "Section", children: [
          Paragraph("## **Rubrique**"),
          { ...Columns(), children: [Placeholder(), Placeholder(), Placeholder()] },
        ],
      },
    ],
  };
}

const layout = Observable.create<FormLayoutNode | null>(null, null);
const editing = Observable.create(null, false);
let saveTimer = 0;

function save(next: FormLayoutNode) {
  layout.setAndTrigger(next);
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => { if (inGrist) { grist.setOption(OPTION_KEY, next).catch(console.error); } }, 300);
}

function edit() {
  if (readonly) { return; }
  if (!layout.get()) { layout.set(starterLayout()); }
  editing.set(true);
}

(window as any).__hub = { layout, editing, edit, hubContext };

const app = dom("div", { style: "height: 100%" },
  // En lecture, le hub est redessiné quand Grist fournit les pages, les formulaires et l'adresse du
  // document : ils arrivent après le premier affichage (sinon : « Page à choisir » et pas de lien).
  dom.domComputed(use => [use(editing), use(editing) ? null : use(layout),
    use(hubContext.pages), use(hubContext.forms), use(hubContext.docBase)] as const, ([isEditing, current]) => {
    if (isEditing) {
      const view = HubView.create(null, layout.get()!, save, () => editing.set(false));
      return dom("div", { style: "height: 100%" }, dom.autoDispose(view), view.buildDom());
    }
    return current ? buildView(current) : null;
  }),
);
gristCommands.init(); // comme app/client/ui/App.ts
setupLocale().catch(console.error).finally(() => document.body.appendChild(app));

// Données du document : pages, formulaires (widgets « Formulaire ») et adresse de base.
function rows(table: any) {
  return table.id.map((id: number, i: number) => Object.fromEntries(Object.keys(table).map(k => [k, table[k][i]])));
}

async function loadContext() {
  const [pages, views, sections] = await Promise.all(
    ["_grist_Pages", "_grist_Views", "_grist_Views_section"].map(t => grist.docApi.fetchTable(t)));
  const names = new Map<number, string>(rows(views).map((v: any) => [v.id, v.name]));
  // Les pages qui contiennent ce hub ne sont pas proposées comme destination.
  const hubViews = new Set(rows(sections)
    .filter((s: any) => s.parentKey === "custom" && /hub-formulaire/.test(s.options || "")).map((s: any) => s.parentId));
  hubContext.pages.set(rows(pages).sort((a: any, b: any) => a.pagePos - b.pagePos)
    .filter((p: any) => !hubViews.has(p.viewRef))
    .map((p: any) => ({ id: p.viewRef, name: names.get(p.viewRef) || "" })).filter((p: any) => p.name));
  hubContext.forms.set(rows(sections).filter((s: any) => s.parentKey === "form" && names.has(s.parentId))
    .map((s: any) => ({ id: s.id, name: (s.title || "").trim() || names.get(s.parentId)!, page: names.get(s.parentId)! })));
  const token = await grist.docApi.getAccessToken({ readOnly: true });
  const m = /^(.*?)\/api\/docs\/([^/?#]+)/.exec(token.baseUrl || "");
  hubContext.docBase.set(m ? `${m[1]}/doc/${m[2]}` : null);
}

if (inGrist) {
  grist.ready({ requiredAccess: "full", onEditOptions: edit });
  grist.onOptions((options: any) => {
    if (editing.get()) { return; }
    const next = options?.[OPTION_KEY];
    layout.set(next && next.type === "Layout" ? next : null);
    // Hub pas encore construit : on ouvre directement l'éditeur, avec la mise en page de départ.
    if (!layout.get()) { edit(); }
  });
  loadContext().catch(err => console.warn("Pages et formulaires indisponibles (accès complet requis) :", err));
} else {
  // Démonstration hors de Grist.
  hubContext.pages.set([{ id: 1, name: "Tableau de bord" }, { id: 2, name: "Projets" }, { id: 3, name: "Budget 2026" }]);
  hubContext.forms.set([{ id: 7, name: "Signaler un incident", page: "Signalements" }]);
  hubContext.docBase.set("https://docs.getgrist.com/doc/demo");
  edit();
}
