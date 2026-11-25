/**
 * Hub en lecture : le rendu des formulaires publiés de Grist (FormRenderer), appelé comme dans
 * app/client/ui/FormPage.ts. Il affiche paragraphes, sections, colonnes et boutons (ButtonRenderer).
 */
import { FormLayoutNode, FormRenderer } from "app/client/components/FormRenderer";
import { HubContext } from "app/client/hub/HubContext";
import { theme } from "app/client/ui2018/cssVars";

import { dom, Observable, styled } from "grainjs";

/** Largeur maximale du hub, en lecture comme dans l'éditeur (HubView.ts). */
export const HUB_MAX_WIDTH = "960px";

export function buildHubPage(layout: FormLayoutNode, hub: HubContext) {
  return dom.create((owner) => {
    const renderer = FormRenderer.new(layout, {
      fields: {},
      rootLayoutNode: layout,
      // Sans objet ici : ils servent au bouton « Envoyer » d'un formulaire.
      disabled: Observable.create(owner, false),
      error: Observable.create(owner, null),
      hub,
    });
    owner.autoDispose(renderer);
    return cssPage(cssBody(renderer.render()));
  });
}

const cssPage = styled("div", `
  min-height: 100%;
  background: ${theme.mainPanelBg};
  color: ${theme.text};
`);

const cssBody = styled("div", `
  max-width: ${HUB_MAX_WIDTH};
  margin: 0 auto;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`);
