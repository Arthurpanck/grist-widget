// Tests du moteur de filtrage, des réglages et de la liste transmise à Grist (sans navigateur).
//   node --test test/
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { autoFields, effectiveFields, normalize } from '../js/config.js';
import { buildFacet, buildSearchIndex, evaluate, isActive, modesFor, resolvePreset } from '../js/engine.js';
import { BLANK, ERROR, cellItems, describeColumns, formatValue, guessColumns, parseNumberInput, toDay } from '../js/model.js';
import { RESERVE, Selection } from '../js/selection.js';

const day = (y, m, d) => Date.UTC(y, m - 1, d) / 1000;

// Métadonnées Grist (format colonnes de fetchTable) d'une petite table « Projets ».
const TABLES = { id: [1, 2], tableId: ['Projets', 'Villes'] };
const COLUMNS = (() => {
  const cols = [
    [1, 1, 'Nom', 'Nom', 'Text', {}],
    [2, 1, 'Statut', 'Statut', 'Choice', { choices: ['À faire', 'En cours', 'Terminé'], choiceOptions: { 'En cours': { fillColor: '#FFD666' } } }],
    [3, 1, 'Tags', 'Thèmes', 'ChoiceList', { choices: ['Eau', 'Climat', 'Social'] }],
    [4, 1, 'Ville', 'Ville', 'Ref:Villes', {}, 20],
    [5, 1, 'Budget', 'Budget', 'Numeric', { numMode: 'currency', currency: 'EUR', decimals: 0 }],
    [6, 1, 'Debut', 'Date de début', 'Date', {}],
    [7, 1, 'Actif', 'Actif', 'Bool', {}],
    [8, 1, 'manualSort', 'manualSort', 'ManualSortPos', {}],
    [9, 1, 'gristHelper_Display', 'gristHelper_Display', 'Any', {}],
    [20, 2, 'Nom', 'Nom', 'Text', {}],
  ];
  const t = { id: [], parentId: [], colId: [], label: [], type: [], widgetOptions: [], visibleCol: [], parentPos: [], isFormula: [], formula: [] };
  cols.forEach(([id, parentId, colId, label, type, wo, visibleCol], i) => {
    t.id.push(id); t.parentId.push(parentId); t.colId.push(colId); t.label.push(label); t.type.push(type);
    t.widgetOptions.push(JSON.stringify(wo)); t.visibleCol.push(visibleCol || 0); t.parentPos.push(i); t.isFormula.push(false); t.formula.push('');
  });
  return t;
})();

// Données telles que fetchSelectedTable les renvoie (keepEncoded, expandRefs).
const DATA = {
  id: [1, 2, 3, 4, 5, 6],
  Nom: ['Piscine', 'École', 'Parc', 'Réseau', 'Musée', 'Gymnase'],
  Statut: ['En cours', 'Terminé', 'En cours', 'À faire', '', 'Terminé'],
  Tags: [['L', 'Eau'], ['L', 'Climat', 'Social'], ['L', 'Climat'], null, ['L', 'Eau', 'Climat'], ['L', 'Social']],
  Ville: ['Lyon', 'Bron', 'Lyon', 'Écully', '', 'Lyon'],
  Budget: [100000, 25000, null, 500000, 75000, 12000],
  Debut: [['d', day(2024, 1, 15)], ['d', day(2025, 6, 1)], ['d', day(2025, 12, 31)], null, ['d', day(2026, 3, 2)], ['d', day(2024, 7, 9)]],
  Actif: [true, false, true, null, true, false],
};

const columns = describeColumns('Projets', TABLES, COLUMNS);
const col = id => columns.find(c => c.colId === id);
const facet = (colId, mode) => buildFacet({ colId, mode: mode || modesFor(col(colId))[0] }, col(colId), DATA);
const run = (facets, filters, extra = {}) => evaluate({ facets, filters, ids: DATA.id, ...extra });
const counts = (result, i) => Object.fromEntries([...result.counts[i]].map(([k, v]) => [String(k), v]));

test('les colonnes techniques sont écartées et les libellés repris', () => {
  assert.deepEqual(columns.map(c => c.colId), ['Nom', 'Statut', 'Tags', 'Ville', 'Budget', 'Debut', 'Actif']);
  assert.equal(col('Debut').label, 'Date de début');
  assert.equal(col('Ville').visible.colId, 'Nom');
});

test('modes proposés selon le type de colonne', () => {
  assert.deepEqual(modesFor(col('Statut')), ['list']);
  assert.deepEqual(modesFor(col('Budget')), ['range', 'list']);
  assert.deepEqual(modesFor(col('Debut')), ['period', 'year', 'month', 'list']);
  assert.deepEqual(modesFor(col('Ville')), ['list', 'text']);
});

