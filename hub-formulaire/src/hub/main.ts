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
import { reportError } from "app/client/models/errors";
import { attachCssRootVars } from "app/client/ui2018/cssVars";
import { convertThemeKeysToCssVars } from "app/common/ThemePrefs";
import { GristLight } from "app/common/themes/GristLight";
import { InteractionOptions, InteractionOptionsRequest } from "app/plugin/CustomSectionAPI";
import { GristDocAPI } from "app/plugin/GristAPI";

import { Disposable, dom, Observable, styled } from "grainjs";
import { v4 as uuidv4 } from "uuid";

import type { App } from "app/client/ui/App";

/**
 * Ce que le hub utilise de l'API des widgets de Grist (grist-plugin-api.js, chargé par index.html),
 * avec les types de Grist.
 */
interface GristPluginApi {
  docApi: Pick<GristDocAPI, "fetchTable" | "getAccessToken">;
  ready(settings: InteractionOptionsRequest & { onEditOptions: () => void }): void;
  onOptions(callback: (options: Record<string, unknown> | null, settings: InteractionOptions) => void): void;
  setOption(key: string, value: unknown): Promise<void>;
}

declare const grist: GristPluginApi;

/** Clé des options du widget où est enregistrée la mise en page. */
const OPTION_KEY = "layout";

/** Identifiant du widget dans le catalogue (package.json, grist.widgetId). */
const WIDGET_ID = "@arthurpanck/widget-hub-formulaire";

class HubApp extends Disposable {
  private _layout = Observable.create<FormLayoutNode | null>(this, null);
  private _editing = Observable.create(this, false);
  private _hub = HubContext.create(this);
  private _readonly = new URLSearchParams(location.search).get("readonly") === "true";
  private _inGrist = typeof grist !== "undefined" && window.parent !== window;

  public buildDom() {
    return cssHubApp(
      dom.domComputed((use) => {
        if (use(this._editing)) {
          return this._buildEditor();
        }
        // En lecture, le hub est redessiné quand Grist fournit les pages, les formulaires et l'adresse
        // du document : ils arrivent après le premier affichage.
        const layout = use(this._layout);
        use(this._hub.pages);
        use(this._hub.forms);
        use(this._hub.docBase);
        use(this._hub.loaded);
        return layout ? buildHubPage(this._hub.cleanLayout(layout), this._hub) : null;
      }),
    );
  }

  /**
   * Relie le hub à Grist ; hors de Grist, affiche une démonstration.
   */
  public connect() {
    if (!this._inGrist) {
      this._showDemo();
      return;
    }
    grist.ready({ requiredAccess: "full", onEditOptions: () => this._edit() });
    grist.onOptions((options) => {
      if (this._editing.get()) {
        return;
      }
      const layout = options?.[OPTION_KEY] as FormLayoutNode | undefined;
      this._layout.set(layout?.type === "Layout" ? layout : null);
      // Hub pas encore construit : on ouvre directement l'éditeur.
      if (!this._layout.get()) {
        this._edit();
      }
    });
    this._loadDocument().catch(err => console.warn("Pages et formulaires indisponibles (accès complet requis) :", err));
  }

  /**
   * Ouvre l'éditeur ; un hub pas encore construit commence par la mise en page de départ.
   */
  private _edit() {
    if (this._readonly) {
      return;
    }
    if (!this._layout.get()) {
      this._layout.set(starterLayout());
    }
    this._editing.set(true);
  }

  private _buildEditor() {
    return dom.create((owner) => {
      const view = HubView.create(owner, this._hub.cleanLayout(this._layout.get()!), this._hub,
        layout => this._save(layout),
        () => this._editing.set(false),
      );
      return view.buildDom();
    });
  }

