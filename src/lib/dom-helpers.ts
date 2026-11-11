/**
 * Focuses an interactive element by DOM id on the next animation frame.
 */
export function focusFieldById(fieldId: string): void {
  if (typeof window === 'undefined') return;
  window.requestAnimationFrame(() => {
    const el = document.getElementById(fieldId);
    if (el instanceof HTMLElement) el.focus();
  });
}

