/* global window */  // utilisés dans le navigateur (page.evaluate, addInitScript)
// Outils des tests : ouvre le widget dans Chromium (Playwright), dans une page qui imite Grist
// (le widget dans un cadre, faux grist-plugin-api), avec un document fictif.
const assert = require("node:assert/strict");
const path = require("path");

const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const ORIGIN = "http://hub.test";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };

/** Options d'un widget personnalisé chargé depuis cette adresse, telles que Grist les enregistre. */
const customSection = url => JSON.stringify({ customView: JSON.stringify({ mode: "url", url }) });

/**
 * Document fictif : « Accueil » contient le hub, « Signalements » un formulaire.
 */
const DOC = {
  _grist_Pages: { id: [1, 2, 3, 4, 5], viewRef: [1, 2, 3, 4, 5], pagePos: [1, 2, 3, 4, 5] },
  _grist_Views: { id: [1, 2, 3, 4, 5], name: ["Accueil", "Tableau de bord", "Projets", "Budget 2026", "Signalements"] },
  _grist_Views_section: {
    id: [1, 2, 7],
    parentId: [1, 2, 5],
    parentKey: ["custom", "record", "form"],
    title: ["", "", "Signaler un incident"],
    options: [customSection(`${ORIGIN}/index.html`), "", ""],
  },
};

/**
 * Mise en page d'un hub : un titre, puis une section avec les boutons donnés en colonnes.
 */
function hubLayout(...buttons) {
  return {
    id: "root", type: "Layout", children: [
      { id: "title", type: "Paragraph", text: "# **Accueil**" },
      {
        id: "section", type: "Section", children: [
          { id: "columns", type: "Columns", children: buttons.map((b, i) => ({ id: `b${i}`, type: "Button", ...b })) },
        ],
      },
    ],
  };
}

let browser = null;

async function startBrowser() {
  browser = await chromium.launch();
}

async function stopBrowser() {
  await browser?.close();
}

/**
 * Ouvre le widget. Options : layout (mise en page enregistrée), readonly, access, tables, width
 * (largeur du cadre). Renvoie la page, le cadre du widget et les erreurs de la console.
 */
async function openHub({ layout = null, readonly = false, access = "full", tables = DOC, width = 1280 } = {}) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") {
      errors.push(m.text());
    }
  });
  await page.addInitScript((mock) => {
    if (window === window.top) {
      window.__mock = mock;
    }
  }, { options: layout ? { layout } : null, access, tables });
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.href.startsWith("https://docs.getgrist.com/grist-plugin-api.js")) {
      return route.fulfill({ path: path.join(__dirname, "fixtures/grist-plugin-api.js"), contentType: TYPES[".js"] });
    }
    if (url.origin === ORIGIN && url.pathname === "/grist.html") {
      const src = `/index.html?access=${access}&readonly=${readonly}`;
      return route.fulfill({
        contentType: TYPES[".html"],
        body: `<!doctype html><style>html,body{margin:0;height:100%}iframe{border:0;width:100%;height:100%}</style>` +
          `<iframe src="${src}"></iframe>`,
      });
    }
    if (url.origin === ORIGIN) {
      const file = path.join(ROOT, url.pathname);
      return route.fulfill({ path: file, contentType: TYPES[path.extname(file)] });
    }
    return route.fulfill({ status: 404, body: "" });
  });
  await page.goto(`${ORIGIN}/grist.html`);
  // Le widget est prêt quand il a reçu ses options et le document (ou le refus d'y accéder).
  await page.waitForFunction(() => window.__optionsSent && window.__documentRead);
  const frame = await (await page.$("iframe")).contentFrame();
  return { page, frame, errors };
}

/**
 * Ferme le widget ; le scénario échoue s'il a provoqué une erreur dans la console.
 */
async function closeHub({ page, errors }) {
  assert.deepEqual(errors, [], "erreurs dans la console du navigateur");
  await page.close();
}

/**
 * Mise en page enregistrée par le widget dans ses options.
 */
function savedLayout(page) {
  return page.evaluate(() => window.__savedOptions?.layout);
}

/**
 * Relance une vérification jusqu'à ce qu'elle passe, comme waitToPass dans les tests de Grist :
 * l'interface et l'enregistrement se mettent à jour un court instant après une action.
 */
async function waitToPass(check, timeoutMs = 3000) {
  const start = Date.now();
  for (;;) {
    try {
      return await check();
    } catch (err) {
      if (Date.now() - start > timeoutMs) {
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

/**
 * Tous les boutons d'une mise en page, dans l'ordre.
 */
function buttonsOf(layout) {
  const all = [];
  const walk = (node) => {
    if (node.type === "Button") {
      all.push(node);
    }
    node.children?.forEach(walk);
  };
  walk(layout);
  return all;
}

module.exports = { startBrowser, stopBrowser, openHub, closeHub, savedLayout, waitToPass, buttonsOf, hubLayout };
