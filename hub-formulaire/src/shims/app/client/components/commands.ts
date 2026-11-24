/**
 * Cale de app/client/components/commands (Mousetrap et liste de raccourcis dans Grist).
 * Même interface : `allCommands.<nom>.run(...)` appelle le gestionnaire du groupe actif le plus
 * récent, créé par `createGroup(handlers, owner, activate)`.
 */
import { MenuCommand } from "app/client/components/commandList";

type Handlers = Record<string, (...args: any[]) => any>;
interface Group { handlers: Handlers; activate?: { get(): boolean } | boolean }

const groups: Group[] = [];

const KEYS: Record<string, string[]> = {
  contextMenuCopy: ["Ctrl+C"],
  contextMenuCut: ["Ctrl+X"],
  contextMenuPaste: ["Ctrl+V"],
  deleteFields: ["Suppr"],
};

class Command implements MenuCommand {
  constructor(public name: string, public humanKeys: string[] = []) {}
  public run(...args: any[]) {
    for (const g of [...groups].reverse()) {
      const active = typeof g.activate === "object" ? g.activate.get() : g.activate ?? true;
      if (active && g.handlers[this.name]) { return g.handlers[this.name](...args); }
    }
  }
}

const cache: Record<string, Command> = {};
export const allCommands: Record<string, Command> = new Proxy(cache, {
  get: (target, name: string) => (target[name] ??= new Command(name, KEYS[name])),
});

export function createGroup(handlers: Handlers, owner: any, activate?: Group["activate"]) {
  const group: Group = { handlers, activate };
  groups.push(group);
  const disposable = { dispose: () => { const i = groups.indexOf(group); if (i >= 0) { groups.splice(i, 1); } } };
  owner?.autoDispose?.(disposable);
  return disposable;
}
