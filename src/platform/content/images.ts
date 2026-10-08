import { PackError } from '../../content/packs/model';
/** Actual browser decoding is a platform boundary, never part of the domain engine. */
export async function verifyImage(bytes: Uint8Array, mime: string) {
  const blob = new Blob([new Uint8Array(bytes).buffer], { type: mime });
  try { const bitmap = await createImageBitmap(blob); bitmap.close(); } catch { throw new PackError(['L’immagine non può essere decodificata dal browser.']); }
}
