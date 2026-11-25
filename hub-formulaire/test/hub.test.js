/* global window, document */  // utilisés dans le navigateur (page.evaluate)
// Tests du hub, sur le modèle des tests du Formulaire de Grist (test/nbrowser/FormView1.ts) : chaque
// scénario ouvre le widget dans un navigateur, l'utilise comme un utilisateur et vérifie le résultat
// à l'écran et dans ce que le widget enregistre.
const assert = require("node:assert/strict");
const { after, before, describe, it } = require("node:test");

const {
  buttonsOf, closeHub, hubLayout, openHub, savedLayout, startBrowser, stopBrowser, waitToPass,
} = require("./helpers");

before(startBrowser);
after(stopBrowser);

/** Textes affichés par les éléments trouvés, sans les espaces autour. */
async function textsOf(locator) {
  return (await locator.allInnerTexts()).map(text => text.trim());
}

/** Textes des paragraphes de l'éditeur ; Grist les affiche dans un « shadow DOM ». */
function paragraphTexts(frame) {
  return frame.locator(".test-forms-Paragraph").evaluateAll(paragraphs => paragraphs.map(paragraph =>
    [...paragraph.querySelectorAll("*")].map(el => el.shadowRoot?.textContent.trim()).filter(Boolean).join(" ")));
}

/** Ouvre l'éditeur, comme « Ouvrir la configuration » dans le menu du widget. */
async function openEditor(page, frame) {
  await page.evaluate(() => window.__ready.onEditOptions());
  await frame.locator(".test-hub-done").waitFor();
}

/** Ajoute un bouton depuis le menu « + » de la première case vide. */
async function addButton(frame, kind, item) {
  const count = await frame.locator(".test-forms-Button").count();
  await frame.locator(".test-forms-Placeholder").first().click();
  if (item) {
    await frame.locator(`.test-forms-menu-button-${kind}`).hover();
    await frame.locator(`.test-forms-menu-${kind}-item`, { hasText: item }).click();
  } else {
    await frame.locator(`.test-forms-menu-button-${kind}`).click();
  }
  await frame.locator(".test-forms-Button").nth(count).waitFor();
}

/** Ouvre en édition un texte du bouton (sélectionné d'abord) et le remplace. */
async function editText(page, frame, index, part, text, finish = "Enter") {
  const button = frame.locator(".test-forms-Button").nth(index);
  await button.click();
  await button.locator(`.test-hub-${part}`).click();
  await frame.locator(`.test-hub-${part}-editor:focus`).waitFor();
  await page.keyboard.press("Control+a");
  await page.keyboard.type(text);
  if (finish === "click-elsewhere") {
    await frame.locator(".test-forms-Paragraph").first().click();
  } else {
    await page.keyboard.press(finish);
  }
  await frame.locator(`.test-hub-${part}-editor`).waitFor({ state: "detached" });
}

