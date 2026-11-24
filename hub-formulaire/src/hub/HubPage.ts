/**
 * Hub en lecture : le rendu des formulaires publiés de Grist (FormRenderer), appelé comme dans
 * app/client/ui/FormPage.ts. Il affiche paragraphes, rubriques, colonnes et boutons (ButtonRenderer).
 */
import { FormLayoutNode, FormRenderer } from "app/client/components/FormRenderer";
import { HubContext } from "app/client/hub/HubContext";
import { theme } from "app/client/ui2018/cssVars";

import { dom, Observable, styled } from "grainjs";

export function buildHubPage(layout: FormLayoutNode, hub: HubContext) {
  const renderer = FormRenderer.new(layout, {
    fields: {},
    rootLayoutNode: layout,
    disabled: Observable.create(null, false),
    error: Observable.create(null, null),
    hub,
  });
  return cssPage(
    dom.autoDispose(renderer),
    cssBody(renderer.render()),
  );
}

const cssPage = styled("div", `
  min-height: 100%;
  background: ${theme.mainPanelBg};
  color: ${theme.text};
`);

const cssBody = styled("div", `
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`);
