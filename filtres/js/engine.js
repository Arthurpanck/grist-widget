/**
 * Moteur de filtrage : prépare les valeurs de chaque filtre, trouve les lignes retenues et compte,
 * pour chaque valeur, combien de lignes on obtiendrait en la cochant.
 *
 * Règles (celles des sites de vente et des segments Excel / Power BI) :
 * - dans un même champ, les valeurs cochées s'additionnent (OU) ;
 * - d'un champ à l'autre, les conditions se cumulent (ET) ;
 * - le nombre affiché à côté d'une valeur tient compte de tous les autres filtres, mais pas de
 *   celui du champ lui-même : il dit ce que l'on obtiendrait en ajoutant cette valeur.
 */

import { BLANK, ERROR, cellItems, cellScalar, cellText, choiceStyle, displayColumn, fold, formatMonth, formatValue, toDay } from './model.js';

/** Façons de filtrer un champ. */
export const MODES = {
  list: 'Cases à cocher',
  range: 'Plage de valeurs (min / max)',
  period: 'Période (du … au …)',
  year: 'Cases à cocher par année',
  month: 'Cases à cocher par mois',
  text: 'Recherche de texte',
};

/** Modes possibles pour une colonne, le premier étant celui par défaut. */
export function modesFor(col) {
  const c = displayColumn(col);
  if (col.base === 'Ref' || col.base === 'RefList') {
    return ['list', 'text'];
  }
  switch (c.base) {
    case 'Date': case 'DateTime': return ['period', 'year', 'month', 'list'];
    case 'Numeric': case 'Int': return ['range', 'list'];
    case 'Bool': case 'Choice': case 'ChoiceList': return ['list'];
    case 'Attachments': return [];
    default: return ['list', 'text'];
  }
}

export const LIST_MODES = new Set(['list', 'year', 'month']);

/** Périodes prêtes à l'emploi, recalculées chaque jour. */
export const PRESETS = [
  ['today', "Aujourd'hui"],
  ['week', 'Cette semaine'],
  ['month', 'Ce mois-ci'],
  ['quarter', 'Ce trimestre'],
  ['year', 'Cette année'],
  ['last30', '30 derniers jours'],
  ['next30', '30 prochains jours'],
  ['lastMonth', 'Mois dernier'],
  ['lastYear', 'Année dernière'],
  ['past', "Avant aujourd'hui"],
  ['future', "À partir d'aujourd'hui"],
];

/** Choix sur la présence d'une date, proposés à la suite des périodes. */
export const PRESENCE = [
  ['blank', 'Sans date'],
  ['notBlank', 'Avec une date'],
];

const pad = n => String(n).padStart(2, '0');
const dayOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const shift = (d, days) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

/** Bornes { from, to } (jours inclus, « AAAA-MM-JJ », null si ouverte) d'une période prête à l'emploi. */
export function resolvePreset(id, now = new Date()) {
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const y = t.getFullYear(), m = t.getMonth();
  switch (id) {
    case 'today': return { from: dayOf(t), to: dayOf(t) };
    case 'week': { const monday = shift(t, -((t.getDay() + 6) % 7)); return { from: dayOf(monday), to: dayOf(shift(monday, 6)) }; }
    case 'month': return { from: dayOf(new Date(y, m, 1)), to: dayOf(new Date(y, m + 1, 0)) };
    case 'quarter': { const q = Math.floor(m / 3) * 3; return { from: dayOf(new Date(y, q, 1)), to: dayOf(new Date(y, q + 3, 0)) }; }
    case 'year': return { from: `${y}-01-01`, to: `${y}-12-31` };
    case 'last30': return { from: dayOf(shift(t, -29)), to: dayOf(t) };
    case 'next30': return { from: dayOf(t), to: dayOf(shift(t, 29)) };
    case 'lastMonth': return { from: dayOf(new Date(y, m - 1, 1)), to: dayOf(new Date(y, m, 0)) };
    case 'lastYear': return { from: `${y - 1}-01-01`, to: `${y - 1}-12-31` };
    case 'past': return { from: null, to: dayOf(shift(t, -1)) };
    case 'future': return { from: dayOf(t), to: null };
    default: return { from: null, to: null };
  }
}

