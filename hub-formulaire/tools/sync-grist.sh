#!/usr/bin/env bash
# Copie, sans modification (hormis un libellé traduit, voir plus bas), les fichiers de grist-core que le hub réutilise : l'éditeur de formulaires
# (modèle de blocs, glisser-déposer, menus, paragraphes Markdown, sections, colonnes, styles) et le
# rendu des formulaires publiés, avec les utilitaires d'interface dont ils dépendent.
#
#   bash tools/sync-grist.sh [chemin/vers/grist-core]
#
# Sans argument, grist-core est récupéré (clone partiel) au commit indiqué ci-dessous.
# Les modules de Grist trop liés à l'application (document, commandes, traductions, infobulles…)
# ne sont pas copiés : de petites cales les remplacent dans src/shims/ (voir README.md).
set -euo pipefail

GRIST_CORE_COMMIT=cc110ed0fec59e63a7d4019c2e50dcea6c7a8421

FILES=(
  # Éditeur de formulaires : réutilisé tel quel.
  app/client/components/Forms/Model.ts
  app/client/components/Forms/Editor.ts
  app/client/components/Forms/Paragraph.ts
  app/client/components/Forms/Section.ts
  app/client/components/Forms/Columns.ts
  app/client/components/Forms/styles.ts
  # Rendu des formulaires publiés (mode lecture du hub).
  app/client/components/FormRenderer.ts
  app/client/components/FormRendererCss.ts
  # Interface de Grist : menus, icônes, boutons, champs, thème.
  app/client/ui2018/menus.ts
  app/client/ui2018/cssVars.ts
  app/client/ui2018/checkbox.ts
  app/client/ui2018/buttons.ts
  app/client/ui2018/IconList.ts
  app/client/ui2018/icons.ts
  app/client/ui2018/loaders.ts
  app/client/ui2018/select.ts
  app/client/ui2018/unstyled.ts
  app/client/ui/forms.ts
  app/client/ui/inputs.ts
  app/client/ui/sanitizeHTML.ts
  app/client/widgets/NumericSpinner.ts
  app/client/lib/FocusLayer.ts
  app/client/lib/domUtils.ts
  app/client/lib/Mousetrap.js
  app/client/lib/browserGlobals.ts
  app/client/lib/getOrCreateStyleElement.ts
  app/common/ThemePrefs.ts
  app/common/CssCustomProp.ts
  app/common/themes/Base.ts
  app/common/themes/GristLight.ts
  app/common/gutil.ts
  app/common/RefCountMap.ts
  app/common/tbind.ts
  app/plugin/gutil.ts
  app/plugin/GristData.ts
)

HERE="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$HERE/src/grist"
SRC="${1:-}"

if [ -z "$SRC" ]; then
  SRC="$(mktemp -d)/grist-core"
  trap 'rm -rf "$(dirname "$SRC")"' EXIT
  git clone --quiet --filter=blob:none --no-checkout https://github.com/gristlabs/grist-core.git "$SRC"
  git -C "$SRC" sparse-checkout set --no-cone "${FILES[@]}" static/icons/icons.css LICENSE.txt
  git -C "$SRC" checkout --quiet "$GRIST_CORE_COMMIT"
fi

rm -rf "$OUT" && mkdir -p "$OUT"
for f in "${FILES[@]}"; do
  mkdir -p "$OUT/$(dirname "$f")"
  cp "$SRC/$f" "$OUT/$f"
done
# Seule retouche : un libellé écrit en dur en anglais dans Columns.ts (« Column 2 »), traduit ici.
sed -i 's/dom("span", `Column `,/dom("span", `Colonne `,/' "$OUT/app/client/components/Forms/Columns.ts"
grep -q 'Colonne ' "$OUT/app/client/components/Forms/Columns.ts" || { echo "Retouche de Columns.ts impossible" >&2; exit 1; }

mkdir -p "$HERE/public"
cp "$SRC/static/icons/icons.css" "$HERE/public/grist-icons.css"
cp "$SRC/LICENSE.txt" "$OUT/LICENSE.txt"
echo "$GRIST_CORE_COMMIT" > "$OUT/COMMIT"
echo "grist-core@${GRIST_CORE_COMMIT:0:8} : ${#FILES[@]} fichiers copiés dans src/grist/ (un libellé traduit) ($(cat "${FILES[@]/#/$OUT/}" | wc -l) lignes)."
