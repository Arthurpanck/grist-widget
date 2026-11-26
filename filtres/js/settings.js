/**
 * Écran de configuration (configurateurs seulement) : champs proposés, leur ordre, leur façon de
 * filtrer, et les options du panneau. Ouvert par la roue dentée ou par « Ouvrir la configuration »
 * dans le menu du widget.
 */

import { h, icon } from './dom.js';
import { MODES, modesFor } from './engine.js';

const TYPE_LABELS = {
  Text: 'Texte', Numeric: 'Numérique', Int: 'Entier', Bool: 'Case à cocher', Date: 'Date', DateTime: 'Date et heure',
  Choice: 'Choix', ChoiceList: 'Choix multiple', Ref: 'Référence', RefList: 'Liste de références', Attachments: 'Pièce jointe', Any: 'Formule',
};
const TYPE_ICONS = {
  Text: 'text', Numeric: 'hash', Int: 'hash', Bool: 'check', Date: 'calendar', DateTime: 'calendar',
  Choice: 'choice', ChoiceList: 'choice', Ref: 'ref', RefList: 'ref', Any: 'formula',
};
/** Libellés courts des modes, pour les listes de l'écran de configuration. */
const MODE_SHORT = { list: 'Cases à cocher', range: 'Plage min – max', period: 'Période', year: 'Par année', month: 'Par mois', text: 'Recherche de texte' };

/**
 * Ouvre l'écran par-dessus le panneau. `fields` sont les champs actuellement proposés (réglés ou
 * automatiques). `onSave(config)` reçoit les nouveaux réglages ; `onClose()` est appelé dans tous les cas.
 */
