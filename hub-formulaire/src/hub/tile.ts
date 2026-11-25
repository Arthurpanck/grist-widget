/**
 * Tuile d'un bouton : bandeau au vert du bouton « Envoyer » des formulaires, avec l'icône de la
 * destination, et texte en dessous. Même rendu, et même taille, dans l'éditeur (Button.ts) et en
 * lecture (ButtonRenderer, dans FormRenderer.ts).
 */
import { DESTINATIONS } from "app/client/hub/destinations";
import { theme, vars } from "app/client/ui2018/cssVars";

import { dom, DomContents, DomElementArg, makeTestId, styled } from "grainjs";

import type { FormLayoutNode } from "app/client/components/FormRenderer";
import type { HubContext } from "app/client/hub/HubContext";

const testId = makeTestId("test-hub-");

/** Texte de la tuile : le libellé et la description en lecture ; l'éditeur fournit les siens. */
interface TileText {
  label: DomContents;
  description: DomContents;
}

/**
 * Tuile de l'éditeur.
 */
export function buttonTile(button: FormLayoutNode, text: TileText, ...args: DomElementArg[]) {
  return cssTile(buildTileContent(button, text), ...args);
}

/**
 * Tuile en lecture : un lien vers la destination, grisé tant que le bouton n'en a pas.
 */
export function buttonLink(button: FormLayoutNode, hub: HubContext) {
  const text = {
    label: cssTileLabel(hub.labelOf(button)),
    description: button.description ? cssTileDesc(button.description) : null,
  };
  const link = hub.linkOf(button);
  if (!link) {
    return cssTile(
      buildTileContent(button, text),
      cssTile.cls("-disabled"),
      dom.attr("title", DESTINATIONS[button.kind || "page"].missing),
    );
  }
  return cssTileLink(
    buildTileContent(button, text),
    { href: link.href, target: link.target },
    link.target === "_blank" ? { rel: "noopener" } : null,
  );
}

function buildTileContent(button: FormLayoutNode, text: TileText) {
  return [
    testId("tile"),
    cssTileIcon(DESTINATIONS[button.kind || "page"].icon, testId("icon")),
    cssTileText(text.label, text.description),
  ];
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
  a&:focus-visible {
    outline: 2px solid ${vars.primaryBg};
    outline-offset: 2px;
  }
  &-disabled {
    opacity: 0.55;
  }
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
