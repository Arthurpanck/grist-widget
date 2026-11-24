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
import { createApp, reactive, computed, ref, watch, onMounted, nextTick, Sortable, registerIconLibrary, LUCIDE } from './libs.js';
import * as C from './config.js';
import * as G from './grist.js';

export const APP_VERSION = '3.3.0';
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
  forms: [],
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
const formOf = id => store.forms.find(f => f.id === id);
const isIconName = icon => /^[a-z0-9-]+$/.test(icon || '');
const sectionOf = id => store.draft.blocks.find(b => b.id === id && b.type === 'section');

function findButton(id) {
  for (const section of C.sectionsOf(store.draft)) {
    const index = section.buttons.findIndex(b => b.id === id);
    if (index >= 0) { return { section, index, button: section.buttons[index] }; }
  }
  return null;
}

function hostOf(url) {
  try { return new URL(C.safeUrl(url)).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
}

function autoLabel(b) {
  if (b.kind === 'form') { return formOf(b.form)?.name || ''; }
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
  if (b.kind === 'form') {
    if (!b.form) { return { problem: 'Aucun formulaire choisi' }; }
    if (store.pagesLoaded && !formOf(b.form)) { return { problem: 'Formulaire supprimé' }; }
  } else {
    if (!b.page) { return { problem: 'Aucune page choisie' }; }
    if (store.pagesLoaded && !pageOf(b.page)) { return { problem: 'Page supprimée' }; }
  }
  const base = C.cleanDocUrl(cfg.docUrl) || store.docBase;
  if (!base) { return { problem: 'Adresse du document inconnue', missingBase: true }; }
  // Un formulaire s'ouvre en pleine page (lien « /f/ » de Grist), dans un nouvel onglet pour garder le hub.
  return b.kind === 'form' ? { href: `${base}/f/${b.form}`, target: '_blank' } : { href: `${base}/p/${b.page}`, target: '_top' };
}

function describeLink(b) {
  if (b.kind === 'url') { return hostOf(b.url) || 'Site web'; }
  if (b.kind === 'form') { const f = formOf(b.form); return f ? `Formulaire « ${f.name} »` : 'Formulaire à choisir'; }
  const p = pageOf(b.page);
  return p ? `Page « ${p.name} »` : 'Page à choisir';
}

const iconFor = dest => (dest.kind === 'url' ? 'globe' : dest.kind === 'form' ? 'square-pen' : C.guessIcon(pageOf(dest.page)?.name));
/** Destination choisie → champs du bouton. */
const destFields = dest => (dest.kind === 'url' ? { kind: 'url', url: dest.url } : dest.kind === 'form' ? { kind: 'form', form: dest.form } : { kind: 'page', page: dest.page });
const KINDS = { page: ['file-text', 'Page du document'], form: ['square-pen', 'Formulaire'], url: ['globe', 'Site web'] };

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
    const editing = computed(() => props.mode === 'edit');

    const m = computed(() => {
      const c = props.config;
      let index = 0;
      const blocks = c.blocks
        .map(blk => (blk.type === 'section'
          ? { ...blk, items: blk.buttons.map(b => ({ b, label: labelOf(b), color: C.colorOf(b, index++, c), link: linkOf(c, b) })) }
          : blk))
        // En lecture, on masque les titres vides et les rubriques sans bouton.
        .filter(blk => editing.value || (blk.type === 'section' ? blk.items.length : blk.text.trim()));
      const bg = c.background;
      const image = bg.type === 'image' ? (bg.image || C.DEFAULT_IMAGE) : '';
      return { c, blocks, image, onDark: Boolean(image && bg.tone === 'dark' && bg.veil >= 0.2) };
    });

    const rootStyle = computed(() => {
      const bg = m.value.c.background;
      const style = {};
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
      if (editing.value) {
        if (Date.now() - lastDrag < 300) { return; }   // fin d'un glisser-déposer, pas un clic
        store.ghost = null;
        store.editId = item.b.id;
      } else if (props.mode === 'view' && !item.link.href) {
        notify(item.link.missingBase
          ? 'Adresse du document inconnue : accordez l\'accès complet au widget.'
          : `${item.label} : ${item.link.problem.toLowerCase()}.`, 'warning');
      }
    }

    // Glisser-déposer : les blocs (titres, sous-titres, rubriques) par leur poignée,
    // et les boutons, y compris d'une rubrique à l'autre.
    const blockSort = computed(() => (!editing.value ? null : {
      group: 'hub-blocks', draggable: '.hub-block', handle: '.hub-block__handle',
      onMove({ oldIndex, newIndex }) {
        const list = store.draft.blocks;
        list.splice(newIndex, 0, list.splice(oldIndex, 1)[0]);
      },
    }));
    const buttonSort = computed(() => (!editing.value ? null : {
      group: 'hub-buttons', draggable: '.hub-cell', filter: '.hub-adder, .hub-cell__remove',
      onMove({ from, to, oldIndex, newIndex }) {
        const [b] = sectionOf(from).buttons.splice(oldIndex, 1);
        sectionOf(to).buttons.splice(newIndex, 0, b);
      },
    }));

    function addBlock(type) {
      const blk = C.newBlock(type);
      store.draft.blocks.push(blk);
      store.editId = null;
      store.ghost = type === 'section' ? blk.id : null;
      if (type !== 'section') {
        nextTick(() => document.querySelector(`[data-block-input="${blk.id}"]`)?.focus());
      }
    }

    async function removeBlock(id) {
      const blocks = store.draft.blocks;
      const blk = blocks.find(b => b.id === id);
      const n = blk.type === 'section' ? blk.buttons.length : 0;
      if (n && !(await ask({ label: 'Supprimer la rubrique ?', text: `Ses ${n} bouton${n > 1 ? 's' : ''} seront supprimés.`, ok: 'Supprimer' }))) { return; }
      blocks.splice(blocks.indexOf(blk), 1);
    }

    function removeButton(id) {
      const found = findButton(id);
      if (!found) { return; }
      found.section.buttons.splice(found.index, 1);
      if (store.editId === id) { store.editId = null; }
    }

    const setText = (id, text) => { store.draft.blocks.find(b => b.id === id).text = text; };

    return { m, editing, rootStyle, tagOf, click, blockSort, buttonSort, addBlock, removeBlock, removeButton, setText, isIconName, store };
  },
};