test('valeurs dans l’ordre des choix, tous les choix proposés, « Vide » à la fin', () => {
  const f = facet('Statut');
  assert.deepEqual(f.order, ['À faire', 'En cours', 'Terminé', BLANK]);
  assert.equal(f.values.get('En cours').style.fill, '#FFD666');
  assert.equal(f.values.get(BLANK).label, 'Vide');
});

test('OU dans un champ, ET entre les champs, nombres calculés sans le filtre du champ', () => {
  const statut = facet('Statut'), ville = facet('Ville');
  const r = run([statut, ville], { Statut: { in: ['En cours', 'Terminé'] }, Ville: { in: ['Lyon'] } });
  assert.deepEqual(r.rowIds, [1, 3, 6]);
  assert.equal(r.active, true);
  // Statut : compté parmi les lignes de Lyon (1, 3, 6) ; Ville : parmi En cours ou Terminé (1, 2, 3, 6).
  assert.deepEqual(counts(r, 0), { 'En cours': 2, 'Terminé': 1 });
  assert.deepEqual(counts(r, 1), { Lyon: 3, Bron: 1 });
});

test('exclure les valeurs cochées', () => {
  const r = run([facet('Statut')], { Statut: { in: ['Terminé', BLANK], not: true } });
  assert.deepEqual(r.rowIds, [1, 3, 4]);
});

test('choix multiples : une valeur cochée suffit ; exclure retire toute ligne qui la contient', () => {
  const tags = facet('Tags');
  assert.deepEqual(run([tags], { Tags: { in: ['Climat'] } }).rowIds, [2, 3, 5]);
  assert.deepEqual(run([tags], { Tags: { in: ['Climat'], not: true } }).rowIds, [1, 4, 6]);
  assert.deepEqual(run([tags], { Tags: { in: [BLANK] } }).rowIds, [4]);
  assert.deepEqual(counts(run([tags], {}), 0), { Eau: 2, Climat: 3, Social: 2, [BLANK]: 1 });
});

test('cases à cocher : une case vide compte comme « Non »', () => {
  const r = run([facet('Actif')], { Actif: { in: [false] } });
  assert.deepEqual(r.rowIds, [2, 4, 6]);
});

test('plage de montants : bornes incluses, cellules vides écartées, extrêmes sans le filtre du champ', () => {
  const budget = facet('Budget'), statut = facet('Statut');
  const r = run([budget, statut], { Budget: { min: 25000, max: 100000 }, Statut: { in: ['Terminé', 'En cours'] } });
  assert.deepEqual(r.rowIds, [1, 2]);
  assert.deepEqual(r.bounds[0], { min: 12000, max: 100000 });
  assert.deepEqual(run([budget], { Budget: { min: 100000, max: null } }).rowIds, [1, 4]);
});

test('périodes prêtes à l’emploi', () => {
  const now = new Date(2025, 11, 31);   // 31 décembre 2025
  assert.deepEqual(resolvePreset('month', now), { from: '2025-12-01', to: '2025-12-31' });
  assert.deepEqual(resolvePreset('quarter', now), { from: '2025-10-01', to: '2025-12-31' });
  assert.deepEqual(resolvePreset('week', new Date(2025, 11, 31)), { from: '2025-12-29', to: '2026-01-04' });
  assert.deepEqual(resolvePreset('lastMonth', new Date(2026, 0, 15)), { from: '2025-12-01', to: '2025-12-31' });
  assert.deepEqual(resolvePreset('past', now), { from: null, to: '2025-12-30' });
  const debut = facet('Debut');
  assert.deepEqual(run([debut], { Debut: { preset: 'year' } }, { now }).rowIds, [2, 3]);
  assert.deepEqual(run([debut], { Debut: { from: '2024-07-09', to: null } }).rowIds, [2, 3, 5, 6]);
});

test('dates par année, les plus récentes d’abord', () => {
  const f = facet('Debut', 'year');
  assert.deepEqual(f.order, ['2026', '2025', '2024', BLANK]);
  assert.deepEqual(run([f], { Debut: { in: ['2025'] } }).rowIds, [2, 3]);
});

test('date-heure : le jour est celui du fuseau de la colonne', () => {
  const c = { base: 'DateTime', tz: 'Europe/Paris' };
  assert.equal(toDay(Date.UTC(2025, 5, 30, 23, 30) / 1000, c), '2025-07-01');
});

