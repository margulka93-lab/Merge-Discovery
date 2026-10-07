export type UpdateState = Readonly<{ available: boolean; deferred: boolean; applying: boolean; safe: boolean }>;
export interface WaitingWorker { postMessage(message: { type: 'ACTIVATE_UPDATE' }): void }
/** Browser effects are injected; availability and locks never belong to PlayerSave. */
export class UpdateCoordinator {
  private waiting?: WaitingWorker;
  private operations = 0;
  private reveal = false;
  private reloaded = false;
  private listeners = new Set<() => void>();
  private state: UpdateState = { available: false, deferred: false, applying: false, safe: true };
  constructor(private reload: () => void) {}
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private publish(change: Partial<UpdateState> = {}) {
    this.state = { ...this.state, ...change, safe: this.operations === 0 && !this.reveal };
    this.listeners.forEach(listener => listener());
  }
  offer(worker: WaitingWorker) { if (worker === this.waiting) return; this.waiting = worker; this.publish({ available: true, deferred: false }); }
  beginOperation = () => {
    if (this.state.applying) return undefined;
    this.operations++; this.publish();
    let released = false;
    return () => { if (!released) { released = true; this.operations--; this.publish(); } };
  };
  setReveal(value: boolean) { if (this.reveal !== value) { this.reveal = value; this.publish(); } }
  defer = () => this.publish({ deferred: true });
  show = () => this.publish({ deferred: false });
  accept = () => {
    if (!this.waiting || !this.state.safe || this.state.applying) return false;
    this.publish({ applying: true });
    try { this.waiting.postMessage({ type: 'ACTIVATE_UPDATE' }); return true; }
    catch { this.publish({ applying: false }); return false; }
  };
  controllerChanged = () => {
    if (this.state.applying && !this.reloaded) { this.reloaded = true; this.reload(); }
  };
}
export const updates = new UpdateCoordinator(() => window.location.reload());
let started = false;
export async function registerProductionWorker() {
  if (!import.meta.env.PROD || started || !('serviceWorker' in navigator)) return;
  started = true;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
    const inspect = () => { if (registration.waiting && navigator.serviceWorker.controller) updates.offer(registration.waiting); };
    inspect();
    registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', inspect));
    navigator.serviceWorker.addEventListener('controllerchange', updates.controllerChanged);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void registration.update().catch(() => undefined);
    });
  } catch { /* No SW support/network must never block the laboratory. */ }
}
