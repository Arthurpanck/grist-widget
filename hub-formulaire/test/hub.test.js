/* global window, document */  // utilisés dans le navigateur (page.evaluate)
// Tests du hub, sur le modèle des tests du Formulaire de Grist (test/nbrowser/FormView1.ts) : chaque
// scénario ouvre le widget dans un navigateur, l'utilise comme un utilisateur et vérifie le résultat
// à l'écran et dans ce que le widget enregistre.
const assert = require("node:assert/strict");
const { after, before, describe, it } = require("node:test");

const { buttonsOf, hubLayout, openHub, savedLayout, startBrowser, stopBrowser } = require("./helpers");

before(startBrowser);
after(stopBrowser);

/** Choisit une entrée du menu « + » ouvert sur la première case vide. */
async function addButton(page, frame, submenu, item) {
  await frame.locator(".test-forms-Placeholder").first().click();
  if (item) {
    await frame.locator(`.test-forms-menu-button-${submenu}`).hover();
    await frame.locator(`.test-forms-menu-${submenu}-item`, { hasText: item }).click();
  } else {
    await frame.locator(`.test-forms-menu-button-${submenu}`).click();
  }
  await page.waitForTimeout(300);
}

/** Ouvre l'éditeur, comme « Ouvrir la configuration » dans le menu du widget. */
async function openEditor(page, frame) {
  await page.evaluate(() => window.__ready.onEditOptions());
  await frame.locator(".test-hub-done").waitFor();
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
  await page.waitForTimeout(300);
}