/** Champ unique « Vers où mène ce bouton ? » : pages du document suggérées, ou adresse web collée. */
let pickerCount = 0;
const DestPicker = {
  template: '#tpl-dest',
  props: { label: String, autofocus: Boolean, initialKind: { type: String, default: 'page' } },
  emits: ['pick', 'cancel', 'leave'],
  setup(props, { emit }) {
    const uid = 'dest' + (++pickerCount);
    const kind = ref(['page', 'form', 'url'].includes(props.initialKind) ? props.initialKind : 'page');
    const query = ref('');
    const active = ref(0);
    const input = ref(null);

    const options = computed(() => {
      const text = query.value.trim();
      const q = normalizeText(text);
      const list = [];
      if (text && (kind.value === 'url' || looksLikeUrl(text)) && C.safeUrl(text)) {
        const url = C.safeUrl(text);
        list.push({ key: 'url', kind: 'url', url, icon: 'globe', label: hostOf(url) || url, hint: 'Site web' });
      }
      if (kind.value === 'url') { return list; }
      if (kind.value === 'form') {
        const usedForms = store.draft ? new Set(C.allButtons(store.draft).filter(b => b.kind === 'form').map(b => b.form)) : new Set();
        store.forms
          .filter(f => !q || normalizeText(f.name).includes(q) || normalizeText(f.page).includes(q))
          .sort((a, b) => usedForms.has(a.id) - usedForms.has(b.id))
          .slice(0, 8)
          .forEach(f => list.push({ key: 'f' + f.id, kind: 'form', form: f.id, icon: 'square-pen', label: f.name,
            hint: usedForms.has(f.id) ? 'déjà sur le hub' : (f.page !== f.name ? f.page : '') }));
        return list;
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
      if (kind.value === 'url') { return 'Saisissez ou collez l\'adresse du site, par exemple www.grandlyon.com.'; }
      if (kind.value === 'form') {
        if (!store.forms.length) { return 'Ce document n\'a pas encore de formulaire. Ajoutez un widget « Formulaire » sur une page de Grist.'; }
        return 'Aucun formulaire ne correspond.';
      }
      if (!store.pages.length) { return 'Collez une adresse web (https://…). Pour choisir une page, accordez l\'accès complet au widget.'; }
      return query.value.trim() ? 'Aucune page ne correspond. Collez une adresse web pour créer un lien.' : 'Collez une adresse web (https://…).';
    });

    watch(options, () => { active.value = 0; });

    function pick(o) {
      emit('pick', destFields(o));
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

    function setKind(value) {
      kind.value = value;
      input.value?.focus();
    }

    function onFocusOut(e) {
      if (!e.currentTarget.contains(e.relatedTarget) && !query.value.trim()) { emit('leave'); }
    }

    onMounted(() => { if (props.autofocus) { input.value?.focus(); } });

    return { uid, kind, query, active, input, options, emptyText, pick, onKey, onFocusOut, setKind };
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
      Object.assign(b.value, destFields(dest));
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
    const colors = computed(() => [['auto', 'Automatique (charte Métropole)']].concat(C.BUTTON_COLORS.map(id => [id, C.COLORS[id].label])));
    const autoGradient = computed(() => {
      const ch = C.charteOf(store.draft);
      const cycle = ch.palettes[store.draft.look.palette].cycle.map(id => ch.colors[id].bg);
      return `conic-gradient(${cycle.map((c, i) => `${c} ${(i / cycle.length) * 100}% ${((i + 1) / cycle.length) * 100}%`).join(', ')})`;
    });

    return {
      b, changing, moreIcons, iconQuery, iconChoices, icons, setDest, remove, onHide, colors, autoGradient, chartColors, KINDS,
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

/** Glisser-déposer (SortableJS) ; Vue reste maître du DOM : on annule le déplacement puis on change les données. */
const vSortable = {
  mounted(el, { value }) {
    if (!value) { return; }
    el._sortable = Sortable.create(el, {
      group: value.group,
      draggable: value.draggable,
      handle: value.handle,
      filter: value.filter,
      preventOnFilter: false,
      animation: 150,
      // Glisser « à la souris » plutôt qu'en glisser-déposer natif : Firefox ne sait pas glisser un <button>.
      forceFallback: true,
      fallbackTolerance: 4,
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

    const hasImage = computed(() => store.draft.background.type === 'image');
    const setImage = on => { store.draft.background.type = on ? 'image' : 'default'; };

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

    return {
      store, d, hasImage, setImage, importImage,
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
    [store.pages, store.forms] = await Promise.all([G.loadPages(), G.loadForms().catch(() => [])]);
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
  if (!draft.blocks.length) { draft.blocks = C.initialBlocks(); }
  if (!C.sectionsOf(draft).length) { draft.blocks.push(C.newBlock('section')); }
  store.draft = draft;
  store.baseline = JSON.stringify(draft);
  store.editing = true;
  store.editId = null;
  store.panel = false;
  store.ghost = isEmpty(draft) ? C.sectionsOf(draft)[0].id : null;
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

    function chooseTemplate(id) {
      const base = store.editing ? store.draft : store.saved;
      const cfg = C.fromTemplate(id, templatePages(), C.normalize(base));
      if (!store.editing) { startEditing(cfg); } else { store.draft = cfg; store.ghost = null; }
      store.gallery = false;
      notify(`Modèle « ${C.TEMPLATES.find(t => t.id === id).label} » appliqué : cliquez sur un bouton pour le modifier.`, 'success', 5000);
    }

    function startBlank() {
      startEditing(C.defaultConfig());
      store.gallery = false;
    }

    async function finish() {
      const cfg = C.normalize(store.draft);
      cfg.blocks = cfg.blocks.filter(b => (b.type === 'section' ? b.buttons.length : b.text.trim()));
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

    return { store, config, dirty, showGallery, emptyView, chooseTemplate, startBlank, finish, cancel, answer, startEditing, canEdit };
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
  store.forms = C.SAMPLE_FORMS;
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
  .component('settings-panel', SettingsPanel)
  .directive('sortable', vSortable)
  .mount('#hub-root');

// Pour les tests automatisés.
window.__hub = { store, C };
