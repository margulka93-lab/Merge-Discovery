import { engineStatus } from '../application/diagnostics';
import { DiagnosticStatus } from '../ui/DiagnosticStatus';
import { SaveDiagnostics } from '../ui/SaveDiagnostics';
import { saveRuntime } from './saveRuntime';

const status = engineStatus();
export function App() {
  return <DiagnosticStatus {...status}>{status.ready && <SaveDiagnostics {...saveRuntime()} />}</DiagnosticStatus>;
}
