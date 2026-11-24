/**
 * Cale de Forms/Field : le hub n'a pas de questions (colonnes de table). Section et Columns testent
 * `instanceof FieldModel` en supprimant un bloc ; ici, aucun bloc n'en est un. La classe de base des
 * blocs n'est importée que comme type : l'importer pour de bon créerait une boucle d'imports
 * (Model → elements → Columns → Field → Model).
 */
import type { BoxModel } from "app/client/components/Forms/Model";
import type { Observable } from "grainjs";

/** Une question : un bloc lié à un champ de la table (leaf). */
export type FieldModel = BoxModel & { leaf: Observable<number> };

export const FieldModel = class {} as unknown as new () => FieldModel;
