/**
 * Panneau de filtres : recherche globale, compteur de lignes, puces des filtres actifs, puis un bloc
 * repliable par champ (cases à cocher avec nombre de lignes, plage min / max, période, texte).
 *
 * Les blocs sont conservés d'une mise à jour à l'autre (même clé = même élément), pour ne perdre ni le
 * focus, ni la saisie en cours, ni la position de défilement.
 */

import { debounce, fmtInt, h, icon, plural } from './dom.js';
import { LIST_MODES, PRESETS, describeValue, isActive, resolvePreset } from './engine.js';
import { GRIST_LIST_LIMIT, RESERVE } from './selection.js';
import { displayColumn, fold, formatCompact, formatDay, formatNumberInput, parseNumberInput } from './model.js';

/** Valeurs visibles d'un bloc avant « Afficher plus ». */
export const VISIBLE = 8;
/** Largeur à partir de laquelle les blocs se placent côte à côte. */
const GRID_WIDTH = 620;
/** Hauteur en dessous de laquelle un widget large devient un bandeau (une seule rangée de blocs). */
const BAND_HEIGHT = 420;

const PRESET_LABELS = new Map(PRESETS);

/** Texte court d'un filtre actif, pour sa puce et pour l'en-tête d'un bloc replié. */
export function summarize(facet, f) {
  if (!isActive(facet, f)) { return ''; }
  if (LIST_MODES.has(facet.mode)) {
    const labels = f.in.map(k => (facet.values.get(k) || describeValue(facet, k)).label);
    const shown = labels.slice(0, 2).join(', ') + (labels.length > 2 ? ` +${labels.length - 2}` : '');
    return (f.not ? 'sauf ' : '') + shown;
  }
  if (facet.mode === 'range') {
    const fmt = n => formatCompact(n, facet.col);
    const hasMin = f.min !== null && f.min !== undefined, hasMax = f.max !== null && f.max !== undefined;
    if (hasMin && hasMax) { return `${fmt(f.min)} – ${fmt(f.max)}`; }
    return hasMin ? `≥ ${fmt(f.min)}` : `≤ ${fmt(f.max)}`;
  }
  if (facet.mode === 'period') {
    if (f.preset) { return PRESET_LABELS.get(f.preset) || f.preset; }
    if (f.from && f.to) { return f.from === f.to ? `le ${formatDay(f.from)}` : `du ${formatDay(f.from)} au ${formatDay(f.to)}`; }
    return f.from ? `depuis le ${formatDay(f.from)}` : `jusqu'au ${formatDay(f.to)}`;
  }
  if (facet.mode === 'text') { return `« ${f.q.trim()} »`; }
  return '';
}

export class Panel {
  /**
   * actions : setFilter(colId, filtre|null), clearAll(), undo(), update(), setSearch(q), toggleCollapsed(colId),
   * openSettings(), focusFacet(colId)
   */
  constructor(root, actions) {
    this.actions = actions;
    this.views = new Map();
    this.root = root;
    this.searchInput = h('input', {
      type: 'search', class: 'fl-search-input', placeholder: 'Rechercher…', title: 'Rechercher dans toutes les colonnes',
      'aria-label': 'Rechercher dans toutes les colonnes',
      oninput: () => this._search(this.searchInput.value),
      onkeydown: e => { if (e.key === 'Escape' && this.searchInput.value) { e.stopPropagation(); this.searchInput.value = ''; this._search.flush(''); } },
    });
    this._search = debounce(q => actions.setSearch(q), 200);
    this.searchBox = h('div', { class: 'fl-search' }, icon('search', 15), this.searchInput);
    this.count = h('div', { class: 'fl-count', role: 'status', 'aria-live': 'polite' });
    this.resetBtn = h('button', { type: 'button', class: 'fl-link fl-reset', onclick: () => actions.clearAll() }, 'Tout effacer');
    this.settingsBtn = h('button', { type: 'button', class: 'fl-icon-btn fl-settings-btn', title: 'Configurer les filtres', 'aria-label': 'Configurer les filtres', onclick: () => actions.openSettings() }, icon('settings', 16));
    this.chips = h('div', { class: 'fl-chips' });
    this.notice = h('div', { class: 'fl-notice', hidden: true });
    this.facetsEl = h('div', { class: 'fl-facets' });
    this.message = h('div', { class: 'fl-message', hidden: true });
    this.toast = h('div', { class: 'fl-toast', role: 'status', hidden: true });
    this.chipsRow = h('div', { class: 'fl-chips-row' }, this.chips, this.resetBtn);
    this.limitNote = h('div', { class: 'fl-limit-note', hidden: true });
    this.top = h('div', { class: 'fl-top' },
      this.searchBox,
      h('div', { class: 'fl-status' }, this.count, this.settingsBtn),
      this.chipsRow, this.limitNote);
    this.app = h('div', { class: 'fl-app' }, this.top, this.notice, this.message, this.facetsEl, this.toast);
    root.appendChild(this.app);
    new ResizeObserver(() => this._layout()).observe(this.app);
    this._layout();
  }

