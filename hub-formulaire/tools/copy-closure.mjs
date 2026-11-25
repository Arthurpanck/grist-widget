// Copie, sans modification, des fichiers de grist-core et de tout ce qu'ils importent (statiquement).
//   node tools/copy-closure.mjs <grist-core> <destination> <entrées séparées par des virgules> <arrêts>
// Les imports de type (« import type ») et les imports dynamiques (« import(...) », chargés à la
// demande par Grist : pages d'administration, document, éditeur de code, graphiques…) ne sont pas
// suivis ; le hub n'emprunte jamais ces chemins (voir tools/build.mjs).
// Les « arrêts » sont fournis par src/shims (fichiers liés au document Grist, remplacés ou adaptés).
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const [root, out, entries, stops = ""] = process.argv.slice(2);
const stop = new Set(stops.split(",").filter(Boolean));
const seen = new Set();
const IMPORT = /(?:import|export)[^'"]*?from\s+["']([^"']+)["']|^import\s+["']([^"']+)["']|require\(["']([^"']+)["']\)/gm;

function resolve(mod) {
  for (const ext of [".ts", ".js", "/index.ts"]) {
    const file = join(root, mod + ext);
    if (existsSync(file)) { return file; }
  }
  return null;
}

function visit(mod) {
  if (seen.has(mod) || stop.has(mod)) { return; }
  const file = resolve(mod);
  if (!file) { return; }
  seen.add(mod);
  const dest = join(out, relative(root, file));
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(file, dest);
  const src = readFileSync(file, "utf8").replace(/^import type[^;]*;/gm, "");
  for (const m of src.matchAll(IMPORT)) {
    const dep = m[1] || m[2] || m[3];
    if (dep.startsWith("app/")) {
      visit(dep);
    } else if (dep.startsWith(".")) {
      visit(join(dirname(mod), dep));
    }
  }
}

entries.split(",").forEach(visit);
console.log(seen.size);
