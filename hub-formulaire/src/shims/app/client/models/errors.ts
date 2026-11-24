/** Cale de app/client/models/errors. */
export class NeedUpgradeError extends Error {}
export function reportError(err: unknown) { console.error(err); }
