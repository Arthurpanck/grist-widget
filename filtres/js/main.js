/**
 * Widget « Filtres » : un panneau pour filtrer, en même temps et par cases à cocher, plusieurs champs
 * d'une table. Les widgets reliés (« Sélectionner par » ce widget) n'affichent que les lignes retenues.
 *
 * Mécanisme Grist : un widget personnalisé déclaré source de sélection (allowSelectBy) transmet la
 * liste des lignes retenues par grist.setSelectedRows(ids) ; null rend toutes les lignes.
 */

import { OPTION_KEY, effectiveFields, newId, normalize } from './config.js';
import { LIST_MODES, buildFacet, buildSearchIndex, evaluate, isActive } from './engine.js';
import { describeColumns, guessColumns } from './model.js';
import { RESERVE, Selection } from './selection.js';
import { openSettings } from './settings.js';
import { Panel } from './ui.js';
import * as store from './store.js';

const grist = window.grist;
const params = new URLSearchParams(location.search);

const S = {
  readonly: params.get('readonly') === 'true',
  access: null,
  linking: null,
  tableId: null,
  docId: null,
  columns: [],
  data: null,
  config: normalize(null),
  fields: [],
  facets: [],
  searchIndex: null,
  filters: {},
  search: '',
  collapsed: new Set(),
  loading: true,
  error: null,
  restoredKey: null,
  undo: null,
  result: null,
  selection: new Selection(),
  missing: 0,
  onDemand: false,
};

let panel = null;
let settings = null;

/** Clé de mémorisation des filtres de l'utilisateur pour ce panneau. */
function storageKey() {
  return S.docId && S.tableId ? `grist-filtres:${S.docId}:${S.tableId}:${S.config.id || 'auto'}` : null;
}

function restore() {
  const key = storageKey();
  if (!key || key === S.restoredKey) { return; }
  S.restoredKey = key;
  const saved = store.load(key);
  if (!saved) { return; }
  if (S.config.remember) {
    S.filters = saved.filters && typeof saved.filters === 'object' ? saved.filters : {};
    S.search = typeof saved.search === 'string' ? saved.search : '';
  }
  S.collapsed = new Set(Array.isArray(saved.collapsed) ? saved.collapsed : []);
}

const persist = (() => {
  let t = null;
  return () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const key = storageKey();
      if (!key) { return; }
      store.save(key, {
        filters: S.config.remember ? S.filters : {},
        search: S.config.remember ? S.search : '',
        collapsed: [...S.collapsed],
      });
    }, 250);
  };
})();

/**
 * Reconstruit les filtres à partir des colonnes, des réglages et des données.
 * `reason` : 'user' (action sur les filtres ou les réglages) ou 'data' (données modifiées).
 */
function rebuild(reason = 'user') {
  if (!S.data) { render(); return; }
  S.fields = effectiveFields(S.config, S.columns, S.data);
  const byId = new Map(S.columns.map(c => [c.colId, c]));
  S.facets = S.fields.filter(f => S.data[f.colId]).map(f => buildFacet(f, byId.get(f.colId), S.data));
  S.searchIndex = S.config.search ? buildSearchIndex(S.columns, S.data) : null;
  // Filtres d'un champ retiré ou passé à un autre mode : oubliés.
  const modeOf = new Map(S.facets.map(f => [f.colId, f.mode]));
  for (const [colId, f] of Object.entries(S.filters)) {
    const mode = modeOf.get(colId);
    if (!mode || (f && f.mode && f.mode !== mode)) { delete S.filters[colId]; }
  }
  refresh(reason);
}

/**
 * Recalcule les lignes retenues et met à jour l'affichage. Après une action de l'utilisateur, les
 * widgets reliés reçoivent la nouvelle liste ; après un changement de données, seulement s'il n'y a
 * aucun filtre (voir selection.js).
 */
function refresh(reason = 'user') {
  if (S.data) {
    const filters = {};
    for (const facet of S.facets) {
      const f = S.filters[facet.colId];
      if (f) { filters[facet.colId] = f; }
    }
    S.result = evaluate({ facets: S.facets, filters, ids: S.data.id, search: S.config.search ? S.search : '', searchIndex: S.searchIndex });
    if (reason === 'data') {
      S.missing = S.selection.missing(S.result);
    } else {
      send();
    }
  }
  render();
  persist();
}

function render() {
  if (!panel) { return; }
  panel.update({
    facets: S.facets, filters: S.filters, result: S.result, search: S.search, config: S.config,
    readonly: S.readonly, collapsed: S.collapsed, loading: S.loading, error: S.error, linking: S.linking,
    missing: S.missing, onDemand: S.onDemand,
  });
}

/** Transmet à Grist les lignes retenues, si elles ont changé. */
function send() {
  S.missing = 0;
  const out = S.selection.fresh(S.result, S.data.id);
  if (!out) { return; }
  const push = rows => grist.setSelectedRows(rows).catch(err => console.warn('Filtres : setSelectedRows', err));
  push(out.rows);
  if (out.activated) {
    // Passer de « aucune liste » à une liste fait passer le lien de Grist du mode « curseur » au mode
    // « filtre », ce qui envoie le curseur du tableau relié sur la ligne d'ajout, tout en bas. Une
    // seconde liste, à peine différente (un identifiant réservé de plus), le ramène sur la première ligne.
    const rows = out.rows.concat([S.selection.anchor + RESERVE + 1]);
    const signature = S.selection.signature;
    setTimeout(() => { if (S.selection.signature === signature) { push(rows); } }, 150);
  }
}

