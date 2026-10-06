import { SaveError } from '../../domain/model/saveErrors';
export { SaveError } from '../../domain/model/saveErrors';
/** Technical details stay in the error cause, never in player-facing diagnostics. */
export function saveErrorMessage(error: unknown): string {
  if (!(error instanceof SaveError)) return 'Operazione non riuscita. Il progresso esistente è stato conservato.';
  switch (error.code) {
    case 'conflict': return 'Il salvataggio è cambiato. Ricarica e riprova.';
    case 'invalid_json': case 'invalid_save': case 'invalid_export': return 'La copia non è valida. Il progresso esistente è stato conservato.';
    case 'unsupported_schema': return 'Questa versione del salvataggio non è supportata.';
    case 'migration_failed': return 'Non è stato possibile aggiornare il salvataggio. Conserva una copia per il recupero.';
    case 'recovery_failed': return 'Salvataggio non leggibile. Puoi esportare i dati originali o tentare il backup.';
    case 'confirmation_required': return 'Conferma esplicitamente la sostituzione del progresso.';
    case 'not_found': return 'Nessun salvataggio disponibile.';
    case 'persistence_failed': return 'Non siamo riusciti a salvare. Riprova oppure esporta una copia del progresso.';
  }
}
