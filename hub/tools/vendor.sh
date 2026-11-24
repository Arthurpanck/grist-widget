#!/usr/bin/env bash
# Copie dans hub/vendor/ les librairies utilisées par le hub, pour que GitHub Pages serve tout
# (aucun CDN externe). À relancer après un changement de version dans les variables ci-dessous.
#   bash hub/tools/vendor.sh
set -euo pipefail

WEBAWESOME=3.14.0
VUE=3.5.45
SORTABLE=1.15.7
LUCIDE=1.70.0

HUB="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$HUB/vendor"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

(cd "$TMP" && npm init -y >/dev/null && npm install --silent --no-audit --no-fund \
  "@awesome.me/webawesome@$WEBAWESOME" "vue@$VUE" "sortablejs@$SORTABLE" "lucide-static@$LUCIDE")
NM="$TMP/node_modules"

rm -rf "$OUT" && mkdir -p "$OUT/webawesome" "$OUT/lucide"

# Web Awesome : chargeur, composants, morceaux partagés, styles et traduction française (sans types ni docs).
WA="$NM/@awesome.me/webawesome/dist-cdn"
cp "$WA/webawesome.loader.js" "$WA/webawesome.js" "$OUT/webawesome/"
cp -r "$WA/chunks" "$WA/components" "$WA/styles" "$OUT/webawesome/"
mkdir -p "$OUT/webawesome/translations" && cp "$WA/translations/fr.js" "$OUT/webawesome/translations/"
find "$OUT/webawesome" -name '*.d.ts' -delete
cp "$NM/@awesome.me/webawesome/LICENSE.md" "$OUT/webawesome/LICENSE.md"

# Vue (version navigateur avec compilateur de gabarits) et SortableJS.
cp "$NM/vue/dist/vue.esm-browser.prod.js" "$OUT/vue.esm-browser.prod.js"
cp "$NM/vue/LICENSE" "$OUT/vue.LICENSE"
cp "$NM/sortablejs/modular/sortable.core.esm.js" "$OUT/sortable.core.esm.js"
cp "$NM/sortablejs/LICENSE" "$OUT/sortable.LICENSE"

# Lucide : uniquement les icônes citées par le hub (catalogue de config.js + icônes d'interface des gabarits).
NAMES=$( { grep -oE "^\s*\['[a-z0-9-]+'," "$HUB/js/config.js" | grep -oE "[a-z0-9-]+";
           grep -oE "<wa-icon[^>]* name=\"[a-z0-9-]+\"" "$HUB/index.html" | grep -oE "name=\"[a-z0-9-]+\"" | cut -d'"' -f2;
           grep -oE "'(external-link|arrow-right|globe|arrow-up|arrow-down)'" "$HUB/js/"*.js "$HUB/index.html" | grep -oE "[a-z-]+'$" | tr -d "'"; } | sort -u)
for n in $NAMES; do
  if [ -f "$NM/lucide-static/icons/$n.svg" ]; then cp "$NM/lucide-static/icons/$n.svg" "$OUT/lucide/"; else echo "Icône inconnue : $n" >&2; exit 1; fi
done
cp "$NM/lucide-static/LICENSE" "$OUT/lucide/LICENSE"

cat > "$OUT/VERSIONS.md" <<VERSIONS
# Librairies embarquées (générées par tools/vendor.sh — ne pas modifier à la main)

| Librairie | Version | Licence |
|---|---|---|
| Web Awesome | $WEBAWESOME | MIT (webawesome/LICENSE.md) |
| Vue | $VUE | MIT (vue.LICENSE) |
| SortableJS | $SORTABLE | MIT (sortable.LICENSE) |
| Lucide (icônes utilisées uniquement) | $LUCIDE | ISC (lucide/LICENSE) |
VERSIONS

echo "Librairies copiées dans $OUT ($(du -sh "$OUT" | cut -f1), $(ls "$OUT/lucide" | grep -c svg) icônes)."
