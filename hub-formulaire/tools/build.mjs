// Construit dist/hub.js : les imports « app/… » se résolvent d'abord dans src/shims (les 4 fichiers
// liés au document Grist), puis dans src/grist (code de grist-core copié sans modification).
//
// Le code de Grist charge certaines parties à la demande, par des imports dynamiques regroupés dans
// app/client/lib/imports.js : pages d'administration et de facturation, document complet, éditeur
// de code, graphiques, calendrier, formules mathématiques… Le hub ne passe jamais par ces chemins : ces modules sont remplacés par des
// modules vides au lieu d'être embarqués.
import { build } from "esbuild";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOTS = [join(ROOT, "src/shims"), join(ROOT, "src/grist")];
const ON_DEMAND = /^(ace-builds|marked-katex-extension|katex|plotly\.js-basic-dist|@toast-ui\/calendar|moment-timezone)(\/|$)/;
const emptied = new Set();

const gristPaths = {
  name: "grist-paths",
  setup(b) {
    b.onResolve({ filter: /^app\// }, (args) => {
      for (const root of ROOTS) {
        for (const ext of [".ts", ".js"]) {
          const file = join(root, args.path + ext);
          if (existsSync(file)) { return { path: file }; }
        }
      }
      emptied.add(args.path);
      return { path: args.path, namespace: "a-la-demande" };
    });
    b.onResolve({ filter: ON_DEMAND }, (args) => { emptied.add(args.path); return { path: args.path, namespace: "a-la-demande" }; });
    b.onLoad({ filter: /.*/, namespace: "a-la-demande" }, () => ({ contents: "module.exports = {};", loader: "js" }));
  },
};

await build({
  entryPoints: [join(ROOT, "src/hub/main.ts")],
  bundle: true,
  format: "iife",
  target: "es2020",
  minify: process.env.DEV !== "1",
  sourcemap: process.env.DEV === "1",
  outfile: join(ROOT, "dist/hub.js"),
  plugins: [gristPaths],
  // Mêmes options TypeScript que grist-core (décorateurs « experimental »).
  tsconfig: join(ROOT, "tsconfig.json"),
  // Comme le bundler de Grist : version ESM des paquets (popper.js, utilisé par les menus popweasel).
  mainFields: ["module", "main"],
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
});
console.log(`Chargés à la demande par Grist, non embarqués (${emptied.size}) : ${[...emptied].sort().join(", ")}`);
