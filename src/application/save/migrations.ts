import type { PlayerSave } from '../../domain/model/save';
import { SaveError } from './errors';
import { parseSave, SAVE_SCHEMA_VERSION } from '../../domain/model/saveSchema';

export interface SaveMigration {
  from: number;
  /** Each legacy version owns its strict parser. Unvalidated data is never migrated. */
  validate: (raw: unknown) => unknown;
  migrate: (validated: unknown) => unknown;
}
export function migrateSaveSchema<T>(raw: unknown, targetVersion: number, migrations: readonly SaveMigration[], parseTarget: (raw: unknown) => T): T {
  const readVersion = (value: unknown) => {
    if (!value || typeof value !== 'object' || !('saveSchemaVersion' in value) || !Number.isInteger(value.saveSchemaVersion) || Number(value.saveSchemaVersion) < 0) throw new SaveError('invalid_save', 'Missing schema version');
    return Number(value.saveSchemaVersion);
  };
  let current = structuredClone(raw);
  let version = readVersion(current);
  if (version > targetVersion) throw new SaveError('unsupported_schema', 'Save from a newer application');
  while (version < targetVersion) {
    const steps = migrations.filter(m => m.from === version);
    if (steps.length !== 1) throw new SaveError('unsupported_schema', 'No unique migration path');
    try {
      current = steps[0]!.migrate(steps[0]!.validate(current));
      if (readVersion(current) !== version + 1) throw new Error('Migration must advance exactly one version');
    } catch (cause) { throw new SaveError('migration_failed', 'Save migration failed', cause); }
    version++;
  }
  try { return parseTarget(current); }
  catch (cause) {
    if (readVersion(raw) < targetVersion) throw new SaveError('migration_failed', 'Migrated save invalid', cause);
    throw cause;
  }
}
export function migrateSave(raw: unknown, migrations: readonly SaveMigration[] = []): PlayerSave {
  return migrateSaveSchema(raw, SAVE_SCHEMA_VERSION, migrations, parseSave);
}
