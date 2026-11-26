/**
 * Colonnes du tableau et lecture des cellules.
 *
 * Les valeurs arrivent de Grist « encodées » (option keepEncoded) : une date est ['d', secondes],
 * une liste ['L', a, b], une erreur ['E', …]. Ce module les ramène à des valeurs simples et
 * fournit, pour chaque colonne, de quoi les afficher comme dans Grist (libellés des choix et leurs
 * couleurs, montants, dates à la française).
 */

/** Clé des cellules vides (texte vide, référence absente, liste vide…). */
export const BLANK = '\u0000vide';
/** Clé des cellules en erreur. */
export const ERROR = '\u0000erreur';

const LOCALE = 'fr-FR';

/** Types de colonnes Grist reconnus, ramenés à leur base ('Ref:Projets' → 'Ref'). */
export function baseType(type) {
  const t = String(type || 'Any');
  const i = t.indexOf(':');
  return i < 0 ? t : t.slice(0, i);
}

function parseJson(text) {
  if (!text) { return {}; }
  try { return JSON.parse(text) || {}; } catch (e) { return {}; }
}

/** Lignes d'une table renvoyée par fetchTable (format colonnes). */
export function tableRows(table) {
  const keys = Object.keys(table || {});
  return (table && table.id ? table.id : []).map((id, i) => {
    const row = {};
    for (const k of keys) { row[k] = table[k][i]; }
    return row;
  });
}

/**
 * Décrit les colonnes de la table `tableId` à partir des métadonnées du document
 * (`_grist_Tables`, `_grist_Tables_column`). Les colonnes techniques sont écartées.
 */
export function describeColumns(tableId, tables, columns) {
  const tableRef = tableRows(tables).find(t => t.tableId === tableId)?.id;
  const all = tableRows(columns);
  const byRef = new Map(all.map(c => [c.id, c]));
  return all
    .filter(c => c.parentId === tableRef)
    .filter(c => !c.colId.startsWith('gristHelper_') && c.colId !== 'manualSort')
    .sort((a, b) => (a.parentPos || 0) - (b.parentPos || 0))
    .map(c => {
      const col = makeColumn(c.colId, c.label || c.colId, c.type, parseJson(c.widgetOptions));
      col.isFormula = Boolean(c.isFormula && c.formula);
      if (col.base === 'Ref' || col.base === 'RefList') {
        // La valeur affichée est celle de la « colonne visible » de la table liée.
        const visible = byRef.get(c.visibleCol);
        col.visible = visible ? makeColumn(visible.colId, visible.label, visible.type, parseJson(visible.widgetOptions)) : null;
      }
      return col;
    });
}

/**
 * Colonnes déduites des seules valeurs, quand le widget n'a pas accès aux métadonnées
 * (accès « lecture de la table » seulement).
 */
export function guessColumns(data) {
  return Object.keys(data || {}).filter(k => k !== 'id' && k !== 'manualSort' && !k.startsWith('gristHelper_')).map(colId => {
    const sample = data[colId].find(v => v !== null && v !== '' && v !== undefined);
    let type = 'Text';
    if (typeof sample === 'number') { type = 'Numeric'; }
    else if (typeof sample === 'boolean') { type = 'Bool'; }
    else if (Array.isArray(sample)) {
      if (sample[0] === 'd') { type = 'Date'; }
      else if (sample[0] === 'D') { type = 'DateTime:' + (sample[2] || 'UTC'); }
      else if (sample[0] === 'L') { type = 'ChoiceList'; }
    }
    return makeColumn(colId, colId.replace(/_/g, ' '), type, {});
  });
}

function makeColumn(colId, label, type, options) {
  const base = baseType(type);
  const col = {
    colId,
    label: label || colId,
    type,
    base,
    options,
    tz: base === 'DateTime' ? (String(type).split(':')[1] || 'UTC') : null,
    choices: Array.isArray(options.choices) ? options.choices : [],
    choiceOptions: options.choiceOptions || {},
  };
  col.numberFormat = makeNumberFormat(options);
  return col;
}

function makeNumberFormat(o) {
  const opts = {};
  if (o.numMode === 'currency') { opts.style = 'currency'; opts.currency = o.currency || 'EUR'; }
  else if (o.numMode === 'percent') { opts.style = 'percent'; }
  if (typeof o.decimals === 'number') { opts.minimumFractionDigits = o.decimals; }
  if (typeof o.maxDecimals === 'number') { opts.maximumFractionDigits = Math.max(o.maxDecimals, opts.minimumFractionDigits || 0); }
  else if (opts.style !== 'currency') { opts.maximumFractionDigits = Math.max(10, opts.minimumFractionDigits || 0); }
  try { return new Intl.NumberFormat(LOCALE, opts); } catch (e) { return new Intl.NumberFormat(LOCALE); }
}

/** Colonne dont dépend l'affichage d'une valeur : la colonne visible pour une référence. */
export function displayColumn(col) {
  return (col.base === 'Ref' || col.base === 'RefList') ? (col.visible || { ...col, base: 'Text' }) : col;
}

