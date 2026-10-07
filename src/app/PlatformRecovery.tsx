import { useSyncExternalStore } from 'react';
import { updates } from '../platform/pwa/updates';
import { RecoveryScreen, type RecoveryProps } from '../ui/recovery/RecoveryScreen';
import { UpdateNotice } from '../ui/platform/UpdateNotice';
import { refreshRuntimeBootForRetry } from './saveRuntime';
/** Recovery can also accept a healthy waiting build, without clearing caches or local progress. */
export function PlatformRecovery(props: RecoveryProps) {
  const state = useSyncExternalStore(updates.subscribe, updates.getSnapshot);
  return <>
    <RecoveryScreen {...props} actionsDisabled={!state.safe || state.applying}
      retry={props.retry ? () => {
        const release = updates.beginOperation();
        if (!release) return;
        const boot = refreshRuntimeBootForRetry();
        if (!boot) { release(); props.retry?.(); return; }
        // A rejected load is surfaced by the existing boot/save-recovery screen after retry.
        void boot.finally(() => { release(); props.retry?.(); }).catch(() => undefined);
      } : undefined}
      reload={() => { if (state.safe && !state.applying && !updates.accept()) props.reload(); }}
      exportRaw={async () => {
        const release = updates.beginOperation();
        if (!release) throw new Error('Update applying');
        try { return await props.exportRaw(); } finally { release(); }
      }} />
    <UpdateNotice state={state} accept={() => { updates.accept(); }} defer={() => { updates.defer(); document.querySelector<HTMLElement>('.recovery-screen')?.focus(); }} />
  </>;
}
