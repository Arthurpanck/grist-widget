/**
 * Mémorisation, dans le navigateur de chaque utilisateur, des filtres choisis et des blocs repliés.
 * Le stockage peut être indisponible (navigation privée, réglages du navigateur) : tout échec est ignoré.
 */

const VERSION = 1;

export function load(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) { return null; }
    const v = JSON.parse(raw);
    return v && v.v === VERSION ? v : null;
  } catch (e) {
    return null;
  }
}

export function save(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify({ v: VERSION, ...value }));
  } catch (e) {
    // Stockage plein ou interdit : les filtres ne seront simplement pas retrouvés.
  }
}
