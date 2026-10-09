/** Adapted from PR #14 SaveApplication.ts (85d7a214), without importing pack/layout code. */
export type CommandLease = <T>(action: () => Promise<T>) => Promise<T>;
export const directLease: CommandLease = action => action();
/** CAS remains authoritative in adapters; this optional browser lease reduces conflicts. */
export function browserWorldLease(name = 'merge_discovery_world'): CommandLease {
  return async action => typeof navigator !== 'undefined' && navigator.locks ? await navigator.locks.request(name, action) : action();
}
