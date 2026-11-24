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
}

/** Emoji par défaut, quand le texte du bouton n'en commence pas par un : page, formulaire, site web. */
export const DEFAULT_EMOJI: Record<string, string> = { page: "📄", form: "📝", url: "🌐" };

// Même règle que les noms de pages dans Grist : un emoji en tête du nom devient l'icône. Expression
// reprise de grist-core app/client/ui2018/pages.ts (splitPageInitial, Apache-2.0), qui n'est pas
// importé ici car il entraîne le panneau gauche de l'accueil de Grist, et avec lui toute l'application.
const emojiPart = /(?:\p{RI}\p{RI}|\p{Emoji}(?:\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?)/u;
const pageInitialRegex = new RegExp(`^${emojiPart.source}(?:\\u{200D}${emojiPart.source})*`, "u");

/** Sépare l'emoji de tête (s'il y en a un) du reste du texte. */
export function splitEmoji(text: string): { emoji: string | null, rest: string } {
  const m = text.match(pageInitialRegex);
  // Comme dans Grist : les chiffres correspondent à \p{Emoji} mais n'en sont pas.
  return m && !/^\d$/.test(m[0]) ? { emoji: m[0], rest: text.slice(m[0].length).trim() } : { emoji: null, rest: text };
}

/** Icône de la tuile : l'emoji en tête du texte, sinon celui du type de destination. */
export function emojiOf(b: ButtonData) {
  return splitEmoji(b.label?.trim() || "").emoji || DEFAULT_EMOJI[b.kind || "page"];
}

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
  const own = splitEmoji(b.label?.trim() || "").rest;
  if (own) { return own; }
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
