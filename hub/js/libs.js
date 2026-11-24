/**
 * Librairies externes, copiées dans ../vendor/ par tools/vendor.sh (versions : vendor/VERSIONS.md).
 * Tout est servi par GitHub Pages avec le widget : aucun CDN externe n'est nécessaire.
 */
export const LUCIDE = new URL('../vendor/lucide', import.meta.url).href;

export { createApp, reactive, computed, watch, nextTick, ref, onMounted } from '../vendor/vue.esm-browser.prod.js';
export { default as Sortable } from '../vendor/sortable.core.esm.js';
export { registerIconLibrary } from '../vendor/webawesome/webawesome.loader.js';
import '../vendor/webawesome/translations/fr.js';
