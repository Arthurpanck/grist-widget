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
  color?: string;
}

/** Couleurs proposées : charte Métropole de Lyon, puis palette par défaut de Metabase. */
export const COLORS: { id: string, label: string, bg: string }[] = [
  { id: "rouge", label: "Rouge Métropole", bg: "#FF0000" },
  { id: "rouge-fonce", label: "Rouge foncé", bg: "#C00000" },
  { id: "marine", label: "Bleu marine", bg: "#2A3158" },
  { id: "bleu", label: "Bleu", bg: "#509EE3" },
  { id: "vert", label: "Vert", bg: "#88BF4D" },
  { id: "violet", label: "Violet", bg: "#A989C5" },
  { id: "corail", label: "Corail", bg: "#EF8C8C" },
  { id: "jaune", label: "Jaune", bg: "#F9D45C" },
  { id: "orange", label: "Orange", bg: "#F2A86F" },
  { id: "cyan", label: "Cyan", bg: "#98D9D9" },
  { id: "indigo", label: "Indigo", bg: "#7172AD" },
];

export function colorOf(color?: string) {
  const bg = /^#[0-9a-f]{6}$/i.test(color || "") ? color! : (COLORS.find(c => c.id === color) ?? COLORS[0]).bg;
  const n = parseInt(bg.slice(1), 16);
  const dark = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) < 150;
  return { bg, fg: dark ? "#FFFFFF" : "#1E2340" };
}

/** Icônes de Grist proposées pour les boutons. */
export const ICONS = [
  "Home", "Page", "TypeTable", "TypeCard", "TypeCardList", "ChartBar", "ChartPie", "ChartLine", "TypeCalendar",
  "Database", "Folder", "Board", "Pivot", "Layers", "FormConfig", "Memo", "Pencil", "Mail", "Chat", "Notification",
  "Public", "World", "FieldLink", "Bookmark", "Star", "Heart", "Flag", "Idea", "Info", "Help", "Search", "Settings",
  "Lock", "Clock", "Desktop", "Mobile", "Video", "UseFinance", "UseHr", "UseSales", "UseScience", "UseEducate",
] as const;

export const DEFAULT_ICON: Record<string, string> = { page: "Page", form: "Pencil", url: "World" };

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
