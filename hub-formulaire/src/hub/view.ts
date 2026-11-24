/**
 * Mode lecture : le rendu des formulaires publiés de Grist (FormRenderer) affiche paragraphes,
 * rubriques et colonnes ; on lui ajoute seulement le rendu des boutons.
 */
import { FormLayoutNode, FormRenderer } from "app/client/components/FormRenderer";
import { theme } from "app/client/ui2018/cssVars";
import { dom, Observable, styled } from "grainjs";
import { ButtonData, linkOf } from "./context";
import { buttonTile } from "./tile";

class ButtonRenderer extends FormRenderer {
  public render() {
    const b = this.layoutNode as unknown as ButtonData;
    const link = linkOf(b);
    return link ?
      buttonTile(b, "a", { href: link.href, target: link.target }, link.target === "_blank" ? { rel: "noopener" } : null) :
      buttonTile(b, "div", dom.style("opacity", "0.55"), dom.attr("title", "Destination à choisir"));
  }
}

// FormRenderer choisit le rendu de chaque bloc dans FormRenderer.new : on y insère les boutons.
const baseNew = FormRenderer.new;
(FormRenderer as any).new = (node: FormLayoutNode, context: any, parent?: FormRenderer) =>
  (node.type as string) === "Button" ? new ButtonRenderer(node, context, parent) : baseNew.call(FormRenderer, node, context, parent);

export function buildView(layout: FormLayoutNode) {
  const renderer = FormRenderer.new(layout, {
    fields: {}, rootLayoutNode: layout,
    disabled: Observable.create(null, false), error: Observable.create(null, null),
  });
  return cssPage(dom.autoDispose(renderer), cssBody(renderer.render()));
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