/** Vrai si le filtre d'un champ restreint réellement les lignes. */
export function isActive(facet, f) {
  if (!f) { return false; }
  if (LIST_MODES.has(facet.mode)) { return Array.isArray(f.in) && f.in.length > 0; }
  if (facet.mode === 'range') { return f.min !== null && f.min !== undefined || f.max !== null && f.max !== undefined; }
  if (facet.mode === 'period') { return Boolean(f.preset || f.from || f.to); }
  if (facet.mode === 'text') { return Boolean(f.q && f.q.trim()); }
  return false;
}

function compareNatural(a, b) {
  if (typeof a === 'number' && typeof b === 'number') { return a - b; }
  if (typeof a === 'boolean' && typeof b === 'boolean') { return (b ? 1 : 0) - (a ? 1 : 0); }
  return String(a).localeCompare(String(b), 'fr', { numeric: true, sensitivity: 'base' });
}

/**
 * Prépare un filtre pour les données reçues : valeurs de chaque ligne, et liste des valeurs
 * possibles avec leur libellé, leur style et leur ordre.
 */
export function buildFacet(field, col, data) {
  const facet = { colId: field.colId, col, mode: field.mode, sort: field.sort || 'natural' };
  const raw = data[field.colId] || [];
  const n = data.id.length;
  const disp = displayColumn(col);
  if (LIST_MODES.has(facet.mode)) {
    const keysOf = facet.mode === 'year' ? (v => { const d = toDay(cellScalar(v), disp); return [d ? d.slice(0, 4) : BLANK]; })
      : facet.mode === 'month' ? (v => { const d = toDay(cellScalar(v), disp); return [d ? d.slice(0, 7) : BLANK]; })
      : disp.base === 'Bool' ? (v => cellItems(v).map(k => (k === BLANK ? false : k)))
      : (v => { const items = cellItems(v); return items.length > 1 ? [...new Set(items)] : items; });
    const rowKeys = new Array(n);
    const freq = new Map();
    for (let i = 0; i < n; i++) {
      const keys = keysOf(raw[i]);
      rowKeys[i] = keys;
      for (const k of keys) { freq.set(k, (freq.get(k) || 0) + 1); }
    }
    facet.rowKeys = rowKeys;
    facet.freq = freq;
    // Toutes les valeurs d'une liste de choix sont proposées, même absentes des données.
    if (disp.base === 'Choice' || disp.base === 'ChoiceList') {
      if (col.base === 'Choice' || col.base === 'ChoiceList') {
        for (const c of col.choices) { if (!freq.has(c)) { freq.set(c, 0); } }
      }
    }
    if (disp.base === 'Bool' && facet.mode === 'list') {
      for (const b of [true, false]) { if (!freq.has(b)) { freq.set(b, 0); } }
    }
    facet.values = new Map();
    for (const k of freq.keys()) { facet.values.set(k, describeValue(facet, k)); }
    facet.order = orderValues(facet, [...facet.values.keys()]);
  } else if (facet.mode === 'range') {
    facet.rowValue = raw.map(v => { const x = cellScalar(v); return typeof x === 'number' ? x : null; });
  } else if (facet.mode === 'period') {
    facet.rowValue = raw.map(v => toDay(cellScalar(v), disp));
  } else if (facet.mode === 'text') {
    facet.rowValue = raw.map(v => fold(cellText(v, col)).replace(/\s+/g, ' '));
  }
  return facet;
}

/** Libellé, style et rang d'une valeur ; utilisé aussi pour une valeur cochée absente des données. */
export function describeValue(facet, key) {
  const col = facet.col;
  const disp = displayColumn(col);
  let label;
  if (key === BLANK) { label = 'Vide'; }
  else if (key === ERROR) { label = 'Erreur'; }
  else if (facet.mode === 'year') { label = String(key); }
  else if (facet.mode === 'month') { label = formatMonth(String(key)); }
  else { label = formatValue(key, col); }
  const style = facet.mode === 'list' ? choiceStyle(key, col) : null;
  return { key, label, style, special: key === BLANK || key === ERROR, bool: disp.base === 'Bool' };
}

/** Ordre d'affichage des valeurs : ordre des choix, puis ordre naturel ; « Vide » à la fin. */
export function orderValues(facet, keys) {
  const col = facet.col;
  const choiceRank = new Map((col.choices || []).map((c, i) => [c, i]));
  const special = k => (k === BLANK ? 2 : k === ERROR ? 3 : 0);
  const dir = (facet.mode === 'year' || facet.mode === 'month') ? -1 : 1;
  return keys.slice().sort((a, b) => {
    const sa = special(a), sb = special(b);
    if (sa || sb) { return sa - sb; }
    if (facet.sort === 'count') {
      const d = (facet.freq.get(b) || 0) - (facet.freq.get(a) || 0);
      if (d) { return d; }
    }
    const ra = choiceRank.has(a) ? choiceRank.get(a) : Infinity;
    const rb = choiceRank.has(b) ? choiceRank.get(b) : Infinity;
    if (ra !== rb) { return ra - rb; }
    return dir * compareNatural(a, b);
  });
}

