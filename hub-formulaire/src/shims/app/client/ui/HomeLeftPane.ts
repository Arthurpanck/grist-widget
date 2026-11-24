/**
 * Remplace grist-core app/client/ui/HomeLeftPane.ts (panneau gauche de la page d'accueil de Grist),
 * qui importe toute l'application. Seul `cssEditorInput` en est importé, par app/client/ui2018/pages.ts
 * (lui-même importé par l'icône de document, DocIcon), pour le champ de renommage des pages de la
 * barre latérale : le hub ne l'affiche jamais. Même style que dans Grist (Apache-2.0), sur un champ
 * simple au lieu de transientInput (qui importe le modèle de l'application).
 */
import { theme } from "app/client/ui2018/cssVars";
import { styled } from "grainjs";

export const cssEditorInput = styled("input", `
  height: 24px;
  flex: 1 1 0px;
  min-width: 0px;
  background-color: ${theme.inputBg};
  margin-right: 16px;
  font-size: inherit;
`);