describe("Éditeur", () => {
  it("ouvre un hub vide avec la mise en page de départ", async () => {
    const hub = await openHub();
    const { frame } = hub;
    await frame.locator(".test-hub-done").waitFor();
    // Un titre, puis une section de Grist (titre et description) avec trois cases à remplir.
    await waitToPass(async () => {
      assert.deepEqual(await paragraphTexts(frame), ["Accueil", "Titre", "Description"]);
    });
    assert.equal(await frame.locator(".test-forms-Placeholder").count(), 3);
    await closeHub(hub);
  });

  it("propose les pages et les formulaires du document, sans la page du hub", async () => {
    const hub = await openHub();
    const { frame } = hub;
    await frame.locator(".test-forms-Placeholder").first().click();
    await frame.locator(".test-forms-menu-button-page").hover();
    await frame.locator(".test-forms-menu-page-item").first().waitFor();
    assert.deepEqual(await textsOf(frame.locator(".test-forms-menu-page-item")),
      ["Tableau de bord", "Projets", "Budget 2026", "Signalements"]);
    await frame.locator(".test-forms-menu-button-form").hover();
    await frame.locator(".test-forms-menu-form-item").first().waitFor();
    assert.deepEqual(await textsOf(frame.locator(".test-forms-menu-form-item")), ["Signaler un incident"]);
    await closeHub(hub);
  });

  it("nomme les blocs du menu « + » avec les traductions de Grist", async () => {
    const hub = await openHub();
    const { frame } = hub;
    await frame.locator(".test-forms-Placeholder").first().click();
    const menu = frame.locator(".grist-floating-menu");
    await menu.waitFor();
    const text = await menu.innerText();
    for (const label of ["NOUVEAU BOUTON", "BLOCS DE CONSTRUCTION", "Titre", "Paragraphe", "Colonnes", "Séparateur"]) {
      assert.ok(text.toUpperCase().includes(label.toUpperCase()), `« ${label} » absent du menu : ${text}`);
    }
    await closeHub(hub);
  });

  it("ajoute un bouton par destination et l'enregistre dans les options du widget", async () => {
    const hub = await openHub();
    const { page, frame } = hub;
    await addButton(frame, "page", "Budget 2026");
    await addButton(frame, "form", "Signaler un incident");
    await addButton(frame, "url");
    await frame.locator(".test-hub-url-editor:focus").waitFor();
    await page.keyboard.type("www.grandlyon.com");
    await page.keyboard.press("Enter");
    await waitToPass(async () => {
      const buttons = buttonsOf(await savedLayout(page));
      assert.deepEqual(buttons.map(b => [b.kind, b.page, b.form, b.url]), [
        ["page", 4, null, ""],
        ["form", null, 7, ""],
        ["url", null, null, "www.grandlyon.com"],
      ]);
    });
    assert.deepEqual(await textsOf(frame.locator(".test-forms-Button .test-hub-icon")), ["📄", "📝", "🌐"]);
    await closeHub(hub);
  });

  it("affiche le nom de la destination tant que le bouton n'a pas de texte", async () => {
    const hub = await openHub();
    const { frame } = hub;
    await addButton(frame, "page", "Projets");
    assert.deepEqual(await textsOf(frame.locator(".test-forms-Button .test-hub-label")), ["Projets"]);
    await closeHub(hub);
  });

  it("modifie le texte et la description sur la tuile, comme le libellé d'une question", async () => {
    const hub = await openHub();
    const { page, frame } = hub;
    await addButton(frame, "page", "Budget 2026");
    await editText(page, frame, 0, "label", "Budget annuel");
    await editText(page, frame, 0, "description", "Suivi des dépenses", "click-elsewhere");
    await waitToPass(async () => {
      const [button] = buttonsOf(await savedLayout(page));
      assert.equal(button.label, "Budget annuel");
      assert.equal(button.description, "Suivi des dépenses");
    });
    // Échap annule.
    await editText(page, frame, 0, "label", "Autre chose", "Escape");
    assert.deepEqual(await textsOf(frame.locator(".test-forms-Button .test-hub-label")), ["Budget annuel"]);
    assert.equal(buttonsOf(await savedLayout(page))[0].label, "Budget annuel");
    await closeHub(hub);
  });

  it("ouvre directement la saisie de l'adresse d'un nouveau bouton vers un site web", async () => {
    const hub = await openHub();
    const { page, frame } = hub;
    await addButton(frame, "url");
    await frame.locator(".test-hub-url-editor:focus").waitFor();
    await page.keyboard.type("www.grandlyon.fr");
    await page.keyboard.press("Enter");
    await waitToPass(async () => {
      assert.deepEqual(await textsOf(frame.locator(".test-hub-url")), ["www.grandlyon.fr"]);
      assert.deepEqual(await textsOf(frame.locator(".test-forms-Button .test-hub-label")), ["grandlyon.fr"]);
    });
    await closeHub(hub);
  });

  it("propose Insérer et Supprimer au clic droit, et supprime le bouton", async () => {
    const hub = await openHub({ layout: hubLayout({ kind: "page", page: 2 }, { kind: "page", page: 3 }) });
    const { page, frame } = hub;
    await openEditor(page, frame);
    // Un bloc hors d'une colonne : on peut insérer ci-dessus et ci-dessous.
    await frame.locator(".test-forms-Paragraph").first().click({ button: "right" });
    await frame.locator(".grist-floating-menu li").first().waitFor();
    const items = await textsOf(frame.locator(".grist-floating-menu li"));
    assert.deepEqual(items.map(item => item.split("\n")[0]), ["Insérer ci-dessus", "Insérer ci-dessous", "Supprimer"]);
    await page.keyboard.press("Escape");
    // Un bouton dans une colonne : seulement Supprimer.
    await frame.locator(".test-forms-Button").first().click({ button: "right" });
    await frame.locator(".grist-floating-menu li", { hasText: "Supprimer" }).click();
    await waitToPass(async () => {
      assert.deepEqual(buttonsOf(await savedLayout(page)).map(b => b.page), [3]);
    });
    await closeHub(hub);
  });

  it("ajoute une section ci-dessus ou ci-dessous depuis le « + » d'une section, comme le Formulaire", async () => {
    const hub = await openHub();
    const { page, frame } = hub;
    // « + » d'une section (Forms/Section.ts, code du Formulaire), visible au survol.
    for (const where of ["ci-dessous", "ci-dessus"]) {
      await frame.locator(".test-forms-Section").first().hover();
      await frame.locator(".test-forms-plus").first().click();
      await frame.locator(".grist-floating-menu li", { hasText: `Ajouter une section ${where}` }).click();
    }
    await waitToPass(async () => {
      assert.equal(await frame.locator(".test-forms-Section").count(), 3);
      assert.equal((await savedLayout(page)).children.filter(c => c.type === "Section").length, 3);
    });
    await closeHub(hub);
  });

  it("modifie un paragraphe sur place (bloc de Grist)", async () => {
    const hub = await openHub();
    const { page, frame } = hub;
    const paragraph = frame.locator(".test-forms-Paragraph").first();
    await paragraph.click();
    await paragraph.click();
    await frame.locator("textarea:focus").waitFor();
    await page.keyboard.press("Control+a");
    await page.keyboard.type("# Mon hub");
    // Un clic ailleurs enregistre.
    await frame.locator(".test-forms-Section").first().click({ position: { x: 5, y: 5 } });
    await waitToPass(async () => {
      assert.equal((await savedLayout(page)).children[0].text, "# Mon hub");
    });
    await closeHub(hub);
  });

  it("garde la même taille de tuile en édition et en lecture", async () => {
    const hub = await openHub({ layout: hubLayout({ kind: "page", page: 2, description: "Indicateurs" }) });
    const { page, frame } = hub;
    const tile = frame.locator(".test-hub-tile").first();
    await openEditor(page, frame);
    const edited = await tile.boundingBox();
    await frame.locator(".test-hub-done").click();
    await frame.locator("a.test-hub-tile").waitFor();
    const viewed = await tile.boundingBox();
    assert.ok(Math.abs(edited.height - viewed.height) < 4, `hauteur ${edited.height} / ${viewed.height}`);
    await closeHub(hub);
  });
});

