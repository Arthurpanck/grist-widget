/**
 * Réglages du widget, enregistrés dans les options du widget Grist (communs à tous les lecteurs).
 *
 * {
 *   version: 1,
 *   id: 'f8k2…',                  // identifiant du panneau (mémorisation des filtres par utilisateur)
 *   fields: [{ colId, mode, sort, collapsed }],
 *   search: true,                 // barre « Rechercher dans toutes les colonnes »
 *   remember: true,               // chaque utilisateur retrouve ses filtres
 *   hideEmpty: false,             // masquer les valeurs qui ne donneraient aucune ligne
 * }
 *
 * Sans réglages enregistrés, des champs sont proposés automatiquement (voir autoFields).
 */

import { modesFor } from './engine.js';
import { BLANK, cellItems, displayColumn } from './model.js';

export const OPTION_KEY = 'filtres';
export const MAX_AUTO_FIELDS = 9;

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export function defaults() {
  return { version: 1, id: null, fields: null, search: true, remember: true, hideEmpty: false };
}

/** Réglages lus dans les options du widget, complétés et nettoyés. */
export function normalize(raw) {
  const c = { ...defaults(), ...(raw && typeof raw === 'object' ? raw : {}) };
  c.fields = Array.isArray(c.fields) ? c.fields.filter(f => f && typeof f.colId === 'string') : null;
  return c;
}

function distinctCount(values, limit) {
  const seen = new Set();
  for (const v of values) {
    for (const k of cellItems(v)) {
      if (k !== BLANK) { seen.add(k); if (seen.size > limit) { return seen.size; } }
    }
  }
  return seen.size;
}

/**
 * Champs proposés quand rien n'est réglé, par ordre d'intérêt : listes de choix et cases à cocher,
 * dates (deux au plus), références, choix multiples, montants, et textes qui reviennent souvent (au plus 40 valeurs
 * différentes). Les textes libres (noms, commentaires) sont laissés à la recherche globale. Les champs
 * retenus gardent l'ordre des colonnes de la table.
 */
export function autoFields(columns, data) {
  const n = data && data.id ? data.id.length : 0;
  const scored = [];
  let numbers = 0, dates = 0;
  columns.forEach((col, index) => {
    const modes = modesFor(col);
    if (!modes.length) { return; }
    const disp = displayColumn(col);
    const values = (data && data[col.colId]) || [];
    let score = 0;
    if (col.base === 'Choice' || col.base === 'Bool') { score = 10; }
    else if ((col.base === 'Date' || col.base === 'DateTime') && dates < 2) { score = 9; dates++; }
    else if (col.base === 'Ref') { score = distinctCount(values, 300) <= 300 ? 8 : 0; }
    else if (col.base === 'ChoiceList') { score = 7; }
    else if (col.base === 'RefList') { score = distinctCount(values, 300) <= 300 ? 5 : 0; }
    else if ((disp.base === 'Numeric' || disp.base === 'Int') && numbers < 2) {
      if (!/^(id|n°|num|numero|numéro|code|ordre|rang)\b/i.test(col.label) && distinctCount(values, 5) > 5) { score = 6; numbers++; }
    } else if (col.base === 'Text' || col.base === 'Any') {
      const d = distinctCount(values, 40);
      if (d > 0 && d <= 40 && d <= Math.max(3, n / 3)) { score = 4; }
    }
    if (score) { scored.push({ index, score, field: { colId: col.colId, mode: modes[0] } }); }
  });
  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, MAX_AUTO_FIELDS)
    .sort((a, b) => a.index - b.index)
    .map(s => s.field);
}

/** Champs effectifs : ceux des réglages (s'ils existent encore), sinon les champs proposés. */
export function effectiveFields(config, columns, data) {
  const byId = new Map(columns.map(c => [c.colId, c]));
  const source = config.fields || autoFields(columns, data);
  return source
    .filter(f => byId.has(f.colId))
    .map(f => {
      const modes = modesFor(byId.get(f.colId));
      return { ...f, mode: modes.includes(f.mode) ? f.mode : modes[0] };
    })
    .filter(f => f.mode);
}