/** Fonction (ligne → vrai/faux) d'un filtre actif. */
function makeTest(facet, f, now) {
  if (LIST_MODES.has(facet.mode)) {
    const set = new Set(f.in);
    const rowKeys = facet.rowKeys;
    const anyIn = i => { const keys = rowKeys[i]; for (let j = 0; j < keys.length; j++) { if (set.has(keys[j])) { return true; } } return false; };
    return f.not ? (i => !anyIn(i)) : anyIn;
  }
  const v = facet.rowValue;
  if (facet.mode === 'range') {
    const min = (f.min === null || f.min === undefined) ? -Infinity : f.min;
    const max = (f.max === null || f.max === undefined) ? Infinity : f.max;
    return i => v[i] !== null && v[i] >= min && v[i] <= max;
  }
  if (facet.mode === 'period') {
    if (f.preset === 'blank') { return i => v[i] === null; }
    if (f.preset === 'notBlank') { return i => v[i] !== null; }
    const { from, to } = f.preset ? resolvePreset(f.preset, now) : { from: f.from || null, to: f.to || null };
    return i => v[i] !== null && (!from || v[i] >= from) && (!to || v[i] <= to);
  }
  if (facet.mode === 'text') {
    // « Contient » : l'expression saisie, telle quelle (sans accents ni majuscules).
    const q = fold(f.q.trim()).replace(/\s+/g, ' ');
    return i => v[i].includes(q);
  }
  return () => true;
}

/** Texte de chaque ligne (toutes colonnes confondues) pour la recherche globale. */
export function buildSearchIndex(columns, data) {
  const n = data.id.length;
  const cols = columns.filter(c => data[c.colId]);
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    let s = '';
    for (const c of cols) { s += ' ' + cellText(data[c.colId][i], c); }
    out[i] = fold(s);
  }
  return out;
}

/**
 * Applique les filtres. Renvoie les lignes retenues et, pour chaque champ, le nombre de lignes par
 * valeur (cases à cocher) ou les valeurs extrêmes (plages), calculés sans le filtre du champ.
 */
export function evaluate({ facets, filters, ids, search, searchIndex, now = new Date() }) {
  const n = ids.length;
  const tests = [];
  for (let fi = 0; fi < facets.length; fi++) {
    const facet = facets[fi];
    if (isActive(facet, filters[facet.colId])) { tests.push([fi, makeTest(facet, filters[facet.colId], now)]); }
  }
  const tokens = search ? fold(search).split(/\s+/).filter(Boolean) : [];
  if (tokens.length && searchIndex) {
    tests.push([-1, i => { const s = searchIndex[i]; return tokens.every(t => s.includes(t)); }]);
  }
  const counts = facets.map(f => (LIST_MODES.has(f.mode) ? new Map() : null));
  const bounds = facets.map(() => ({ min: null, max: null }));
  const matched = [];
  const add = (fi, i) => {
    const facet = facets[fi];
    if (counts[fi]) {
      const keys = facet.rowKeys[i];
      const m = counts[fi];
      for (let j = 0; j < keys.length; j++) { m.set(keys[j], (m.get(keys[j]) || 0) + 1); }
    } else if (facet.mode === 'range' || facet.mode === 'period') {
      const v = facet.rowValue[i];
      if (v !== null) {
        const b = bounds[fi];
        if (b.min === null || v < b.min) { b.min = v; }
        if (b.max === null || v > b.max) { b.max = v; }
      }
    }
  };
  for (let i = 0; i < n; i++) {
    let failed = -2;   // -2 : aucun échec ; sinon indice du seul filtre non satisfait
    let fails = 0;
    for (let t = 0; t < tests.length; t++) {
      if (!tests[t][1](i)) {
        fails++;
        failed = tests[t][0];
        if (fails > 1) { break; }
      }
    }
    if (fails === 0) {
      matched.push(ids[i]);
      for (let fi = 0; fi < facets.length; fi++) { add(fi, i); }
    } else if (fails === 1 && failed >= 0) {
      add(failed, i);
    }
  }
  return { rowIds: matched, total: n, active: tests.length > 0, counts, bounds };
}
