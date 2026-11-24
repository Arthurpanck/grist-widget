/**
 * Hub de navigation — application Vue.
 * Les gabarits des composants sont dans index.html (<template id="tpl-…">).
 * Conception : voir DESIGN.md.
 *
 * Édition sur place :
 *  1. créer  — une case « Ajouter un bouton » attend à la fin de chaque rubrique ; elle contient un seul
 *              champ « Vers où mène ce bouton ? » (page du document ou adresse web) ;
 *  2. modifier — un clic sur un bouton ouvre sa fiche à côté de lui ; on le glisse pour le déplacer ;
 *  3. afficher — le panneau « Affichage » règle forme, couleurs, en-tête et fond.
 */
import { createApp, reactive, computed, ref, watch, onMounted, Sortable, registerIconLibrary, LUCIDE } from './libs.js';
import * as C from './config.js';
import * as G from './grist.js';

export const APP_VERSION = '3.0.0';
console.info(`Hub de navigation ${APP_VERSION}`);

// Icônes Lucide pour tous les <wa-icon> (les icônes internes de Web Awesome restent les siennes).
registerIconLibrary('default', {
  resolver: name => `${LUCIDE}/${name}.svg`,
  mutator: svg => svg.querySelectorAll('*').forEach(el => el.setAttribute('fill', 'none')),
});

/* ================================================================== */
/* État partagé                                                        */
/* ================================================================== */

const store = reactive({
  loaded: false,
  saved: null,          // configuration enregistrée
  draft: null,          // configuration en cours d'édition
  baseline: '',         // brouillon initial, pour détecter les modifications
  editing: false,
  gallery: false,       // galerie de modèles ouverte
  ghost: null,          // rubrique dont la case « Ajouter un bouton » est ouverte
  editId: null,         // bouton dont la fiche est ouverte
  panel: false,         // panneau Affichage / Réglages ouvert
  panelTab: 'affichage',
  access: null,
  pages: [],
  pagesLoaded: false,
  docBase: null,
  confirm: null,        // { label, text, ok, resolve }
});

const canEdit = () => !G.readonly;
const clone = o => JSON.parse(JSON.stringify(o));
const current = () => (store.editing ? store.draft : store.saved);
const isEmpty = cfg => !cfg || !C.allButtons(cfg).length;
const templatePages = () => {
  const pages = store.pages.filter(p => !p.isHub);
  return pages.length ? pages : C.SAMPLE_PAGES;
};

function notify(message, variant = 'neutral', duration = 6000) {
  document.querySelector('wa-toast')?.create(message, { variant, duration });
}

function ask(options) {
  return new Promise(resolve => { store.confirm = { ok: 'Confirmer', ...options, resolve }; });
}

/* ================================================================== */
/* Liens et boutons                                                    */
/* ================================================================== */

const pageOf = viewRef => store.pages.find(p => p.viewRef === viewRef);
const isIconName = icon => /^[a-z0-9-]+$/.test(icon || '');
const sectionOf = id => store.draft.sections.find(s => s.id === id);

function findButton(id) {
  for (const section of store.draft.sections) {
    const index = section.buttons.findIndex(b => b.id === id);
    if (index >= 0) { return { section, index, button: section.buttons[index] }; }
  }
  return null;
}

