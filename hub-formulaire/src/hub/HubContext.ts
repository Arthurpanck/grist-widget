/**
 * Ce que le hub sait du document : ses pages, ses formulaires et son adresse (…/doc/<id>).
 * Rempli par main.ts à partir de l'API des widgets de Grist, puis transmis à la vue d'édition
 * (HubView.hub) et au rendu en lecture (FormRendererContext.hub), comme Grist transmet les champs
 * d'un formulaire.
 */
import { Disposable, Observable } from "grainjs";

import type { FormLayoutNode } from "app/client/components/FormRenderer";

export interface PageInfo {
  id: number;
  name: string;
  /** La page contient un hub : elle n'est pas proposée comme destination. */
  hasHub?: boolean;
}

export interface FormInfo {
  id: number;
  name: string;
  page: string;
}

export interface ButtonLink {
  href: string;
  target: "_top" | "_blank";
}

export class HubContext extends Disposable {
  public pages = Observable.create<PageInfo[]>(this, []);
  public forms = Observable.create<FormInfo[]>(this, []);
  public docBase = Observable.create<string | null>(this, null);
  /** Vrai une fois les pages et les formulaires reçus de Grist. */
  public loaded = Observable.create(this, false);

  /**
   * Copie de la mise en page où un bouton dont la page ou le formulaire n'existe plus n'a plus de
   * destination : il s'affiche « à choisir », sans lien. Même principe que cleanFormLayoutSpec
   * (FormRenderer.ts), qui retire d'un formulaire les questions dont la colonne a été supprimée.
   */
  public cleanLayout(layout: FormLayoutNode): FormLayoutNode {
    if (!this.loaded.get()) {
      return layout;
    }
    const pageIds = new Set(this.pages.get().map(page => page.id));
    const formIds = new Set(this.forms.get().map(form => form.id));
    const clean = (node: FormLayoutNode): FormLayoutNode => {
      const copy = { ...node };
      if (node.children) {
        copy.children = node.children.map(clean);
      }
      if (node.type === "Button" && node.kind === "page" && node.page && !pageIds.has(node.page)) {
        copy.page = null;
      }
      if (node.type === "Button" && node.kind === "form" && node.form && !formIds.has(node.form)) {
        copy.form = null;
      }
      return copy;
    };
    return clean(layout);
  }

  /**
   * Texte du bouton : celui saisi, sinon le nom de sa destination.
   */
  public labelOf(button: FormLayoutNode): string {
    const own = button.label?.trim();
    if (own) {
      return own;
    }
    switch (button.kind) {
      case "form":
        return this.forms.get().find(f => f.id === button.form)?.name || "Formulaire à choisir";
      case "url":
        return hostOf(button.url) || "Site web à choisir";
      default:
        return this.pages.get().find(p => p.id === button.page)?.name || "Page à choisir";
    }
  }

  /**
   * Lien du bouton : une page du document, un formulaire (lien /f/ de Grist) ou un site web.
   */
  public linkOf(button: FormLayoutNode): ButtonLink | null {
    if (button.kind === "url") {
      const href = safeUrl(button.url);
      return href ? { href, target: "_blank" } : null;
    }
    const base = this.docBase.get();
    if (!base) {
      return null;
    }
    if (button.kind === "form") {
      return button.form ? { href: `${base}/f/${button.form}`, target: "_blank" } : null;
    }
    return button.page ? { href: `${base}/p/${button.page}`, target: "_top" } : null;
  }
}

/**
 * Adresse d'un site web : complétée par https:// si besoin ; seuls http(s), mailto et tel sont acceptés.
 */
export function safeUrl(url?: string): string {
  let value = (url || "").trim();
  if (!value) {
    return "";
  }
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    value = "https://" + value;
  }
  return /^(https?|mailto|tel):/i.test(value) ? value : "";
}

function hostOf(url?: string): string {
  try {
    return new URL(safeUrl(url)).hostname.replace(/^www\./, "");
  } catch (e) {
    return "";
  }
}
