/**
 * Librairies externes, copiées dans ../vendor/ par tools/vendor.sh (versions : vendor/VERSIONS.md).
 * Tout est servi par GitHub Pages avec le widget : aucun CDN externe n'est nécessaire.
 */
export const LUCIDE_SPRITE = new URL('../vendor/lucide/sprite.svg', import.meta.url).href;
export const LUCIDE_TAGS = new URL('../vendor/lucide/tags.json', import.meta.url).href;

export { createApp, reactive, computed, watch, nextTick, ref, onMounted } from '../vendor/vue.esm-browser.prod.js';
export { default as Sortable } from '../vendor/sortable.core.esm.js';
export { registerIconLibrary } from '../vendor/webawesome/webawesome.loader.js';
import '../vendor/webawesome/translations/fr.js';
