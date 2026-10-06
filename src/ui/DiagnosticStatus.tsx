import type { ReactNode } from 'react';
export function DiagnosticStatus({ ready, version, error, children }: { ready: boolean; version?: string; error?: string; children?: ReactNode }) {
  return <main>
    <h1>Merge Discovery</h1>
    <p>Scaffold tecnico · Phase 0 + Phase 1</p>
    <p role="status">{ready ? `Motore pronto · contenuto ${version}` : 'Contenuto non valido'}</p>
    {error && <pre role="alert">{error}</pre>}
    <p>La verifica del seed si esegue con <code>npm run validate:content</code> e <code>npm run simulate:content</code>.</p>
    {children}
  </main>;
}
