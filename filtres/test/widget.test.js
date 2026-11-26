// Tests du widget dans Chromium (Playwright), dans une page qui imite Grist : le widget est chargé
// dans un cadre, avec un faux grist-plugin-api (test/fixtures) et une table fictive de 60 projets.
//   node --test test/
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try { return require('playwright'); } catch (e) {
    // Playwright installé globalement (poste de développement).
    return require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
  }
}
const { chromium } = loadPlaywright();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'http://filtres.test';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const RESERVE = 20;

const STATUTS = ['À faire', 'En cours', 'Terminé'];
const VILLES = ['Lyon', 'Bron', 'Écully', 'Givors'];
const day = (y, m, d) => Date.UTC(y, m - 1, d) / 1000;

/** Table « Projets » de 60 lignes, valeurs déterministes. */
function makeDoc() {
  const n = 60;
  const ids = Array.from({ length: n }, (_, i) => i + 1);
  const data = {
    id: ids,
    Nom: ids.map(i => `Projet ${i}`),
    Statut: ids.map(i => STATUTS[i % 3]),
    Ville: ids.map(i => (i % 10 === 0 ? '' : VILLES[i % 4])),
    Tags: ids.map(i => ['L', ...(i % 2 ? ['Eau'] : []), ...(i % 5 === 0 ? ['Climat'] : [])]),
    Budget: ids.map(i => i * 1000),
    Debut: ids.map(i => ['d', day(2020 + (i % 5), 1 + (i % 12), 1)]),
    Actif: ids.map(i => i % 4 !== 0),
  };
  const cols = [
    ['Nom', 'Nom', 'Text', {}],
    ['Statut', 'Statut', 'Choice', { choices: STATUTS, choiceOptions: { 'En cours': { fillColor: '#FFD666', textColor: '#262633' } } }],
    ['Ville', 'Ville', 'Ref:Villes', {}],
    ['Tags', 'Thèmes', 'ChoiceList', { choices: ['Eau', 'Climat'] }],
    ['Budget', 'Budget', 'Numeric', { numMode: 'currency', currency: 'EUR', decimals: 0 }],
    ['Debut', 'Date de début', 'Date', {}],
    ['Actif', 'Actif', 'Bool', {}],
  ];
  const columns = { id: [], parentId: [], colId: [], label: [], type: [], widgetOptions: [], visibleCol: [], parentPos: [], isFormula: [], formula: [] };
  cols.forEach(([colId, label, type, wo], i) => {
    columns.id.push(i + 1); columns.parentId.push(1); columns.colId.push(colId); columns.label.push(label);
    columns.type.push(type); columns.widgetOptions.push(JSON.stringify(wo)); columns.visibleCol.push(type.startsWith('Ref') ? 100 : 0);
    columns.parentPos.push(i); columns.isFormula.push(false); columns.formula.push('');
  });
  columns.id.push(100); columns.parentId.push(2); columns.colId.push('Nom'); columns.label.push('Nom'); columns.type.push('Text');
  columns.widgetOptions.push(''); columns.visibleCol.push(0); columns.parentPos.push(1); columns.isFormula.push(false); columns.formula.push('');
  return { tableId: 'Projets', data, tables: { _grist_Tables: { id: [1, 2], tableId: ['Projets', 'Villes'], onDemand: [false, false] }, _grist_Tables_column: columns } };
}

let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser?.close(); });

/**
 * Ouvre le widget. Options : options (réglages enregistrés), readonly, linked, width, height,
 * context (pour garder le stockage du navigateur d'une ouverture à l'autre).
 */
