/*
 * Hub de navigation — widget personnalisé Grist
 *
 * Affiche des boutons cliquables qui mènent vers d'autres pages du document
 * ou vers des liens externes, avec un fond (couleur ou image), un en-tête et
 * un pied de page. Charte graphique : Métropole de Lyon.
 *
 * Toute la configuration est stockée dans les options du widget, sous la clé
 * « hub » (grist.setOption), et se modifie depuis le panneau d'édition intégré.
 */
(function () {
  'use strict';

  const OPTION_KEY = 'hub';
  const CONFIG_VERSION = 1;
  const MAX_IMAGE_BYTES = 900 * 1024;

  /* ================================================================== */
  /* Palette (charte Métropole de Lyon)                                  */
  /* ================================================================== */

  const COLORS = [
    { id: 'auto', label: 'Automatique (alternance rouge / rouge foncé)' },
    { id: 'rouge', label: 'Rouge Métropole', bg: '#FF0000', fg: '#FFFFFF' },
    { id: 'rouge-fonce', label: 'Rouge foncé', bg: '#C00000', fg: '#FFFFFF' },
    { id: 'bleu', label: 'Bleu institutionnel', bg: '#2A3158', fg: '#FFFFFF' },
    { id: 'canard', label: 'Bleu canard', bg: '#6CA6AB', fg: '#1E2340' },
    { id: 'vert', label: 'Vert', bg: '#6DB33F', fg: '#1E2340' },
    { id: 'vert-fonce', label: 'Vert foncé', bg: '#387C2C', fg: '#FFFFFF' },
    { id: 'ambre', label: 'Ambre', bg: '#FFB90B', fg: '#1E2340' },
    { id: 'orange', label: 'Orange', bg: '#ED7D31', fg: '#1E2340' },
    { id: 'violet', label: 'Violet', bg: '#7030A0', fg: '#FFFFFF' },
    { id: 'rose', label: 'Rouge rosé', bg: '#F49E9E', fg: '#1E2340' },
    { id: 'gris', label: 'Gris', bg: '#7F7F7F', fg: '#FFFFFF' },
  ];
  const COLOR_BY_ID = Object.fromEntries(COLORS.map(c => [c.id, c]));

  function resolveColor(id, index) {
    if (!id || id === 'auto' || !COLOR_BY_ID[id]) {
      return index % 2 === 0 ? COLOR_BY_ID.rouge : COLOR_BY_ID['rouge-fonce'];
    }
    return COLOR_BY_ID[id];
  }

  /* ================================================================== */
  /* Icônes (traits 24×24)                                               */
  /* « c:x,y,r » = cercle, « r:x,y,w,h,rx » = rectangle, sinon chemin.   */
  /* ================================================================== */

  const ICONS = {
    accueil: { label: 'Accueil', d: ['M3 10.5 12 3l9 7.5', 'M5 9v12h14V9', 'M10 21v-6h4v6'] },
    tableau: { label: 'Tableau', d: ['r:3,4,18,16,2', 'M3 10h18', 'M3 15h18', 'M9 10v10'] },
    graphique: { label: 'Graphique', d: ['M3 21h18', 'M6 17v-5', 'M11 17V6', 'M16 17v-8', 'M21 17v-3'] },
    camembert: { label: 'Répartition', d: ['M12 3a9 9 0 1 0 9 9h-9z', 'M15 3.5A9 9 0 0 1 20.5 9H15z'] },
    pilotage: { label: 'Tableau de bord', d: ['M3.5 18a8.5 8.5 0 1 1 17 0', 'M12 18l4.5-5.5', 'c:12,18,1.2'] },
    document: { label: 'Document', d: ['M6 2.5h8l5 5V21.5H6z', 'M14 2.5v5h5', 'M9 13h7', 'M9 17h7'] },
    dossier: { label: 'Dossier', d: ['M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z'] },
    liste: { label: 'Liste', d: ['M9 6h11', 'M9 12h11', 'M9 18h11', 'c:4.5,6,1', 'c:4.5,12,1', 'c:4.5,18,1'] },
    formulaire: { label: 'Saisie', d: ['M4 20h4L19 9l-4-4L4 16z', 'M13.5 6.5l4 4'] },
    calendrier: { label: 'Calendrier', d: ['r:3,5,18,16,2', 'M3 10h18', 'M8 3v4', 'M16 3v4'] },
    horloge: { label: 'Horaires', d: ['c:12,12,9', 'M12 7v5l3 2'] },
    carte: { label: 'Carte', d: ['M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z', 'c:12,9,2.5'] },
    batiment: { label: 'Bâtiment', d: ['M4 21V4.5A1.5 1.5 0 0 1 5.5 3h8A1.5 1.5 0 0 1 15 4.5V21', 'M15 9h3.5A1.5 1.5 0 0 1 20 10.5V21', 'M2 21h20', 'M8 7.5h3', 'M8 11.5h3', 'M8 15.5h3'] },
    personnes: { label: 'Personnes', d: ['c:9,8,3.5', 'M2.5 20a6.5 6.5 0 0 1 13 0', 'M16 4.6a3.5 3.5 0 0 1 0 6.8', 'M18 14a6.5 6.5 0 0 1 3.5 6'] },
    personne: { label: 'Personne', d: ['c:12,8,4', 'M4 21a8 8 0 0 1 16 0'] },
    mail: { label: 'Courriel', d: ['r:3,5,18,14,2', 'M3.5 7l8.5 6 8.5-6'] },
    telephone: { label: 'Téléphone', d: ['M5 3h3.5l2 5-2.5 1.5a11 11 0 0 0 6.5 6.5L16 13.5l5 2V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z'] },
    euro: { label: 'Finances', d: ['M18 6.5A7 7 0 1 0 18 17.5', 'M4 10h10', 'M4 14h10'] },
    recherche: { label: 'Recherche', d: ['c:11,11,7', 'M20.5 20.5l-4.5-4.5'] },
    info: { label: 'Information', d: ['c:12,12,9', 'M12 11v6', 'M12 7.5v.5'] },
    alerte: { label: 'Alerte', d: ['M12 3.5 2.5 20h19z', 'M12 10v4.5', 'M12 17.2v.3'] },
    valide: { label: 'Validé', d: ['c:12,12,9', 'M8 12.5l3 3 5-6'] },
    etoile: { label: 'Favori', d: ['M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z'] },
    idee: { label: 'Idée', d: ['M9 18h6', 'M10 21h4', 'M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z'] },
    cible: { label: 'Objectifs', d: ['c:12,12,9', 'c:12,12,5', 'c:12,12,1'] },
    livre: { label: 'Guide', d: ['M3 5h6a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H3z', 'M21 5h-6a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H21z'] },
    telechargement: { label: 'Téléchargement', d: ['M12 3v12', 'M7 10l5 5 5-5', 'M4 20h16'] },
    lien: { label: 'Lien', d: ['M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1', 'M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'] },
    externe: { label: 'Site externe', d: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'] },
    reglages: { label: 'Réglages', d: ['c:12,12,3', 'M12 2.5v3', 'M12 18.5v3', 'M2.5 12h3', 'M18.5 12h3', 'M5.3 5.3l2.1 2.1', 'M16.6 16.6l2.1 2.1', 'M5.3 18.7l2.1-2.1', 'M16.6 7.4l2.1-2.1'] },
    nature: { label: 'Environnement', d: ['M5 19c0-8.5 6-14 15-14 0 9-5.5 15-14 15', 'M5 19l8-8'] },
    transport: { label: 'Transport', d: ['r:4,3,16,14,3', 'M4 10h16', 'M7.5 20.5v-3.5', 'M16.5 20.5v-3.5', 'c:8,13.5,.6', 'c:16,13.5,.6'] },
    grille: { label: 'Applications', d: ['r:3.5,3.5,7,7,1.5', 'r:13.5,3.5,7,7,1.5', 'r:3.5,13.5,7,7,1.5', 'r:13.5,13.5,7,7,1.5'] },
    fleche: { label: 'Flèche', d: ['M5 12h14', 'M13 6l6 6-6 6'] },
  };

  // Devine une icône à partir du nom d'une page.
  const ICON_GUESSES = [
    [/accueil|home|sommaire|portail|hub/i, 'accueil'],
    [/tableau de bord|pilotage|dashboard|kpi|indicateur|synth[eè]se/i, 'pilotage'],
    [/graph|stat|[ée]volution|analyse|tendance/i, 'graphique'],
    [/r[ée]partition|camembert|ventilation/i, 'camembert'],
    [/carte|plan\b|g[ée]o|lieu|adresse|territoire|commune/i, 'carte'],
    [/calendrier|planning|agenda|[ée]ch[ée]ance|date|r[ée]union/i, 'calendrier'],
    [/contact|annuaire|[ée]quipe|agent|personne|utilisateur|membre|rh\b|ressources humaines/i, 'personnes'],
    [/budget|financ|co[uû]t|d[ée]pense|factur|subvention|march[ée]|paiement|€/i, 'euro'],
    [/formulaire|saisie|demande|nouveau|ajout/i, 'formulaire'],
    [/mode d.emploi|aide|guide|documentation|tutoriel|notice/i, 'livre'],
    [/param[eè]tre|r[ée]glage|config|administration|admin/i, 'reglages'],
    [/document|fichier|pi[eè]ce|courrier|rapport/i, 'document'],
    [/dossier|projet|op[ée]ration/i, 'dossier'],
    [/b[aâ]timent|patrimoine|site|[ée]quipement|logement|copropri/i, 'batiment'],
    [/transport|mobilit|voirie|v[ée]hicule|bus|tram/i, 'transport'],
    [/environnement|nature|climat|vert|biodiversit|d[ée]chet/i, 'nature'],
    [/objectif|cible|action/i, 'cible'],
    [/donn[ée]es|table|liste|inventaire|r[ée]f[ée]rentiel|import/i, 'tableau'],
    [/alerte|risque|incident|anomalie/i, 'alerte'],
    [/suivi|avancement|validation|contr[oô]le/i, 'valide'],
  ];

  function guessIcon(name) {
    const found = ICON_GUESSES.find(([re]) => re.test(name || ''));
    return found ? found[1] : 'fleche';
  }

  /* ================================================================== */
  /* Configuration                                                       */
  /* ================================================================== */

  function uid() {
    return 'b' + Math.random().toString(36).slice(2, 9);
  }

  function defaultConfig() {
    return {
      version: CONFIG_VERSION,
      header: { show: true, title: 'Portail du document', subtitle: '', logo: '', style: 'clair', align: 'left' },
      background: { type: 'none', color: '#F4F4F6', image: '', veil: 0.35, veilColor: 'dark', fit: 'cover', position: 'center' },
      layout: { style: 'tuile', size: 'm', columns: 0, align: 'left', numbering: true, maxWidth: 1200 },
      footer: '',
      buttons: [],
      docUrl: '',
      showEditButton: true,
    };
  }

  function newButton(extra) {
    return Object.assign({
      id: uid(), label: '', description: '', icon: 'fleche', color: 'auto',
      kind: 'page', page: null, url: '', newTab: true, group: '',
    }, extra || {});
  }

  function pick(value, allowed, fallback) {
    return allowed.includes(value) ? value : fallback;
  }
  function str(value, fallback) {
    return typeof value === 'string' ? value : (fallback || '');
  }
  function num(value, min, max, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  }

  // Complète et assainit une configuration (issue des options, d'un import…).
  function normalize(raw) {
    const d = defaultConfig();
    if (!raw || typeof raw !== 'object') { return d; }
    const hd = raw.header || {}, bg = raw.background || {}, ly = raw.layout || {};
    return {
      version: CONFIG_VERSION,
      header: {
        show: hd.show !== false,
        title: str(hd.title, ''),
        subtitle: str(hd.subtitle, ''),
        logo: str(hd.logo, ''),
        style: pick(hd.style, ['clair', 'bandeau', 'carte'], d.header.style),
        align: pick(hd.align, ['left', 'center'], d.header.align),
      },
      background: {
        type: pick(bg.type, ['none', 'color', 'image'], 'none'),
        color: /^#[0-9a-f]{6}$/i.test(bg.color) ? bg.color : d.background.color,
        image: str(bg.image, ''),
        veil: num(bg.veil, 0, 0.9, d.background.veil),
        veilColor: pick(bg.veilColor, ['dark', 'light'], 'dark'),
        fit: pick(bg.fit, ['cover', 'contain', 'repeat'], 'cover'),
        position: pick(bg.position, ['center', 'top', 'bottom'], 'center'),
      },
      layout: {
        style: pick(ly.style, ['tuile', 'plein', 'liste', 'pastille'], 'tuile'),
        size: pick(ly.size, ['s', 'm', 'l'], 'm'),
        columns: Math.round(num(ly.columns, 0, 6, 0)),
        align: pick(ly.align, ['left', 'center'], 'left'),
        numbering: ly.numbering !== false,
        maxWidth: Math.round(num(ly.maxWidth, 600, 2400, 1200)),
      },
      footer: str(raw.footer, ''),
      buttons: Array.isArray(raw.buttons) ? raw.buttons.filter(b => b && typeof b === 'object').map(b => ({
        id: str(b.id) || uid(),
        label: str(b.label),
        description: str(b.description),
        icon: str(b.icon, 'fleche'),
        color: COLOR_BY_ID[b.color] ? b.color : 'auto',
        kind: pick(b.kind, ['page', 'url'], 'page'),
        page: Number.isInteger(b.page) ? b.page : (Number(b.page) > 0 ? Number(b.page) : null),
        url: str(b.url),
        newTab: b.newTab !== false,
        group: str(b.group).trim(),
      })) : [],
      docUrl: str(raw.docUrl, ''),
      showEditButton: raw.showEditButton !== false,
    };
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Configuration affichée lorsque la page est ouverte hors de Grist.
  function demoConfig() {
    return normalize({
      header: { title: 'Portail du document', subtitle: 'Aperçu hors Grist : ajoutez ce widget à une page Grist pour le configurer.', style: 'clair' },
      buttons: [
        newButton({ label: 'Tableau de bord', description: 'Indicateurs clés et synthèse', icon: 'pilotage', kind: 'url', url: 'https://www.grandlyon.com' }),
        newButton({ label: 'Données', description: 'Consulter et saisir les données', icon: 'tableau', kind: 'url', url: 'https://www.grandlyon.com' }),
        newButton({ label: 'Site de la Métropole', description: 'grandlyon.com', icon: 'externe', color: 'bleu', kind: 'url', url: 'https://www.grandlyon.com' }),
      ],
    });
  }

  /* ================================================================== */
  /* Outils DOM                                                          */
  /* ================================================================== */

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function h(tag, props, ...children) {
    const el = document.createElement(tag);
    if (props) {
      for (const [key, value] of Object.entries(props)) {
        if (value === undefined || value === null || value === false) { continue; }
        if (key === 'class') { el.className = value; }
        else if (key === 'style' && typeof value === 'object') { Object.assign(el.style, value); }
        else if (key === 'dataset') { Object.assign(el.dataset, value); }
        else if (key.startsWith('on') && typeof value === 'function') { el.addEventListener(key.slice(2), value); }
        else if (key in el && typeof value !== 'string') { el[key] = value; }
        else { el.setAttribute(key, value === true ? '' : value); }
      }
    }
    append(el, children);
    return el;
  }

  function append(el, children) {
    for (const child of children.flat(Infinity)) {
      if (child === null || child === undefined || child === false) { continue; }
      el.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
    }
  }

  function svgIcon(id) {
    const def = ICONS[id];
    if (!def) { return null; }
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    for (const spec of def.d) {
      let node;
      if (spec.startsWith('c:')) {
        const [cx, cy, r] = spec.slice(2).split(',');
        node = document.createElementNS(SVG_NS, 'circle');
        node.setAttribute('cx', cx); node.setAttribute('cy', cy); node.setAttribute('r', r);
      } else if (spec.startsWith('r:')) {
        const [x, y, w, hh, rx] = spec.slice(2).split(',');
        node = document.createElementNS(SVG_NS, 'rect');
        node.setAttribute('x', x); node.setAttribute('y', y);
        node.setAttribute('width', w); node.setAttribute('height', hh);
        node.setAttribute('rx', rx || 0);
      } else {
        node = document.createElementNS(SVG_NS, 'path');
        node.setAttribute('d', spec);
      }
      svg.appendChild(node);
    }
    return svg;
  }

  // Une icône est soit un identifiant de la bibliothèque, soit un emoji / texte court.
  function iconNode(icon) {
    if (!icon) { return null; }
    return svgIcon(icon) || document.createTextNode(Array.from(icon).slice(0, 2).join(''));
  }

  const UI_ICONS = {
    edit: ['M4 20h4L19 9l-4-4L4 16z', 'M13.5 6.5l4 4'],
    close: ['M6 6l12 12', 'M18 6L6 18'],
    up: ['M12 19V5', 'M6 11l6-6 6 6'],
    down: ['M12 5v14', 'M6 13l6 6 6-6'],
    copy: ['r:8,8,12,12,2', 'M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8'],
    trash: ['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 13h10l1-13'],
    plus: ['M12 5v14', 'M5 12h14'],
    grip: ['c:9,6,1', 'c:15,6,1', 'c:9,12,1', 'c:15,12,1', 'c:9,18,1', 'c:15,18,1'],
    chevron: ['M9 6l6 6-6 6'],
    chevronDown: ['M6 9l6 6 6-6'],
  };
  for (const [id, d] of Object.entries(UI_ICONS)) { ICONS['ui-' + id] = { label: id, d, ui: true }; }

  function uiIcon(id) { return svgIcon('ui-' + id); }

  /* ================================================================== */
  /* État                                                                */
  /* ================================================================== */

  const params = new URLSearchParams(window.location.search);
  const state = {
    inGrist: typeof window.grist !== 'undefined' && window.parent !== window,
    readonly: params.get('readonly') === 'true',
    access: params.get('access') || null,
    saved: null,          // configuration enregistrée dans les options
    hasSavedConfig: false,
    draft: null,          // configuration en cours d'édition
    editing: false,
    dirty: false,
    tab: 'boutons',
    openItem: null,
    pages: [],            // [{viewRef, name, indentation}]
    pagesLoaded: false,
    pagesError: null,
    tokenBase: null,      // URL de base du document déduite du jeton d'accès
    confirmCancel: false,
  };

  const root = document.getElementById('hub-root');
  const hubHost = h('div');
  const edHost = h('div');
  root.append(hubHost, edHost);

  function current() {
    return state.editing ? state.draft : state.saved;
  }

  function canEdit() {
    return state.inGrist && !state.readonly;
  }

  /* ================================================================== */
  /* Liens et pages                                                      */
  /* ================================================================== */

  // Nettoie une URL de document collée par l'utilisateur.
  function cleanDocUrl(url) {
    try {
      const u = new URL(url.trim());
      if (!/^https?:$/.test(u.protocol)) { return null; }
      let path = u.pathname.replace(/\/p\/\d+.*$/, '').replace(/\/+$/, '');
      return u.origin + path;
    } catch (e) {
      return null;
    }
  }

  function docBase(cfg) {
    return (cfg.docUrl && cleanDocUrl(cfg.docUrl)) || state.tokenBase;
  }

  function pageUrl(cfg, viewRef) {
    const base = docBase(cfg);
    return base && viewRef ? `${base}/p/${viewRef}` : null;
  }

  function pageInfo(viewRef) {
    return state.pages.find(p => p.viewRef === viewRef) || null;
  }

  // N'accepte que des liens web, courriel ou téléphone.
  function safeUrl(url) {
    let value = (url || '').trim();
    if (!value) { return null; }
    if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) {
      if (/^[\w-]+(\.[\w-]+)+([/?#:].*)?$/.test(value)) { value = 'https://' + value; }
      else { return null; }
    }
    try {
      const u = new URL(value);
      return ['http:', 'https:', 'mailto:', 'tel:'].includes(u.protocol) ? u.href : null;
    } catch (e) {
      return null;
    }
  }

  function buttonLabel(b) {
    if (b.label.trim()) { return b.label.trim(); }
    if (b.kind === 'page') {
      const p = pageInfo(b.page);
      if (p) { return p.name; }
    }
    return 'Sans titre';
  }

  // Décrit l'état d'un lien : { href, target, problem }.
  function resolveLink(cfg, b) {
    if (b.kind === 'url') {
      const href = safeUrl(b.url);
      if (!href) { return { problem: b.url ? 'Lien invalide' : 'Aucun lien renseigné' }; }
      const sameTab = !b.newTab || /^(mailto|tel):/.test(href);
      return { href, target: sameTab ? '_top' : '_blank', external: !sameTab };
    }
    if (!b.page) { return { problem: 'Aucune page choisie' }; }
    if (state.pagesLoaded && !pageInfo(b.page)) { return { problem: 'Page introuvable (supprimée ?)' }; }
    const href = pageUrl(cfg, b.page);
    if (!href) { return { problem: 'Adresse du document inconnue', missingBase: true }; }
    return { href, target: '_top' };
  }

  async function loadContext() {
    if (!state.inGrist) { return; }
    if (state.access && state.access !== 'full') {
      state.pagesError = 'access';
      return;
    }
    try {
      const [pages, views] = await Promise.all([
        grist.docApi.fetchTable('_grist_Pages'),
        grist.docApi.fetchTable('_grist_Views'),
      ]);
      const names = new Map(views.id.map((id, i) => [id, views.name[i]]));
      state.pages = pages.id.map((id, i) => ({
        viewRef: pages.viewRef[i],
        name: names.get(pages.viewRef[i]),
        indentation: pages.indentation ? pages.indentation[i] : 0,
        pos: pages.pagePos ? pages.pagePos[i] : i,
      })).filter(p => p.name).sort((a, b) => a.pos - b.pos);
      state.pagesLoaded = true;
      state.pagesError = null;
    } catch (e) {
      console.warn('Hub : impossible de lire la liste des pages', e);
      state.pagesError = 'access';
    }
    if (!state.tokenBase) {
      try {
        const token = await grist.docApi.getAccessToken({ readOnly: true });
        const m = /^(.*?)\/api\/docs\/([^/?#]+)/.exec(token.baseUrl || '');
        if (m) { state.tokenBase = `${m[1]}/doc/${m[2]}`; }
      } catch (e) {
        console.warn('Hub : adresse du document indisponible', e);
      }
    }
  }

  /* ================================================================== */
  /* Rendu du hub                                                        */
  /* ================================================================== */

  function isDarkColor(hex) {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
  }

  function groupButtons(buttons) {
    const groups = [];
    const byName = new Map();
    buttons.forEach((b, index) => {
      const key = b.group || '';
      if (!byName.has(key)) {
        const g = { title: key, items: [] };
        byName.set(key, g);
        groups.push(g);
      }
      byName.get(key).items.push({ b, index });
    });
    return groups;
  }

  function renderHub() {
    const cfg = current();
    if (!cfg) { hubHost.replaceChildren(); return; }
    const L = cfg.layout, B = cfg.background;
    const onDark = (B.type === 'image' && B.image && B.veilColor === 'dark' && B.veil >= 0.2) ||
      (B.type === 'color' && isDarkColor(B.color));

    const hub = h('div', {
      class: [
        'hub', `hub--size-${L.size}`, `hub--align-${L.align}`,
        onDark ? 'hub--on-dark' : '',
      ].join(' '),
    });
    hub.style.setProperty('--hub-max-width', L.maxWidth + 'px');
    if (B.type === 'color') { hub.style.setProperty('--hub-bg-color', B.color); }

    if (B.type === 'image' && B.image) {
      const bg = h('div', { class: 'hub__bg' });
      bg.style.backgroundImage = `url(${JSON.stringify(B.image)})`;
      bg.style.backgroundSize = B.fit === 'repeat' ? 'auto' : B.fit;
      bg.style.backgroundRepeat = B.fit === 'repeat' ? 'repeat' : 'no-repeat';
      bg.style.backgroundPosition = B.position;
      const veil = h('div', { class: 'hub__veil' });
      veil.style.background = B.veilColor === 'dark' ? `rgba(20, 22, 40, ${B.veil})` : `rgba(255, 255, 255, ${B.veil})`;
      hub.append(bg, veil);
    }

    const inner = h('div', { class: 'hub__inner' });
    hub.appendChild(inner);

    const H = cfg.header;
    if (H.show && (H.title || H.subtitle || H.logo)) {
      const header = h('header', { class: `hub-header hub-header--${H.style} hub-header--${H.align}` },
        H.logo ? h('img', { class: 'hub-header__logo', src: H.logo, alt: '' }) : null,
        (H.title || H.subtitle) ? h('div', { class: 'hub-header__text' },
          H.title ? h('h1', { class: 'hub-header__title' }, H.title) : null,
          H.subtitle ? h('p', { class: 'hub-header__subtitle' }, H.subtitle) : null,
        ) : null,
      );
      if (H.style === 'bandeau') {
        hub.insertBefore(h('div', { class: 'hub-band' }, h('div', { class: 'hub-band__inner' }, header)), inner);
      } else {
        inner.appendChild(header);
      }
    }

    if (!cfg.buttons.length) {
      inner.appendChild(renderEmpty());
    } else {
      let n = 0;
      for (const group of groupButtons(cfg.buttons)) {
        const section = h('section', { class: 'hub-section' });
        if (group.title) {
          n += 1;
          section.appendChild(h('h2', { class: 'hub-section__title' }, L.numbering ? `${n} - ${group.title}` : group.title));
        }
        const grid = h('div', { class: gridClass(L) });
        if (L.columns > 0) { grid.style.setProperty('--hub-cols', L.columns); }
        for (const { b, index } of group.items) { grid.appendChild(renderButton(cfg, b, index)); }
        section.appendChild(grid);
        inner.appendChild(section);
      }
    }

    if (cfg.footer.trim()) {
      inner.appendChild(h('footer', { class: 'hub-footer' }, cfg.footer));
    }

    if (canEdit() && !state.editing && cfg.showEditButton) {
      hub.appendChild(h('button', {
        class: 'hub-fab', type: 'button', title: 'Modifier le hub',
        onclick: openEditor,
      }, uiIcon('edit'), h('span', null, 'Modifier')));
    }

    hubHost.replaceChildren(hub);
  }

  function gridClass(L) {
    if (L.style === 'liste') { return 'hub-grid hub-grid--liste'; }
    if (L.style === 'pastille') { return 'hub-grid hub-grid--pastille'; }
    return L.columns > 0 ? 'hub-grid hub-grid--cols' : 'hub-grid';
  }

  function renderButton(cfg, b, index) {
    const style = cfg.layout.style;
    const color = resolveColor(b.color, index);
    const link = resolveLink(cfg, b);
    const label = buttonLabel(b);
    const icon = iconNode(b.icon);
    const goIcon = link.external ? svgIcon('externe') : svgIcon('fleche');
    if (goIcon) { goIcon.classList.add('hub-btn__go'); }

    const el = h(link.href && !state.editing ? 'a' : 'button', {
      class: [
        'hub-btn', `hub-btn--${style}`,
        icon ? '' : 'hub-btn--no-icon',
        link.problem && !state.editing ? 'hub-btn--disabled' : '',
      ].join(' '),
      title: link.problem ? `${label} — ${link.problem}` : (b.description || label),
      dataset: { id: b.id },
    },
    h('span', { class: 'hub-btn__icon' }, icon),
    h('span', { class: 'hub-btn__body' },
      h('span', { class: 'hub-btn__label' }, label),
      b.description ? h('span', { class: 'hub-btn__desc' }, b.description) : null,
    ),
    goIcon);
    el.style.setProperty('--c', color.bg);
    el.style.setProperty('--c-fg', color.fg);

    if (state.editing) {
      // En édition, un clic sur un bouton l'ouvre dans le panneau.
      el.type = 'button';
      el.addEventListener('click', () => {
        state.tab = 'boutons';
        state.openItem = b.id;
        renderEditor();
        const item = edHost.querySelector(`[data-item="${CSS.escape(b.id)}"]`);
        if (item) { item.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
      });
    } else if (link.href) {
      el.href = link.href;
      el.target = link.target;
      if (link.target === '_blank') { el.rel = 'noopener noreferrer'; }
    } else {
      el.type = 'button';
      el.setAttribute('aria-disabled', 'true');
      el.addEventListener('click', () => {
        if (link.missingBase) {
          toast('Adresse du document inconnue : accordez l\'accès complet au widget ou renseignez l\'URL du document dans « Avancé ».', 'warning');
        } else {
          toast(`${label} : ${link.problem.toLowerCase()}.`, 'warning');
        }
      });
    }
    return el;
  }

  function renderEmpty() {
    if (state.editing) {
      return h('div', { class: 'hub-empty' },
        h('h2', null, 'Aucun bouton pour l\'instant'),
        h('p', null, 'Ajoutez un premier bouton depuis le panneau de droite, ou créez-en un par page du document.'));
    }
    if (!canEdit()) {
      return h('div', { class: 'hub-empty' },
        h('h2', null, 'Hub en cours de préparation'),
        h('p', null, 'Ce hub n\'a pas encore été configuré par un éditeur du document.'));
    }
    return h('div', { class: 'hub-empty' },
      h('h2', null, 'Créez votre hub de navigation'),
      h('p', null, 'Ajoutez des boutons vers les pages du document ou vers des sites web, puis personnalisez le fond, l\'en-tête et les couleurs.'),
      h('div', { class: 'hub-empty__actions' },
        state.pages.length ? h('button', {
          class: 'ui-btn ui-btn--primary', type: 'button',
          onclick: () => { openEditor(); addAllPages(); },
        }, 'Créer un bouton par page') : null,
        h('button', { class: state.pages.length ? 'ui-btn' : 'ui-btn ui-btn--primary', type: 'button', onclick: openEditor }, 'Configurer le hub'),
      ));
  }

  /* ================================================================== */
  /* Notifications                                                       */
  /* ================================================================== */

  let toastTimer = null;
  function toast(message, kind, duration) {
    document.querySelectorAll('.hub-toast').forEach(t => t.remove());
    clearTimeout(toastTimer);
    const el = h('div', { class: `hub-toast hub-toast--${kind || 'info'}`, role: 'status' }, message);
    document.body.appendChild(el);
    toastTimer = setTimeout(() => el.remove(), duration || 6000);
    el.addEventListener('click', () => el.remove());
  }

  /* ================================================================== */
  /* Éditeur                                                             */
  /* ================================================================== */

  async function openEditor() {
    if (!canEdit() && state.inGrist) { return; }
    if (!state.editing) {
      state.draft = clone(state.saved || defaultConfig());
      state.editing = true;
      state.dirty = false;
      state.confirmCancel = false;
      document.body.classList.add('editing');
    }
    renderAll();
    await loadContext();
    if (state.editing) { renderAll(); }
  }

  function closeEditor() {
    state.editing = false;
    state.draft = null;
    state.dirty = false;
    state.openItem = null;
    document.body.classList.remove('editing');
    renderAll();
  }

  async function saveEditor() {
    const cfg = normalize(state.draft);
    try {
      if (state.inGrist) { await grist.setOption(OPTION_KEY, cfg); }
      state.saved = cfg;
      state.hasSavedConfig = true;
      closeEditor();
      toast('Hub mis à jour. Pour conserver ces réglages, cliquez sur « Enregistrer » dans le menu du widget Grist (icône mise en évidence en haut à droite du widget).', 'success', 12000);
    } catch (e) {
      console.error(e);
      toast('Impossible d\'enregistrer la configuration : ' + (e && e.message ? e.message : e), 'error');
    }
  }

  function cancelEditor() {
    if (state.dirty && !state.confirmCancel) {
      state.confirmCancel = true;
      renderEditorFoot();
      return;
    }
    closeEditor();
  }

  // Modifie le brouillon puis rafraîchit l'aperçu (et l'éditeur si demandé).
  function change(mutator, rerenderEditor) {
    mutator(state.draft);
    state.dirty = true;
    state.confirmCancel = false;
    renderHub();
    if (rerenderEditor) { renderEditor(); } else { renderEditorFoot(); }
  }

  function renderAll() {
    renderHub();
    renderEditor();
  }

  let edBody = null, edFoot = null;

  function renderEditor() {
    if (!state.editing) { edHost.replaceChildren(); edBody = edFoot = null; return; }
    const scroll = edBody ? edBody.scrollTop : 0;
    const tabs = [
      ['boutons', `Boutons (${state.draft.buttons.length})`],
      ['apparence', 'Apparence'],
      ['fond', 'Fond'],
      ['avance', 'Avancé'],
    ];
    edBody = h('div', { class: 'ed__body' });
    edFoot = h('div', { class: 'ed__foot' });
    const panel = h('aside', { class: 'ed', 'aria-label': 'Configuration du hub' },
      h('div', { class: 'ed__head' },
        h('h2', { class: 'ed__title' }, 'Configurer le hub'),
        h('button', { class: 'ui-btn ui-btn--icon', type: 'button', title: 'Fermer', onclick: cancelEditor }, uiIcon('close'))),
      h('div', { class: 'ed__tabs', role: 'tablist' }, tabs.map(([id, label]) => h('button', {
        class: 'ed__tab', type: 'button', role: 'tab', 'aria-selected': String(state.tab === id),
        onclick: () => { state.tab = id; edBody = null; renderEditor(); },
      }, label))),
      edBody,
      edFoot);

    const builders = { boutons: tabButtons, apparence: tabAppearance, fond: tabBackground, avance: tabAdvanced };
    append(edBody, [builders[state.tab]()]);
    renderEditorFoot();
    edHost.replaceChildren(panel);
    edBody.scrollTop = scroll;
  }

  function renderEditorFoot() {
    if (!edFoot) { return; }
    edFoot.replaceChildren(
      h('div', { class: 'ed__foot-actions' },
        h('span', { class: 'ed__dirty' + (state.dirty ? ' ed__dirty--on' : '') },
          state.confirmCancel ? 'Abandonner les modifications ?' : (state.dirty ? 'Modifications non appliquées' : 'Aucune modification')),
        h('button', { class: 'ui-btn ui-btn--ghost', type: 'button', onclick: cancelEditor },
          state.confirmCancel ? 'Oui, abandonner' : 'Annuler'),
        h('button', { class: 'ui-btn ui-btn--primary', type: 'button', onclick: saveEditor }, 'Appliquer'),
      ));
  }

  /* ---------- Champs génériques ---------- */

  function field(label, control, hint) {
    return h('label', { class: 'ed-field' },
      h('span', { class: 'ed-field__label' }, label),
      control,
      hint ? h('span', { class: 'ed-field__hint' }, hint) : null);
  }

  function textInput(value, onInput, attrs) {
    const tag = attrs && attrs.multiline ? 'textarea' : 'input';
    const el = h(tag, Object.assign({
      class: tag === 'textarea' ? 'ed-textarea' : 'ed-input',
      value: value || '',
      oninput: e => onInput(e.target.value, e.target),
    }, attrs && { placeholder: attrs.placeholder, type: tag === 'input' ? (attrs.type || 'text') : undefined, list: attrs.list, maxlength: attrs.maxlength }));
    if (tag === 'textarea') { el.value = value || ''; el.rows = attrs.rows || 2; }
    return el;
  }

  function select(value, options, onChange) {
    return h('select', { class: 'ed-select', onchange: e => onChange(e.target.value) },
      options.map(([v, label, extra]) => h('option', Object.assign({ value: String(v), selected: String(v) === String(value) }, extra), label)));
  }

  function segmented(value, options, onChange) {
    const wrap = h('div', { class: 'ed-seg', role: 'group' });
    for (const [v, label] of options) {
      wrap.appendChild(h('button', {
        type: 'button', 'aria-pressed': String(v === value),
        onclick: e => {
          wrap.querySelectorAll('button').forEach(btn => btn.setAttribute('aria-pressed', 'false'));
          e.currentTarget.setAttribute('aria-pressed', 'true');
          onChange(v);
        },
      }, label));
    }
    return wrap;
  }

  function checkbox(label, value, onChange) {
    return h('label', { class: 'ed-check' },
      h('input', { type: 'checkbox', checked: !!value, onchange: e => onChange(e.target.checked) }),
      h('span', null, label));
  }

  function range(value, min, max, step, format, onInput) {
    const out = h('output', null, format(value));
    return h('div', { class: 'ed-range' },
      h('input', {
        type: 'range', min, max, step, value: String(value),
        oninput: e => { const v = Number(e.target.value); out.textContent = format(v); onInput(v); },
      }), out);
  }

  function group(title, ...children) {
    return h('div', { class: 'ed-group' }, h('h3', { class: 'ed-group__title' }, title), children);
  }

  function note(text, kind) {
    return h('div', { class: 'ed-note' + (kind ? ` ed-note--${kind}` : '') }, text);
  }

  /* ---------- Onglet « Boutons » ---------- */

  function pagesNote() {
    if (state.pagesError === 'access') {
      return note('Pour choisir les pages du document dans une liste, accordez au widget l\'accès complet au document (panneau de droite de Grist › onglet Widget › Accès).', 'warn');
    }
    return null;
  }

  function addAllPages() {
    const existing = new Set(state.draft.buttons.filter(b => b.kind === 'page').map(b => b.page));
    const toAdd = state.pages.filter(p => !existing.has(p.viewRef));
    if (!toAdd.length) {
      toast('Toutes les pages ont déjà un bouton.', 'info');
      return;
    }
    change(d => {
      for (const p of toAdd) {
        d.buttons.push(newButton({ kind: 'page', page: p.viewRef, icon: guessIcon(p.name) }));
      }
    }, true);
    toast(`${toAdd.length} bouton${toAdd.length > 1 ? 's' : ''} ajouté${toAdd.length > 1 ? 's' : ''}.`, 'success', 3000);
  }

  function moveButton(from, to) {
    change(d => {
      if (to < 0 || to >= d.buttons.length || from === to) { return; }
      const [b] = d.buttons.splice(from, 1);
      d.buttons.splice(to, 0, b);
    }, true);
  }

  function tabButtons() {
    const d = state.draft;
    const groups = Array.from(new Set(d.buttons.map(b => b.group).filter(Boolean)));
    const listId = 'hub-groups';
    const items = h('div', { class: 'ed-items' });
    let dragFrom = null;

    d.buttons.forEach((b, i) => {
      const open = state.openItem === b.id;
      const color = resolveColor(b.color, i);
      const link = resolveLink(d, b);
      const meta = link.problem ||
        (b.kind === 'page' ? `Page : ${(pageInfo(b.page) || { name: '#' + b.page }).name}` : (safeUrl(b.url) || b.url));

      const dot = h('span', { class: 'ed-item__dot' }, iconNode(b.icon));
      dot.style.background = color.bg;
      dot.style.color = color.fg;

      const head = h('div', {
        class: 'ed-item__head', draggable: 'true',
        onclick: e => {
          if (e.target.closest('button')) { return; }
          state.openItem = open ? null : b.id;
          renderEditor();
        },
        ondragstart: e => { dragFrom = i; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); },
      },
      h('span', { class: 'ed-item__handle', title: 'Glisser pour déplacer' }, uiIcon('grip')),
      dot,
      h('span', { class: 'ed-item__name' }, buttonLabel(b),
        h('span', { class: 'ed-item__meta' + (link.problem ? ' ed-item__meta--warn' : '') }, (b.group ? b.group + ' · ' : '') + meta)),
      h('span', { class: 'ed-item__tools' },
        h('button', { class: 'ui-btn ui-btn--icon', type: 'button', title: 'Monter', disabled: i === 0, onclick: () => moveButton(i, i - 1) }, uiIcon('up')),
        h('button', { class: 'ui-btn ui-btn--icon', type: 'button', title: 'Descendre', disabled: i === d.buttons.length - 1, onclick: () => moveButton(i, i + 1) }, uiIcon('down')),
        h('button', {
          class: 'ui-btn ui-btn--icon', type: 'button', title: 'Dupliquer',
          onclick: () => change(dd => {
            const copy = Object.assign(clone(b), { id: uid() });
            dd.buttons.splice(i + 1, 0, copy);
            state.openItem = copy.id;
          }, true),
        }, uiIcon('copy')),
        h('button', {
          class: 'ui-btn ui-btn--icon', type: 'button', title: 'Supprimer',
          onclick: () => change(dd => { dd.buttons.splice(i, 1); }, true),
        }, uiIcon('trash'))));

      const item = h('div', {
        class: 'ed-item' + (open ? ' ed-item--open' : ''),
        dataset: { item: b.id },
        ondragover: e => { if (dragFrom !== null) { e.preventDefault(); item.classList.add('ed-item--drop'); } },
        ondragleave: () => item.classList.remove('ed-item--drop'),
        ondrop: e => {
          e.preventDefault();
          item.classList.remove('ed-item--drop');
          if (dragFrom !== null && dragFrom !== i) { moveButton(dragFrom, dragFrom < i ? i - 1 : i); }
          dragFrom = null;
        },
      }, head, open ? buttonForm(b, i, listId) : null);
      items.appendChild(item);
    });

    return h('div', null,
      pagesNote(),
      d.buttons.length ? null : note('Aucun bouton. Ajoutez-en un, ou créez automatiquement un bouton par page du document.'),
      items,
      h('div', { class: 'ed-actions' },
        h('button', {
          class: 'ui-btn ui-btn--primary', type: 'button',
          onclick: () => change(dd => {
            const firstFree = state.pages.find(p => !dd.buttons.some(x => x.kind === 'page' && x.page === p.viewRef));
            const nb = newButton(firstFree ? { page: firstFree.viewRef, icon: guessIcon(firstFree.name) } : { kind: state.pages.length ? 'page' : 'url' });
            dd.buttons.push(nb);
            state.openItem = nb.id;
          }, true),
        }, uiIcon('plus'), 'Ajouter un bouton'),
        state.pages.length ? h('button', { class: 'ui-btn', type: 'button', onclick: addAllPages }, 'Un bouton par page') : null),
      h('datalist', { id: listId }, groups.map(g => h('option', { value: g }))),
      d.buttons.length ? h('p', { class: 'ed-field__hint', style: { marginTop: '14px' } },
        'Astuce : cliquez sur un bouton dans l\'aperçu pour le modifier ; glissez-déposez les lignes pour les réordonner.') : null);
  }

  function buttonForm(b, index, listId) {
    // Les modifications de texte ne reconstruisent pas le panneau (le focus est conservé).
    const set = (key, value, rerender) => change(d => {
      const target = d.buttons.find(x => x.id === b.id);
      if (target) { target[key] = value; }
    }, rerender);

    const pageOptions = [[ '', '— Choisir une page —' ]].concat(state.pages.map(p => [
      p.viewRef, `${'   '.repeat(p.indentation || 0)}${p.name}`,
    ]));
    if (b.page && !pageInfo(b.page)) { pageOptions.push([b.page, `Page n° ${b.page} (introuvable)`]); }

    const linkFields = b.kind === 'page'
      ? (state.pages.length
        ? field('Page de destination', select(b.page || '', pageOptions, v => {
            const page = v ? Number(v) : null;
            change(d => {
              const t = d.buttons.find(x => x.id === b.id);
              t.page = page;
              if (page && (!t.icon || t.icon === 'fleche')) { t.icon = guessIcon((pageInfo(page) || {}).name); }
            }, true);
          }), 'Laissez le libellé vide pour reprendre automatiquement le nom de la page.')
        : field('Numéro de la page', textInput(b.page || '', v => set('page', Number(v) > 0 ? Number(v) : null), { type: 'number', placeholder: 'ex. 3' }),
          'Numéro visible dans l\'adresse de la page : …/p/3'))
      : h('div', null,
        field('Adresse du lien', textInput(b.url, (v, el) => {
          el.classList.toggle('ed-input--invalid', !!v && !safeUrl(v));
          set('url', v);
        }, { placeholder: 'https://www.grandlyon.com', type: 'url' }), 'Liens web, mailto: et tel: acceptés.'),
        checkbox('Ouvrir dans un nouvel onglet', b.newTab, v => set('newTab', v)));

    const iconGrid = h('div', { class: 'ed-icons' });
    for (const [id, def] of Object.entries(ICONS)) {
      if (def.ui) { continue; }
      iconGrid.appendChild(h('button', {
        class: 'ed-icon', type: 'button', title: def.label, 'aria-pressed': String(b.icon === id),
        onclick: () => set('icon', id, true),
      }, svgIcon(id)));
    }
    iconGrid.appendChild(h('button', {
      class: 'ed-icon', type: 'button', title: 'Sans icône', 'aria-pressed': String(!b.icon),
      onclick: () => set('icon', '', true),
    }, 'Aucune'));

    const swatches = h('div', { class: 'ed-swatches' });
    for (const c of COLORS) {
      const sw = h('button', {
        class: 'ed-swatch', type: 'button', title: c.label, 'aria-label': c.label,
        'aria-pressed': String((b.color || 'auto') === c.id),
        onclick: () => set('color', c.id, true),
      });
      sw.style.background = c.id === 'auto'
        ? 'linear-gradient(135deg, #FF0000 0 50%, #C00000 50% 100%)'
        : c.bg;
      swatches.appendChild(sw);
    }

    return h('div', { class: 'ed-item__body' },
      field('Type de lien', segmented(b.kind, [['page', 'Page du document'], ['url', 'Lien web']], v => set('kind', v, true))),
      linkFields,
      field('Libellé', textInput(b.label, v => set('label', v), {
        placeholder: b.kind === 'page' && pageInfo(b.page) ? pageInfo(b.page).name : 'Texte du bouton', maxlength: 80,
      })),
      field('Description (facultatif)', textInput(b.description, v => set('description', v), { multiline: true, rows: 2, placeholder: 'Une phrase pour préciser la destination' })),
      field('Groupe (facultatif)', textInput(b.group, v => set('group', v.trim()), { list: listId, placeholder: 'ex. Pilotage, Données, Ressources…' }),
        'Les boutons d\'un même groupe sont réunis sous un titre de section.'),
      field('Icône', h('div', null,
        iconGrid,
        h('div', { class: 'ed-row', style: { marginTop: '6px', alignItems: 'center' } },
          h('span', { class: 'ed-field__hint', style: { margin: 0, flex: '0 0 auto' } }, 'ou un emoji :'),
          textInput(ICONS[b.icon] ? '' : b.icon, v => set('icon', v.trim()), { placeholder: '🚲', maxlength: 4 })))),
      field('Couleur', swatches),
    );
  }

  /* ---------- Onglet « Apparence » ---------- */

  function tabAppearance() {
    const d = state.draft;
    const setH = (k, v, r) => change(x => { x.header[k] = v; }, r);
    const setL = (k, v, r) => change(x => { x.layout[k] = v; }, r);
    return h('div', null,
      group('En-tête',
        checkbox('Afficher l\'en-tête', d.header.show, v => setH('show', v, true)),
        d.header.show ? [
          field('Titre', textInput(d.header.title, v => setH('title', v), { placeholder: 'Portail du document' })),
          field('Sous-titre', textInput(d.header.subtitle, v => setH('subtitle', v), { multiline: true, rows: 2, placeholder: 'Quelques mots pour présenter le document' })),
          field('Style', segmented(d.header.style, [['clair', 'Sobre'], ['carte', 'Encadré'], ['bandeau', 'Bandeau rouge']], v => setH('style', v))),
          field('Alignement', segmented(d.header.align, [['left', 'À gauche'], ['center', 'Centré']], v => setH('align', v))),
          imageField('Logo', d.header.logo, v => setH('logo', v, true), { logo: true }),
        ] : null),
      group('Boutons',
        field('Style', segmented(d.layout.style, [['tuile', 'Tuiles'], ['plein', 'Aplats'], ['liste', 'Liste'], ['pastille', 'Pastilles']], v => setL('style', v))),
        field('Taille', segmented(d.layout.size, [['s', 'Petite'], ['m', 'Moyenne'], ['l', 'Grande']], v => setL('size', v))),
        field('Colonnes', select(d.layout.columns, [[0, 'Automatique'], [1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5'], [6, '6']], v => setL('columns', Number(v))),
          'Sans effet sur les styles Liste et Pastilles.'),
        field('Alignement', segmented(d.layout.align, [['left', 'À gauche'], ['center', 'Centré']], v => setL('align', v))),
        checkbox('Numéroter les titres de groupe (« 1 - … »)', d.layout.numbering, v => setL('numbering', v)),
        field('Largeur maximale du contenu', range(d.layout.maxWidth, 600, 2400, 50, v => v + ' px', v => setL('maxWidth', v)))),
      group('Pied de page',
        field('Texte', textInput(d.footer, v => change(x => { x.footer = v; }), { multiline: true, rows: 2, placeholder: 'ex. Direction de l\'innovation numérique — contact : …' }))));
  }

  /* ---------- Onglet « Fond » ---------- */

  function tabBackground() {
    const d = state.draft;
    const setB = (k, v, r) => change(x => { x.background[k] = v; }, r);
    const B = d.background;
    return h('div', null,
      group('Fond',
        field('Type', segmented(B.type, [['none', 'Par défaut'], ['color', 'Couleur'], ['image', 'Image']], v => setB('type', v, true))),
        B.type === 'color' ? field('Couleur de fond', h('div', { class: 'ed-row', style: { alignItems: 'center' } },
          h('input', { type: 'color', value: B.color, style: { flex: '0 0 44px', height: '30px', padding: 0, border: 'none', background: 'none' }, oninput: e => setB('color', e.target.value) }),
          h('div', { class: 'ed-swatches' }, ['#F4F4F6', '#FFFFFF', '#2A3158', '#C00000', '#FFF5F5', '#EEF3F3'].map(c => {
            const sw = h('button', { class: 'ed-swatch', type: 'button', title: c, onclick: () => setB('color', c, true) });
            sw.style.background = c;
            return sw;
          })))) : null,
        B.type === 'image' ? [
          imageField('Image', B.image, v => setB('image', v, true), {}),
          field('Voile (lisibilité du texte)', h('div', null,
            segmented(B.veilColor, [['dark', 'Sombre'], ['light', 'Clair']], v => setB('veilColor', v)),
            h('div', { style: { marginTop: '8px' } }, range(B.veil, 0, 0.9, 0.05, v => Math.round(v * 100) + ' %', v => setB('veil', v))))),
          field('Ajustement', segmented(B.fit, [['cover', 'Remplir'], ['contain', 'Contenir'], ['repeat', 'Mosaïque']], v => setB('fit', v))),
          field('Position', segmented(B.position, [['top', 'Haut'], ['center', 'Centre'], ['bottom', 'Bas']], v => setB('position', v))),
        ] : null));
  }

  // Champ image : adresse web ou fichier importé (redimensionné et stocké dans les options).
  function imageField(label, value, onChange, opts) {
    const isData = value && value.startsWith('data:');
    const fileInput = h('input', {
      type: 'file', accept: 'image/*', style: { display: 'none' },
      onchange: async e => {
        const file = e.target.files && e.target.files[0];
        if (!file) { return; }
        try {
          const dataUrl = await readImage(file, opts.logo ? { max: 480, keepPng: true } : { max: 1920 });
          if (dataUrl.length > MAX_IMAGE_BYTES * 1.37) {
            toast('Image trop lourde même après compression. Utilisez une image plus légère ou une adresse web.', 'error');
            return;
          }
          onChange(dataUrl);
        } catch (err) {
          toast('Impossible de lire cette image.', 'error');
        }
      },
    });
    return field(label, h('div', null,
      textInput(isData ? '' : value, v => onChange(v.trim()), { placeholder: isData ? 'Image importée' : 'https://… (adresse d\'une image)', type: 'url' }),
      h('div', { class: 'ed-actions', style: { marginTop: '6px' } },
        h('button', { class: 'ui-btn ui-btn--small', type: 'button', onclick: () => fileInput.click() }, 'Importer un fichier…'),
        value ? h('button', { class: 'ui-btn ui-btn--small ui-btn--ghost', type: 'button', onclick: () => onChange('') }, 'Retirer') : null,
        fileInput),
      value ? h('div', { class: 'ed-thumb' + (opts.logo ? ' ed-thumb--logo' : '') },
        h('img', { src: value, alt: '' }),
        h('span', null, isData ? `Importée · ${formatBytes(Math.round(value.length * 0.74))}` : 'Image en ligne')) : null),
    opts.logo ? 'PNG ou SVG à fond transparent conseillé.' : 'Les images importées sont compressées et enregistrées dans le document.');
  }

  function formatBytes(n) {
    return n > 1024 * 1024 ? (n / 1024 / 1024).toFixed(1) + ' Mo' : Math.max(1, Math.round(n / 1024)) + ' Ko';
  }

  function readImage(file, { max, keepPng }) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const src = reader.result;
        if (file.type === 'image/svg+xml' || (file.size < 150 * 1024 && file.type !== 'image/bmp')) {
          resolve(src);
          return;
        }
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(keepPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------- Onglet « Avancé » ---------- */

  function tabAdvanced() {
    const d = state.draft;
    const json = JSON.stringify(normalize(d), null, 2);
    const importArea = textInput('', () => {}, { multiline: true, rows: 6, placeholder: 'Collez ici une configuration exportée (JSON)' });
    importArea.classList.add('ed-textarea--code');
    const base = docBase(d);

    return h('div', null,
      group('Navigation',
        field('Adresse du document (facultatif)', textInput(d.docUrl, (v, el) => {
          el.classList.toggle('ed-input--invalid', !!v && !cleanDocUrl(v));
          change(x => { x.docUrl = v.trim(); });
        }, { type: 'url', placeholder: state.tokenBase || 'https://grist.exemple.fr/o/equipe/AbCdEf/Mon-document' }),
        base ? `Liens vers les pages : ${base}/p/…` : 'Adresse non détectée : collez l\'adresse du document (copiée depuis la barre du navigateur).'),
        checkbox('Afficher le bouton « Modifier » au survol', d.showEditButton, v => change(x => { x.showEditButton = v; })),
        h('p', { class: 'ed-field__hint' }, 'Bouton masqué : la configuration reste accessible via le panneau de droite de Grist › « Ouvrir la configuration ». Les lecteurs seuls ne voient jamais ce bouton.')),
      group('Exporter / importer',
        h('div', { class: 'ed-actions' },
          h('button', {
            class: 'ui-btn ui-btn--small', type: 'button',
            onclick: async () => {
              try { await navigator.clipboard.writeText(json); toast('Configuration copiée dans le presse-papiers.', 'success', 3000); }
              catch (e) { toast('Copie impossible : utilisez le téléchargement.', 'warning'); }
            },
          }, 'Copier la configuration'),
          h('button', {
            class: 'ui-btn ui-btn--small', type: 'button',
            onclick: () => {
              const a = h('a', { href: URL.createObjectURL(new Blob([json], { type: 'application/json' })), download: 'hub-configuration.json' });
              document.body.appendChild(a); a.click(); a.remove();
            },
          }, 'Télécharger (.json)')),
        h('div', { style: { marginTop: '12px' } }, importArea),
        h('div', { class: 'ed-actions', style: { marginTop: '6px' } },
          h('button', {
            class: 'ui-btn ui-btn--small', type: 'button',
            onclick: () => {
              try {
                const parsed = JSON.parse(importArea.value);
                const cfg = normalize(parsed.hub || parsed);
                change(x => { Object.assign(x, cfg); }, true);
                toast(`Configuration importée (${cfg.buttons.length} boutons). Cliquez sur « Appliquer » pour la valider.`, 'success');
              } catch (e) {
                toast('JSON invalide : ' + e.message, 'error');
              }
            },
          }, 'Importer'))),
      group('Réinitialiser',
        h('button', {
          class: 'ui-btn ui-btn--small', type: 'button',
          onclick: e => {
            if (e.currentTarget.dataset.confirm) {
              change(x => { Object.assign(x, defaultConfig()); }, true);
            } else {
              e.currentTarget.dataset.confirm = '1';
              e.currentTarget.textContent = 'Confirmer : tout effacer';
            }
          },
        }, 'Repartir d\'une configuration vierge')));
  }

  /* ================================================================== */
  /* Démarrage                                                           */
  /* ================================================================== */

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && state.editing) { cancelEditor(); }
  });

  function start() {
    if (!state.inGrist) {
      state.saved = demoConfig();
      renderHub();
      return;
    }
    grist.ready({ requiredAccess: 'full', onEditOptions: openEditor });
    let first = true;
    grist.onOptions(async (options, settings) => {
      if (settings && settings.accessLevel) { state.access = settings.accessLevel; }
      const raw = options ? options[OPTION_KEY] : null;
      state.hasSavedConfig = !!raw;
      state.saved = normalize(raw);
      if (first) {
        first = false;
        await loadContext();
      }
      if (!state.editing) { renderHub(); }
    });
    // Si Grist ne répond pas (page ouverte hors document), afficher tout de même quelque chose.
    setTimeout(() => {
      if (!state.saved) { state.saved = defaultConfig(); renderHub(); }
    }, 2500);
  }

  // Pour les tests automatisés.
  window.__hub = { state, normalize, resolveLink, guessIcon, openEditor, renderAll };

  start();
})();
