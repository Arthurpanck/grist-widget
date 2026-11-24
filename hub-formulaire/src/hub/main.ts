/**
 * Point d'entrée. Prépare ce que prépare l'application Grist (app/client/ui/App.ts) : configuration,
 * styles et thème, commandes, traductions. Puis HubApp affiche le hub, en lecture ou en édition, et
 * le relie à Grist : sa mise en page est enregistrée dans les options du widget.
 */
import * as commands from "app/client/components/commands";
import { FormLayoutNode } from "app/client/components/FormRenderer";
// Les blocs passent par elements, comme dans FormView : chargé en premier, il évite que Paragraph,
// Section ou Columns soient évalués avant leur classe de base (boucle Model → elements → blocs).
import * as elements from "app/client/components/Forms/elements";
import { HubContext } from "app/client/hub/HubContext";
import { buildHubPage } from "app/client/hub/HubPage";
import { HubView } from "app/client/hub/HubView";
import { getOrCreateStyleElement } from "app/client/lib/getOrCreateStyleElement";
import { setupLocale } from "app/client/lib/localization";
import { attachCssRootVars } from "app/client/ui2018/cssVars";
import { convertThemeKeysToCssVars } from "app/common/ThemePrefs";
import { GristLight } from "app/common/themes/GristLight";

import { Disposable, dom, Observable } from "grainjs";
import { v4 as uuidv4 } from "uuid";

import type { App } from "app/client/ui/App";

declare const grist: any;

/** Clé des options du widget où est enregistrée la mise en page. */
const OPTION_KEY = "layout";

(window as any).gristConfig = { supportedLngs: ["fr", "en"], namespaces: ["client"], userLocale: "fr" };

// Styles de base de Grist, puis thème clair par défaut ; Grist remplace ce dernier par le thème de
// l'utilisateur (couche « grist-theme », prioritaire) dès que le widget est connecté.
attachCssRootVars("grist");
const defaultTheme = convertThemeKeysToCssVars({ appearance: "light", name: "GristLight", colors: GristLight });
const defaultVars = Object.entries(defaultTheme.colors).map(([key, value]) => `--grist-theme-${key}: ${value};`);
const rootCss = document.getElementById("grist-root-css");
const defaultThemeCss = `@layer grist-base { :root { ${defaultVars.join(" ")} } }`;
getOrCreateStyleElement("hub-default-theme", { element: rootCss, position: "afterend" }).textContent = defaultThemeCss;

// Les zones de saisie des formulaires (Forms/styles.ts, saveControls) enregistrent quand
// l'application signale « clipboard_focus », c'est-à-dire quand l'utilisateur clique ailleurs que
// dans un champ (dans Grist, le focus revient alors à son presse-papiers). Le widget n'a pas
// l'application Grist : il émet le même signal au clic hors d'un champ.
const clipboardFocusListeners = new Set<() => void>();
const gristApp: App = {
  on(name: string, callback: () => void) {
    if (name === "clipboard_focus") {
      clipboardFocusListeners.add(callback);
    }
  },
  off(name: string, callback: () => void) {
    clipboardFocusListeners.delete(callback);
  },
};
(window as any).gristApp = gristApp;
document.addEventListener("mousedown", (ev) => {
  if (!(ev.target as Element).closest?.("textarea, input, select, [contenteditable]")) {
    [...clipboardFocusListeners].forEach(callback => callback());
  }
}, true);

class HubApp extends Disposable {
  public layout = Observable.create<FormLayoutNode | null>(this, null);
  public editing = Observable.create(this, false);

  private _hub = HubContext.create(this);
  private _readonly = new URLSearchParams(location.search).get("readonly") === "true";
  private _inGrist = typeof grist !== "undefined" && window.parent !== window;
  private _saveTimer = 0;

  /**
   * Ouvre l'éditeur ; un hub pas encore construit commence par la mise en page de départ.
   */
  public edit() {
    if (this._readonly) {
      return;
    }
    if (!this.layout.get()) {
      this.layout.set(starterLayout());
    }
    this.editing.set(true);
  }

  public buildDom() {
    // En lecture, le hub est redessiné quand Grist fournit les pages, les formulaires et l'adresse du
    // document : ils arrivent après le premier affichage.
    return dom("div",
      { style: "height: 100%" },
      dom.domComputed((use) => {
        if (use(this.editing)) {
          return this._buildEditor();
        }
        const layout = use(this.layout);
        use(this._hub.pages);
        use(this._hub.forms);
        use(this._hub.docBase);
        use(this._hub.loaded);
        return layout ? buildHubPage(this._hub.cleanLayout(layout), this._hub) : null;
      }),
    );
  }

