/**
 * Configuration du hub : schéma, valeurs par défaut, migration, modèles, palettes et icônes.
 * Module pur (aucune dépendance, aucun accès au DOM) : testable isolément.
 */

export const VERSION = 2;

/* ------------------------------------------------------------------ */
/* Couleurs de la charte Métropole de Lyon                             */
/* ------------------------------------------------------------------ */

export const COLORS = {
  rouge: { label: 'Rouge Métropole', bg: '#FF0000', fg: '#FFFFFF' },
  'rouge-fonce': { label: 'Rouge foncé', bg: '#C00000', fg: '#FFFFFF' },
  bleu: { label: 'Bleu institutionnel', bg: '#2A3158', fg: '#FFFFFF' },
  canard: { label: 'Bleu canard', bg: '#6CA6AB', fg: '#1E2340' },
  'vert-fonce': { label: 'Vert foncé', bg: '#387C2C', fg: '#FFFFFF' },
  vert: { label: 'Vert', bg: '#6DB33F', fg: '#1E2340' },
  ambre: { label: 'Ambre', bg: '#FFB90B', fg: '#1E2340' },
  orange: { label: 'Orange', bg: '#ED7D31', fg: '#1E2340' },
  violet: { label: 'Violet', bg: '#7030A0', fg: '#FFFFFF' },
  rose: { label: 'Rouge rosé', bg: '#F49E9E', fg: '#1E2340' },
  gris: { label: 'Gris', bg: '#7F7F7F', fg: '#FFFFFF' },
};

/** Palettes : couleur des boutons laissés en « Automatique », selon leur rang. */
export const PALETTES = {
  metropole: { label: 'Métropole', hint: 'Rouge et rouge foncé alternés', cycle: ['rouge', 'rouge-fonce'] },
  institutionnel: { label: 'Institutionnel', hint: 'Bleu de la charte', cycle: ['bleu'] },
  contraste: { label: 'Rouge et bleu', hint: 'Alternance rouge et bleu', cycle: ['rouge-fonce', 'bleu'] },
  multicolore: { label: 'Multicolore', hint: 'Une couleur par bouton', cycle: ['rouge-fonce', 'bleu', 'canard', 'vert-fonce', 'ambre', 'violet'] },
};

/* ------------------------------------------------------------------ */
/* Couleurs du Système de design de l'État (DSFR)                      */
/* ------------------------------------------------------------------ */

export const DSFR_COLORS = {
  'bleu-france': { label: 'Bleu France', bg: '#000091', fg: '#FFFFFF' },
  'rouge-marianne': { label: 'Rouge Marianne', bg: '#E1000F', fg: '#FFFFFF' },
  ecume: { label: 'Écume', bg: '#465F9D', fg: '#FFFFFF' },
  cumulus: { label: 'Cumulus', bg: '#417DC4', fg: '#FFFFFF' },
  menthe: { label: 'Menthe', bg: '#009081', fg: '#FFFFFF' },
  emeraude: { label: 'Émeraude', bg: '#00A95F', fg: '#161616' },
  bourgeon: { label: 'Bourgeon', bg: '#68A532', fg: '#161616' },
  tournesol: { label: 'Tournesol', bg: '#C8AA39', fg: '#161616' },
  'terre-battue': { label: 'Terre battue', bg: '#E4794A', fg: '#161616' },
  glycine: { label: 'Glycine', bg: '#A558A0', fg: '#FFFFFF' },
  'cafe-creme': { label: 'Café crème', bg: '#D1B781', fg: '#161616' },
  gris: { label: 'Gris', bg: '#666666', fg: '#FFFFFF' },
};

export const DSFR_PALETTES = {
  bleu: { label: 'Bleu France', hint: 'Couleur principale de l\'État', cycle: ['bleu-france'] },
  marianne: { label: 'Bleu et rouge', hint: 'Bleu France et Rouge Marianne alternés', cycle: ['bleu-france', 'rouge-marianne'] },
  froid: { label: 'Tons froids', hint: 'Couleurs illustratives bleues et vertes', cycle: ['ecume', 'menthe', 'cumulus', 'emeraude'] },
  illustratif: { label: 'Illustratif', hint: 'Une couleur illustrative par bouton', cycle: ['ecume', 'menthe', 'glycine', 'terre-battue', 'tournesol', 'cumulus'] },
};

