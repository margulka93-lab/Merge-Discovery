import { createRoot } from 'react-dom/client';
import { AppErrorBoundary } from '../../src/ui/recovery/RecoveryScreen';
import { PlatformRecovery } from '../../src/app/PlatformRecovery';
import { exportRawRecovery } from '../../src/app/rawRecovery';
import '../../src/styles/tokens.css';
import '../../src/styles/global.css';
import '../../src/styles/platform.css';
function BrokenScreen(): never { throw new Error('TEST ONLY: unexpected render exception'); }
const reload=()=>window.location.reload();
createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).get('mode')==='boundary'
  ? <AppErrorBoundary recovery={PlatformRecovery} exportRaw={exportRawRecovery} reload={reload}><BrokenScreen /></AppErrorBoundary>
  : <PlatformRecovery fatal exportRaw={exportRawRecovery} reload={reload} />);