  _layout() {
    const w = this.app.clientWidth, hgt = this.app.clientHeight;
    const layout = w < GRID_WIDTH ? 'column' : (hgt < BAND_HEIGHT ? 'band' : 'grid');
    if (this.app.dataset.layout !== layout) {
      this.app.dataset.layout = layout;
      // En bandeau, chaque liste défile dans son bloc : toutes les valeurs sont affichées.
      for (const view of this.views.values()) { view.content.relayout && view.content.relayout(); }
    }
  }

  /** Vrai en bandeau : les listes affichent toutes leurs valeurs, dans un bloc qui défile. */
  get band() { return this.app.dataset.layout === 'band'; }

  /** Met à jour tout le panneau à partir de l'état courant. */
  update(v) {
    const { facets, filters, result, config, readonly } = v;
    this.settingsBtn.hidden = readonly;
    this.searchBox.hidden = !config.search;
    if (document.activeElement !== this.searchInput && this.searchInput.value !== (v.search || '')) {
      this.searchInput.value = v.search || '';
    }

    // Message à la place des blocs (chargement, accès, aucun champ).
    this._message(v);

    // Compteur.
    if (result) {
      this.count.replaceChildren(result.active
        ? h('span', null, h('strong', null, fmtInt(result.rowIds.length)), ` sur ${plural(result.total, 'ligne', 'lignes')}`)
        : h('span', null, plural(result.total, 'ligne', 'lignes')));
    } else {
      this.count.replaceChildren();
    }
    const anyActive = Boolean(result && result.active);
    this.resetBtn.hidden = !anyActive;
    // Au-delà de 500 lignes transmises, Grist affiche « Toute la donnée n'est pas visible » sous le
    // tableau relié. C'est faux pour une table ordinaire, vrai pour une table chargée « à la demande ».
    const overLimit = anyActive && result.rowIds.length + RESERVE > GRIST_LIST_LIMIT;
    this.limitNote.hidden = !overLimit;
    if (overLimit) {
      this.limitNote.replaceChildren(icon('info', 13), h('span', null, v.onDemand
        ? `Table chargée « à la demande » : les tableaux reliés n’affichent que ${fmtInt(GRIST_LIST_LIMIT - RESERVE)} lignes environ. Précisez les filtres.`
        : `Les ${fmtInt(result.rowIds.length)} lignes sont bien affichées, même si Grist indique « Toute la donnée n’est pas visible ».`));
    }
    this.top.hidden = !facets.length && !config.search;

    // Puces des filtres actifs.
    this.chips.replaceChildren(...facets.filter(f => isActive(f, filters[f.colId])).map(f => this._chip(f, filters[f.colId])));
    if (v.search && v.search.trim()) {
      this.chips.appendChild(this._chipEl('Recherche', `« ${v.search.trim()} »`, () => { this.searchInput.value = ''; this.actions.setSearch(''); }, () => this.searchInput.focus()));
    }
    this.chipsRow.hidden = !this.chips.childElementCount;

    // Bandeau d'aide (configurateurs).
    this._notice(v);

    // Blocs, dans l'ordre des réglages ; un bloc est recréé si le champ change de mode.
    const keep = new Map();
    const order = [];
    facets.forEach((facet, i) => {
      const key = facet.colId + '|' + facet.mode;
      let view = this.views.get(key);
      if (!view) { view = new FacetView(this, facet); }
      keep.set(key, view);
      order.push(view.el);
      view.update(facet, filters[facet.colId], result ? result.counts[i] : null, result ? result.bounds[i] : null, v);
    });
    for (const [key, view] of this.views) { if (!keep.has(key)) { view.el.remove(); } }
    this.views = keep;
    order.forEach((el, i) => { if (this.facetsEl.children[i] !== el) { this.facetsEl.insertBefore(el, this.facetsEl.children[i] || null); } });
  }

