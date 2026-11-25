#!/usr/bin/env bash
# Copie, sans modification (hormis les retouches de tools/grist.patch), le code de grist-core que le
# hub réutilise : l'éditeur de formulaires (modèle de blocs, glisser-déposer, menus, paragraphes
# Markdown, sections, colonnes, styles), le rendu des formulaires publiés, et tout ce qu'ils
# importent (commandes, traductions, infobulles, thème, menus…), ainsi que les traductions de Grist.
#
#   bash tools/sync-grist.sh [chemin/vers/grist-core]
#
# Sans argument, grist-core est récupéré (clone partiel) au commit indiqué ci-dessous.
# Les fichiers liés au document Grist ouvert ne sont pas copiés : src/shims/ les remplace ou en fournit
# une version adaptée (voir README.md).
#
# Si grist-core a modifié un fichier dont le hub garde une version adaptée, la copie s'arrête avant de
# rien changer. Après avoir reporté ces modifications, validez la nouvelle version de référence :
#
#   ACCEPT_ADAPTED=1 bash tools/sync-grist.sh [chemin/vers/grist-core]
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

# Fichiers de grist-core dont le hub garde une version adaptée (src/shims/…/Menu.ts et elements.ts)
# ou reprend la logique (HubView.ts d'après FormView.ts, Button.ts d'après Field.ts).
ADAPTED=(
  app/client/components/Forms/Menu.ts
  app/client/components/Forms/elements.ts
  app/client/components/Forms/FormView.ts
  app/client/components/Forms/Field.ts
)

HERE="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$HERE/src/grist"
SRC="${1:-}"

if [ -z "$SRC" ]; then
  SRC="$(mktemp -d)/grist-core"
  trap 'rm -rf "$(dirname "$SRC")"' EXIT
  git clone --quiet --filter=blob:none --no-checkout https://github.com/gristlabs/grist-core.git "$SRC"
  git -C "$SRC" sparse-checkout set --no-cone app/client app/common app/plugin \
    static/icons/icons.css assets/locales/fr.client.json assets/locales/en.client.json LICENSE.txt package.json \
    eslint.config.shared.js eslint-rules/local-rules.js
  git -C "$SRC" checkout --quiet "$GRIST_CORE_COMMIT"
fi

# Les fichiers adaptés par le hub ont-ils changé dans grist-core depuis leur adaptation ?
if [ -n "${ACCEPT_ADAPTED:-}" ]; then
  (cd "$SRC" && sha256sum "${ADAPTED[@]}") > "$HERE/tools/adapted-from.sha256"
elif ! (cd "$SRC" && sha256sum --quiet --check "$HERE/tools/adapted-from.sha256") >&2; then
  echo "Ces fichiers ont changé dans grist-core depuis que le hub les a adaptés. Reportez leurs" >&2
  echo "modifications dans src/shims/ et src/hub/, puis relancez avec ACCEPT_ADAPTED=1." >&2
  exit 1
fi

rm -rf "$OUT" && mkdir -p "$OUT"
join() { local IFS=,; echo "$*"; }
COUNT=$(node "$HERE/tools/copy-closure.mjs" "$SRC" "$OUT" "$(join "${ENTRIES[@]}")" "$(join "${STOPS[@]}")")

# Retouches de tools/grist.patch, comme Grist Labs les ferait dans grist-core : le type de bloc
# « Button » et son rendu en lecture (FormRenderer.ts), et un libellé écrit en dur en anglais dans
# Columns.ts (« Column 2 ») traduit. Si grist-core a changé à ces endroits, patch échoue et s'arrête.
patch --quiet --forward --strip=1 --directory="$OUT" < "$HERE/tools/grist.patch"

mkdir -p "$HERE/public" "$OUT/locales"
cp "$SRC/static/icons/icons.css" "$HERE/public/grist-icons.css"
# Traductions complètes de Grist ; tools/build.mjs n'en publie que la partie utilisée (locales/).
cp "$SRC/assets/locales/fr.client.json" "$SRC/assets/locales/en.client.json" "$OUT/locales/"
cp "$SRC/LICENSE.txt" "$OUT/LICENSE.txt"
# Configuration ESLint de Grist (eslint.config.js l'applique au code du hub).
mkdir -p "$OUT/eslint-rules"
cp "$SRC/eslint.config.shared.js" "$OUT/"
cp "$SRC/eslint-rules/local-rules.js" "$OUT/eslint-rules/"
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
      // Les outils (ESLint…) restent dans devDependencies, où ils sont déjà.
      if (name !== "app" && all[name] && !pkg.devDependencies[name]) { used.add(name); }
    }
  });
  walk(process.argv[3]);
  pkg.dependencies = Object.fromEntries([...used].sort().map(n => [n, all[n]]));
  fs.writeFileSync(process.argv[2], JSON.stringify(pkg, null, 2) + "\n");
' "$SRC/package.json" "$HERE/package.json" "$OUT"

echo "grist-core@${GRIST_CORE_COMMIT:0:8} : $COUNT fichiers copiés dans src/grist/ ($(find "$OUT" -name '*.[tj]s' -exec cat {} + | wc -l) lignes), retouches de tools/grist.patch appliquées."
echo "Dépendances alignées sur grist-core dans package.json : lancez npm install."