/** Chartes graphiques disponibles : couleurs, palettes et fonds proposés. */
export const CHARTES = {
  metropole: { label: 'Métropole de Lyon', hint: 'Rouges et bleu de la Métropole', colors: COLORS, palettes: PALETTES, palette: 'metropole',
    backgrounds: ['#F4F4F6', '#FFFFFF', '#FFF5F5', '#EEF3F3', '#2A3158', '#C00000'] },
  dsfr: { label: 'DSFR (État)', hint: 'Système de design de l\'État', colors: DSFR_COLORS, palettes: DSFR_PALETTES, palette: 'bleu',
    backgrounds: ['#F6F6F6', '#FFFFFF', '#F5F5FE', '#E3E3FD', '#000091', '#161616'] },
};

// Palette équivalente quand on change de charte.
const PALETTE_EQUIV = { metropole: 'bleu', institutionnel: 'bleu', contraste: 'marianne', multicolore: 'illustratif',
  bleu: 'metropole', marianne: 'contraste', froid: 'institutionnel', illustratif: 'multicolore' };

export function paletteFor(charte, palette) {
  const ch = CHARTES[charte] || CHARTES.metropole;
  if (ch.palettes[palette]) { return palette; }
  return ch.palettes[PALETTE_EQUIV[palette]] ? PALETTE_EQUIV[palette] : ch.palette;
}

export const charteOf = cfg => CHARTES[cfg && cfg.charte] || CHARTES.metropole;

/** Couleur d'un bouton : la sienne, ou celle de la palette selon son rang (« Automatique »). */
export function colorOf(button, index, cfg) {
  const ch = charteOf(cfg);
  if (button.color && ch.colors[button.color]) { return ch.colors[button.color]; }
  const cycle = (ch.palettes[cfg.look.palette] || ch.palettes[ch.palette]).cycle;
  return ch.colors[cycle[index % cycle.length]];
}

export function isDark(hex) {
  const n = parseInt(String(hex).slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) < 140;
}

/* ------------------------------------------------------------------ */
/* Icônes (noms Lucide) avec libellés et mots-clés français            */
/* ------------------------------------------------------------------ */

export const ICONS = [
  ['house', 'Accueil', 'maison portail sommaire'],
  ['layout-dashboard', 'Tableau de bord', 'pilotage synthèse kpi'],
  ['gauge', 'Indicateurs', 'compteur performance'],
  ['chart-column', 'Graphique', 'statistiques barres'],
  ['chart-line', 'Évolution', 'courbe tendance'],
  ['chart-pie', 'Répartition', 'camembert'],
  ['table-2', 'Tableau', 'données liste grille'],
  ['database', 'Base de données', 'référentiel'],
  ['file-spreadsheet', 'Tableur', 'excel calcul'],
  ['list-checks', 'Suivi', 'tâches contrôle'],
  ['clipboard-list', 'Inventaire', 'liste recensement'],
  ['kanban', 'Avancement', 'étapes projet'],
  ['square-pen', 'Saisie', 'formulaire modifier écrire'],
  ['file-text', 'Document', 'fichier rapport courrier'],
  ['folder-open', 'Dossier', 'projet classement'],
  ['inbox', 'Demandes', 'réception courrier'],
  ['calendar-days', 'Calendrier', 'planning agenda date'],
  ['clock', 'Horaires', 'heure délai'],
  ['map-pin', 'Lieu', 'adresse carte'],
  ['map', 'Carte', 'plan territoire géographie'],
  ['route', 'Itinéraire', 'trajet voirie'],
  ['building-2', 'Bâtiment', 'immeuble patrimoine'],
  ['landmark', 'Institution', 'métropole mairie collectivité'],
  ['school', 'École', 'éducation collège'],
  ['hospital', 'Santé', 'hôpital soin'],
  ['users', 'Équipe', 'personnes agents rh'],
  ['user', 'Personne', 'profil agent'],
  ['contact', 'Annuaire', 'contacts carnet'],
  ['id-card', 'Fiche', 'identité badge'],
  ['handshake', 'Partenaires', 'accord partenariat'],
  ['mail', 'Courriel', 'email message'],
  ['phone', 'Téléphone', 'appel contact'],
  ['message-square', 'Échanges', 'discussion commentaire'],
  ['megaphone', 'Communication', 'annonce information'],
  ['newspaper', 'Actualités', 'journal presse'],
  ['bell', 'Alertes', 'notification rappel'],
  ['euro', 'Budget', 'finances argent coût'],
  ['wallet', 'Dépenses', 'paiement subvention'],
  ['scale', 'Juridique', 'droit marché règlement'],
  ['shield', 'Sécurité', 'protection risque'],
  ['triangle-alert', 'Attention', 'alerte incident risque'],
  ['circle-check', 'Validé', 'terminé contrôle'],
  ['star', 'Favori', 'important'],
  ['lightbulb', 'Idée', 'innovation'],
  ['target', 'Objectifs', 'cible action'],
  ['book-open', 'Guide', 'mode d\'emploi aide documentation'],
  ['graduation-cap', 'Formation', 'apprendre'],
  ['info', 'Information', 'aide à propos'],
  ['search', 'Recherche', 'chercher trouver'],
  ['download', 'Téléchargement', 'export'],
  ['upload', 'Dépôt', 'import envoyer'],
  ['link', 'Lien', 'raccourci'],
  ['external-link', 'Site externe', 'web internet'],
  ['globe', 'Site web', 'internet portail'],
  ['image', 'Images', 'photo galerie'],
  ['settings', 'Réglages', 'paramètres administration'],
  ['leaf', 'Environnement', 'nature climat'],
  ['trees', 'Espaces verts', 'parc nature arbres'],
  ['recycle', 'Déchets', 'propreté tri'],
  ['droplets', 'Eau', 'assainissement'],
  ['zap', 'Énergie', 'électricité'],
  ['bus', 'Transports', 'mobilité tcl'],
  ['bike', 'Vélo', 'cyclable mobilité'],
  ['train-front', 'Train', 'gare rail'],
  ['car', 'Voirie', 'route voiture stationnement'],
  ['construction', 'Travaux', 'chantier aménagement'],
  ['accessibility', 'Accessibilité', 'handicap'],
  ['heart-handshake', 'Solidarités', 'social aide'],
  ['layout-grid', 'Applications', 'grille outils'],
  ['arrow-right', 'Flèche', 'aller suivant'],
].map(([name, label, keywords]) => ({ name, label, keywords }));

