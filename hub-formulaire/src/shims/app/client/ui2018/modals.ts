/** Cale de app/client/ui2018/modals. */
export function confirmModal(title: string, _btnText: string, onConfirm: () => any) {
  if (window.confirm(title)) { onConfirm(); }
}
