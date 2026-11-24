/**
 * Cale de ui/App, importé seulement comme type par Forms/styles.ts : ce que les zones de saisie des
 * formulaires attendent de l'application Grist. main.ts en fournit l'équivalent (window.gristApp).
 */
export interface App {
  on(name: "clipboard_focus", callback: () => void): void;
  off(name: "clipboard_focus", callback: () => void): void;
}
