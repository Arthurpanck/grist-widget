/**
 * Librairies externes, versions épinglées (un seul endroit à modifier pour les mettre à jour).
 * Toutes viennent de jsDelivr : un seul domaine à autoriser sur un réseau filtré.
 */
const CDN = 'https://cdn.jsdelivr.net/npm';

export const WEBAWESOME = `${CDN}/@awesome.me/webawesome@3.14.0/dist-cdn`;
export const LUCIDE = `${CDN}/lucide-static@1.70.0/icons`;

export { createApp, reactive, computed, watch, nextTick, ref, onMounted } from 'https://cdn.jsdelivr.net/npm/vue@3.5.45/dist/vue.esm-browser.prod.js';
export { default as Sortable } from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.7/modular/sortable.core.esm.js';
export { registerIconLibrary } from 'https://cdn.jsdelivr.net/npm/@awesome.me/webawesome@3.14.0/dist-cdn/webawesome.loader.js';
import 'https://cdn.jsdelivr.net/npm/@awesome.me/webawesome@3.14.0/dist-cdn/translations/fr.js';