  /**
   * Enregistre la mise en page dans les options du widget, à chaque modification, comme le Formulaire.
   */
  private _save(layout: FormLayoutNode) {
    this._layout.set(layout);
    if (this._inGrist) {
      grist.setOption(OPTION_KEY, layout).catch(reportError);
    }
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
    const hubViews = new Set(rows(sections).filter(isHubSection).map(section => section.parentId));
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
    this._hub.forms.set([{ id: 7, name: "Signaler un incident" }]);
    this._hub.docBase.set("https://docs.getgrist.com/doc/demo");
    this._hub.loaded.set(true);
    this._edit();
  }
}

/**
 * Prépare, pour le code de Grist, ce que son application prépare d'habitude (app/client/ui/App.ts).
 */
function setupGristEnvironment() {
  (window as any).gristConfig = { supportedLngs: ["fr", "en"], namespaces: ["client"], userLocale: "fr" };

  // Styles de base de Grist, puis thème clair par défaut ; Grist remplace ce dernier par le thème de
  // l'utilisateur (couche « grist-theme », prioritaire) dès que le widget est connecté.
  attachCssRootVars("grist");
  const defaultTheme = convertThemeKeysToCssVars({ appearance: "light", name: "GristLight", colors: GristLight });
  const defaultVars = Object.entries(defaultTheme.colors).map(([key, value]) => `--grist-theme-${key}: ${value};`);
  const rootCss = document.getElementById("grist-root-css");
  getOrCreateStyleElement("hub-default-theme", { element: rootCss, position: "afterend" }).textContent =
    `@layer grist-base { :root { ${defaultVars.join(" ")} } }`;

  (window as any).gristApp = buildGristAppStub();
  commands.init(); // Initialize the 'commands' module using the default command list.
}

/**
 * Les zones de saisie des formulaires (Forms/styles.ts, saveControls) enregistrent quand
 * l'application signale « clipboard_focus », c'est-à-dire quand l'utilisateur clique ailleurs que dans
 * un champ (dans Grist, le focus revient alors à son presse-papiers). Le widget n'a pas l'application
 * Grist : il émet le même signal au clic hors d'un champ.
 */
function buildGristAppStub(): App {
  const listeners = new Set<() => void>();
  document.addEventListener("mousedown", (ev) => {
    if (!(ev.target as Element).closest?.("textarea, input, select, [contenteditable]")) {
      [...listeners].forEach(callback => callback());
    }
  }, true);
  return {
    on: (_name, callback) => listeners.add(callback),
    off: (_name, callback) => listeners.delete(callback),
  };
}

/**
 * Mise en page de départ : un titre, puis une section de Grist avec trois cases à remplir.
 */
function starterLayout(): FormLayoutNode {
  const columns = { ...elements.Columns(), children: [1, 2, 3].map(() => elements.Placeholder()) };
  return {
    id: uuidv4(),
    type: "Layout",
    children: [
      elements.Paragraph("# **Accueil**"),
      elements.Section(columns),
    ],
  };
}

/**
 * Cette section du document est-elle un hub ? Oui si elle charge ce widget, par son adresse ou par son
 * identifiant dans le catalogue.
 */
function isHubSection(section: Record<string, any>): boolean {
  if (section.parentKey !== "custom") {
    return false;
  }
  try {
    const custom = JSON.parse(JSON.parse(section.options || "{}").customView || "{}");
    const url = String(custom.url || "").split(/[?#]/)[0];
    return custom.widgetId === WIDGET_ID || url === location.origin + location.pathname;
  } catch (e) {
    return false;
  }
}

/** Lignes d'une table renvoyée par fetchTable (colonnes → objets). */
function rows(table: Record<string, any[]>): Record<string, any>[] {
  return table.id.map((_, i) => Object.fromEntries(Object.keys(table).map(key => [key, table[key][i]])));
}

const cssHubApp = styled("div", `
  height: 100%;
`);

setupGristEnvironment();
const app = HubApp.create(null);
// Les traductions d'abord : la mise en page de départ contient des textes traduits par Grist.
setupLocale()
  .catch(reportError)
  .finally(() => {
    document.body.appendChild(app.buildDom());
    app.connect();
  });