function hostOf(url) {
  try { return new URL(C.safeUrl(url)).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
}

function autoLabel(b) {
  return (b.kind === 'page' ? pageOf(b.page)?.name : hostOf(b.url)) || '';
}

function labelOf(b) {
  return b.label.trim() || autoLabel(b) || 'Sans titre';
}

function linkOf(cfg, b) {
  if (b.kind === 'url') {
    const href = C.safeUrl(b.url);
    if (!href) { return { problem: b.url ? 'Adresse web invalide' : 'Adresse web manquante' }; }
    const sameTab = !b.newTab || /^(mailto|tel):/.test(href);
    return { href, target: sameTab ? '_top' : '_blank', external: !sameTab };
  }
  if (!b.page) { return { problem: 'Aucune page choisie' }; }
  if (store.pagesLoaded && !pageOf(b.page)) { return { problem: 'Page supprimée' }; }
  const base = C.cleanDocUrl(cfg.docUrl) || store.docBase;
  if (!base) { return { problem: 'Adresse du document inconnue', missingBase: true }; }
  return { href: `${base}/p/${b.page}`, target: '_top' };
}

function describeLink(b) {
  if (b.kind === 'url') { return hostOf(b.url) || 'Site web'; }
  const p = pageOf(b.page);
  return p ? `Page « ${p.name} »` : 'Page à choisir';
}

const iconFor = dest => (dest.kind === 'url' ? 'globe' : C.guessIcon(pageOf(dest.page)?.name));

function addButton(sectionId, dest) {
  sectionOf(sectionId).buttons.push(C.newButton({ ...dest, icon: iconFor(dest) }));
}

// Une adresse plutôt qu'un nom de page : schéma connu, « www. » ou nom de domaine.
const looksLikeUrl = text => /^(https?:\/\/|www\.|mailto:|tel:)/i.test(text) || /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(text);
const normalizeText = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

let lastDrag = 0;

/* ================================================================== */
/* Composants                                                          */
/* ================================================================== */

/** Le hub. mode : view (liens actifs) | edit (édition sur place) | static (miniatures). */
const HubView = {
  template: '#tpl-hub',
  props: { config: Object, mode: { type: String, default: 'view' } },
  setup(props) {
    const m = computed(() => {
      const c = props.config;
      let index = 0, number = 0;
      const sections = c.sections
        .filter(s => s.buttons.length || props.mode === 'edit')
        .map(s => ({
          id: s.id,
          title: s.title,
          number: s.title ? ++number : 0,
          items: s.buttons.map(b => ({ b, label: labelOf(b), color: C.colorOf(b, index++, c), link: linkOf(c, b) })),
        }));
      const bg = c.background;
      const image = bg.type === 'image' ? (bg.image || C.DEFAULT_IMAGE) : '';
      return {
        c,
        sections,
        image,
        onDark: (image && bg.tone === 'dark' && bg.veil >= 0.2) || (bg.type === 'color' && C.isDark(bg.color)),
        hasHeader: c.header.style !== 'none' && Boolean(c.header.title || c.header.subtitle || c.header.logo),
      };
    });

    const rootStyle = computed(() => {
      const bg = m.value.c.background;
      const style = {};
      if (bg.type === 'color') { style['--hub-canvas'] = bg.color; }
      if (m.value.image) {
        const veil = bg.tone === 'dark' ? `rgba(20, 22, 40, ${bg.veil})` : `rgba(255, 255, 255, ${bg.veil})`;
        style.backgroundImage = `linear-gradient(${veil}, ${veil}), url(${JSON.stringify(m.value.image)})`;
        style.backgroundSize = bg.fit;
      }
      if (m.value.c.look.columns) { style['--hub-columns'] = m.value.c.look.columns; }
      return style;
    });

    const tagOf = item => (props.mode === 'view' && item.link.href ? 'a' : props.mode === 'static' ? 'div' : 'button');

    function click(event, item) {
      if (props.mode === 'edit') {
        if (Date.now() - lastDrag < 300) { return; }   // fin d'un glisser-déposer, pas un clic
        store.ghost = null;
        store.editId = item.b.id;
      } else if (props.mode === 'view' && !item.link.href) {
        notify(item.link.missingBase
          ? 'Adresse du document inconnue : accordez l\'accès complet au widget, ou renseignez l\'adresse du document dans les réglages du hub.'
          : `${item.label} : ${item.link.problem.toLowerCase()}.`, 'warning');
      }
    }

    // Glisser-déposer des boutons, y compris d'une rubrique à l'autre (mode édition uniquement).
    const sortable = computed(() => (props.mode !== 'edit' ? null : {
      onMove({ from, to, oldIndex, newIndex }) {
        const [b] = sectionOf(from).buttons.splice(oldIndex, 1);
        sectionOf(to).buttons.splice(newIndex, 0, b);
      },
    }));

    function addSection() {
      const s = C.newSection();
      store.draft.sections.push(s);
      store.editId = null;
      store.ghost = s.id;
    }

    async function removeSection(id) {
      const s = sectionOf(id);
      const n = s.buttons.length;
      if (n && !(await ask({ label: 'Supprimer la rubrique ?', text: `Ses ${n} bouton${n > 1 ? 's' : ''} seront supprimés.`, ok: 'Supprimer' }))) { return; }
      store.draft.sections.splice(store.draft.sections.indexOf(s), 1);
    }

    const setTitle = (id, title) => { sectionOf(id).title = title; };

    return { m, rootStyle, tagOf, click, sortable, addSection, removeSection, setTitle, isIconName, store };
  },
};

/** Champ unique « Vers où mène ce bouton ? » : pages du document suggérées, ou adresse web collée. */
let pickerCount = 0;
const DestPicker = {
  template: '#tpl-dest',
  props: { label: String, placeholder: String, autofocus: Boolean },
  emits: ['pick', 'cancel', 'leave'],
  setup(props, { emit }) {
    const uid = 'dest' + (++pickerCount);
    const query = ref('');
    const active = ref(0);
    const input = ref(null);

    const options = computed(() => {
      const text = query.value.trim();
      const q = normalizeText(text);
      const list = [];
      if (text && looksLikeUrl(text) && C.safeUrl(text)) {
        const url = C.safeUrl(text);
        list.push({ key: 'url', kind: 'url', url, icon: 'globe', label: hostOf(url) || url, hint: 'Lien web' });
      }
      const used = store.draft ? new Set(C.allButtons(store.draft).filter(b => b.kind === 'page').map(b => b.page)) : new Set();
      store.pages
        .filter(p => !p.isHub && (!q || normalizeText(p.name).includes(q)))
        .sort((a, b) => used.has(a.viewRef) - used.has(b.viewRef))
        .slice(0, 8)
        .forEach(p => list.push({ key: 'p' + p.viewRef, kind: 'page', page: p.viewRef, icon: C.guessIcon(p.name), label: p.name,
          hint: used.has(p.viewRef) ? 'déjà sur le hub' : '' }));
      return list;
    });

    const emptyText = computed(() => {
      if (!store.pages.length) { return 'Collez une adresse web (https://…). Pour choisir une page, accordez l\'accès complet au widget.'; }
      return query.value.trim() ? 'Aucune page ne correspond. Collez une adresse web pour créer un lien.' : 'Collez une adresse web (https://…).';
    });

    watch(options, () => { active.value = 0; });

    function pick(o) {
      emit('pick', o.kind === 'url' ? { kind: 'url', url: o.url } : { kind: 'page', page: o.page });
      query.value = '';
      input.value?.focus();
    }

    function onKey(e) {
      const n = options.value.length;
      if (e.key === 'ArrowDown' && n) { e.preventDefault(); active.value = (active.value + 1) % n; }
      else if (e.key === 'ArrowUp' && n) { e.preventDefault(); active.value = (active.value - 1 + n) % n; }
      else if (e.key === 'Enter') { e.preventDefault(); if (options.value[active.value]) { pick(options.value[active.value]); } }
      else if (e.key === 'Escape') { e.preventDefault(); emit('cancel'); }
    }

    function onFocusOut(e) {
      if (!e.currentTarget.contains(e.relatedTarget) && !query.value.trim()) { emit('leave'); }
    }

    onMounted(() => { if (props.autofocus) { input.value?.focus(); } });

    return { uid, query, active, input, options, emptyText, pick, onKey, onFocusOut };
  },
};

/** Case « Ajouter un bouton », à la fin de chaque rubrique. */
const GhostTile = {
  template: '#tpl-ghost',
  props: { sectionId: String },
  setup(props) {
    const active = computed(() => store.ghost === props.sectionId);
    const open = () => { store.editId = null; store.ghost = props.sectionId; };
    const close = () => { if (store.ghost === props.sectionId) { store.ghost = null; } };
    const create = dest => addButton(props.sectionId, dest);
    return { active, open, close, create };
  },
};

/** Fiche d'un bouton, ouverte à côté de lui : nom, destination, icône, couleur, description. */
const ButtonCard = {
  template: '#tpl-card',
  setup() {
    const found = computed(() => (store.editId ? findButton(store.editId) : null));
    const b = computed(() => found.value?.button);
    const changing = ref(false);
    const moreIcons = ref(false);
    const iconQuery = ref('');
    watch(() => store.editId, () => { changing.value = false; moreIcons.value = false; iconQuery.value = ''; });

    const iconChoices = computed(() => {
      if (!b.value) { return []; }
      const names = [b.value.icon, C.guessIcon(labelOf(b.value)), 'file-text', 'table-2', 'layout-dashboard', 'users', 'calendar-days', 'map', 'book-open', 'globe'];
      return [...new Set(names.filter(isIconName))].slice(0, 6).map(n => C.ICONS.find(i => i.name === n) || { name: n, label: n });
    });
    const icons = computed(() => C.searchIcons(iconQuery.value));

    function setDest(dest) {
      const before = iconFor(b.value);
      Object.assign(b.value, dest.kind === 'url' ? { kind: 'url', url: dest.url } : { kind: 'page', page: dest.page });
      if (!b.value.icon || b.value.icon === before || b.value.icon === 'arrow-right') { b.value.icon = iconFor(dest); }
      changing.value = false;
    }

    function remove() {
      found.value.section.buttons.splice(found.value.index, 1);
      store.editId = null;
    }

    function onHide(event, id) {
      if (event.target === event.currentTarget && store.editId === id) { store.editId = null; }
    }

    const chartColors = computed(() => C.charteOf(store.draft).colors);
    const colors = computed(() => [['auto', 'Automatique']].concat(Object.entries(chartColors.value).map(([id, c]) => [id, c.label])));
    const autoGradient = computed(() => {
      const ch = C.charteOf(store.draft);
      const cycle = ch.palettes[store.draft.look.palette].cycle.map(id => ch.colors[id].bg);
      return `conic-gradient(${cycle.map((c, i) => `${c} ${(i / cycle.length) * 100}% ${((i + 1) / cycle.length) * 100}%`).join(', ')})`;
    });

    return {
      b, changing, moreIcons, iconQuery, iconChoices, icons, setDest, remove, onHide, colors, autoGradient, chartColors,
      describe: computed(() => (b.value ? describeLink(b.value) : '')),
      placeholder: computed(() => (b.value ? autoLabel(b.value) || 'Texte du bouton' : '')),
    };
  },
};

/** Galerie de modèles (facultative : « partir d'un modèle »). */
const TemplateGallery = {
  template: '#tpl-gallery',
  props: { cancellable: Boolean },
  emits: ['choose', 'blank', 'cancel'],
  setup() {
    const templates = computed(() => C.TEMPLATES.map(t => ({ ...t, preview: C.fromTemplate(t.id, templatePages()) })));
    return { templates };
  },
};

/** Grille de choix visuels : chaque option est une miniature du hub. */
const ChoiceGrid = {
  template: '#tpl-choices',
  props: { label: String, value: String, options: Array, small: Boolean },
  emits: ['change'],
};

/** Glisser-déposer (SortableJS) ; Vue reste maître du DOM : on annule le déplacement puis on change les données. */
const vSortable = {
  mounted(el, { value }) {
    if (!value) { return; }
    el._sortable = Sortable.create(el, {
      group: 'hub-buttons',
      draggable: '.hub-btn',
      filter: '.hub-adder',
      preventOnFilter: false,
      animation: 150,
      onMove: e => (e.related.classList.contains('hub-adder') ? -1 : true),
      onEnd(e) {
        lastDrag = Date.now();
        if (e.from === e.to && e.oldIndex === e.newIndex) { return; }
        e.to.removeChild(e.item);
        e.from.insertBefore(e.item, e.from.children[e.oldIndex] || null);
        value.onMove({ from: e.from.dataset.key, to: e.to.dataset.key, oldIndex: e.oldDraggableIndex, newIndex: e.newDraggableIndex });
      },
    });
  },
  unmounted(el) { el._sortable?.destroy(); },
};

/** Panneau latéral : Affichage (forme, couleurs, en-tête, fond, disposition) et Réglages. */
const SettingsPanel = {
  template: '#tpl-settings',
  setup() {
    const d = computed(() => store.draft);

    // Miniatures : le brouillon, réduit à quelques boutons.
    function preview(patch) {
      const buttons = C.allButtons(store.draft).slice(0, 3);
      const sample = buttons.length ? buttons : C.SAMPLE_PAGES.slice(0, 3).map(p => C.newButton({ page: p.viewRef, label: p.name, icon: C.guessIcon(p.name) }));
      const base = clone(store.draft);
      return C.normalize({
        ...base,
        charte: patch.charte || base.charte,
        header: { ...base.header, style: 'none', ...(patch.header || {}) },
        background: { ...base.background, ...(patch.background || {}) },
        look: { ...base.look, columns: 0, ...(patch.look || {}) },
        sections: [{ id: 'apercu', title: '', buttons: patch.buttons ? sample.slice(0, patch.buttons) : sample }],
        footer: '',
      });
    }

    const choices = computed(() => ({
      shape: [['tuile', 'Tuiles'], ['aplat', 'Aplats'], ['liste', 'Liste'], ['pastille', 'Pastilles']]
        .map(([value, label]) => ({ value, label, preview: preview({ look: { shape: value }, background: { type: 'default' } }) })),
      charte: Object.entries(C.CHARTES)
        .map(([value, ch]) => ({ value, label: ch.label, hint: ch.hint, preview: preview({ charte: value, look: { palette: ch.palette }, header: { style: 'sobre', title: 'Accueil' }, background: { type: 'default' }, buttons: 2 }) })),
      palette: Object.entries(C.charteOf(store.draft).palettes)
        .map(([value, p]) => ({ value, label: p.label, hint: p.hint, swatches: p.cycle.map(id => C.charteOf(store.draft).colors[id].bg) })),
      header: [['none', 'Aucun'], ['sobre', 'Sobre'], ['encadre', 'Encadré'], ['bandeau', 'Bandeau']]
        .map(([value, label]) => ({ value, label, preview: preview({ header: { style: value, title: store.draft.header.title || 'Titre du hub', subtitle: '' }, background: { type: 'default' }, buttons: 2 }) })),
      background: [['default', 'Par défaut'], ['color', 'Couleur'], ['image', 'Image']]
        .map(([value, label]) => ({ value, label, preview: preview({ background: { type: value }, buttons: 2 }) })),
    }));

    // Changer de charte conserve l'intention de la palette (unie, alternée, multicolore).
    function setCharte(charte) {
      store.draft.charte = charte;
      store.draft.look.palette = C.paletteFor(charte, store.draft.look.palette);
      if (!C.CHARTES[charte].backgrounds.includes(store.draft.background.color)) {
        store.draft.background.color = C.CHARTES[charte].backgrounds[0];
      }
    }

    async function importImage(event, apply, logo) {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) { return; }
      try {
        apply(await readImage(file, logo ? 480 : 1920, logo));
      } catch (e) {
        notify('Impossible de lire cette image.', 'danger');
      }
    }

    const importText = ref('');
    function importConfig() {
      try {
        const parsed = JSON.parse(importText.value);
        Object.assign(store.draft, C.normalize(parsed.hub || parsed));
        importText.value = '';
        notify('Configuration importée.', 'success', 3000);
      } catch (e) {
        notify('JSON invalide : ' + e.message, 'danger');
      }
    }

    async function reset() {
      if (await ask({ label: 'Tout effacer ?', text: 'Le hub repartira d\'une page vierge.', ok: 'Tout effacer' })) {
        const blank = C.defaultConfig();
        blank.sections.push(C.newSection());
        store.draft = blank;
        store.ghost = blank.sections[0].id;
        store.panel = false;
      }
    }

    const exportJson = computed(() => JSON.stringify(C.normalize(store.draft), null, 2));
    const docBaseHint = computed(() => {
      const base = C.cleanDocUrl(store.draft.docUrl) || store.docBase;
      return base ? `Les boutons de page ouvrent ${base}/p/…` : 'Adresse non détectée : collez l\'adresse du document, copiée depuis la barre du navigateur.';
    });

    return {
      store, d, choices, setCharte, importImage, importText, importConfig, reset, exportJson, docBaseHint,
      backgroundColors: computed(() => C.charteOf(store.draft).backgrounds),
      version: APP_VERSION,
    };
  },
};

