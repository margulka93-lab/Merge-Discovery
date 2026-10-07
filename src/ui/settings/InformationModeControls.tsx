export interface InformationPreferences {
  informationMode: "mystery" | "balanced" | "collector";
  proactiveHints: "off" | "light" | "normal";
}
export function InformationModeControls({
  preferences,
  busy,
  change,
}: {
  preferences: InformationPreferences;
  busy: boolean;
  change: (value: Partial<InformationPreferences>) => void;
}) {
  return (
    <fieldset aria-busy={busy}>
      <legend>Informazioni e indizi</legend>
      <label>
        Informazioni mostrate
        <select
          aria-label="Informazioni mostrate"
          aria-disabled={busy}
          disabled={busy}
          value={preferences.informationMode}
          onChange={(e) =>
            change({
              informationMode: e.target
                .value as InformationPreferences["informationMode"],
            })
          }
        >
          <option value="mystery">Mistero</option>
          <option value="balanced">Equilibrato</option>
          <option value="collector">Collezionista</option>
        </select>
      </label>
      <label>
        Indizi proattivi
        <select
          aria-label="Indizi proattivi"
          aria-disabled={busy}
          disabled={busy}
          value={preferences.proactiveHints}
          onChange={(e) =>
            change({
              proactiveHints: e.target
                .value as InformationPreferences["proactiveHints"],
            })
          }
        >
          <option value="off">Disattivati</option>
          <option value="light">Leggeri</option>
          <option value="normal">Normali</option>
        </select>
      </label>
    </fieldset>
  );
}