  _message(v) {
    let content = null;
    if (v.error) {
      content = [h('strong', null, 'Les données ne peuvent pas être lues.'), h('p', null, v.error)];
    } else if (v.loading) {
      content = [h('p', { class: 'fl-muted' }, 'Chargement…')];
    } else if (!v.facets.length) {
      content = v.readonly
        ? [h('p', { class: 'fl-muted' }, 'Aucun filtre n’est configuré.')]
        : [h('strong', null, 'Aucun champ à filtrer.'), h('p', null, 'Choisissez les champs que les utilisateurs pourront filtrer.'),
          h('button', { type: 'button', class: 'fl-btn fl-btn-primary', onclick: () => this.actions.openSettings() }, 'Choisir les champs')];
    }
    this.message.hidden = !content;
    this.message.replaceChildren(...(content || []));
  }

  _notice(v) {
    const parts = [];
    if (v.missing) {
      parts.push(h('div', { class: 'fl-notice-item fl-notice-update' }, icon('undo', 15), h('div', null,
        v.missing > 1 ? `${fmtInt(v.missing)} lignes modifiées correspondent maintenant aux filtres. ` : 'Une ligne modifiée correspond maintenant aux filtres. ',
        h('button', { type: 'button', class: 'fl-link', onclick: () => this.actions.update() }, 'Actualiser'))));
    }
    if (!v.readonly && v.linking && v.linking.asSource === false && v.facets.length) {
      parts.push(h('div', { class: 'fl-notice-item' }, icon('link', 15), h('div', null,
        h('strong', null, 'Reliez ces filtres à un tableau.'), ' Sélectionnez le tableau à filtrer puis, dans le panneau de droite, ',
        h('em', null, 'Vue'), ' › ', h('em', null, 'Données source'), ' › ', h('em', null, 'Sélectionner par'), ' : choisissez ce widget.')));
    }
    if (!v.readonly && !v.config.fields && v.facets.length) {
      parts.push(h('div', { class: 'fl-notice-item' }, icon('filter', 15), h('div', null,
        'Champs proposés automatiquement. ',
        h('button', { type: 'button', class: 'fl-link', onclick: () => this.actions.openSettings() }, 'Choisir les champs'))));
    }
    this.notice.hidden = !parts.length;
    this.notice.replaceChildren(...parts);
  }

  _chip(facet, f) {
    return this._chipEl(facet.col.label, summarize(facet, f), () => this.actions.setFilter(facet.colId, null), () => this.actions.focusFacet(facet.colId));
  }

  _chipEl(label, text, onRemove, onFocus) {
    return h('span', { class: 'fl-chip' },
      h('button', { type: 'button', class: 'fl-chip-label', title: `${label} : ${text}`, onclick: onFocus },
        h('span', { class: 'fl-chip-name' }, label, ' : '), text),
      h('button', { type: 'button', class: 'fl-chip-x', 'aria-label': `Retirer le filtre ${label}`, title: 'Retirer ce filtre', onclick: onRemove }, icon('x', 13)));
  }

  /** Ouvre un bloc et l'amène à l'écran. */
  reveal(colId) {
    for (const view of this.views.values()) {
      if (view.colId === colId) {
        view.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        view.focus();
      }
    }
  }

