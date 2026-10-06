export type SaveErrorCode = 'invalid_json' | 'invalid_save' | 'invalid_export' | 'unsupported_schema'
  | 'migration_failed' | 'persistence_failed' | 'conflict' | 'not_found' | 'confirmation_required' | 'recovery_failed';

export class SaveError extends Error {
  constructor(public readonly code: SaveErrorCode, message: string, public readonly cause?: unknown) {
    super(message); this.name = 'SaveError';
  }
}