export const ICON_NAMES = new Set(ICONS.map(i => i.name));

const ICON_GUESSES = [
  [/accueil|home|sommaire|portail|hub/i, 'house'],
  [/tableau de bord|pilotage|dashboard|kpi|indicateur|synth[eè]se/i, 'layout-dashboard'],
  [/graph|stat|analyse|tendance/i, 'chart-column'],
  [/[ée]volution|historique/i, 'chart-line'],
  [/r[ée]partition|camembert|ventilation/i, 'chart-pie'],
  [/carte|plan\b|g[ée]o|territoire|commune/i, 'map'],
  [/lieu|adresse|site/i, 'map-pin'],
  [/calendrier|planning|agenda|[ée]ch[ée]ance|r[ée]union/i, 'calendar-days'],
  [/annuaire|contact/i, 'contact'],
  [/[ée]quipe|agent|personne|utilisateur|membre|\brh\b|ressources humaines/i, 'users'],
  [/budget|financ|co[uû]t|d[ée]pense|factur|subvention|paiement|€/i, 'euro'],
  [/march[ée]|juridique|contrat|convention/i, 'scale'],
  [/formulaire|saisie|demande|nouveau|ajout/i, 'square-pen'],
  [/mode d.emploi|aide|guide|documentation|tutoriel|notice/i, 'book-open'],
  [/param[eè]tre|r[ée]glage|config|administration|admin/i, 'settings'],
  [/document|fichier|pi[eè]ce|courrier|rapport/i, 'file-text'],
  [/projet|op[ée]ration|dossier/i, 'folder-open'],
  [/b[aâ]timent|patrimoine|[ée]quipement|logement|copropri/i, 'building-2'],
  [/transport|mobilit|bus|tram/i, 'bus'],
  [/v[ée]lo|cyclable/i, 'bike'],
  [/voirie|route|stationnement/i, 'car'],
  [/travaux|chantier|am[ée]nagement/i, 'construction'],
  [/environnement|nature|climat|biodiversit/i, 'leaf'],
  [/d[ée]chet|propret[ée]/i, 'recycle'],
  [/objectif|cible|action/i, 'target'],
  [/suivi|avancement|validation|contr[oô]le/i, 'list-checks'],
  [/alerte|risque|incident|anomalie/i, 'triangle-alert'],
  [/donn[ée]es|table|liste|inventaire|r[ée]f[ée]rentiel|import/i, 'table-2'],
];

export function guessIcon(name) {
  const found = ICON_GUESSES.find(([re]) => re.test(name || ''));
  return found ? found[1] : 'arrow-right';
}

