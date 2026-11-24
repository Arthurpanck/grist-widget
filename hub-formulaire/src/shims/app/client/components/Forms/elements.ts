/**
 * Blocs disponibles dans le hub.
 *
 * Adapté de grist-core app/client/components/Forms/elements.ts (Apache-2.0). Le modèle de Grist
 * (Forms/Model.ts) cherche ici une classe `<type>Model` pour chaque bloc. On garde Paragraphe,
 * Section (rubrique) et Colonnes de Grist, sans Champ ni Envoyer, et on ajoute Bouton.
 */
import { FormLayoutNode, FormLayoutNodeType } from "app/client/components/FormRenderer";
import { Columns, Placeholder } from "app/client/components/Forms/Columns";
import { Paragraph } from "app/client/components/Forms/Paragraph";
import { Section } from "app/client/components/Forms/Section";

import { v4 as uuidv4 } from "uuid";

export * from "app/client/components/Forms/Paragraph";
export * from "app/client/components/Forms/Section";
export * from "app/client/components/Forms/Columns";
export * from "app/client/hub/Button";

export function defaultElement(type: FormLayoutNodeType): FormLayoutNode {
  switch (type) {
    case "Columns": return Columns();
    case "Placeholder": return Placeholder();
    case "Separator": return Paragraph("---");
    case "Header": return Paragraph("# **En-tête**", "center");
    case "Section": return Section();
    default: return { id: uuidv4(), type };
  }
}