describe("Lecture", () => {
  it("affiche des liens vers les pages, les formulaires et les sites web", async () => {
    const hub = await openHub({
      layout: hubLayout(
        { kind: "page", page: 2, label: "Indicateurs", description: "Tableau de bord" },
        { kind: "form", form: 7 },
        { kind: "url", url: "www.grandlyon.com" },
      ),
    });
    const { frame } = hub;
    const tiles = frame.locator("a.test-hub-tile");
    await waitToPass(async () => {
      assert.deepEqual(await tiles.evaluateAll(links => links.map(a => [a.getAttribute("href"), a.target])), [
        ["https://grist.test/o/docs/doc/DOC123/p/2", "_top"],
        ["https://grist.test/o/docs/doc/DOC123/f/7", "_blank"],
        ["https://www.grandlyon.com", "_blank"],
      ]);
    });
    const texts = await textsOf(tiles);
    assert.match(texts[0], /Indicateurs\s+Tableau de bord/);
    assert.match(texts[1], /Signaler un incident/);
    assert.match(texts[2], /grandlyon\.com/);
    assert.ok(!texts[2].includes("www."), "l'adresse n'est montrée que dans l'éditeur");
    await closeHub(hub);
  });

  it("refuse les adresses dangereuses", async () => {
    const hub = await openHub({ layout: hubLayout({ kind: "url", url: "javascript:alert(1)" }) });
    const { frame } = hub;
    await frame.locator("div.test-hub-tile").waitFor();
    assert.equal(await frame.locator("a.test-hub-tile").count(), 0);
    await closeHub(hub);
  });

  it("désactive un bouton dont la page ou le formulaire a été supprimé", async () => {
    const layout = hubLayout({ kind: "page", page: 99, label: "Ancienne page" }, { kind: "form", form: 98 });
    const hub = await openHub({ layout });
    const { page, frame } = hub;
    await waitToPass(async () => {
      assert.deepEqual(await textsOf(frame.locator("div.test-hub-tile")),
        ["📄\nAncienne page", "📝\nFormulaire à choisir"]);
    });
    assert.equal(await frame.locator("a.test-hub-tile").count(), 0);
    // Dans l'éditeur aussi : la destination disparue est retirée à l'enregistrement suivant.
    await openEditor(page, frame);
    await editText(page, frame, 0, "label", "Ancienne page (à refaire)");
    await waitToPass(async () => {
      assert.deepEqual(buttonsOf(await savedLayout(page)).map(b => [b.page, b.form]), [[null, null], [null, null]]);
    });
    await closeHub(hub);
  });

  it("ne propose pas comme destination une page qui contient un hub, quelle que soit son adresse", async () => {
    // Le hub est reconnu à l'adresse d'où il est chargé (ici celle du test), pas à un nom de dossier.
    const hub = await openHub();
    const { frame } = hub;
    await frame.locator(".test-forms-Placeholder").first().click();
    await frame.locator(".test-forms-menu-button-page").hover();
    await frame.locator(".test-forms-menu-page-item").first().waitFor();
    assert.ok(!(await textsOf(frame.locator(".test-forms-menu-page-item"))).includes("Accueil"));
    await closeHub(hub);
  });

  it("n'ouvre pas l'éditeur pour un lecteur", async () => {
    const hub = await openHub({ readonly: true, layout: hubLayout({ kind: "page", page: 2 }) });
    const { page, frame } = hub;
    await frame.locator("a.test-hub-tile").waitFor();
    await page.evaluate(() => window.__ready.onEditOptions());
    assert.equal(await frame.locator(".test-hub-done").count(), 0);
    assert.equal(await frame.locator("a.test-hub-tile").count(), 1);
    await closeHub(hub);
  });

  it("affiche une page vide à un lecteur tant que le hub n'est pas construit", async () => {
    const hub = await openHub({ readonly: true });
    const { frame } = hub;
    assert.equal(await frame.locator(".test-hub-done, .test-hub-tile").count(), 0);
    await closeHub(hub);
  });

  it("reste utilisable sans l'accès complet au document, avec des boutons désactivés", async () => {
    const hub = await openHub({ access: "read table", layout: hubLayout({ kind: "page", page: 2 }) });
    const { frame } = hub;
    await waitToPass(async () => {
      assert.deepEqual(await textsOf(frame.locator("div.test-hub-tile")), ["📄\nPage à choisir"]);
    });
    assert.equal(await frame.locator("a.test-hub-tile").count(), 0);
    await closeHub(hub);
  });

  it("tient dans un cadre étroit, sans défilement horizontal", async () => {
    const layout = hubLayout({ kind: "page", page: 2 }, { kind: "page", page: 3 }, { kind: "page", page: 4 });
    const hub = await openHub({ layout, width: 360 });
    const { frame } = hub;
    await frame.locator("a.test-hub-tile").first().waitFor();
    const overflow = await frame.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 0, `débordement de ${overflow} px`);
    await closeHub(hub);
  });
});
