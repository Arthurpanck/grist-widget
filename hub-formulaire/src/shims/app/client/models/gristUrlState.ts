/** Cale de app/client/models/gristUrlState : pas d'état d'URL Grist dans un widget. */
export function urlState() { return { state: { get: () => ({ params: {} as Record<string, any> }) } }; }
