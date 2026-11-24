/* global window */
// Faux grist-plugin-api pour les tests : sert un document fictif (pages, formulaires, options du
// widget) et note ce que le widget enregistre. Le test décrit le document dans window.top.__mock.
(function() {
  const top = window.top;
  const mock = top.__mock || {};
  let options = mock.options ? JSON.parse(JSON.stringify(mock.options)) : null;
  let onOptions = null;
  const settings = { accessLevel: mock.access || "full" };
  const tables = mock.tables;

  top.__savedOptions = options;
  window.grist = {
    ready(config) {
      top.__ready = config;
    },
    onOptions(callback) {
      onOptions = callback;
      setTimeout(() => callback(options, settings), 30);
    },
    async setOption(key, value) {
      options = { ...options, [key]: value };
      top.__savedOptions = JSON.parse(JSON.stringify(options));
      setTimeout(() => onOptions && onOptions(options, settings), 10);
    },
    docApi: {
      async fetchTable(tableId) {
        if (settings.accessLevel !== "full") {
          throw new Error("Access denied");
        }
        return tables[tableId];
      },
      async getAccessToken() {
        if (settings.accessLevel !== "full") {
          throw new Error("Access denied");
        }
        return { token: "t", baseUrl: "https://grist.test/o/docs/api/docs/DOC123", ttlMsecs: 1000 };
      },
    },
  };
})();
