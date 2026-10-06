import { engineStatus } from '../application/diagnostics';
import { DiagnosticStatus } from '../ui/DiagnosticStatus';

const status = engineStatus();
export function App() { return <DiagnosticStatus {...status} />; }