async function openWidget({ options = null, readonly = false, linked = true, access = 'full', width = 320, height = 800, context = null, waitFor = '.fl-facet', delays = null } = {}) {
  const ctx = context || await browser.newContext({ viewport: { width: Math.max(width + 40, 800), height: height + 40 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') { errors.push(m.text()); } });
  await page.addInitScript((mock) => { if (window === window.top) { window.__mock = mock; } }, { ...makeDoc(), options, linked, access, delays });
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.href.startsWith('https://docs.getgrist.com/grist-plugin-api.js')) {
      return route.fulfill({ path: path.join(ROOT, 'test/fixtures/grist-plugin-api.js'), contentType: TYPES['.js'] });
    }
    if (url.origin === ORIGIN && url.pathname === '/grist.html') {
      const src = `/index.html${readonly ? '?readonly=true' : ''}`;
      return route.fulfill({ contentType: 'text/html', body: `<!doctype html><body style="margin:0"><iframe id="w" src="${src}" style="border:0;width:${width}px;height:${height}px"></iframe></body>` });
    }
    if (url.origin === ORIGIN) {
      const file = path.join(ROOT, url.pathname);
      return route.fulfill({ path: file, contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
    }
    return route.abort();
  });
  await page.goto(`${ORIGIN}/grist.html`);
  const frame = page.frames().find(f => f.url().includes('/index.html'));
  await frame.waitForSelector(waitFor);
  return { page, frame, errors, context: ctx };
}

const facet = (frame, colId) => frame.locator(`.fl-facet[data-col="${colId}"]`);
const value = (frame, colId, label) => facet(frame, colId).locator('.fl-value-row', { hasText: label }).first();
/** Dernière liste transmise à Grist, sans les identifiants réservés aux nouvelles lignes. */
async function lastSelected(page) {
  const all = await page.evaluate(() => window.__selected);
  const last = all[all.length - 1];
  return last === null || last === undefined ? last : last.filter(id => id <= 60);
}
async function waitSelected(page, expected) {
  for (let i = 0; i < 40; i++) {
    const got = await lastSelected(page);
    if (JSON.stringify(got) === JSON.stringify(expected)) { return; }
    await page.waitForTimeout(25);
  }
  assert.deepEqual(await lastSelected(page), expected);
}
const expectIds = pred => Array.from({ length: 60 }, (_, i) => i + 1).filter(pred);

test('champs proposés automatiquement, avec le nombre de lignes par valeur', async () => {
  const { page, frame, errors } = await openWidget();
  const cols = await frame.locator('.fl-facet').evaluateAll(els => els.map(e => e.dataset.col + ':' + e.dataset.mode));
  assert.deepEqual(cols, ['Statut:list', 'Ville:list', 'Tags:list', 'Budget:range', 'Debut:period', 'Actif:list']);
  assert.equal(await value(frame, 'Statut', 'En cours').locator('.fl-value-count').textContent(), '20');
  assert.equal(await frame.locator('.fl-count').textContent(), '60 lignes');
  assert.match(await frame.locator('.fl-notice').textContent(), /Champs proposés automatiquement/);
  // Le widget demande l'accès complet et se déclare source de sélection.
  const ready = await page.evaluate(() => window.__ready);
  assert.equal(ready.requiredAccess, 'full');
  assert.equal(ready.allowSelectBy, true);
  assert.deepEqual(errors, []);
  await page.close();
});

test('cocher plusieurs valeurs dans plusieurs champs filtre les lignes transmises à Grist', async () => {
  const { page, frame } = await openWidget();
  await value(frame, 'Statut', 'En cours').click();
  await waitSelected(page, expectIds(i => i % 3 === 1));
  await value(frame, 'Statut', 'Terminé').click();
  await value(frame, 'Ville', 'Lyon').click();
  const expected = expectIds(i => i % 3 !== 0 && i % 10 !== 0 && i % 4 === 0);
  await waitSelected(page, expected);
  assert.equal(await frame.locator('.fl-count').textContent(), `${expected.length} sur 60 lignes`);
  // Les nombres d'un champ tiennent compte des autres champs, pas du sien.
  assert.equal(await value(frame, 'Statut', 'À faire').locator('.fl-value-count').textContent(), String(expectIds(i => i % 3 === 0 && i % 4 === 0 && i % 10 !== 0).length));
  // La liste réserve les identifiants des prochaines lignes ajoutées.
  const raw = await page.evaluate(() => window.__selected[window.__selected.length - 1]);
  assert.deepEqual(raw.slice(-RESERVE - 1).slice(0, 2), [expected[expected.length - 1], 61]);
  assert.equal(await frame.locator('.fl-chip').count(), 2);
  await page.close();
});

test('« Seulement », exclure, effacer un champ, tout effacer puis annuler', async () => {
  const { page, frame } = await openWidget();
  await value(frame, 'Statut', 'En cours').click();
  await value(frame, 'Statut', 'Terminé').hover();
  await value(frame, 'Statut', 'Terminé').locator('.fl-only').click();
  await waitSelected(page, expectIds(i => i % 3 === 2));
  await facet(frame, 'Statut').locator('.fl-not').selectOption('not');
  await waitSelected(page, expectIds(i => i % 3 !== 2));
  assert.match(await frame.locator('.fl-chip').first().textContent(), /sauf Terminé/);
  await facet(frame, 'Statut').locator('.fl-facet-clear').click();
  await waitSelected(page, null);
  await value(frame, 'Actif', 'Non').click();
  await waitSelected(page, expectIds(i => i % 4 === 0));
  await frame.locator('.fl-reset').click();
  await waitSelected(page, null);
  await frame.locator('.fl-toast-undo').click();
  await waitSelected(page, expectIds(i => i % 4 === 0));
  await page.close();
});

test('plage de montants, période, recherche globale', async () => {
  const { page, frame } = await openWidget();
  await facet(frame, 'Budget').locator('input').first().fill('10 000');
  await facet(frame, 'Budget').locator('input').nth(1).fill('20000');
  await facet(frame, 'Budget').locator('input').nth(1).press('Enter');
  await waitSelected(page, expectIds(i => i >= 10 && i <= 20));
  await facet(frame, 'Debut').locator('input[type=date]').first().fill('2022-01-01');
  await facet(frame, 'Debut').locator('input[type=date]').nth(1).fill('2022-12-31');
  await waitSelected(page, expectIds(i => i >= 10 && i <= 20 && i % 5 === 2));
  assert.equal(await facet(frame, 'Debut').locator('select').inputValue(), 'custom');
  await frame.locator('.fl-chip', { hasText: 'Budget' }).locator('.fl-chip-x').click();
  // Recherche globale : chaque mot doit se trouver dans une des colonnes.
  await frame.locator('.fl-search-input').fill('bron eau');
  await waitSelected(page, expectIds(i => i % 5 === 2 && i % 4 === 1 && i % 10 !== 0 && i % 2 === 1));
  await page.close();
});

test('les filtres de chacun sont retrouvés à la réouverture', async () => {
  const first = await openWidget();
  await value(first.frame, 'Ville', 'Bron').click();
  await waitSelected(first.page, expectIds(i => i % 4 === 1 && i % 10 !== 0));
  await first.page.waitForTimeout(400);   // mémorisation différée
  await first.page.close();
  const second = await openWidget({ context: first.context });
  await waitSelected(second.page, expectIds(i => i % 4 === 1 && i % 10 !== 0));
  assert.equal(await value(second.frame, 'Ville', 'Bron').locator('input').isChecked(), true);
  await second.page.close();
  await first.context.close();
});

test('configuration : choisir les champs et leur façon de filtrer', async () => {
  const { page, frame } = await openWidget();
  await frame.locator('.fl-settings-btn').click();
  const row = label => frame.locator('.fl-fieldrow', { hasText: label });
  await row('Thèmes').locator('input[type=checkbox]').uncheck();
  await row('Nom').locator('input[type=checkbox]').check();
  await row('Nom').locator('.fl-mode-select').selectOption('text');
  await row('Date de début').locator('.fl-mode-select').selectOption('year');
  await frame.locator('.fl-settings-foot .fl-btn-primary').click();
  const saved = await page.evaluate(() => window.__savedOptions.filtres);
  assert.deepEqual(saved.fields.map(f => `${f.colId}:${f.mode}`), ['Statut:list', 'Ville:list', 'Budget:range', 'Debut:year', 'Actif:list', 'Nom:text']);
  assert.ok(saved.id);
  await frame.waitForSelector('.fl-facet[data-col="Nom"][data-mode="text"]');
  assert.equal(await frame.locator('.fl-notice').isHidden(), true);
  assert.match(await frame.locator('.fl-toast').textContent(), /Enregistrer/);
  await facet(frame, 'Nom').locator('input').fill('projet 5');
  await waitSelected(page, [5, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]);   // l'expression « projet 5 »
  await page.close();
});

test('lecteur : ni configuration ni bandeaux d’aide', async () => {
  const { page, frame } = await openWidget({ readonly: true, linked: false });
  assert.equal(await frame.locator('.fl-settings-btn').isHidden(), true);
  assert.equal(await frame.locator('.fl-notice').isHidden(), true);
  await page.close();
});

test('accès pas encore accordé : explique quoi faire, au lieu de « Chargement… »', async () => {
  const { page, frame } = await openWidget({ access: 'none', waitFor: '.fl-message:not([hidden])' });
  await frame.waitForFunction(() => /Accepter/.test(document.querySelector('.fl-message').textContent));
  assert.equal(await frame.locator('.fl-top').isHidden(), true);
  await page.close();
});

test('accès limité à la table : colonnes déduites des valeurs, et le configurateur est prévenu', async () => {
  const { page, frame } = await openWidget({ access: 'read table' });
  assert.match(await frame.locator('.fl-notice').textContent(), /Accès limité/);
  assert.equal(await page.evaluate(() => window.__fetchOptions.includeColumns), 'shown');
  await value(frame, 'Statut', 'Terminé').click();
  await waitSelected(page, expectIds(i => i % 3 === 2));
  await page.close();
});

test('widget non relié : explique comment le relier', async () => {
  const { page, frame } = await openWidget({ linked: false });
  assert.match(await frame.locator('.fl-notice').textContent(), /Sélectionner par/);
  await page.close();
});

test('dispositions : colonne, grille, bandeau', async () => {
  for (const [width, height, layout] of [[300, 700, 'column'], [900, 700, 'grid'], [1100, 260, 'band']]) {
    const { page, frame } = await openWidget({ width, height });
    assert.equal(await frame.locator('.fl-app').getAttribute('data-layout'), layout);
    // Le cadre ne défile jamais en entier : l'en-tête reste visible.
    await value(frame, 'Actif', 'Oui').click();
    assert.equal(await frame.evaluate(() => document.scrollingElement.scrollTop), 0);
    await page.close();
  }
});

test('filtres retrouvés même si l’identifiant du document arrive avant les colonnes', async () => {
  const first = await openWidget();
  await value(first.frame, 'Statut', 'Terminé').click();
  await first.page.waitForTimeout(400);
  await first.page.close();
  const second = await openWidget({ context: first.context, delays: { docName: 5, meta: 200 } });
  await waitSelected(second.page, expectIds(i => i % 3 === 2));
  await second.page.waitForTimeout(400);
  const stored = await second.frame.evaluate(() => JSON.parse(localStorage.getItem('grist-filtres:DOC123:Projets:auto')));
  assert.deepEqual(stored.filters.Statut.in, ['Terminé']);
  await second.page.close();
  await first.context.close();
});

test('saisie d’une date : l’autre date n’est jamais modifiée', async () => {
  const { page, frame } = await openWidget();
  const dates = facet(frame, 'Debut').locator('input[type=date]');
  await dates.first().fill('2022-01-01');
  await dates.nth(1).fill('2022-12-31');
  await waitSelected(page, expectIds(i => i % 5 === 2));
  // Chrome signale chaque chiffre tapé : « 0002-12-31 », puis « 0020-12-31 »… jusqu'à « 2023-12-31 ».
  await dates.nth(1).evaluate(async (input) => {
    for (const v of ['0002-12-31', '0020-12-31', '0202-12-31', '2023-12-31']) {
      input.value = v;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 30));
    }
  });
  await page.waitForTimeout(700);
  assert.equal(await dates.first().inputValue(), '2022-01-01');
  await waitSelected(page, expectIds(i => i % 5 === 2 || i % 5 === 3));
  await page.close();
});

