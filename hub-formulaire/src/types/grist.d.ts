// Déclarations qui, dans grist-core, viennent de fichiers que le hub ne copie pas (application
// complète : app/client/declarations.d.ts, jQuery, objets globaux de l'application).
declare module "app/client/lib/dom";
declare module "app/client/lib/Mousetrap";
declare module "app/client/lib/imports" {
  // Chargé à la demande dans Grist (éditeur de code) ; remplacé par un module vide dans le hub.
  export type Ace = any;
  export const loadAce: () => Promise<Ace>;
}

type JQueryStatic = any;

interface Window {
  cmd: any;
  gristNotify: any;
  getAppErrors: any;
  gristDocPageModel: any;
}
