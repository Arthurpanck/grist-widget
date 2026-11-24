// Construit dist/hub.js : les imports « app/… » se résolvent d'abord dans src/shims (cales et
// fichiers adaptés), puis dans src/grist (fichiers de grist-core copiés sans modification).
import { build } from "esbuild";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOTS = [join(ROOT, "src/shims"), join(ROOT, "src/grist")];

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
      return { errors: [{ text: `Module introuvable : ${args.path}` }] };
    });
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
  // Comme le bundler de Grist : version ESM des paquets (popper.js, utilisé par les menus popweasel).
  mainFields: ["module", "main"],
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
});