test('« Tout effacer » juste après une recherche : la recherche ne revient pas', async () => {
  const { page, frame } = await openWidget();
  await value(frame, 'Statut', 'En cours').click();
  await frame.locator('.fl-search-input').type('bron');
  await frame.locator('.fl-reset').click();
  await page.waitForTimeout(400);
  assert.equal(await frame.locator('.fl-search-input').inputValue(), '');
  await waitSelected(page, null);
  assert.equal(await frame.locator('.fl-toast').isHidden(), false);
  await page.close();
});

test('le focus clavier reste sur la case quand une autre valeur disparaît', async () => {
  const { page, frame } = await openWidget();
  const lyon = value(frame, 'Ville', 'Lyon').locator('input');
  await lyon.focus();
  // Toutes les lignes de Bron passent à Lyon (modification faite ailleurs) : « Bron » disparaît.
  await page.evaluate(() => {
    const d = window.__mock.data;
    d.Ville = d.Ville.map(v => (v === 'Bron' ? 'Lyon' : v));
    window.__dataChanged();
  });
  await frame.waitForFunction(() => !document.querySelector('.fl-facet[data-col="Ville"]').textContent.includes('Bron'));
  assert.equal(await frame.evaluate(() => document.activeElement.closest('.fl-value')?.textContent.includes('Lyon')), true);
  await page.close();
});