describe("Éditeur", () => {
  it("ouvre un hub vide avec la mise en page de départ", async () => {
    const { page, frame, errors } = await openHub();
    assert.equal(await frame.locator(".test-hub-done").count(), 1);
    assert.equal(await frame.locator(".test-forms-Paragraph").count(), 2);
    assert.equal(await frame.locator(".test-forms-Placeholder").count(), 3);
    assert.deepEqual(errors, []);
    await page.close();
  });

  it("propose les pages et les formulaires du document, sans la page du hub", async () => {
    const { page, frame } = await openHub();
    await frame.locator(".test-forms-Placeholder").first().click();
    await frame.locator(".test-forms-menu-button-page").hover();
    await frame.locator(".test-forms-menu-page-item").first().waitFor();
    const pages = await frame.locator(".test-forms-menu-page-item").allInnerTexts();
    assert.deepEqual(pages.map(p => p.trim()), ["Tableau de bord", "Projets", "Budget 2026", "Signalements"]);
    await frame.locator(".test-forms-menu-button-form").hover();
    await frame.locator(".test-forms-menu-form-item").first().waitFor();
    const forms = await frame.locator(".test-forms-menu-form-item").allInnerTexts();
    assert.deepEqual(forms.map(f => f.trim()), ["Signaler un incident"]);
    await page.close();
  });

  it("ajoute un bouton par destination et l'enregistre dans les options du widget", async () => {
    const { page, frame } = await openHub();
    await addButton(page, frame, "page", "Budget 2026");
    await addButton(page, frame, "form", "Signaler un incident");
    await addButton(page, frame, "url");
    await page.keyboard.type("www.grandlyon.com");
    await page.keyboard.press("Enter");
    const buttons = buttonsOf(await savedLayout(page));
    assert.deepEqual(buttons.map(b => [b.kind, b.page, b.form, b.url]), [
      ["page", 4, null, ""],
      ["form", null, 7, ""],
      ["url", null, null, "www.grandlyon.com"],
    ]);
    const icons = await frame.locator(".test-forms-Button .test-hub-icon").allInnerTexts();
    assert.deepEqual(icons.map(i => i.trim()), ["📄", "📝", "🌐"]);
    await page.close();
  });

  it("affiche le nom de la destination tant que le bouton n'a pas de texte", async () => {
    const { page, frame } = await openHub();
    await addButton(page, frame, "page", "Projets");
    assert.equal((await frame.locator(".test-forms-Button .test-hub-label").innerText()).trim(), "Projets");
    await page.close();
  });

  it("modifie le texte et la description sur la tuile, comme le libellé d'une question", async () => {
    const { page, frame } = await openHub();
    await addButton(page, frame, "page", "Budget 2026");
    await editText(page, frame, 0, "label", "Budget annuel");
    await editText(page, frame, 0, "description", "Suivi des dépenses", "click-elsewhere");
    let [button] = buttonsOf(await savedLayout(page));
    assert.equal(button.label, "Budget annuel");
    assert.equal(button.description, "Suivi des dépenses");
    // Échap annule.
    await editText(page, frame, 0, "label", "Autre chose", "Escape");
    [button] = buttonsOf(await savedLayout(page));
    assert.equal(button.label, "Budget annuel");
    assert.equal((await frame.locator(".test-forms-Button .test-hub-label").innerText()).trim(), "Budget annuel");
    await page.close();
  });

  it("ouvre directement la saisie de l'adresse d'un nouveau bouton vers un site web", async () => {
    const { page, frame } = await openHub();
    await addButton(page, frame, "url");
    assert.equal(await frame.locator(".test-hub-url-editor:focus").count(), 1);
    await page.keyboard.type("www.grandlyon.fr");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    assert.equal((await frame.locator(".test-hub-url").innerText()).trim(), "www.grandlyon.fr");
    assert.equal((await frame.locator(".test-forms-Button .test-hub-label").innerText()).trim(), "grandlyon.fr");
    await page.close();
  });

  it("propose seulement Insérer et Supprimer au clic droit, et supprime le bouton", async () => {
    const { page, frame } = await openHub({ layout: hubLayout({ kind: "page", page: 2 }, { kind: "page", page: 3 }) });
    await openEditor(page, frame);
    await frame.locator(".test-forms-Button").first().click({ button: "right" });
    await frame.locator(".grist-floating-menu li").first().waitFor();
    const items = (await frame.locator(".grist-floating-menu li").allInnerTexts()).map(t => t.trim()).filter(Boolean);
    assert.ok(items.some(t => t.startsWith("Supprimer")), items.join(" / "));
    assert.ok(!items.some(t => /Copier|Couper|Coller|destination/.test(t)), items.join(" / "));
    await frame.locator(".grist-floating-menu li", { hasText: "Supprimer" }).click();
    assert.deepEqual(buttonsOf(await savedLayout(page)).map(b => b.page), [3]);
    await page.close();
  });

  it("ajoute une section ci-dessus ou ci-dessous, comme le Formulaire, et en bas de page", async () => {
    const { page, frame } = await openHub();
    const sections = async () => (await savedLayout(page)).children.map(c => c.type).filter(t => t === "Section");
    // « + » d'une section (Forms/Section.ts), visible au survol.
    for (const where of ["ci-dessous", "ci-dessus"]) {
      await frame.locator(".test-forms-Section").first().hover();
      await frame.locator(".test-forms-plus").first().click();
      await frame.locator(".grist-floating-menu li", { hasText: `Ajouter une section ${where}` }).click();
    }
    assert.equal((await sections()).length, 3);
    // « + » en bas de page : une section à la fin.
    await frame.locator(".test-hub-add-block .test-forms-plus, .test-hub-add-block div").last().click();
    await frame.locator(".test-hub-add-section").click();
    const layout = await savedLayout(page);
    assert.equal((await sections()).length, 4);
    assert.equal(layout.children.at(-1).type, "Section");
    await page.close();
  });

  it("modifie un paragraphe sur place (bloc de Grist)", async () => {
    const { page, frame } = await openHub();
    const paragraph = frame.locator(".test-forms-Paragraph").first();
    await paragraph.click();
    await paragraph.click();
    await frame.locator("textarea:focus").waitFor();
    await page.keyboard.press("Control+a");
    await page.keyboard.type("# Mon hub");
    await frame.locator(".test-forms-Placeholder").first().click();
    await page.keyboard.press("Escape");
    assert.equal((await savedLayout(page)).children[0].text, "# Mon hub");
    await page.close();
  });

  it("garde la même taille de tuile en édition et en lecture", async () => {
    const { page, frame } = await openHub({ layout: hubLayout({ kind: "page", page: 2, description: "Indicateurs" }) });
    await openEditor(page, frame);
    const editHeight = await frame.locator(".hub-tile").first().evaluate(e => e.getBoundingClientRect().height);
    await frame.locator(".test-hub-done").click();
    await page.waitForTimeout(300);
    const viewHeight = await frame.locator(".hub-tile").first().evaluate(e => e.getBoundingClientRect().height);
    assert.ok(Math.abs(editHeight - viewHeight) < 4, `${editHeight} / ${viewHeight}`);
    await page.close();
  });
});

