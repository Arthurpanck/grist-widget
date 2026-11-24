/**
 * Tuile d'un bouton, en « bloc icône » : bandeau coloré avec l'icône en haut, texte en dessous.
 * Même rendu, et même taille, dans l'éditeur et en lecture. Variables de thème de Grist.
 */
import { theme } from "app/client/ui2018/cssVars";
import { inlineStyle } from "app/common/gutil";
import { dom, DomElementArg, styled } from "grainjs";
import { ButtonData, colorOf, DEFAULT_ICON, labelOf } from "./context";
import { hubIcon } from "./icons";

export function buttonTile(b: ButtonData, tag: "a" | "div", ...args: DomElementArg[]) {
  const { bg, fg } = colorOf(b.color);
  const make = tag === "a" ? cssTileLink : cssTile;
  return make(
    dom.cls("hub-tile"),
    inlineStyle("--tile-bg", bg), inlineStyle("--tile-fg", fg),
    cssTileIcon(hubIcon(b.icon, DEFAULT_ICON[b.kind || "page"])),
    cssTileText(
      cssTileLabel(labelOf(b)),
      b.description ? cssTileDesc(b.description) : null,
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
    border-color: var(--tile-bg);
    box-shadow: 0 6px 16px rgba(38, 38, 51, 0.12);
    transform: translateY(-2px);
    text-decoration: none;
    color: ${theme.text};
  }
  a&:focus-visible { outline: 2px solid var(--tile-bg); outline-offset: 2px; }
`;
const cssTile = styled("div", tileCss);
const cssTileLink = styled("a", tileCss);

const cssTileIcon = styled("div", `
  flex: none;
  display: grid;
  place-items: center;
  height: 64px;
  background: var(--tile-bg);
  color: var(--tile-fg);
  & > svg { width: 30px; height: 30px; }
`);
const cssTileText = styled("div", `
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 14px 16px;
`);
const cssTileLabel = styled("div", `
  font-weight: 600;
  font-size: 15px;
  line-height: 1.3;
  overflow-wrap: break-word;
  hyphens: auto;
`);
const cssTileDesc = styled("div", `
  font-size: 13px;
  line-height: 1.35;
  color: ${theme.lightText};
  overflow-wrap: break-word;
`);