  showToast(text, undoLabel, ms = 6000) {
    clearTimeout(this._toastTimer);
    this.toast.replaceChildren(h('span', null, text),
      undoLabel ? h('button', { type: 'button', class: 'fl-link fl-toast-undo', onclick: () => { this.hideToast(); this.actions.undo(); } }, icon('undo', 14), undoLabel) : null);
    this.toast.hidden = false;
    this._toastTimer = setTimeout(() => this.hideToast(), ms);
  }

  hideToast() {
    this.toast.hidden = true;
  }
}

/** Un bloc de filtre (un champ). */
class FacetView {
  constructor(panel, facet) {
    this.panel = panel;
    this.actions = panel.actions;
    this.colId = facet.colId;
    this.mode = facet.mode;
    const bodyId = 'fl-body-' + Math.random().toString(36).slice(2, 8);
    this.toggle = h('button', {
      type: 'button', class: 'fl-facet-toggle', 'aria-expanded': 'true', 'aria-controls': bodyId,
      onclick: () => this.actions.toggleCollapsed(this.colId),
    }, icon('chevron', 14), this.title = h('span', { class: 'fl-facet-title' }), this.badge = h('span', { class: 'fl-badge', hidden: true }));
    this.summary = h('span', { class: 'fl-facet-summary' });
    this.clearBtn = h('button', {
      type: 'button', class: 'fl-icon-btn fl-facet-clear', title: 'Effacer ce filtre', 'aria-label': `Effacer le filtre ${facet.col.label}`,
      onclick: () => this.actions.setFilter(this.colId, null),
    }, icon('x', 14));
    this.body = h('div', { class: 'fl-facet-body', id: bodyId });
    this.head = h('div', { class: 'fl-facet-head' }, this.toggle, this.clearBtn);
    this.el = h('section', { class: 'fl-facet', 'data-col': facet.colId, 'data-mode': facet.mode }, this.head, this.summary, this.body);
    if (LIST_MODES.has(this.mode)) { this.content = new ListBody(this); }
    else if (this.mode === 'range') { this.content = new RangeBody(this); }
    else if (this.mode === 'period') { this.content = new PeriodBody(this); }
    else { this.content = new TextBody(this); }
    this.body.appendChild(this.content.el);
  }

  set(f) { this.actions.setFilter(this.colId, f); }

  focus() {
    if (this.collapsed) { this.actions.toggleCollapsed(this.colId); }
    this.content.focus();
  }

  update(facet, f, counts, bounds, v) {
    this.facet = facet;
    const active = isActive(facet, f);
    this.collapsed = v.collapsed.has(facet.colId);
    this.title.textContent = facet.col.label;
    this.el.classList.toggle('is-active', active);
    this.el.classList.toggle('is-collapsed', this.collapsed);
    this.toggle.setAttribute('aria-expanded', String(!this.collapsed));
    this.body.hidden = this.collapsed;
    const n = active && LIST_MODES.has(facet.mode) ? f.in.length : 0;
    this.badge.hidden = !n;
    this.badge.textContent = n ? String(n) : '';
    this.badge.title = n ? `${n} valeur${n > 1 ? 's' : ''} ${f.not ? 'exclue' : 'cochée'}${n > 1 ? 's' : ''}` : '';
    this.clearBtn.hidden = !active;
    this.summary.hidden = !(this.collapsed && active);
    this.summary.textContent = this.collapsed && active ? summarize(facet, f) : '';
    this.content.update(facet, f || null, counts, bounds, v);
  }
}