describe("Lecture", () => {
  it("affiche des liens vers les pages, les formulaires et les sites web", async () => {
    const { page, frame, errors } = await openHub({
      layout: hubLayout(
        { kind: "page", page: 2, label: "Indicateurs", description: "Tableau de bord" },
        { kind: "form", form: 7 },
        { kind: "url", url: "www.grandlyon.com" },
      ),
    });
    const links = await frame.locator("a.hub-tile").evaluateAll(as => as.map(a => [a.getAttribute("href"), a.target]));
    assert.deepEqual(links, [
      ["https://grist.test/o/docs/doc/DOC123/p/2", "_top"],
      ["https://grist.test/o/docs/doc/DOC123/f/7", "_blank"],
      ["https://www.grandlyon.com", "_blank"],
    ]);
    const texts = await frame.locator("a.hub-tile").allInnerTexts();
    assert.match(texts[0], /Indicateurs\s+Tableau de bord/);
    assert.match(texts[1], /Signaler un incident/);
    assert.match(texts[2], /grandlyon\.com/);
    assert.ok(!texts[2].includes("www."), "l'adresse n'est montrée que dans l'éditeur");
    assert.deepEqual(errors, []);
    await page.close();
  });

  it("refuse les adresses dangereuses", async () => {
    const { page, frame } = await openHub({ layout: hubLayout({ kind: "url", url: "javascript:alert(1)" }) });
    assert.equal(await frame.locator("a.hub-tile").count(), 0);
    assert.equal(await frame.locator("div.hub-tile").count(), 1);
    await page.close();
  });

  it("désactive un bouton dont la page ou le formulaire a été supprimé", async () => {
    const layout = hubLayout({ kind: "page", page: 99, label: "Ancienne page" }, { kind: "form", form: 98 });
    const { page, frame } = await openHub({ layout });
    assert.equal(await frame.locator("a.hub-tile").count(), 0);
    const texts = (await frame.locator("div.hub-tile").allInnerTexts()).map(t => t.trim());
    assert.deepEqual(texts, ["📄\nAncienne page", "📝\nFormulaire à choisir"]);
    // Dans l'éditeur aussi : la destination disparue est retirée à l'enregistrement suivant.
    await openEditor(page, frame);
    await editText(page, frame, 0, "label", "Ancienne page (à refaire)");
    assert.deepEqual(buttonsOf(await savedLayout(page)).map(b => [b.page, b.form]), [[null, null], [null, null]]);
    await page.close();
  });

  it("n'ouvre pas l'éditeur pour un lecteur", async () => {
    const { page, frame } = await openHub({ readonly: true, layout: hubLayout({ kind: "page", page: 2 }) });
    await page.evaluate(() => window.__ready.onEditOptions());
    await page.waitForTimeout(300);
    assert.equal(await frame.locator(".test-hub-done").count(), 0);
    assert.equal(await frame.locator("a.hub-tile").count(), 1);
    await page.close();
  });

  it("affiche une page vide à un lecteur tant que le hub n'est pas construit", async () => {
    const { page, frame, errors } = await openHub({ readonly: true });
    assert.equal(await frame.locator(".test-hub-done, .hub-tile").count(), 0);
    assert.deepEqual(errors, []);
    await page.close();
  });

  it("reste utilisable sans l'accès complet au document, avec des boutons désactivés", async () => {
    const { page, frame } = await openHub({ access: "read table", layout: hubLayout({ kind: "page", page: 2 }) });
    assert.equal(await frame.locator("a.hub-tile").count(), 0);
    assert.equal((await frame.locator("div.hub-tile").innerText()).trim(), "📄\nPage à choisir");
    await page.close();
  });

  it("tient dans un cadre étroit, sans défilement horizontal", async () => {
    const layout = hubLayout({ kind: "page", page: 2 }, { kind: "page", page: 3 }, { kind: "page", page: 4 });
    const { page, frame } = await openHub({ layout, width: 360 });
    const overflow = await frame.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 0, `débordement de ${overflow} px`);
    await page.close();
  });
});