/**
 * Ramène une cellule à une liste de valeurs simples : chaque élément d'une liste de choix ou de
 * références compte séparément. Une cellule vide donne [BLANK], une erreur [ERROR].
 */
export function cellItems(raw) {
  if (raw === null || raw === undefined || raw === '') { return [BLANK]; }
  if (Array.isArray(raw)) {
    switch (raw[0]) {
      case 'L': {
        const items = raw.slice(1).flatMap(cellItems).filter(v => v !== BLANK);
        return items.length ? items : [BLANK];
      }
      case 'E': return [ERROR];
      case 'R': return [raw[2] === 0 ? BLANK : raw[2]];   // référence dont la valeur affichée est un nombre
      case 'r': return [raw[2] && raw[2].length ? raw[2].join(', ') : BLANK];
      case 'd': return [raw[1]];
      case 'D': return [raw[1]];
      case 'P': case 'C': case 'U': return [BLANK];
      default: return [JSON.stringify(raw)];
    }
  }
  return [raw];
}

/** Première valeur simple d'une cellule (pour les plages de nombres ou de dates). */
export function cellScalar(raw) {
  const v = cellItems(raw)[0];
  return (v === BLANK || v === ERROR) ? null : v;
}

const dayFormatters = new Map();
function dayFormatter(tz) {
  if (!dayFormatters.has(tz)) {
    dayFormatters.set(tz, new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }));
  }
  return dayFormatters.get(tz);
}

/** Jour « AAAA-MM-JJ » d'une date (secondes) ; pour une date-heure, dans le fuseau de la colonne. */
export function toDay(seconds, col) {
  if (typeof seconds !== 'number' || !isFinite(seconds)) { return null; }
  const d = new Date(seconds * 1000);
  if (col.base === 'DateTime') {
    try { return dayFormatter(col.tz).format(d); } catch (e) { /* fuseau inconnu : UTC */ }
  }
  return d.toISOString().slice(0, 10);
}

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** « 2024-03-15 » → « 15/03/2024 ». */
export function formatDay(day) {
  if (!day) { return ''; }
  const [y, m, d] = day.split('-');
  return `${d}/${m}/${y}`;
}

/** « 2024-03 » → « mars 2024 ». */
export function formatMonth(month) {
  const [y, m] = month.split('-');
  return `${MONTHS[Number(m) - 1] || m} ${y}`;
}

/** Texte d'une valeur simple, mis en forme selon la colonne (montant, date, Oui/Non…). */
export function formatValue(value, col) {
  if (value === BLANK) { return 'Vide'; }
  if (value === ERROR) { return 'Erreur'; }
  const c = displayColumn(col);
  if (typeof value === 'boolean') { return value ? 'Oui' : 'Non'; }
  if (typeof value === 'number') {
    if (c.base === 'Date' || c.base === 'DateTime') { return formatDay(toDay(value, c)); }
    if (c.base === 'Numeric' || c.base === 'Int') { return c.numberFormat.format(value); }
    if (c.base === 'Bool') { return value ? 'Oui' : 'Non'; }
    return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 10 }).format(value);
  }
  return String(value);
}

/** Texte d'une cellule entière, pour la recherche globale. */
export function cellText(raw, col) {
  return cellItems(raw).filter(v => v !== BLANK).map(v => formatValue(v, col)).join(' ');
}

/** Texte comparable : minuscules, sans accents. */
export function fold(text) {
  return String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Style d'un choix Grist (couleurs, gras…), ou null pour une valeur sans style. */
export function choiceStyle(value, col) {
  if (col.base !== 'Choice' && col.base !== 'ChoiceList') { return null; }
  if (typeof value !== 'string' || value === BLANK || value === ERROR) { return null; }
  const o = col.choiceOptions[value] || {};
  return {
    fill: o.fillColor || null,
    text: o.textColor || null,
    bold: Boolean(o.fontBold),
    italic: Boolean(o.fontItalic),
    underline: Boolean(o.fontUnderline),
    strike: Boolean(o.fontStrikethrough),
    known: col.choices.includes(value),
  };
}

/** Formats numériques sans décimales superflues pour les bornes saisies (10 000, 12,5). */
export function formatNumberInput(n) {
  if (n === null || n === undefined || !isFinite(n)) { return ''; }
  return String(n).replace('.', ',');
}

/** Lit un nombre saisi à la française : « 10 000 », « 12,5 », « 1.5k » n'est pas accepté. */
export function parseNumberInput(text) {
  const t = String(text || '').replace(/[\s  €$%]/g, '').replace(',', '.');
  if (!t) { return null; }
  const n = Number(t);
  return isFinite(n) ? n : null;
}

/** Montant ou nombre abrégé pour les puces (12 k€, 1,2 M€). */
export function formatCompact(n, col) {
  const c = displayColumn(col);
  const o = c.options || {};
  const opts = { notation: 'compact', maximumFractionDigits: 1 };
  if (o.numMode === 'currency') { opts.style = 'currency'; opts.currency = o.currency || 'EUR'; }
  else if (o.numMode === 'percent') { opts.style = 'percent'; }
  try { return new Intl.NumberFormat(LOCALE, opts).format(n); } catch (e) { return String(n); }
}
