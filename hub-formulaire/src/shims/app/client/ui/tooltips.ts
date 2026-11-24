/** Cale de app/client/ui/tooltips : l'infobulle devient l'attribut title. */
import { dom } from "grainjs";

export function hoverTooltip(content: any, _options?: any) {
  return typeof content === "string" ? dom.attr("title", content) : null;
}
export function showTransientTooltip() { /* sans objet ici */ }