const actions = {
  setFilter(colId, f) {
    const facet = S.facets.find(x => x.colId === colId);
    if (f && facet) { S.filters[colId] = { ...f, mode: facet.mode }; } else { delete S.filters[colId]; }
    panel.hideToast();
    refresh();
  },
  clearAll() {
    S.undo = { filters: S.filters, search: S.search };
    S.filters = {};
    S.search = '';
    refresh();
    panel.showToast('Filtres effacés.', 'Annuler');
  },
  undo() {
    if (!S.undo) { return; }
    S.filters = S.undo.filters;
    S.search = S.undo.search;
    S.undo = null;
    refresh();
  },
  setSearch(q) {
    S.search = q;
    panel.hideToast();
    refresh();
  },
  /** Applique de nouveau les filtres aux données modifiées. */
  update() {
    S.selection.reset();
    refresh();
  },
  toggleCollapsed(colId) {
    if (S.collapsed.has(colId)) { S.collapsed.delete(colId); } else { S.collapsed.add(colId); }
    render();
    persist();
  },
  focusFacet(colId) {
    if (S.collapsed.has(colId)) { S.collapsed.delete(colId); render(); persist(); }
    panel.reveal(colId);
  },
  openSettings() {
    if (S.readonly || settings || !S.data) { return; }
    settings = openSettings(document.body, {
      columns: S.columns,
      fields: S.fields,
      config: S.config,
      onSave: async (config) => {
        const next = { ...config, version: 1, id: S.config.id || newId() };
        S.config = normalize(next);
        rebuild();
        try {
          // Grist garde les réglages en attente : son bouton « Enregistrer », en haut du widget, les conserve.
          await grist.setOption(OPTION_KEY, next);
          panel.showToast('Réglages appliqués. Pour les garder, cliquez sur « Enregistrer » en haut du widget.', null, 12000);
        } catch (err) {
          console.warn('Filtres : enregistrement des réglages', err);
          panel.showToast('Les réglages n’ont pas pu être enregistrés.');
        }
      },
      onClose: () => { settings = null; },
    });
  },
};

/** Colonnes du tableau (libellés, types, choix…) ; sans accès complet, déduites des valeurs. */
async function loadColumns() {
  if (S.access === 'full') {
    try {
      const [tables, columns] = await Promise.all([grist.docApi.fetchTable('_grist_Tables'), grist.docApi.fetchTable('_grist_Tables_column')]);
      const i = tables.tableId.indexOf(S.tableId);
      S.onDemand = i >= 0 && Boolean(tables.onDemand && tables.onDemand[i]);
      return describeColumns(S.tableId, tables, columns);
    } catch (err) {
      console.warn('Filtres : lecture des colonnes', err);
    }
  }
  return guessColumns(S.data);
}

let loadSeq = 0;
async function loadData() {
  const seq = ++loadSeq;
  try {
    const data = await grist.fetchSelectedTable({
      format: 'columns', keepEncoded: true, expandRefs: true,
      includeColumns: S.access === 'full' ? 'normal' : 'shown',
    });
    if (seq !== loadSeq) { return; }
    S.data = data;
    const columns = await loadColumns();
    if (seq !== loadSeq) { return; }
    S.columns = columns.filter(c => data[c.colId]);
    const first = S.loading;
    S.loading = false;
    S.error = null;
    restore();
    rebuild(first ? 'user' : 'data');
  } catch (err) {
    console.warn('Filtres : lecture des données', err);
    S.loading = false;
    S.error = String(err && err.message || err);
    render();
  }
}

function start() {
  panel = new Panel(document.getElementById('app'), actions);
  render();
  if (!grist || window.parent === window) {
    S.loading = false;
    S.error = 'Ce widget s’utilise dans un document Grist (widget personnalisé).';
    render();
    return;
  }
  grist.ready({ requiredAccess: 'full', allowSelectBy: true, onEditOptions: () => actions.openSettings() });
  grist.on('message', (msg) => {
    if (msg.tableId && msg.tableId !== S.tableId) {
      S.tableId = msg.tableId;
      S.restoredKey = null;
    }
    if (msg.tableId && msg.dataChange) { loadData(); }
  });
  grist.onOptions((options, settingsInfo) => {
    const before = JSON.stringify(S.config);
    S.config = normalize(options && options[OPTION_KEY]);
    const accessChanged = settingsInfo && settingsInfo.accessLevel !== S.access;
    S.access = settingsInfo ? settingsInfo.accessLevel : S.access;
    S.linking = settingsInfo && settingsInfo.linking ? settingsInfo.linking : null;
    if (accessChanged && S.tableId) { loadData(); return; }
    if (JSON.stringify(S.config) !== before) { S.restoredKey = null; restore(); rebuild(); }
    else { render(); }
  });
  grist.docApi.getDocName().then(id => { S.docId = id; S.restoredKey = null; if (S.data) { restore(); rebuild(); } }).catch(() => {});
}

// Pour les tests et le débogage depuis la console.
window.__filtres = { state: S, actions, isActive, LIST_MODES };

start();
