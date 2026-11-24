/**
 * Tuile d'un bouton : même rendu dans l'éditeur et en lecture. Icônes et variables de thème de Grist.
 */
import { icon } from "app/client/ui2018/icons";
import { theme } from "app/client/ui2018/cssVars";
import { inlineStyle } from "app/common/gutil";
import { dom, DomElementArg, styled } from "grainjs";
import { ButtonData, colorOf, DEFAULT_ICON, labelOf } from "./context";

export function buttonTile(b: ButtonData, tag: "a" | "div", ...args: DomElementArg[]) {
  const { bg, fg } = colorOf(b.color);
  const make = tag === "a" ? cssTileLink : cssTile;
  return make(
    inlineStyle("--tile-bg", bg), inlineStyle("--tile-fg", fg),
    cssTileIcon(icon((b.icon || DEFAULT_ICON[b.kind || "page"]) as any)),
    cssTileText(
      cssTileLabel(labelOf(b)),
      b.description ? cssTileDesc(b.description) : null,
    ),
    cssTileGo(icon("ArrowRight")),
    ...args,
  );
}

const tileCss = `
  display: flex;
  align-items: stretch;
  min-height: 72px;
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
  width: 64px;
  background: var(--tile-bg);
  --icon-color: var(--tile-fg);
  & > .flexauto, & > div { width: 24px; height: 24px; }
`);
const cssTileText = styled("div", `
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 10px 12px;
`);
const cssTileLabel = styled("div", `
  font-weight: 600;
  font-size: 14px;
  overflow-wrap: anywhere;
`);
const cssTileDesc = styled("div", `
  font-size: 12px;
  color: ${theme.lightText};
  overflow-wrap: anywhere;
`);
const cssTileGo = styled("div", `
  flex: none;
  display: grid;
  place-items: center;
  padding-right: 12px;
  --icon-color: ${theme.lightText};
`);