export function openSettings(root, { columns, fields, config, onSave, onClose }) {
  const byId = new Map(columns.map(c => [c.colId, c]));
  // Lignes de l'écran : champs retenus d'abord (dans leur ordre), puis les autres colonnes.
  const chosen = new Map(fields.map(f => [f.colId, f]));
  let rows = [
    ...fields.filter(f => byId.has(f.colId)).map(f => ({ col: byId.get(f.colId), on: true, mode: f.mode, sort: f.sort || 'natural' })),
    ...columns.filter(c => !chosen.has(c.colId) && modesFor(c).length).map(c => ({ col: c, on: false, mode: modesFor(c)[0], sort: 'natural' })),
  ];
  const opts = { search: config.search, remember: config.remember, hideEmpty: config.hideEmpty };

  const list = h('ul', { class: 'fl-fieldlist' });
  let dragIndex = null;

  function move(i, j) {
    if (j < 0 || j >= rows.length || i === j) { return; }
    const [r] = rows.splice(i, 1);
    rows.splice(j, 0, r);
    render();
    list.children[j]?.querySelector(j > i ? '.fl-down' : '.fl-up')?.focus();
  }

  function render() {
    list.replaceChildren(...rows.map((r, i) => {
      const modes = modesFor(r.col);
      const typeName = TYPE_LABELS[r.col.base] || r.col.base;
      const isChoice = r.col.base === 'Choice' || r.col.base === 'ChoiceList';
      const check = h('input', { type: 'checkbox', checked: r.on, 'aria-label': `Filtrer sur ${r.col.label}`, onchange: () => { r.on = check.checked; render(); } });
      const modeSel = modes.length > 1 ? h('select', { class: 'fl-select fl-mode-select', 'aria-label': `Façon de filtrer ${r.col.label}`, title: MODES[r.mode], onchange: () => { r.mode = modeSel.value; render(); } },
        modes.map(m => h('option', { value: m, selected: m === r.mode, title: MODES[m] }, MODE_SHORT[m]))) : null;
      const isList = ['list', 'year', 'month'].includes(r.mode);
      const sortSel = isList && !(r.col.base === 'Bool') ? h('select', { class: 'fl-select fl-sort-select', 'aria-label': `Ordre des valeurs de ${r.col.label}`, onchange: () => { r.sort = sortSel.value; } },
        h('option', { value: 'natural', selected: r.sort !== 'count' }, isChoice ? 'Ordre des choix' : (r.mode === 'list' ? 'Ordre alphabétique' : 'Plus récentes d’abord')),
        h('option', { value: 'count', selected: r.sort === 'count' }, 'Plus fréquentes d’abord')) : null;
      const li = h('li', { class: 'fl-fieldrow' + (r.on ? ' is-on' : ''), draggable: 'true', 'data-index': String(i),
        ondragstart: e => { dragIndex = i; li.classList.add('is-dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); },
        ondragend: () => { dragIndex = null; li.classList.remove('is-dragging'); },
        ondragover: e => { if (dragIndex !== null) { e.preventDefault(); li.classList.add('is-drop'); } },
        ondragleave: () => li.classList.remove('is-drop'),
        ondrop: e => { e.preventDefault(); li.classList.remove('is-drop'); if (dragIndex !== null) { move(dragIndex, i); } },
      },
      h('div', { class: 'fl-fieldrow-line' },
        h('span', { class: 'fl-grip', title: 'Glisser pour déplacer' }, icon('grip', 14)),
        h('label', { class: 'fl-fieldrow-main', title: `${r.col.label} (${typeName})` }, check,
          h('span', { class: 'fl-type', 'aria-hidden': 'true' }, icon(TYPE_ICONS[r.col.base] || 'text', 13)),
          h('span', { class: 'fl-fieldrow-label' }, r.col.label)),
        h('div', { class: 'fl-fieldrow-move' },
          h('button', { type: 'button', class: 'fl-icon-btn fl-up', 'aria-label': `Monter ${r.col.label}`, title: 'Monter', disabled: i === 0, onclick: () => move(i, i - 1) }, icon('up', 14)),
          h('button', { type: 'button', class: 'fl-icon-btn fl-down', 'aria-label': `Descendre ${r.col.label}`, title: 'Descendre', disabled: i === rows.length - 1, onclick: () => move(i, i + 1) }, icon('down', 14)))),
      r.on && (modeSel || sortSel) ? h('div', { class: 'fl-fieldrow-opts' }, modeSel, sortSel) : null);
      return li;
    }));
    const n = rows.filter(r => r.on).length;
    count.textContent = `${n} champ${n > 1 ? 's' : ''} retenu${n > 1 ? 's' : ''}`;
  }

  const count = h('span', { class: 'fl-muted' });
  const option = (key, label, help) => {
    const input = h('input', { type: 'checkbox', checked: opts[key], onchange: () => { opts[key] = input.checked; } });
    return h('label', { class: 'fl-option' }, input, h('span', null, label, help ? h('span', { class: 'fl-option-help' }, help) : null));
  };

  function close() {
    document.removeEventListener('keydown', onKey, true);
    overlay.remove();
    onClose && onClose();
  }
  function save() {
    const fieldsOut = rows.filter(r => r.on).map(r => ({ colId: r.col.colId, mode: r.mode, ...(r.sort === 'count' ? { sort: 'count' } : {}) }));
    onSave({ ...config, ...opts, fields: fieldsOut });
    close();
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
  }

  const overlay = h('div', { class: 'fl-settings', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'fl-settings-title' },
    h('div', { class: 'fl-settings-scroll' },
      h('h2', { id: 'fl-settings-title' }, 'Configurer les filtres'),
      h('section', null,
        h('div', { class: 'fl-settings-head' }, h('h3', null, 'Champs à filtrer'), count),
        h('p', { class: 'fl-help' }, 'Cochez les champs que les utilisateurs pourront filtrer. Glissez-les, ou utilisez les flèches, pour choisir leur ordre.'),
        list),
      h('section', null,
        h('h3', null, 'Options'),
        option('search', 'Barre de recherche dans toutes les colonnes'),
        option('remember', 'Chaque utilisateur retrouve ses filtres', 'Les filtres choisis sont gardés dans le navigateur de chacun, même après avoir changé de page.'),
        option('hideEmpty', 'Masquer les valeurs qui ne donnent aucune ligne', 'Sinon, elles restent visibles en grisé.'))),
    h('div', { class: 'fl-settings-foot' },
      h('button', { type: 'button', class: 'fl-btn', onclick: close }, 'Annuler'),
      h('button', { type: 'button', class: 'fl-btn fl-btn-primary', onclick: save }, 'Enregistrer')));
  render();
  document.addEventListener('keydown', onKey, true);
  root.appendChild(overlay);
  overlay.querySelector('input')?.focus({ preventScroll: true });
  return { close };
}
