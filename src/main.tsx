import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppErrorBoundary } from './ui/recovery/RecoveryScreen';
import { PlatformRecovery } from './app/PlatformRecovery';
import { registerProductionWorker } from './platform/pwa/updates';
import { exportRawRecovery } from './app/rawRecovery';
import './styles/platform.css';
import { App } from './app/App';
import './styles/tokens.css';
import './styles/global.css';
// Laboratory Set/Collection callouts share this stylesheet with secondary screens.
import './styles/world.css';

createRoot(document.getElementById('root')!).render(<StrictMode><AppErrorBoundary recovery={PlatformRecovery} exportRaw={exportRawRecovery} reload={() => window.location.reload()}><App /></AppErrorBoundary></StrictMode>);
// Also check for a healthy waiting build if startup/render falls into recovery.
void registerProductionWorker();
