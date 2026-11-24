/**
 * Tuile d'un bouton, en « bloc icône » : bandeau au vert du bouton Envoyer des formulaires, avec
 * l'icône du type de destination, texte en dessous. Même rendu, et même taille, dans l'éditeur et en
 * lecture. Variables de thème de Grist.
 */
import { theme, vars } from "app/client/ui2018/cssVars";
import { dom, DomContents, DomElementArg, styled } from "grainjs";
import { ButtonData, ICONS, labelOf } from "./context";

/** Texte de la tuile : par défaut, le libellé et la description ; l'éditeur fournit les siens. */
export interface TileText { label?: DomContents; description?: DomContents; }

export function buttonTile(b: ButtonData, tag: "a" | "div", text: TileText | null, ...args: DomElementArg[]) {
  const make = tag === "a" ? cssTileLink : cssTile;
  return make(
    dom.cls("hub-tile"),
    // Bandeau vert avec l'icône du type de destination.
    cssTileIcon(ICONS[b.kind || "page"], dom.cls("test-hub-icon")),
    cssTileText(
      text?.label ?? cssTileLabel(labelOf(b)),
      text?.description ?? (b.description ? cssTileDesc(b.description) : null),
    ),
    ...args,
  );
}

const tileCss = `
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 124px;
  overflow: hidden;
  border: 1px solid ${theme.menuBorder};
  border-radius: 8px;
  background: ${theme.mainPanelBg};
  color: ${theme.text};
  text-decoration: none;
  transition: box-shadow 0.15s, border-color 0.15s, transform 0.15s;
  a&:hover {
    border-color: ${vars.primaryBg};
    box-shadow: 0 6px 16px rgba(38, 38, 51, 0.12);
    transform: translateY(-2px);
    text-decoration: none;
    color: ${theme.text};
  }
  a&:focus-visible { outline: 2px solid ${vars.primaryBg}; outline-offset: 2px; }
`;
const cssTile = styled("div", tileCss);
const cssTileLink = styled("a", tileCss);

const cssTileIcon = styled("div", `
  flex: none;
  display: grid;
  place-items: center;
  height: 64px;
  background: ${vars.primaryBg};
  font-size: 30px;
  line-height: 1;
`);
const cssTileText = styled("div", `
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 14px 16px;
`);
export const cssTileLabel = styled("div", `
  font-weight: 600;
  font-size: 15px;
  line-height: 1.3;
  overflow-wrap: break-word;
  hyphens: auto;
`);
export const cssTileDesc = styled("div", `
  font-size: 13px;
  line-height: 1.35;
  color: ${theme.lightText};
  overflow-wrap: break-word;
`);