/** Cases à cocher, avec recherche, « Seulement », inclure / exclure et « Afficher plus ». */
class ListBody {
  constructor(view) {
    this.view = view;
    this.query = '';
    this.expanded = false;
    this.items = new Map();
    this.searchInput = h('input', {
      type: 'search', class: 'fl-value-search-input', placeholder: 'Rechercher une valeur', 'aria-label': 'Rechercher une valeur',
      oninput: () => { this.query = this.searchInput.value; this._render(); },
      onkeydown: e => this._searchKey(e),
    });
    this.searchBox = h('div', { class: 'fl-value-search', hidden: true }, icon('search', 14), this.searchInput);
    // « Inclure » : les lignes ayant une des valeurs cochées ; « Exclure » : toutes les autres.
    this.notSelect = h('select', {
      class: 'fl-not', hidden: true, 'aria-label': 'Inclure ou exclure les valeurs cochées',
      title: 'Inclure : seulement les lignes ayant une des valeurs cochées.\nExclure : toutes les lignes sauf celles-là.',
      onchange: () => this._setNot(this.notSelect.value === 'not'),
    }, h('option', { value: 'in' }, 'Inclure'), h('option', { value: 'not' }, 'Exclure'));
    view.head.insertBefore(this.notSelect, view.clearBtn);
    this.list = h('ul', { class: 'fl-values', role: 'list' });
    this.empty = h('div', { class: 'fl-values-empty', hidden: true });
    this.more = h('button', { type: 'button', class: 'fl-link fl-more', hidden: true, onclick: () => { this.expanded = !this.expanded; this._render(); } });
    this.el = h('div', { class: 'fl-list' }, this.searchBox, this.list, this.empty, this.more);
  }

  focus() {
    (this.searchBox.hidden ? this.list.querySelector('input') : this.searchInput)?.focus({ preventScroll: true });
  }

  relayout() { this._render(); }

  update(facet, f, counts, bounds, v) {
    this.facet = facet;
    this.f = f;
    this.counts = counts;
    this.hideEmpty = v.config.hideEmpty;
    this._render();
  }

  _selected() { return this.f && Array.isArray(this.f.in) ? this.f.in : []; }

  _toggle(key, on) {
    const sel = this._selected().filter(k => k !== key);
    if (on) { sel.push(key); }
    this.view.set(sel.length ? { in: sel, not: Boolean(this.f && this.f.not) } : null);
  }

  _only(key) {
    this.view.set({ in: [key], not: false });
  }

  _setNot(not) {
    const sel = this._selected();
    if (sel.length) { this.view.set({ in: sel, not }); }
  }

  _searchKey(e) {
    if (e.key === 'Escape' && this.query) {
      e.stopPropagation();
      this.searchInput.value = this.query = '';
      this._render();
    } else if (e.key === 'Enter') {
      // Entrée coche (ou décoche) la première valeur trouvée.
      const first = this.list.querySelector('li input');
      if (first) { e.preventDefault(); first.click(); }
    }
  }

  _render() {
    const facet = this.facet;
    if (!facet) { return; }
    const selected = this._selected();
    const selSet = new Set(selected);
    const counts = this.counts || new Map();
    // Valeurs cochées qui n'existent plus dans les données : gardées pour pouvoir les décocher.
    const keys = facet.order.slice();
    for (const k of selected) { if (!facet.values.has(k)) { keys.push(k); } }
    const info = k => facet.values.get(k) || describeValue(facet, k);
    const q = fold(this.query.trim());
    let candidates = keys;
    if (this.hideEmpty) { candidates = candidates.filter(k => selSet.has(k) || (counts.get(k) || 0) > 0); }
    if (q) { candidates = candidates.filter(k => fold(info(k).label).includes(q)); }
    let visible = candidates;
    const band = this.view.panel.band;
    const collapsedList = !band && !q && !this.expanded && candidates.length > VISIBLE + 2;
    if (collapsedList) {
      visible = candidates.filter((k, i) => i < VISIBLE || selSet.has(k));
    }
    this.searchBox.hidden = keys.length <= VISIBLE + 2;
    this.notSelect.hidden = !selected.length;
    this.notSelect.value = this.f && this.f.not ? 'not' : 'in';
    this.view.el.classList.toggle('is-excluding', Boolean(selected.length && this.f && this.f.not));

    const items = new Map();
    const els = visible.map(k => {
      const id = typeof k + ':' + String(k);
      let item = this.items.get(id);
      if (!item) { item = this._item(k); }
      items.set(id, item);
      const n = counts.get(k) || 0;
      const checked = selSet.has(k);
      item.input.checked = checked;
      item.li.classList.toggle('is-checked', checked);
      item.li.classList.toggle('is-zero', n === 0 && !checked);
      item.count.textContent = fmtInt(n);
      item.label.title = info(k).label;
      return item.li;
    });
    this.items = items;
    // Remplace le contenu sans recréer les éléments conservés (le focus reste en place).
    els.forEach((li, i) => { if (this.list.children[i] !== li) { this.list.insertBefore(li, this.list.children[i] || null); } });
    while (this.list.children.length > els.length) { this.list.lastChild.remove(); }

    this.empty.hidden = visible.length > 0;
    this.empty.textContent = q ? 'Aucune valeur ne correspond.' : 'Aucune valeur.';
    const hidden = candidates.length - visible.length;
    this.more.hidden = band || !(hidden > 0 || (this.expanded && !q && candidates.length > VISIBLE + 2));
    this.more.textContent = hidden > 0 ? `Afficher ${hidden > 1 ? `les ${fmtInt(hidden)} autres valeurs` : 'l’autre valeur'}` : 'Afficher moins';
  }

