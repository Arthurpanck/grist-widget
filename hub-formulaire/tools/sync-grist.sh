#!/usr/bin/env bash
# Copie, sans modification (hormis un libellé traduit, voir plus bas), le code de grist-core que le
# hub réutilise : l'éditeur de formulaires (modèle de blocs, glisser-déposer, menus, paragraphes
# Markdown, sections, colonnes, styles), le rendu des formulaires publiés, et tout ce qu'ils
# importent (commandes, traductions, infobulles, thème, menus…), ainsi que les traductions de Grist.
#
#   bash tools/sync-grist.sh [chemin/vers/grist-core]
#
# Sans argument, grist-core est récupéré (clone partiel) au commit indiqué ci-dessous.
# Seuls 4 fichiers ne sont pas copiés, car liés au document Grist ouvert : src/shims/ les fournit
# (voir README.md).
set -euo pipefail

GRIST_CORE_COMMIT=cc110ed0fec59e63a7d4019c2e50dcea6c7a8421

# Points d'entrée : tout ce qu'ils importent est copié aussi.
ENTRIES=(
  app/client/components/Forms/Model
  app/client/components/Forms/Editor
  app/client/components/Forms/Paragraph
  app/client/components/Forms/Section
  app/client/components/Forms/Columns
  app/client/components/Forms/styles
  app/client/components/FormRenderer
  app/client/components/commands
  app/client/lib/localization
  app/client/ui2018/menus
  app/client/ui2018/cssVars
  app/client/ui2018/buttons
  app/client/ui2018/icons
  app/client/ui/inputs
  app/common/ThemePrefs
  app/common/themes/GristLight
  app/common/gutil
)
# Fichiers liés au document Grist (colonnes, enregistrements, connexion au serveur) : fournis par src/shims.
STOPS=(
  app/client/components/Forms/FormView
  app/client/components/Forms/Field
  app/client/components/Forms/Menu
  app/client/components/Forms/elements
)

HERE="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$HERE/src/grist"
SRC="${1:-}"

if [ -z "$SRC" ]; then
  SRC="$(mktemp -d)/grist-core"
  trap 'rm -rf "$(dirname "$SRC")"' EXIT
  git clone --quiet --filter=blob:none --no-checkout https://github.com/gristlabs/grist-core.git "$SRC"
  git -C "$SRC" sparse-checkout set --no-cone app/client app/common app/plugin \
    static/icons/icons.css assets/locales/fr.client.json assets/locales/en.client.json LICENSE.txt package.json
  git -C "$SRC" checkout --quiet "$GRIST_CORE_COMMIT"
fi

rm -rf "$OUT" && mkdir -p "$OUT"
join() { local IFS=,; echo "$*"; }
COUNT=$(node "$HERE/tools/copy-closure.mjs" "$SRC" "$OUT" "$(join "${ENTRIES[@]}")" "$(join "${STOPS[@]}")")

# Seule retouche : un libellé écrit en dur en anglais dans Columns.ts (« Column 2 »), traduit ici.
sed -i 's/dom("span", `Column `,/dom("span", `Colonne `,/' "$OUT/app/client/components/Forms/Columns.ts"
grep -q 'Colonne ' "$OUT/app/client/components/Forms/Columns.ts" || { echo "Retouche de Columns.ts impossible" >&2; exit 1; }

mkdir -p "$HERE/public" "$HERE/locales"
cp "$SRC/static/icons/icons.css" "$HERE/public/grist-icons.css"
cp "$SRC/assets/locales/fr.client.json" "$SRC/assets/locales/en.client.json" "$HERE/locales/"
cp "$SRC/LICENSE.txt" "$OUT/LICENSE.txt"
echo "$GRIST_CORE_COMMIT" > "$OUT/COMMIT"

# Mêmes versions de dépendances que grist-core, pour celles qu'importent les fichiers copiés.
node -e '
  const fs = require("fs");
  const grist = require(process.argv[1]);
  const all = { ...grist.dependencies, ...grist.devDependencies };
  const pkg = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const used = new Set();
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
    const p = d + "/" + e.name;
    if (e.isDirectory()) { return walk(p); }
    const src = fs.readFileSync(p, "utf8").replace(/^import type[^;]*;/gm, "");
    for (const m of src.matchAll(/(?:from\s+|^import\s+|require\()["\x27]([^."\x27][^"\x27]*)["\x27]/gm)) {
      const name = m[1].startsWith("@") ? m[1].split("/").slice(0, 2).join("/") : m[1].split("/")[0];
      if (name !== "app" && all[name]) { used.add(name); }
    }
  });
  walk(process.argv[3]);
  pkg.dependencies = Object.fromEntries([...used].sort().map(n => [n, all[n]]));
  fs.writeFileSync(process.argv[2], JSON.stringify(pkg, null, 2) + "\n");
' "$SRC/package.json" "$HERE/package.json" "$OUT"

echo "grist-core@${GRIST_CORE_COMMIT:0:8} : $COUNT fichiers copiés dans src/grist/ ($(find "$OUT" -name '*.[tj]s' -exec cat {} + | wc -l) lignes), un libellé traduit."
echo "Dépendances alignées sur grist-core dans package.json : lancez npm install."
