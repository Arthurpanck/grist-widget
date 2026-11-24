/**
 * Cale de Forms/Field : le hub n'a pas de questions (colonnes de table). Section et Columns testent
 * `instanceof FieldModel` en supprimant un bloc ; ici, aucun bloc n'en est un.
 */
import type { BoxModel } from "app/client/components/Forms/Model";
import type { Observable } from "grainjs";

export class FieldModel {
  public leaf: Observable<number>;
}

// Pour le typage : une question est un bloc (comme dans Grist, où FieldModel hérite de BoxModel).
export interface FieldModel extends BoxModel {}
