import { Component, type ComponentType, type ReactNode, useEffect, useRef, useState } from 'react';
export interface RecoveryProps { fatal?: boolean; retry?: () => void; exportRaw: () => Promise<string>; reload: () => void; actionsDisabled?: boolean }
export function RecoveryScreen({ fatal = false, retry, exportRaw, reload, actionsDisabled = false }: RecoveryProps) {
  const [json, setJson] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const main = useRef<HTMLElement>(null);
  useEffect(() => { main.current?.focus(); }, []);
  return <main ref={main} className="boot-screen recovery-screen" tabIndex={-1}>
    <p className="eyebrow">Merge Discovery</p>
    <h1>{fatal ? 'L’osservatorio non può aprirsi' : 'Riprendiamo con calma'}</h1>
    <p role="alert">{fatal ? 'Il contenuto di questa versione non è disponibile. Ricarica per riprovare.' : 'Questa schermata non si è aperta correttamente. Puoi riprovare o ricaricare.'}</p>
    <p>Il salvataggio locale resta sul dispositivo.</p>
    {retry && <button disabled={busy || actionsDisabled} onClick={retry}>Riprova</button>}
    <button disabled={busy || actionsDisabled} onClick={reload}>Ricarica l’osservatorio</button>
    <button disabled={busy || actionsDisabled} onClick={() => { setBusy(true); setError(''); void exportRaw().then(setJson, () => setError('Non è stato possibile leggere i dati locali. Riprova.')).finally(() => setBusy(false)); }}>Esporta dati originali per recupero</button>
    {error && <p role="alert">{error}</p>}
    {json && <><label htmlFor="raw-recovery">Dati originali JSON · copia e conserva</label><textarea id="raw-recovery" readOnly rows={8} value={json} /></>}
  </main>;
}
export class AppErrorBoundary extends Component<{ children: ReactNode; exportRaw: () => Promise<string>; reload: () => void; recovery?: ComponentType<RecoveryProps> }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    const Recovery = this.props.recovery ?? RecoveryScreen;
    return this.state.failed ? <Recovery exportRaw={this.props.exportRaw} reload={this.props.reload} retry={() => this.setState({ failed: false })} /> : this.props.children;
  }
}
