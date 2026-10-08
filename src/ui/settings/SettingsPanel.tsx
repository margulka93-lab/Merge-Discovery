import { lazy, Suspense, useState } from 'react';
import { InformationModeControls } from './InformationModeControls';
import type { LabModel } from '../../application/laboratory';
import type { ApplicationSnapshot, SaveApplication } from '../../application/save/SaveApplication';
import '../../styles/exploration.css';
import type { ContentPackApplication } from '../../application/packs/ContentPackApplication';
import { updates } from '../../platform/pwa/updates';
const ContentImportPanel = lazy(() => import('../content/ContentImportPanel').then(m => ({ default: m.ContentImportPanel })));
const ContentStudio = lazy(() => import('../content/ContentStudio').then(m => ({ default: m.ContentStudio })));
const SaveDiagnostics = lazy(() => import('../SaveDiagnostics').then(m => ({ default: m.SaveDiagnostics })));
type LabModelTextScale = 'default' | 'large' | 'extra_large';
export function SettingsPanel({ model, snapshot, busy, preferences, application, boot, accept, beginOperation, contentApplication }: {
  model: LabModel; snapshot: ApplicationSnapshot; busy: boolean;
  preferences: (change: Parameters<SaveApplication['updatePreferences']>[0]) => void;
  application: SaveApplication; boot: Promise<ApplicationSnapshot>; accept: (snapshot: ApplicationSnapshot) => void;
  beginOperation: () => (() => void) | undefined;
  contentApplication?: ContentPackApplication;
}) {
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [author, setAuthor] = useState(false);
  const [editing, setEditing] = useState(false);
  return (
    <div className="settings-groups">
                {!(author && editing) && <>
                <InformationModeControls
                  preferences={snapshot.save.settings}
                  busy={busy}
                  change={preferences}
                />
                <fieldset aria-busy={busy}>
                  <legend>Accessibilità</legend>
                  <label>
                    <input
                      type="checkbox"
                      aria-disabled={busy}
                      disabled={busy}
                      checked={model.reducedMotion}
                      onChange={(e) =>
                        preferences({ reducedMotion: e.target.checked })
                      }
                    />{" "}
                    Movimento ridotto
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      aria-disabled={busy}
                      disabled={busy}
                      checked={model.highContrast}
                      onChange={(e) =>
                        preferences({ highContrast: e.target.checked })
                      }
                    />{" "}
                    Contrasto elevato
                  </label>
                  <label htmlFor="text-scale">Dimensione del testo</label>
                  <select
                    id="text-scale"
                    aria-disabled={busy}
                      disabled={busy}
                    value={model.textScale}
                    onChange={(e) =>
                      preferences({
                        textScale: e.target.value as LabModelTextScale,
                      })
                    }
                  >
                    <option value="default">Normale</option>
                    <option value="large">Grande</option>
                    <option value="extra_large">Molto grande</option>
                  </select>
                </fieldset>
                <fieldset aria-busy={busy}>
                  <legend>Audio</legend>
                  <label><input type="checkbox" disabled={busy} checked={snapshot.save.settings.soundEnabled} onChange={e => preferences({ soundEnabled: e.target.checked })} /> Suoni</label>
                  <label><input type="checkbox" disabled checked={snapshot.save.settings.musicEnabled} readOnly /> Musica · disponibile in una fase futura</label>
                  <p>I suoni sono facoltativi. Ogni risultato resta leggibile.</p>
                </fieldset>
                <details onToggle={e => setDiagnosticsOpen(e.currentTarget.open)}>
                  <summary>
                    Salvataggio locale · importazione e recupero
                  </summary>
                  {diagnosticsOpen && <Suspense fallback={<p>Apertura salvataggio…</p>}><SaveDiagnostics
                    beginOperation={beginOperation}
                    application={application}
                    boot={boot}
                    onSnapshot={accept}
                  /></Suspense>}
                </details>
                </>}
                {contentApplication && <fieldset className="author-fieldset"><legend>Modalità autore · avanzate</legend>
                  <label><input type="checkbox" checked={author} disabled={busy} onChange={e => setAuthor(e.target.checked)} /> Attiva modalità autore locale</label>
                  <p>Anteprime complete, compresi contenuti nascosti. Riservate all’autrice; nessuna approvazione canonica automatica.</p>
                  {author && <><button disabled={busy} onClick={()=>setEditing(!editing)}>{editing?'Torna ai pacchetti':'Apri Studio contenuti'}</button><Suspense fallback={<p>Apertura authoring…</p>}>{editing?<ContentStudio application={contentApplication} busy={busy} beginOperation={beginOperation} safe={()=>updates.getSnapshot().safe}/>:<ContentImportPanel application={contentApplication} busy={busy} beginOperation={beginOperation} safe={() => updates.getSnapshot().safe} />}</Suspense></>}
                </fieldset>}
              </div>);
}
