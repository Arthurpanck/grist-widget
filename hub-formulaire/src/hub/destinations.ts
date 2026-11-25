/**
 * Les trois destinations possibles d'un bouton, décrites à un seul endroit : icône de la tuile,
 * entrée du menu « + » (icône de Grist et libellé) et texte affiché tant que la destination manque.
 */
import type { FormLayoutNode } from "app/client/components/FormRenderer";
import type { IconName } from "app/client/ui2018/IconList";

export type ButtonKind = NonNullable<FormLayoutNode["kind"]>;

interface Destination {
  /** Icône de la tuile. */
  icon: string;
  /** Icône de Grist dans le menu « + ». */
  menuIcon: IconName;
  /** Libellé dans le menu « + ». */
  menuLabel: string;
  /** Texte du sous-menu quand le document n'a aucune destination de ce type (pages, formulaires). */
  menuEmpty?: string;
  /** Texte de la tuile tant que le bouton n'a ni texte ni destination. */
  missing: string;
}

export const DESTINATIONS: Record<ButtonKind, Destination> = {
  page: {
    icon: "📄",
    menuIcon: "Page",
    menuLabel: "Vers une page",
    menuEmpty: "Aucune page dans ce document",
    missing: "Page à choisir",
  },
  form: {
    icon: "📝",
    menuIcon: "Pencil",
    menuLabel: "Vers un formulaire",
    menuEmpty: "Aucun formulaire dans ce document",
    missing: "Formulaire à choisir",
  },
  url: {
    icon: "🌐",
    menuIcon: "World",
    menuLabel: "Vers un site web",
    missing: "Site web à choisir",
  },
};