  _item(key) {
    const v = this.facet.values.get(key) || describeValue(this.facet, key);
    const input = h('input', { type: 'checkbox', class: 'fl-checkbox', onchange: () => this._toggle(key, input.checked) });
    let text;
    if (v.style) {
      const s = v.style;
      text = h('span', {
        class: 'fl-token' + (s.known ? '' : ' fl-token-invalid'),
        style: {
          backgroundColor: s.fill || '', color: s.text || '', fontWeight: s.bold ? '600' : '',
          fontStyle: s.italic ? 'italic' : '', textDecoration: [s.underline ? 'underline' : '', s.strike ? 'line-through' : ''].join(' ').trim(),
        },
      }, v.label);
    } else {
      text = h('span', { class: 'fl-value-text' + (v.special ? ' fl-special' : '') }, v.label);
    }
    const label = h('span', { class: 'fl-value-label' }, text);
    const count = h('span', { class: 'fl-value-count' });
    const only = h('button', {
      type: 'button', class: 'fl-only', tabindex: '-1', title: `Ne garder que « ${v.label} »`,
      onclick: e => { e.preventDefault(); this._only(key); },
    }, 'Seulement');
    // Le bouton « Seulement » est dans l'étiquette : un clic dessus ne coche pas la case (contenu interactif).
    const li = h('li', { class: 'fl-value' }, h('label', { class: 'fl-value-row' }, input, label, only, count));
    return { li, input, count, label };
  }
}

/** Plage de nombres : min et max, appliqués pendant la saisie. */
class RangeBody {
  constructor(view) {
    this.view = view;
    const make = (name) => h('input', {
      type: 'text', inputmode: 'decimal', class: 'fl-input', 'aria-label': name,
      oninput: () => this._apply(), onkeydown: e => { if (e.key === 'Enter') { this._apply.flush(); } },
      onblur: () => { this._apply.flush(); this._sync(true); },
    });
    this.min = make('Minimum');
    this.max = make('Maximum');
    this._apply = debounce(() => this._commit(), 450);
    this.hint = h('div', { class: 'fl-range-hint' });
    this.el = h('div', { class: 'fl-range' },
      h('div', { class: 'fl-range-row' },
        h('label', { class: 'fl-field' }, h('span', null, 'Min'), this.min),
        h('span', { class: 'fl-dash' }, '–'),
        h('label', { class: 'fl-field' }, h('span', null, 'Max'), this.max)),
      this.hint);
  }

  focus() { this.min.focus({ preventScroll: true }); }

  _commit() {
    const a = parseNumberInput(this.min.value), b = parseNumberInput(this.max.value);
    this.min.classList.toggle('is-invalid', Boolean(this.min.value.trim()) && a === null);
    this.max.classList.toggle('is-invalid', Boolean(this.max.value.trim()) && b === null);
    let min = a, max = b;
    if (min !== null && max !== null && min > max) { [min, max] = [max, min]; }
    this.view.set(min === null && max === null ? null : { min, max });
  }