  public connect() {
    if (!this._inGrist) {
      this._showDemo();
      return;
    }
    grist.ready({ requiredAccess: "full", onEditOptions: () => this.edit() });
    grist.onOptions((options: any) => {
      if (this.editing.get()) {
        return;
      }
      const layout = options?.[OPTION_KEY];
      this.layout.set(layout?.type === "Layout" ? layout : null);
      // Hub pas encore construit : on ouvre directement l'éditeur.
      if (!this.layout.get()) {
        this.edit();
      }
    });
    this._loadDocument().catch(err => console.warn("Pages et formulaires indisponibles (accès complet requis) :", err));
  }

  private _buildEditor() {
    const view = HubView.create(null, this._hub.cleanLayout(this.layout.get()!), this._hub,
      layout => this._save(layout),
      () => this.editing.set(false),
    );
    return dom("div",
      { style: "height: 100%" },
      dom.autoDispose(view),
      view.buildDom(),
    );
  }

  private _save(layout: FormLayoutNode) {
    this.layout.setAndTrigger(layout);
    window.clearTimeout(this._saveTimer);
    this._saveTimer = window.setTimeout(() => {
      if (this._inGrist) {
        grist.setOption(OPTION_KEY, layout).catch(console.error);
      }
    }, 300);
  }

  /**
   * Pages et formulaires du document (widgets « Formulaire »), et adresse du document.
   */
  private async _loadDocument() {
    const [pages, views, sections] = await Promise.all(
      ["_grist_Pages", "_grist_Views", "_grist_Views_section"].map(table => grist.docApi.fetchTable(table)),
    );
    const viewNames = new Map<number, string>(rows(views).map(view => [view.id, view.name]));

    // Les pages qui contiennent un hub sont marquées : elles ne sont pas proposées comme destination.
    const hubViews = new Set(rows(sections)
      .filter(section => section.parentKey === "custom" && /hub-formulaire/.test(section.options || ""))
      .map(section => section.parentId));
    this._hub.pages.set(rows(pages)
      .sort((a, b) => a.pagePos - b.pagePos)
      .map(page => ({
        id: page.viewRef,
        name: viewNames.get(page.viewRef) || "",
        hasHub: hubViews.has(page.viewRef),
      }))
      .filter(page => page.name));

    this._hub.forms.set(rows(sections)
      .filter(section => section.parentKey === "form" && viewNames.has(section.parentId))
      .map(section => ({
        id: section.id,
        name: (section.title || "").trim() || viewNames.get(section.parentId)!,
        page: viewNames.get(section.parentId)!,
      })));

    const token = await grist.docApi.getAccessToken({ readOnly: true });
    const match = /^(.*?)\/api\/docs\/([^/?#]+)/.exec(token.baseUrl || "");
    this._hub.docBase.set(match ? `${match[1]}/doc/${match[2]}` : null);
    this._hub.loaded.set(true);
  }

  /**
   * Hors de Grist : démonstration avec des pages fictives.
   */
  private _showDemo() {
    this._hub.pages.set([
      { id: 1, name: "Tableau de bord" },
      { id: 2, name: "Projets" },
      { id: 3, name: "Budget 2026" },
    ]);
    this._hub.forms.set([{ id: 7, name: "Signaler un incident", page: "Signalements" }]);
    this._hub.docBase.set("https://docs.getgrist.com/doc/demo");
    this._hub.loaded.set(true);
    this.edit();
  }
}

/**
 * Mise en page de départ : un titre, puis une rubrique avec trois cases à remplir.
 */
function starterLayout(): FormLayoutNode {
  return {
    id: uuidv4(),
    type: "Layout",
    children: [
      elements.Paragraph("# **Accueil**"),
      {
        id: uuidv4(),
        type: "Section",
        children: [
          elements.Paragraph("## **Rubrique**"),
          { ...elements.Columns(), children: [elements.Placeholder(), elements.Placeholder(), elements.Placeholder()] },
        ],
      },
    ],
  };
}

/** Lignes d'une table renvoyée par fetchTable (colonnes → objets). */
function rows(table: Record<string, any[]>): Record<string, any>[] {
  return table.id.map((_, i) => Object.fromEntries(Object.keys(table).map(key => [key, table[key][i]])));
}

const app = HubApp.create(null);
commands.init(); // comme app/client/ui/App.ts
setupLocale()
  .catch(console.error)
  .finally(() => document.body.appendChild(app.buildDom()));
app.connect();
