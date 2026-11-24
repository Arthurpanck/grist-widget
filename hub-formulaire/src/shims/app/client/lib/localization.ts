/**
 * Cale de app/client/lib/localization (i18next dans Grist) : traductions françaises des textes
 * de l'éditeur de formulaires réutilisé, et interpolation « {{nom}} ».
 */
const FR: Record<string, string> = {
  "Delete": "Supprimer",
  "Insert section above": "Insérer une rubrique au-dessus",
  "Insert section below": "Insérer une rubrique en dessous",
  "## **Header**": "## **Rubrique**",
  "Description": "Description",
  "Remove Column": "Retirer la colonne",
  "Loading...": "Chargement…",
  "Select fields": "Choisir",
  "Reset": "Réinitialiser",
  "Submit": "Envoyer",
};

export function makeT(_scope: string) {
  return (key: string, args?: Record<string, unknown>): any => {
    let text = FR[key] ?? key;
    for (const [name, value] of Object.entries(args ?? {})) { text = text.split(`{{${name}}}`).join(String(value)); }
    return text;
  };
}

export function t(key: string, args?: Record<string, unknown>) { return makeT("")(key, args); }
