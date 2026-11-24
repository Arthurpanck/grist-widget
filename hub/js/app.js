/**
 * Hub de navigation — application Vue.
 * Les gabarits des composants sont dans index.html (<template id="tpl-…">).
 * Conception : voir DESIGN.md.
 */
import { createApp, reactive, computed, ref, watch, Sortable, registerIconLibrary, LUCIDE } from './libs.js';
import * as C from './config.js';
import * as G from './grist.js';

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
  tab: 'contenu',
  access: null,
  pages: [],
  pagesLoaded: false,
  docBase: null,
  narrow: false,
  mobilePreview: false,
  dialog: null,         // { sectionId, isNew, form }
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
/* Liens                                                               */
/* ================================================================== */

const pageOf = viewRef => store.pages.find(p => p.viewRef === viewRef);
const isIconName = icon => /^[a-z0-9-]+$/.test(icon || '');

function hostOf(url) {
  try { return new URL(C.safeUrl(url)).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
}

function labelOf(b) {
  return b.label.trim() || (b.kind === 'page' ? pageOf(b.page)?.name : hostOf(b.url)) || 'Sans titre';
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
  return p ? `Page « ${p.name} »` : 'Page';
}

/* ================================================================== */
/* Composants                                                          */
/* ================================================================== */

/** Le hub lui-même. mode : view (liens actifs) | edit (clic = modifier) | static (aperçus). */
const HubView = {
  template: '#tpl-hub',
  props: { config: Object, mode: { type: String, default: 'view' } },
  emits: ['pick'],
  setup(props, { emit }) {
    const m = computed(() => {
      const c = props.config;
      let index = 0, number = 0;
      const sections = c.sections
        .filter(s => s.buttons.length || props.mode === 'edit')
        .map(s => ({
          id: s.id,
          title: s.title,
          number: s.title ? ++number : 0,
          items: s.buttons.map(b => ({ b, label: labelOf(b), color: C.colorOf(b, index++, c.look.palette), link: linkOf(c, b) })),
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
        emit('pick', item.b.id);
      } else if (props.mode === 'view' && !item.link.href) {
        notify(item.link.missingBase
          ? 'Adresse du document inconnue : accordez l\'accès complet au widget, ou renseignez l\'adresse du document dans les réglages du hub.'
          : `${item.label} : ${item.link.problem.toLowerCase()}.`, 'warning');
      }
    }

    return { m, rootStyle, tagOf, click, isIconName };
  },
};

/** Galerie « Que doit faire cette page d'accueil ? ». */
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

/** Réordonnancement par glisser-déposer (SortableJS) ; Vue reste maître du DOM. */
const vSortable = {
  mounted(el, { value }) {
    el._sortable = Sortable.create(el, {
      group: value.group,
      handle: '.grip',
      animation: 150,
      onEnd(e) {
        if (e.from === e.to && e.oldIndex === e.newIndex) { return; }
        e.to.removeChild(e.item);
        e.from.insertBefore(e.item, e.from.children[e.oldIndex] || null);
        value.onMove({ from: e.from.dataset.key, to: e.to.dataset.key, oldIndex: e.oldIndex, newIndex: e.newIndex });
      },
    });
  },
  unmounted(el) { el._sortable?.destroy(); },
};

/** Panneau d'édition : Contenu / Apparence / Réglages. */
const EditorPanel = {
  template: '#tpl-editor',
  emits: ['done', 'cancel'],
  setup() {
    const d = computed(() => store.draft);
    const section = id => store.draft.sections.find(s => s.id === id);

    const missingPages = computed(() => {
      const used = new Set(C.allButtons(store.draft).filter(b => b.kind === 'page').map(b => b.page));
      return store.pages.filter(p => !p.isHub && !used.has(p.viewRef));
    });

    function addMissing() {
      const target = store.draft.sections.find(s => !s.title) || store.draft.sections[0] || addSection('');
      target.buttons.push(...missingPages.value.map(p => C.newButton({ page: p.viewRef, icon: C.guessIcon(p.name) })));
      notify('Pages ajoutées.', 'success', 3000);
    }

    function addSection(title = 'Nouvelle rubrique') {
      const s = C.newSection({ title });
      store.draft.sections.push(s);
      return s;
    }

    function moveSection(i, delta) {
      const list = store.draft.sections;
      if (i + delta < 0 || i + delta >= list.length) { return; }
      list.splice(i + delta, 0, list.splice(i, 1)[0]);
    }

    async function sectionAction(event, i) {
      const action = event.detail.item.value;
      const s = store.draft.sections[i];
      if (action === 'up') { moveSection(i, -1); }
      if (action === 'down') { moveSection(i, 1); }
      if (action === 'delete') {
        const n = s.buttons.length;
        if (n && !(await ask({ label: 'Supprimer la rubrique ?', text: `Ses ${n} bouton${n > 1 ? 's' : ''} seront supprimés.`, ok: 'Supprimer' }))) { return; }
        store.draft.sections.splice(i, 1);
      }
    }

    function buttonAction(event, s, j) {
      const action = event.detail.item.value;
      if (action === 'edit') { openButton(s.id, s.buttons[j].id); }
      if (action === 'duplicate') { s.buttons.splice(j + 1, 0, { ...clone(s.buttons[j]), id: C.uid('b') }); }
      if (action === 'delete') { s.buttons.splice(j, 1); }
    }

    function onMove({ from, to, oldIndex, newIndex }) {
      const [b] = section(from).buttons.splice(oldIndex, 1);
      section(to).buttons.splice(newIndex, 0, b);
    }

    // Miniatures de l'onglet Apparence : le brouillon, réduit à quelques boutons.
    function preview(patch) {
      const buttons = C.allButtons(store.draft).slice(0, 3);
      const sample = buttons.length ? buttons : C.SAMPLE_PAGES.slice(0, 3).map(p => C.newButton({ page: p.viewRef, label: p.name, icon: C.guessIcon(p.name) }));
      const base = clone(store.draft);
      return C.normalize({
        ...base,
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
      palette: Object.entries(C.PALETTES)
        .map(([value, p]) => ({ value, label: p.label, hint: p.hint, swatches: p.cycle.map(id => C.COLORS[id].bg) })),
      header: [['none', 'Aucun'], ['sobre', 'Sobre'], ['encadre', 'Encadré'], ['bandeau', 'Bandeau']]
        .map(([value, label]) => ({ value, label, preview: preview({ header: { style: value, title: store.draft.header.title || 'Titre du hub', subtitle: '' }, background: { type: 'default' }, buttons: 2 }) })),
      background: [['default', 'Par défaut'], ['color', 'Couleur'], ['image', 'Image']]
        .map(([value, label]) => ({ value, label, preview: preview({ background: { type: value }, buttons: 2 }) })),
    }));

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
        store.draft = C.defaultConfig();
        store.gallery = true;
      }
    }

    const exportJson = computed(() => JSON.stringify(C.normalize(store.draft), null, 2));
    const docBaseHint = computed(() => {
      const base = C.cleanDocUrl(store.draft.docUrl) || store.docBase;
      return base ? `Les boutons de page ouvrent ${base}/p/…` : 'Adresse non détectée : collez l\'adresse du document, copiée depuis la barre du navigateur.';
    });

    return {
      store, d, missingPages, addMissing, addSection, sectionAction, buttonAction, onMove, choices,
      importImage, importText, importConfig, reset, exportJson, docBaseHint,
      openButton, labelOf, describeLink, linkOf, isIconName, colorOf: C.colorOf, flatIndex,
      backgroundColors: C.BACKGROUND_COLORS,
    };
  },
};

// Rang d'un bouton dans tout le hub (pour la couleur automatique).
function flatIndex(buttonId) {
  return C.allButtons(store.draft).findIndex(b => b.id === buttonId);
}

function openButton(sectionId, buttonId) {
  const s = store.draft.sections.find(x => x.id === sectionId) || store.draft.sections[0];
  const b = buttonId && s.buttons.find(x => x.id === buttonId);
  store.dialog = { sectionId: s.id, isNew: !b, form: b ? clone(b) : C.newButton(store.pages.length ? {} : { kind: 'url', icon: 'globe' }) };
}

function pickFromPreview(buttonId) {
  const s = store.draft.sections.find(x => x.buttons.some(b => b.id === buttonId));
  if (s) { openButton(s.id, buttonId); }
}

/** Dialogue « Nouveau bouton / Modifier le bouton » : 1. Où mène-t-il ? 2. À quoi ressemble-t-il ? */
const ButtonDialog = {
  template: '#tpl-button-dialog',
  setup() {
    const f = computed(() => store.dialog?.form);
    const pageQuery = ref('');
    const iconQuery = ref('');
    const tried = ref(false);
    watch(() => store.dialog, () => { pageQuery.value = ''; iconQuery.value = ''; tried.value = false; });

    const pages = computed(() => {
      const q = pageQuery.value.trim().toLowerCase();
      return store.pages.filter(p => !q || p.name.toLowerCase().includes(q));
    });
    const icons = computed(() => C.searchIcons(iconQuery.value));
    const error = computed(() => {
      if (!f.value) { return ''; }
      if (f.value.kind === 'page') { return f.value.page ? '' : 'Choisissez la page vers laquelle mène le bouton.'; }
      return C.safeUrl(f.value.url) ? '' : 'Saisissez une adresse web valide (https://…).';
    });

    // Aperçu du bouton tel qu'il apparaîtra (la couleur automatique dépend de son rang dans le hub).
    const preview = computed(() => {
      const draft = store.draft;
      const index = store.dialog.isNew ? C.allButtons(draft).length : flatIndex(f.value.id);
      const cycle = C.PALETTES[draft.look.palette].cycle;
      const button = { ...f.value, color: f.value.color === 'auto' ? cycle[index % cycle.length] : f.value.color };
      return C.normalize({ ...draft, header: { style: 'none' }, background: { type: 'default' }, footer: '',
        look: { ...draft.look, align: 'left', columns: 1 }, sections: [{ id: 'apercu', title: '', buttons: [button] }] });
    });

    // Changer de destination adapte l'icône si elle n'a pas été choisie.
    function setKind(kind) {
      const defaults = ['arrow-right', 'globe', ''];
      f.value.kind = kind;
      if (defaults.includes(f.value.icon)) {
        f.value.icon = kind === 'url' ? 'globe' : C.guessIcon(pageOf(f.value.page)?.name);
      }
    }

    function choosePage(p) {
      f.value.page = p.viewRef;
      if (!f.value.icon || f.value.icon === 'arrow-right') { f.value.icon = C.guessIcon(p.name); }
    }

    function save() {
      tried.value = true;
      if (error.value) { return; }
      const { sectionId, isNew, form } = store.dialog;
      const s = store.draft.sections.find(x => x.id === sectionId);
      if (isNew) { s.buttons.push(clone(form)); }
      else { s.buttons.splice(s.buttons.findIndex(b => b.id === form.id), 1, clone(form)); }
      store.dialog = null;
    }

    async function remove() {
      const { sectionId, form } = store.dialog;
      const s = store.draft.sections.find(x => x.id === sectionId);
      s.buttons = s.buttons.filter(b => b.id !== form.id);
      store.dialog = null;
    }

    function onHide(event) {
      if (event.target === event.currentTarget) { store.dialog = null; }
    }

    const colors = computed(() => [['auto', 'Automatique']].concat(Object.entries(C.COLORS).map(([id, c]) => [id, c.label])));
    const autoGradient = computed(() => {
      const cycle = C.PALETTES[store.draft.look.palette].cycle.map(id => C.COLORS[id].bg);
      return `conic-gradient(${cycle.map((c, i) => `${c} ${(i / cycle.length) * 100}% ${((i + 1) / cycle.length) * 100}%`).join(', ')})`;
    });

    return { store, f, pages, pageQuery, icons, iconQuery, error, tried, preview, setKind, choosePage, save, remove, onHide, colors, autoGradient, COLORS: C.COLORS, isIconName };
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

function startEditing(config = store.saved) {
  store.draft = clone(config || C.defaultConfig());
  store.baseline = JSON.stringify(store.draft);
  store.editing = true;
  store.tab = 'contenu';
  loadContext();
}

const App = {
  template: '#tpl-app',
  setup() {
    const config = computed(current);
    const dirty = computed(() => store.editing && JSON.stringify(store.draft) !== store.baseline);
    const showGallery = computed(() => store.loaded && canEdit() && (store.gallery || (!store.editing && isEmpty(store.saved))));
    const showFab = computed(() => canEdit() && !store.editing && !showGallery.value && store.saved?.showEditButton);

    function chooseTemplate(id) {
      const base = store.editing ? store.draft : store.saved;
      const cfg = C.fromTemplate(id, templatePages(), { ...C.normalize(base), sections: [] });
      if (!store.editing) { startEditing(cfg); } else { store.draft = cfg; }
      store.gallery = false;
      notify(`Modèle « ${C.TEMPLATES.find(t => t.id === id).label} » appliqué : personnalisez-le à droite.`, 'success', 5000);
    }

    function startBlank() {
      startEditing({ ...C.defaultConfig(), sections: [C.newSection()] });
      store.gallery = false;
      openButton(store.draft.sections[0].id, null);
    }

    async function finish() {
      const cfg = C.normalize(store.draft);
      try {
        if (G.available) { await G.save(cfg); }
      } catch (e) {
        notify('Enregistrement impossible : ' + (e?.message || e), 'danger');
        return;
      }
      store.saved = cfg;
      store.editing = false;
      store.draft = null;
      store.mobilePreview = false;
      notify(G.available
        ? 'Hub mis à jour. Pour le conserver, cliquez sur « Enregistrer » dans le menu du widget Grist (icône mise en évidence en haut à droite).'
        : 'Hub mis à jour.', 'success', 12000);
    }

    async function cancel() {
      if (dirty.value && !(await ask({ label: 'Abandonner les modifications ?', text: 'Le hub reviendra à son dernier état appliqué.', ok: 'Abandonner' }))) { return; }
      store.editing = false;
      store.gallery = false;
      store.draft = null;
      store.mobilePreview = false;
    }

    function answer(value) {
      store.confirm?.resolve(value);
      store.confirm = null;
    }

    const media = window.matchMedia('(max-width: 720px)');
    const syncNarrow = () => { store.narrow = media.matches; };
    media.addEventListener('change', syncNarrow);
    syncNarrow();

    return { store, config, dirty, showGallery, showFab, chooseTemplate, startBlank, finish, cancel, answer, startEditing, pickFromPreview, canEdit };
  },
};

// Les gabarits sont dans index.html. Si la page hôte ne les contient pas (widget intégré ailleurs,
// par exemple via le « Custom widget builder »), on les récupère à côté de ce script.
if (!document.getElementById('tpl-app')) {
  const html = await (await fetch(new URL('../index.html', import.meta.url))).text();
  const page = new DOMParser().parseFromString(html, 'text/html');
  page.querySelectorAll('template[id^="tpl-"]').forEach(t => document.body.appendChild(document.importNode(t, true)));
}

createApp(App)
  .component('hub-view', HubView)
  .component('template-gallery', TemplateGallery)
  .component('choice-grid', ChoiceGrid)
  .component('editor-panel', EditorPanel)
  .component('button-dialog', ButtonDialog)
  .directive('sortable', vSortable)
  .mount('#hub-root');

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

// Pour les tests automatisés.
window.__hub = { store, C };