  _sync(force) {
    const f = this.f || {};
    for (const [input, val] of [[this.min, f.min], [this.max, f.max]]) {
      if (force || document.activeElement !== input) {
        const text = val === null || val === undefined ? '' : formatNumberInput(val);
        if (parseNumberInput(input.value) !== (val ?? null)) { input.value = text; }
        input.classList.remove('is-invalid');
      }
    }
  }

  update(facet, f, counts, bounds) {
    this.facet = facet;
    this.f = f;
    this._sync(false);
    const col = displayColumn(facet.col);
    const fmt = n => col.numberFormat.format(n);
    this.min.placeholder = bounds && bounds.min !== null ? fmt(bounds.min) : '';
    this.max.placeholder = bounds && bounds.max !== null ? fmt(bounds.max) : '';
    this.hint.textContent = bounds && bounds.min !== null
      ? (bounds.min === bounds.max ? `Une seule valeur : ${fmt(bounds.min)}` : `De ${fmt(bounds.min)} à ${fmt(bounds.max)}`)
      : 'Aucune valeur';
  }
}

/** Période : périodes prêtes à l'emploi ou dates « du … au … ». */
class PeriodBody {
  constructor(view) {
    this.view = view;
    this.preset = h('select', { class: 'fl-select', 'aria-label': 'Période', onchange: () => this._choose(this.preset.value) },
      h('option', { value: '' }, 'Toutes les dates'),
      PRESETS.map(([id, label]) => h('option', { value: id }, label)),
      h('option', { value: 'custom' }, 'Dates personnalisées…'));
    const make = (name) => h('input', { type: 'date', class: 'fl-input fl-date', 'aria-label': name, onchange: () => this._dates() });
    this.from = make('Du');
    this.to = make('Au');
    this.hint = h('div', { class: 'fl-range-hint' });
    this.el = h('div', { class: 'fl-period' }, this.preset,
      h('div', { class: 'fl-range-row' },
        h('label', { class: 'fl-field' }, h('span', null, 'Du'), this.from),
        h('label', { class: 'fl-field' }, h('span', null, 'Au'), this.to)),
      this.hint);
  }

  focus() { this.preset.focus({ preventScroll: true }); }

  _choose(id) {
    if (id === 'custom') { this.custom = true; this.from.focus(); this._syncSelect(); return; }
    this.custom = false;
    this.view.set(id ? { preset: id } : null);
  }

  _dates() {
    let from = this.from.value || null, to = this.to.value || null;
    if (from && to && from > to) { [from, to] = [to, from]; }
    this.custom = true;
    this.view.set(from || to ? { from, to } : null);
  }

  _syncSelect() {
    const f = this.f || {};
    this.preset.value = f.preset || (f.from || f.to || this.custom ? 'custom' : '');
  }

  update(facet, f, counts, bounds) {
    this.f = f;
    if (!f) { this.custom = this.custom && document.activeElement && this.el.contains(document.activeElement); }
    this._syncSelect();
    const { from, to } = f && f.preset ? resolvePreset(f.preset) : { from: f ? f.from : null, to: f ? f.to : null };
    if (document.activeElement !== this.from) { this.from.value = from || ''; }
    if (document.activeElement !== this.to) { this.to.value = to || ''; }
    this.hint.textContent = bounds && bounds.min
      ? (bounds.min === bounds.max ? `Une seule date : ${formatDay(bounds.min)}` : `Du ${formatDay(bounds.min)} au ${formatDay(bounds.max)}`)
      : 'Aucune date';
  }
}

/** Recherche de texte dans un champ. */
class TextBody {
  constructor(view) {
    this.view = view;
    this.input = h('input', {
      type: 'search', class: 'fl-input', placeholder: 'Contient…', 'aria-label': 'Contient',
      oninput: () => this._apply(),
      onkeydown: e => { if (e.key === 'Enter') { this._apply.flush(); } },
    });
    this._apply = debounce(() => this.view.set(this.input.value.trim() ? { q: this.input.value } : null), 250);
    this.el = h('div', { class: 'fl-text' }, this.input);
  }

  focus() { this.input.focus({ preventScroll: true }); }

  update(facet, f) {
    if (document.activeElement !== this.input) { this.input.value = f ? f.q : ''; }
  }
}

