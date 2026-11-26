/* global window */
// Faux grist-plugin-api pour les tests : sert une table fictive et note ce que le widget transmet
// (lignes retenues, réglages). Le test décrit le document dans window.top.__mock.
(function() {
  const top = window.top;
  const mock = top.__mock;
  let options = mock.options ? JSON.parse(JSON.stringify(mock.options)) : null;
  const settings = { accessLevel: mock.access || 'full', linking: { asTarget: null, asSource: mock.linked !== false } };
  const listeners = [];
  let onOptions = null;
  top.__selected = [];
  top.__savedOptions = options;

  function send(msg) { listeners.forEach(cb => cb(msg)); }
  top.__dataChanged = () => send({ tableId: mock.tableId, dataChange: true });

  window.grist = {
    ready(config) {
      top.__ready = config;
      setTimeout(() => {
        onOptions && onOptions(options, settings);
        // Sans accès accordé, Grist n'envoie pas les données.
        if (settings.accessLevel !== 'none') { send({ tableId: mock.tableId, dataChange: true }); }
      }, 20);
    },
    on(event, cb) { if (event === 'message') { listeners.push(cb); } },
    onOptions(cb) { onOptions = cb; },
    async fetchSelectedTable(opts) {
      top.__fetchOptions = opts;
      return JSON.parse(JSON.stringify(top.__mock.data));
    },
    async setSelectedRows(rows) { top.__selected.push(rows); },
    async setOption(key, value) {
      options = { ...options, [key]: value };
      top.__savedOptions = JSON.parse(JSON.stringify(options));
      setTimeout(() => onOptions && onOptions(options, settings), 10);
    },
    docApi: {
      async getDocName() {
        if (settings.accessLevel === 'none') { throw new Error('Access not granted'); }
        return 'DOC123';
      },
      async fetchTable(tableId) {
        if (settings.accessLevel !== 'full') { throw new Error('Access denied'); }
        return mock.tables[tableId];
      },
    },
  };
})();
