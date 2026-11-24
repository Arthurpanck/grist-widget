/**
 * Échanges avec Grist : options du widget, liste des pages, adresse du document.
 * Hors de Grist (page ouverte directement), `available` vaut false et l'application
 * affiche une démonstration.
 */

const OPTION_KEY = 'hub';
const params = new URLSearchParams(window.location.search);
const grist = window.grist;

export const available = Boolean(grist) && window.parent !== window;
export const readonly = params.get('readonly') === 'true';

/** Démarre la liaison ; `onConfig(raw, accessLevel)` est appelé à chaque changement d'options. */
export function connect({ onConfig, onEdit }) {
  if (!available) { return; }
  grist.ready({ requiredAccess: 'full', onEditOptions: onEdit });
  grist.onOptions((options, settings) => onConfig(options ? options[OPTION_KEY] : null, settings && settings.accessLevel));
}

export function save(config) {
  return grist.setOption(OPTION_KEY, config);
}

function rows(table) {
  return table.id.map((id, i) => Object.fromEntries(Object.keys(table).map(k => [k, table[k][i]])));
}

/** Pages du document, dans l'ordre du menu, avec un repère sur celles qui contiennent un hub. */
export async function loadPages() {
  const [pages, views, sections] = await Promise.all(
    ['_grist_Pages', '_grist_Views', '_grist_Views_section'].map(t => grist.docApi.fetchTable(t)));
  const names = new Map(rows(views).map(v => [v.id, v.name]));
  const hubViews = new Set(rows(sections)
    .filter(s => s.parentKey === 'custom' && /\/hub\/|hub\.js|hub\\*":/.test(s.options || ''))
    .map(s => s.parentId));
  return rows(pages)
    .sort((a, b) => a.pagePos - b.pagePos)
    .map(p => ({ viewRef: p.viewRef, name: names.get(p.viewRef), depth: p.indentation || 0, isHub: hubViews.has(p.viewRef) }))
    .filter(p => p.name);
}

/** Adresse de base du document (…/doc/<id>), déduite du jeton d'accès de l'API. */
export async function loadDocBase() {
  const token = await grist.docApi.getAccessToken({ readOnly: true });
  const m = /^(.*?)\/api\/docs\/([^/?#]+)/.exec(token.baseUrl || '');
  return m ? `${m[1]}/doc/${m[2]}` : null;
}

/** Suit le thème clair / sombre de Grist. */
export function watchAppearance(callback) {
  const html = document.documentElement;
  const read = () => callback(html.getAttribute('data-grist-appearance') === 'dark');
  new MutationObserver(read).observe(html, { attributes: true, attributeFilter: ['data-grist-appearance'] });
  read();
}
