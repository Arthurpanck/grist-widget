/**
 * Ce que le hub sait du document : pages, formulaires et adresse de base (…/doc/<id>).
 * Rempli par main.ts à partir de l'API des widgets de Grist.
 */
import { Observable } from "grainjs";

export interface PageInfo { id: number; name: string; }
export interface FormInfo { id: number; name: string; page: string; }

export const hubContext = {
  pages: Observable.create<PageInfo[]>(null, []),
  forms: Observable.create<FormInfo[]>(null, []),
  docBase: Observable.create<string | null>(null, null),
};

export interface ButtonData {
  label?: string;
  description?: string;
  kind?: "page" | "form" | "url";
  page?: number | null;
  form?: number | null;
  url?: string;
  icon?: string;
}


/** Icône par défaut de chaque type de destination (voir icons.ts). */
export const DEFAULT_ICON: Record<string, string> = { page: "file-text", form: "clipboard-list", url: "globe" };

function hostOf(url?: string) {
  try { return new URL(safeUrl(url) || "").hostname.replace(/^www\./, ""); } catch (e) { return ""; }
}

export function safeUrl(url?: string) {
  let u = String(url || "").trim();
  if (!u) { return ""; }
  if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) { u = "https://" + u; }
  return /^(https?|mailto|tel):/i.test(u) ? u : "";
}

/** Libellé affiché : celui saisi, sinon le nom de la destination. */
export function labelOf(b: ButtonData) {
  if (b.label?.trim()) { return b.label.trim(); }
  if (b.kind === "page") { return hubContext.pages.get().find(p => p.id === b.page)?.name || "Page à choisir"; }
  if (b.kind === "form") { return hubContext.forms.get().find(f => f.id === b.form)?.name || "Formulaire à choisir"; }
  return hostOf(b.url) || "Site web à choisir";
}

/** Lien du bouton : page du document, formulaire (lien /f/ de Grist) ou site web. */
export function linkOf(b: ButtonData): { href: string, target: string } | null {
  const base = hubContext.docBase.get();
  if (b.kind === "url") { const href = safeUrl(b.url); return href ? { href, target: "_blank" } : null; }
  if (!base) { return null; }
  if (b.kind === "form") { return b.form ? { href: `${base}/f/${b.form}`, target: "_blank" } : null; }
  return b.page ? { href: `${base}/p/${b.page}`, target: "_top" } : null;
}
