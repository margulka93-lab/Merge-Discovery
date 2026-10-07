import { IndexedDbSaveRepository } from '../persistence/indexeddb/IndexedDbSaveRepository';
import { PRODUCT_ID } from '../domain/model/saveSchema';
/** Read-only recovery remains usable even when canonical content cannot boot. */
export async function exportRawRecovery() {
  const repository = new IndexedDbSaveRepository();
  try { return JSON.stringify({ product: PRODUCT_ID, recoveryData: await repository.load() }, null, 2); }
  finally { repository.database.close(); }
}