test('recherche globale : tous les mots, sans tenir compte des accents ni des majuscules', () => {
  const index = buildSearchIndex(columns, DATA);
  assert.deepEqual(run([], {}, { search: 'ecole', searchIndex: index }).rowIds, [2]);
  assert.deepEqual(run([], {}, { search: 'lyon climat', searchIndex: index }).rowIds, [3]);
  const r = run([facet('Statut')], {}, { search: 'lyon', searchIndex: index });
  assert.deepEqual(counts(r, 0), { 'En cours': 2, 'Terminé': 1 });
});

test('recherche dans un champ', () => {
  const nom = buildFacet({ colId: 'Nom', mode: 'text' }, col('Nom'), DATA);
  assert.deepEqual(run([nom], { Nom: { q: 'ECOL' } }).rowIds, [2]);
  assert.deepEqual(run([nom], { Nom: { q: 'se' } }).rowIds, [4, 5, 6]);
  assert.deepEqual(run([nom], { Nom: { q: 'pis cine' } }).rowIds, []);   // l'expression entière
  assert.equal(isActive(nom, { q: '  ' }), false);
});

test('champs proposés automatiquement : choix, références, dates, montants ; pas le texte libre', () => {
  const fields = autoFields(columns, DATA);
  // Budget n'a que 5 valeurs différentes : trop peu pour une plage.
  assert.deepEqual(fields.map(f => `${f.colId}:${f.mode}`), ['Statut:list', 'Tags:list', 'Ville:list', 'Debut:period', 'Actif:list']);
  const more = { ...DATA, id: [...DATA.id, 7], Budget: [...DATA.Budget, 9000] };
  for (const k of Object.keys(DATA)) { if (k !== 'id' && k !== 'Budget') { more[k] = [...DATA[k], null]; } }
  assert.ok(autoFields(columns, more).some(f => f.colId === 'Budget' && f.mode === 'range'));
});

test('réglages : champs disparus ignorés, mode impossible remplacé', () => {
  const config = normalize({ fields: [{ colId: 'Budget', mode: 'period' }, { colId: 'Supprimée', mode: 'list' }] });
  assert.deepEqual(effectiveFields(config, columns, DATA), [{ colId: 'Budget', mode: 'range' }]);
  assert.equal(normalize(null).search, true);
});

test('sans accès complet, colonnes déduites des valeurs', () => {
  const guessed = guessColumns(DATA);
  assert.equal(guessed.find(c => c.colId === 'Debut').base, 'Date');
  assert.equal(guessed.find(c => c.colId === 'Tags').base, 'ChoiceList');
  assert.equal(guessed.find(c => c.colId === 'Actif').base, 'Bool');
});

test('lecture et mise en forme des valeurs', () => {
  assert.deepEqual(cellItems(['L', 'a', 'b']), ['a', 'b']);
  assert.deepEqual(cellItems(['L']), [BLANK]);
  assert.deepEqual(cellItems(['E', 'ZeroDivisionError']), [ERROR]);
  assert.deepEqual(cellItems(['R', 'Villes', 0]), [BLANK]);
  assert.equal(formatValue(1500, col('Budget')).replace(/\s/g, ' '), '1 500 €');
  assert.equal(formatValue(day(2024, 3, 5), col('Debut')), '05/03/2024');
  assert.equal(parseNumberInput('10 000,5'), 10000.5);
  assert.equal(parseNumberInput('abc'), null);
});

test('liste transmise à Grist : null sans filtre, réserve pour les lignes ajoutées', () => {
  const sel = new Selection();
  const ids = DATA.id;
  assert.equal(sel.fresh({ active: false, rowIds: ids }, ids), undefined);   // déjà « aucun filtre »
  const out = sel.fresh({ active: true, rowIds: [1, 3] }, ids);
  assert.equal(out.activated, true);
  assert.deepEqual(out.rows.slice(0, 3), [1, 3, 7]);
  assert.equal(out.rows.length, 2 + RESERVE);
  assert.equal(sel.fresh({ active: true, rowIds: [1, 3] }, ids), undefined);  // rien de changé
  const again = sel.fresh({ active: true, rowIds: [1] }, ids);
  assert.equal(again.activated, false);
  // Une ligne existante qui correspond désormais aux filtres n'est pas affichée : signalée.
  assert.equal(sel.missing({ active: true, rowIds: [1, 2] }), 1);
  // Une ligne créée (identifiant réservé) est déjà affichée.
  assert.equal(sel.missing({ active: true, rowIds: [1, 7] }), 0);
  assert.deepEqual(sel.fresh({ active: false, rowIds: ids }, ids), { rows: null, activated: false });
});
