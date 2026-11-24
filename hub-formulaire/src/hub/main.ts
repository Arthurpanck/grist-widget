/**
 * Point d'entrée : thème et styles de base de Grist, liaison avec Grist (options du widget, pages,
 * formulaires), bascule entre la lecture et l'édition.
 */
import { FormLayoutNode } from "app/client/components/FormRenderer";
import { Columns, Placeholder } from "app/client/components/Forms/Columns";
import { Paragraph } from "app/client/components/Forms/Paragraph";
import { attachCssRootVars, theme } from "app/client/ui2018/cssVars";
import { setupLocale } from "app/client/lib/localization";
import * as gristCommands from "app/client/components/commands";
import { primaryButton } from "app/client/ui2018/buttons";
import { convertThemeKeysToCssVars } from "app/common/ThemePrefs";
import { GristLight } from "app/common/themes/GristLight";
import { getOrCreateStyleElement } from "app/client/lib/getOrCreateStyleElement";
import { dom, Observable, styled } from "grainjs";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./ButtonModel";
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

const cssEmpty = styled("div", `
  max-width: 420px;
  margin: 15vh auto 0;
  padding: 24px;
  text-align: center;
  color: ${theme.text};
  & p { color: ${theme.lightText}; }
`);

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
          { ...Columns(), children: [Button("page"), Placeholder(), Placeholder()] },
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
  dom.domComputed(use => [use(editing), use(editing) ? null : use(layout)] as const, ([isEditing, current]) => {
    if (isEditing) {
      const view = HubView.create(null, layout.get()!, save, () => editing.set(false));
      return dom("div", { style: "height: 100%" }, dom.autoDispose(view), view.buildDom());
    }
    if (!current || !current.children?.length) {
      return cssEmpty(
        dom("h2", "Hub vide"),
        dom("p", readonly ? "Ce hub n'a pas encore été configuré." :
          "Ouvrez la configuration du widget (menu ⋮ du widget) ou cliquez ci-dessous pour construire le hub."),
        readonly ? null : primaryButton("Construire le hub", dom.on("click", edit), dom.cls("test-hub-start")),
      );
    }
    return buildView(current);
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
  hubContext.pages.set(rows(pages).sort((a: any, b: any) => a.pagePos - b.pagePos)
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
  });
  loadContext().catch(err => console.warn("Pages et formulaires indisponibles (accès complet requis) :", err));
} else {
  // Démonstration hors de Grist.
  hubContext.pages.set([{ id: 1, name: "Tableau de bord" }, { id: 2, name: "Projets" }, { id: 3, name: "Budget 2026" }]);
  hubContext.forms.set([{ id: 7, name: "Signaler un incident", page: "Signalements" }]);
  hubContext.docBase.set("https://docs.getgrist.com/doc/demo");
}
