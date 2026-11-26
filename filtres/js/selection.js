/**
 * Lignes transmises aux widgets reliés (grist.setSelectedRows).
 *
 * Comportement de Grist dont il faut tenir compte :
 * - chaque nouvelle liste ramène le curseur du tableau relié sur sa première ligne ;
 * - passer de « aucune liste » (null) à une liste envoie ce curseur sur la ligne d'ajout, tout en bas ;
 * - au-delà de 500 identifiants, le tableau relié affiche « Toute la donnée n'est pas visible »,
 *   même si toutes les lignes retenues sont bien affichées (le filtre est appliqué avant la coupure) ;
 * - un widget relié par une colonne de référence (par exemple des tâches reliées par leur colonne
 *   « Projet ») n'affiche, quand il reçoit null, que les lignes liées à la ligne courante du widget.
 *
 * D'où les règles suivantes, qui reproduisent le comportement des filtres natifs de Grist :
 * - sans filtre actif, null est transmis : le tableau relié affiche tout, y compris les lignes ajoutées ;
 *   sauf si un widget est relié par une colonne de référence : la liste de toutes les lignes est alors
 *   transmise, avec 0 pour garder ses lignes sans référence ;
 * - avec un filtre, la liste réserve les identifiants des prochaines lignes créées : une ligne ajoutée
 *   dans le tableau filtré reste affichée ;
 * - une modification des données ne renvoie pas de liste : une ligne modifiée qui ne correspond plus
 *   aux filtres reste affichée (Grist fait de même) ; si des lignes correspondent désormais aux
 *   filtres, le panneau propose d'actualiser.
 * Une nouvelle liste n'est donc calculée qu'après une action de l'utilisateur sur les filtres.
 */

/** Nombre d'identifiants réservés aux lignes qui seront créées dans le tableau filtré. */
export const RESERVE = 20;
/** Au-delà, Grist signale (à tort pour une table ordinaire) que des données ne sont pas affichées. */
export const GRIST_LIST_LIMIT = 500;

export class Selection {
  constructor() {
    this.sent = null;       // Set des lignes transmises, ou null si aucun filtre n'est transmis
    this.anchor = 0;        // plus grand identifiant au moment de l'envoi
    this.signature = 'null';
  }

  /**
   * Après une action de l'utilisateur : { rows } à transmettre (liste ou null), ou undefined si rien
   * ne change. `ids` : toutes les lignes ; `result` : sortie de evaluate().
   * `activated` est vrai quand on passe de null à une liste (le curseur du tableau est alors à replacer).
   */
  fresh(result, ids, { listWhenInactive = false } = {}) {
    if (!result.active && !listWhenInactive) {
      if (this.signature === 'null') { return undefined; }
      this.signature = 'null';
      this.sent = null;
      return { rows: null, activated: false };
    }
    let anchor = 0;
    for (const id of ids) { if (id > anchor) { anchor = id; } }
    const rows = result.active ? result.rowIds : ids;
    const signature = `${result.active ? 'f' : 'all'}|${anchor}|${rows.length}|${rows.join(',')}`;
    if (signature === this.signature) { return undefined; }
    const activated = this.signature === 'null';
    this.signature = signature;
    this.sent = new Set(rows);
    this.anchor = anchor;
    const list = rows.slice();
    for (let id = anchor + 1; id <= anchor + RESERVE; id++) { list.push(id); }
    if (!result.active) { list.push(0); }
    return { rows: list, activated };
  }

  /**
   * Après un changement de données : nombre de lignes qui correspondent aux filtres mais ne sont pas
   * affichées (modifiées depuis l'envoi, ou créées au-delà de la réserve).
   */
  missing(result, ids) {
    if (!this.sent) { return 0; }
    let n = 0;
    for (const id of (result.active ? result.rowIds : ids)) {
      if (!this.sent.has(id) && (id <= this.anchor || id > this.anchor + RESERVE)) { n++; }
    }
    return n;
  }

  /** Oublie la dernière liste : la prochaine sera transmise même si elle est identique. */
  reset() {
    if (this.signature !== 'null') { this.signature = 'stale'; }
  }
}

/**
 * Vrai si un widget est relié au widget Filtres par une colonne de référence (des tâches reliées par
 * leur colonne « Projet », par exemple), d'après la table `_grist_Views_section` du document.
 * Le widget ne connaît pas son numéro de section : il se reconnaît à l'identifiant de ses réglages
 * enregistrés (`configId`) ; à défaut, tous les widgets Filtres de la table (même adresse) comptent.
 */
export function refLinked(sections, tableRef, { url, configId, optionKey }) {
  if (!sections || !sections.id || !tableRef) { return false; }
  const path = new URL(url).pathname;
  const filtres = [], same = [];
  sections.id.forEach((id, k) => {
    if (sections.parentKey[k] !== 'custom' || sections.tableRef[k] !== tableRef) { return; }
    try {
      const custom = JSON.parse(JSON.parse(sections.options[k] || '{}').customView || '{}');
      if (!custom.url || new URL(custom.url, url).pathname !== path) { return; }
      filtres.push(id);
      const saved = custom.widgetOptions && custom.widgetOptions[optionKey];
      if (configId && saved && saved.id === configId) { same.push(id); }
    } catch (e) { /* options illisibles : section ignorée */ }
  });
  const mine = new Set(same.length ? same : filtres);
  return sections.id.some((id, k) => mine.has(sections.linkSrcSectionRef[k]) && Boolean(sections.linkTargetColRef[k]));
}