/* ================================================================== */
/* Image importée : redimensionnée puis stockée en data URL            */
/* ================================================================== */

function readImage(file, max, keepPng) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (file.type === 'image/svg+xml' || file.size < 150 * 1024) { resolve(reader.result); return; }
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = Object.assign(document.createElement('canvas'), {
          width: Math.round(img.naturalWidth * scale), height: Math.round(img.naturalHeight * scale),
        });
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL(keepPng ? 'image/png' : 'image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ================================================================== */
/* Application                                                         */
/* ================================================================== */

async function loadContext() {
  if (!G.available || (store.access && store.access !== 'full')) { return; }
  try {
    store.pages = await G.loadPages();
    store.pagesLoaded = true;
  } catch (e) {
    console.warn('Hub : liste des pages indisponible (accès complet requis).', e);
  }
  try {
    store.docBase = store.docBase || await G.loadDocBase();
  } catch (e) {
    console.warn('Hub : adresse du document indisponible.', e);
  }
}

/** Passe en édition. Une rubrique existe toujours ; si le hub est vide, la case d'ajout est déjà ouverte. */
function startEditing(config = store.saved) {
  const draft = clone(config || C.defaultConfig());
  if (!draft.sections.length) { draft.sections.push(C.newSection()); }
  store.draft = draft;
  store.baseline = JSON.stringify(draft);
  store.editing = true;
  store.editId = null;
  store.panel = false;
  store.ghost = isEmpty(draft) ? draft.sections[0].id : null;
  loadContext();
}

function stopEditing() {
  store.editing = false;
  store.gallery = false;
  store.draft = null;
  store.editId = null;
  store.ghost = null;
  store.panel = false;
}

const App = {
  template: '#tpl-app',
  setup() {
    const config = computed(current);
    const dirty = computed(() => store.editing && JSON.stringify(store.draft) !== store.baseline);
    const showGallery = computed(() => store.loaded && canEdit() && store.gallery);
    const emptyView = computed(() => !store.editing && isEmpty(store.saved));
    const showFab = computed(() => canEdit() && !store.editing && !showGallery.value && !emptyView.value && store.saved?.showEditButton);

    function chooseTemplate(id) {
      const base = store.editing ? store.draft : store.saved;
      const cfg = C.fromTemplate(id, templatePages(), { ...C.normalize(base), sections: [] });
      if (!store.editing) { startEditing(cfg); } else { store.draft = cfg; store.ghost = null; }
      store.gallery = false;
      notify(`Modèle « ${C.TEMPLATES.find(t => t.id === id).label} » appliqué : cliquez sur un bouton pour le modifier.`, 'success', 5000);
    }

    function startBlank() {
      const blank = C.defaultConfig();
      blank.sections.push(C.newSection());
      startEditing(blank);
      store.gallery = false;
    }

    async function finish() {
      const cfg = C.normalize(store.draft);
      cfg.sections = cfg.sections.filter(s => s.buttons.length || s.title);
      try {
        if (G.available) { await G.save(cfg); }
      } catch (e) {
        notify('Enregistrement impossible : ' + (e?.message || e), 'danger');
        return;
      }
      store.saved = cfg;
      stopEditing();
      notify(G.available
        ? 'Hub mis à jour. Pour le conserver, cliquez sur « Enregistrer » dans le menu du widget Grist (icône mise en évidence en haut à droite).'
        : 'Hub mis à jour.', 'success', 12000);
    }

    async function cancel() {
      if (dirty.value && !(await ask({ label: 'Abandonner les modifications ?', text: 'Le hub reviendra à son dernier état appliqué.', ok: 'Abandonner' }))) { return; }
      stopEditing();
    }

    function answer(value) {
      store.confirm?.resolve(value);
      store.confirm = null;
    }

    // L'interface (boutons, onglets…) prend la couleur principale de la charte affichée.
    watch(() => config.value && config.value.charte, charte => {
      const root = document.documentElement.classList;
      root.toggle('charte-dsfr', charte === 'dsfr');
      root.toggle('wa-brand-blue', charte === 'dsfr');
      root.toggle('wa-brand-red', charte !== 'dsfr');
    }, { immediate: true });

    return { store, config, dirty, showGallery, emptyView, showFab, chooseTemplate, startBlank, finish, cancel, answer, startEditing, canEdit };
  },
};

/* ================================================================== */
/* Liaison avec Grist                                                  */
/* ================================================================== */

G.watchAppearance(dark => {
  document.documentElement.classList.toggle('wa-dark', dark);
  document.documentElement.classList.toggle('wa-light', !dark);
});

if (G.available) {
  G.connect({
    onConfig: async (raw, access) => {
      store.access = access || store.access;
      store.saved = C.normalize(raw);
      if (!store.loaded) {
        await loadContext();
        store.loaded = true;
      }
    },
    onEdit: () => { if (!store.editing && canEdit()) { startEditing(); } },
  });
} else {
  // Ouvert hors de Grist : démonstration avec des pages fictives.
  store.pages = C.SAMPLE_PAGES;
  store.pagesLoaded = true;
  store.docBase = 'https://grist.exemple.fr/doc/demo';
  store.saved = C.fromTemplate('portail', C.SAMPLE_PAGES);
  store.loaded = true;
}

/* ================================================================== */
/* Montage                                                             */
/* ================================================================== */

// Les gabarits sont dans index.html. Si la page hôte ne les contient pas (widget intégré ailleurs),
// on les récupère à côté de ce script.
if (!document.getElementById('tpl-app')) {
  const html = await (await fetch(new URL('../index.html', import.meta.url))).text();
  const page = new DOMParser().parseFromString(html, 'text/html');
  page.querySelectorAll('template[id^="tpl-"]').forEach(t => document.body.appendChild(document.importNode(t, true)));
}

createApp(App)
  .component('hub-view', HubView)
  .component('dest-picker', DestPicker)
  .component('ghost-tile', GhostTile)
  .component('button-card', ButtonCard)
  .component('template-gallery', TemplateGallery)
  .component('choice-grid', ChoiceGrid)
  .component('settings-panel', SettingsPanel)
  .directive('sortable', vSortable)
  .mount('#hub-root');

// Pour les tests automatisés.
window.__hub = { store, C };
