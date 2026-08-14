// TEMP DEBUG (delete this file before merge): tap-to-expand device tracing.
// No-op under jest so warn-count assertions stay meaningful.
export const sonnerDebug = (message: string) => {
  if (typeof jest !== 'undefined') {
    return;
  }
  console.warn(`[sonner-debug] t=${Date.now() % 100000} ${message}`);
};