/** Recherche d'icônes en français (libellé, mots-clés) ou par nom Lucide. */
export function searchIcons(query) {
  const q = normalizeText(query);
  if (!q) { return ICONS; }
  return ICONS.filter(i => normalizeText(`${i.label} ${i.keywords} ${i.name}`).includes(q));
}

function normalizeText(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/* ------------------------------------------------------------------ */
/* Schéma et valeurs par défaut                                        */
/* ------------------------------------------------------------------ */

export function uid(prefix = 'b') {
  return prefix + Math.random().toString(36).slice(2, 9);
}

/** Styles de tuiles proposés ; les anciennes formes « liste » et « pastille » deviennent des blocs icône. */
export const SHAPES = ['tuile', 'douce', 'aplat', 'bloc'];
const SHAPE_ALIASES = { liste: 'bloc', pastille: 'bloc', plein: 'aplat' };

export function defaultConfig() {
  return {
    version: VERSION,
    charte: 'metropole',
    header: { style: 'sobre', title: 'Portail du document', subtitle: '', logo: '', align: 'left' },
    background: { type: 'default', color: '#F4F4F6', image: '', veil: 0.4, tone: 'dark', fit: 'cover' },
    look: { shape: 'tuile', palette: 'metropole', size: 'm', align: 'left', columns: 0 },
    sections: [],
    footer: '',
    numbering: true,
    docUrl: '',
    showEditButton: true,
  };
}

export function newButton(extra = {}) {
  return { id: uid('b'), label: '', description: '', icon: 'arrow-right', color: 'auto', kind: 'page', page: null, url: '', newTab: true, ...extra };
}

export function newSection(extra = {}) {
  return { id: uid('s'), title: '', buttons: [], ...extra };
}

const pick = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback);
const str = v => (typeof v === 'string' ? v : '');
const num = (v, min, max, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

// Icônes de la V1 → Lucide.
const V1_ICONS = {
  accueil: 'house', tableau: 'table-2', graphique: 'chart-column', camembert: 'chart-pie', pilotage: 'gauge',
  document: 'file-text', dossier: 'folder-open', liste: 'list-checks', formulaire: 'square-pen', calendrier: 'calendar-days',
  horloge: 'clock', carte: 'map-pin', batiment: 'building-2', personnes: 'users', personne: 'user', mail: 'mail',
  telephone: 'phone', euro: 'euro', recherche: 'search', info: 'info', alerte: 'triangle-alert', valide: 'circle-check',
  etoile: 'star', idee: 'lightbulb', cible: 'target', livre: 'book-open', telechargement: 'download', lien: 'link',
  externe: 'external-link', reglages: 'settings', nature: 'leaf', transport: 'bus', grille: 'layout-grid', fleche: 'arrow-right',
};

function normalizeButton(b, colors) {
  const icon = str(b.icon);
  return {
    id: str(b.id) || uid('b'),
    label: str(b.label),
    description: str(b.description),
    icon: V1_ICONS[icon] || icon,
    color: colors[b.color] ? b.color : 'auto',
    kind: pick(b.kind, ['page', 'url'], 'page'),
    page: Number(b.page) > 0 ? Number(b.page) : null,
    url: str(b.url),
    newTab: b.newTab !== false,
  };
}

/** Convertit une configuration V1 (boutons à plat avec « group ») en V2. */
function migrateV1(raw) {
  const sections = [];
  const byTitle = new Map();
  for (const b of Array.isArray(raw.buttons) ? raw.buttons : []) {
    const title = str(b && b.group).trim();
    if (!byTitle.has(title)) {
      const s = newSection({ title });
      byTitle.set(title, s);
      sections.push(s);
    }
    byTitle.get(title).buttons.push(b);
  }
  const hd = raw.header || {}, bg = raw.background || {}, ly = raw.layout || {};
  return {
    header: {
      style: hd.show === false ? 'none' : ({ clair: 'sobre', carte: 'encadre', bandeau: 'bandeau' }[hd.style] || 'sobre'),
      title: hd.title, subtitle: hd.subtitle, logo: hd.logo, align: hd.align,
    },
    background: { type: bg.type === 'none' ? 'default' : bg.type, color: bg.color, image: bg.image, veil: bg.veil, tone: bg.veilColor, fit: bg.fit },
    look: { shape: ({ plein: 'aplat' }[ly.style] || ly.style), size: ly.size, align: ly.align, columns: ly.columns, palette: 'metropole' },
    sections,
    footer: raw.footer,
    numbering: ly.numbering,
    docUrl: raw.docUrl,
    showEditButton: raw.showEditButton,
  };
}

/** Complète et assainit une configuration (options Grist, import JSON, V1…). */
export function normalize(raw) {
  const d = defaultConfig();
  if (!raw || typeof raw !== 'object') { return d; }
  if (!raw.version || raw.version < 2 || (!raw.sections && Array.isArray(raw.buttons))) { raw = migrateV1(raw); }
  const hd = raw.header || {}, bg = raw.background || {}, lk = raw.look || {};
  const charte = pick(raw.charte, Object.keys(CHARTES), 'metropole');
  const ch = CHARTES[charte];
  return {
    version: VERSION,
    charte,
    header: {
      style: pick(hd.style, ['none', 'sobre', 'encadre', 'bandeau'], d.header.style),
      title: str(hd.title),
      subtitle: str(hd.subtitle),
      logo: str(hd.logo),
      align: pick(hd.align, ['left', 'center'], 'left'),
    },
    background: {
      type: pick(bg.type, ['default', 'color', 'image'], 'default'),
      color: /^#[0-9a-f]{6}$/i.test(bg.color) ? bg.color : d.background.color,
      image: str(bg.image),
      veil: num(bg.veil, 0, 0.9, d.background.veil),
      tone: pick(bg.tone, ['dark', 'light'], 'dark'),
      fit: pick(bg.fit, ['cover', 'contain'], 'cover'),
    },
    look: {
      shape: pick(SHAPE_ALIASES[lk.shape] || lk.shape, SHAPES, 'tuile'),
      palette: paletteFor(charte, lk.palette),
      size: pick(lk.size, ['s', 'm', 'l'], 'm'),
      align: pick(lk.align, ['left', 'center'], 'left'),
      columns: Math.round(num(lk.columns, 0, 6, 0)),
    },
    sections: (Array.isArray(raw.sections) ? raw.sections : []).filter(s => s && typeof s === 'object').map(s => ({
      id: str(s.id) || uid('s'),
      title: str(s.title),
      buttons: (Array.isArray(s.buttons) ? s.buttons : []).filter(b => b && typeof b === 'object').map(b => normalizeButton(b, ch.colors)),
    })),
    footer: str(raw.footer),
    numbering: raw.numbering !== false,
    docUrl: str(raw.docUrl),
    showEditButton: raw.showEditButton !== false,
  };
}

export function allButtons(config) {
  return config.sections.flatMap(s => s.buttons);
}

/* ------------------------------------------------------------------ */
/* Liens                                                               */
/* ------------------------------------------------------------------ */

/** N'accepte que des liens web, courriel ou téléphone ; complète « www.exemple.fr ». */
export function safeUrl(url) {
  let value = str(url).trim();
  if (!value) { return null; }
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    if (!/^[\w-]+(\.[\w-]+)+([/?#:].*)?$/.test(value)) { return null; }
    value = 'https://' + value;
  }
  try {
    const u = new URL(value);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(u.protocol) ? u.href : null;
  } catch (e) {
    return null;
  }
}

/** Nettoie une adresse de document collée par l'utilisateur (retire /p/…, la requête, etc.). */
export function cleanDocUrl(url) {
  try {
    const u = new URL(str(url).trim());
    if (!/^https?:$/.test(u.protocol)) { return null; }
    return u.origin + u.pathname.replace(/\/p\/\d+.*$/, '').replace(/\/+$/, '');
  } catch (e) {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Modèles prêts à l'emploi                                            */
/* ------------------------------------------------------------------ */

// Fond par défaut du modèle « Accueil visuel » : silhouette lyonnaise au crépuscule (SVG léger).
export const DEFAULT_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">' +
  '<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A3158"/>' +
  '<stop offset=".62" stop-color="#8B2A4A"/><stop offset="1" stop-color="#E0603A"/></linearGradient></defs>' +
  '<rect width="1600" height="900" fill="url(#s)"/>' +
  '<path d="M0 640 C180 560 330 520 470 545 C560 560 610 600 700 640 L700 900 L0 900Z" fill="#23284A"/>' +
  '<path d="M300 545 h26 v-60 l18-30 18 30 v60 h40 v-40 h16 v-50 l10-18 10 18 v50 h16 v40 h26 v40 H300Z" fill="#1B1F3B"/>' +
  '<path d="M640 900 V610 h50 V560 h40 v-70 h46 v120 h30 V470 a35 35 0 0 1 70 0 V610 h40 V520 h60 v90 h50 V560 h70 v50 h40 ' +
  'V600 h60 v-60 h50 v60 h70 V580 h40 V900Z" fill="#1B1F3B"/>' +
  '<rect y="760" width="1600" height="140" fill="#20325A"/>' +
  '<path d="M0 790 H1600 M120 830 H560 M760 860 H1240 M1300 815 H1560" stroke="#4C6A9C" stroke-width="3" opacity=".6"/>' +
  '</svg>');

const LINKS = [
  { label: 'Site de la Métropole', description: 'grandlyon.com', icon: 'globe', color: 'bleu', kind: 'url', url: 'https://www.grandlyon.com' },
  { label: 'Données ouvertes', description: 'data.grandlyon.com', icon: 'database', color: 'canard', kind: 'url', url: 'https://data.grandlyon.com' },
];

const THEMES = [
  ['Pilotage', /tableau de bord|pilotage|synth|indicateur|budget|financ|suivi|planning|kpi|bilan/i],
  ['Ressources', /mode d.emploi|aide|guide|documentation|annuaire|contact|param|r[ée]glage|admin|ressource/i],
];

function pageButton(p) {
  return newButton({ kind: 'page', page: p.viewRef, icon: guessIcon(p.name) });
}

export const TEMPLATES = [
  {
    id: 'sommaire',
    label: 'Sommaire automatique',
    description: 'Un bouton pour chaque page du document.',
    build: pages => ({
      header: { style: 'sobre', title: 'Sommaire' },
      look: { shape: 'tuile', palette: 'metropole' },
      sections: [newSection({ buttons: pages.map(pageButton) })],
    }),
  },
  {
    id: 'portail',
    label: 'Portail par thèmes',
    description: 'Pages et liens rangés en rubriques.',
    build: pages => {
      const groups = new Map([['Pilotage', []], ['Données', []], ['Ressources', []]]);
      for (const p of pages) {
        const theme = (THEMES.find(([, re]) => re.test(p.name)) || ['Données'])[0];
        groups.get(theme).push(pageButton(p));
      }
      const sections = [...groups].filter(([, b]) => b.length).map(([title, buttons]) => newSection({ title, buttons }));
      sections.push(newSection({ title: 'Liens utiles', buttons: LINKS.map(l => newButton(l)) }));
      return {
        header: { style: 'bandeau', title: 'Portail du document', subtitle: 'Accédez rapidement aux pages et aux ressources utiles.' },
        look: { shape: 'tuile', palette: 'metropole' },
        sections,
      };
    },
  },
  {
    id: 'visuel',
    label: 'Accueil visuel',
    description: 'Une image de fond et de grands boutons.',
    build: pages => ({
      header: { style: 'sobre', title: 'Bienvenue', subtitle: 'Que souhaitez-vous consulter ?', align: 'center' },
      background: { type: 'image', image: DEFAULT_IMAGE, veil: 0.25, tone: 'dark' },
      look: { shape: 'aplat', palette: 'multicolore', align: 'center', size: 'l' },
      sections: [newSection({ buttons: pages.slice(0, 6).map(pageButton) })],
    }),
  },
  {
    id: 'raccourcis',
    label: 'Barre de raccourcis',
    description: 'Une ligne compacte, à poser au-dessus d\'un tableau.',
    build: pages => ({
      header: { style: 'none' },
      look: { shape: 'bloc', palette: 'metropole', size: 's' },
      sections: [newSection({ buttons: pages.slice(0, 8).map(pageButton) })],
    }),
  },
];

/** Construit une configuration complète à partir d'un modèle et des pages du document. */
export function fromTemplate(id, pages, base = defaultConfig()) {
  const t = TEMPLATES.find(x => x.id === id);
  const partial = t ? t.build(pages) : {};
  return normalize({
    ...base,
    ...partial,
    header: { ...defaultConfig().header, ...partial.header },
    background: { ...defaultConfig().background, ...partial.background },
    look: { ...defaultConfig().look, ...partial.look },
    sections: partial.sections || [],
    version: VERSION,
  });
}

/** Pages d'exemple pour les miniatures quand le document n'en fournit pas. */
export const SAMPLE_PAGES = [
  { viewRef: 1, name: 'Tableau de bord' }, { viewRef: 2, name: 'Projets' }, { viewRef: 3, name: 'Budget' },
  { viewRef: 4, name: 'Carte des sites' }, { viewRef: 5, name: 'Annuaire' }, { viewRef: 6, name: 'Mode d\'emploi' },
];
