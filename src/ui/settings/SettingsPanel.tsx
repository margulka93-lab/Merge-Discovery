import { lazy, Suspense, useState } from 'react';
import { InformationModeControls } from './InformationModeControls';
import type { LabModel } from '../../application/laboratory';
import type { ApplicationSnapshot, SaveApplication } from '../../application/save/SaveApplication';
const SaveDiagnostics = lazy(() => import('../SaveDiagnostics').then(m => ({ default: m.SaveDiagnostics })));
type LabModelTextScale = 'default' | 'large' | 'extra_large';
export function SettingsPanel({ model, snapshot, busy, preferences, application, boot, accept, beginOperation }: {
  model: LabModel; snapshot: ApplicationSnapshot; busy: boolean;
  preferences: (change: Parameters<SaveApplication['updatePreferences']>[0]) => void;
  application: SaveApplication; boot: Promise<ApplicationSnapshot>; accept: (snapshot: ApplicationSnapshot) => void;
  beginOperation: () => (() => void) | undefined;
}) {
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  return (
    <>
                <InformationModeControls
                  preferences={snapshot.save.settings}
                  busy={busy}
                  change={preferences}
                />
                <fieldset aria-busy={busy}>
                  <legend>Audio</legend>
                  <label><input type="checkbox" disabled={busy} checked={snapshot.save.settings.soundEnabled} onChange={e => preferences({ soundEnabled: e.target.checked })} /> Suoni</label>
                  <label><input type="checkbox" disabled checked={snapshot.save.settings.musicEnabled} readOnly /> Musica · disponibile in una fase futura</label>
                  <p>I suoni sono facoltativi. Ogni risultato resta leggibile.</p>
                </fieldset>
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
              </>);
}
