import { previewPack } from '../../application/packs/preview';
export type PreviewRequest = Parameters<typeof previewPack>;
export type PreviewResponse = { preview: ReturnType<typeof previewPack> } | { error: string };
self.onmessage = (event: MessageEvent<PreviewRequest>) => {
  try { self.postMessage({ preview: previewPack(...event.data) } satisfies PreviewResponse); }
  catch (cause) { self.postMessage({ error: cause instanceof Error ? cause.message : 'Pacchetto non valido.' } satisfies PreviewResponse); }
};
