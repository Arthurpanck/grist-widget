/** Cale de app/client/components/commandList : seul le type des commandes de menu sert. */
export interface MenuCommand {
  humanKeys?: string[];
  run(...args: any[]): any;
}
