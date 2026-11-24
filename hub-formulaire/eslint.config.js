// Règles de style de Grist (src/grist/eslint.config.shared.js, copié de grist-core), appliquées au
// code du hub. Seuls les chemins changent : Grist ne vérifie que ses dossiers app/, test/…, et le
// code copié de Grist (src/grist) n'est pas vérifié ici.
const { makeConfig } = require("./src/grist/eslint.config.shared.js");

const isIgnoreList = config => Object.keys(config).every(key => key === "basePath" || key === "ignores");

module.exports = [
  { ignores: ["dist/", "node_modules/", "src/grist/", "locales/", "public/"] },
  ...makeConfig({ projectRoot: __dirname, lintExt: false })
    .filter(config => !isIgnoreList(config))
    .map(({ ignores, ...config }) => config),
];
