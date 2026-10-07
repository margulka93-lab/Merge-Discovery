import { useId } from "react";

// Local, replaceable SVG studies. Categories describe art only, never recipe validity.
const silhouettes: Record<string, string> = {
  void: "M63 17a34 34 0 1 0 19 53A31 31 0 0 1 63 17Z",
  energy: "M58 9 25 56h23l-8 36 37-51H56Z",
  matter: "M50 16 81 34v35L50 87 19 69V34Z",
  time: "M28 17h44v7H28Z M33 24c0 18 6 21 17 28-11 7-17 12-17 27h34c0-15-6-20-17-27 11-7 17-10 17-28Z M28 79h44v7H28Z",
  water: "M50 12C45 31 23 47 23 65a27 27 0 0 0 54 0C77 47 55 31 50 12Z",
  moon: "M64 14a35 35 0 1 0 20 55A34 34 0 0 1 64 14Z",
  star: "M50 11 60 36 88 39 67 57 73 86 50 70 27 86 33 57 12 39 40 36Z",
  heat: "M51 10c8 26 29 34 25 57-5 27-46 26-51 0-4-17 10-28 15-40 1 21 12 21 11-17Z",
  seed: "M69 21C35 16 15 52 33 76 57 94 88 57 69 21Z",
  light: "M50 12 56 34 73 23 66 43 88 50 66 56 77 73 57 67 50 88 43 67 23 77 34 56 12 50 34 43 27 23 44 34Z",
  life: "M50 18C22 15 14 48 28 72c16 24 49 12 52-15 3-22-12-36-30-39Z",
  mineral: "M25 65 36 27 52 15 69 29 81 65 60 85 38 83Z",
  plant: "M49 81C16 68 18 30 43 23c-1 15 4 29 6 36 0-25 10-38 31-42 8 24-6 48-29 55Z",
  creature: "M25 73 20 43 29 22 41 38 58 33 71 19 77 44 72 68 58 81 38 82Z",
  sphere: "M50 17a33 33 0 1 0 0 66a33 33 0 1 0 0-66Z",
  cloud: "M19 65c-13-12-2-30 12-29 4-24 32-24 39-7 20-3 30 19 17 32-8 10-55 16-68 4Z",
};
const category = (id: string) => {
  if (silhouettes[id]) return id;
  if (/water|rain|ocean|river|lake|drop/.test(id)) return "water";
  if (/heat|fire|lava|light|plasma|sun/.test(id)) return "heat";
  if (/plant|leaf|tree|flower|moss|fung|mushroom|grass|wood/.test(id)) return "plant";
  if (/wolf|animal|fish|bird|insect|beast/.test(id)) return "creature";
  if (/cloud|gas|nebula|steam|air|mist/.test(id)) return "cloud";
  if (/earth|stone|sand|rock|mountain|metal|crystal|soil|mud/.test(id)) return "mineral";
  if (/star|space|cosmo|comet/.test(id)) return "star";
  return "sphere";
};

export function ElementArt({ artKey }: { artKey: string }) {
  const uid = `art-${useId().replace(/:/g, "")}`;
  const kind = category(artKey.split(".").at(-1)!);
  return <svg className="element-art" viewBox="0 0 100 100" aria-hidden="true" data-art-key={artKey} data-art-study={kind}>
    <defs>
      <radialGradient id={`${uid}-halo`}>
        <stop stopColor="currentColor" stopOpacity=".3" />
        <stop offset="1" stopColor="currentColor" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${uid}-body`} x1=".15" y1="0" x2=".8" y2="1">
        <stop stopColor="currentColor" stopOpacity=".85" />
        <stop offset=".45" stopColor="currentColor" stopOpacity=".44" />
        <stop offset="1" stopColor="#101b2b" />
      </linearGradient>
      <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#f8e7bf" /><stop offset="1" stopColor="currentColor" stopOpacity=".4" />
      </linearGradient>
      <clipPath id={`${uid}-shape`}><path d={silhouettes[kind]} /></clipPath>
    </defs>
    <circle cx="50" cy="50" r="47" fill={`url(#${uid}-halo)`} />
    <ellipse cx="50" cy="85" rx="29" ry="4" fill="#040913" opacity=".55" />
    <ellipse cx="50" cy="53" rx="43" ry="28" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".25" transform="rotate(-28 50 50)" />
    <path d={silhouettes[kind]} fill={`url(#${uid}-body)`} stroke={`url(#${uid}-rim)`} strokeWidth="1.3" strokeLinejoin="round" />
    <g clipPath={`url(#${uid}-shape)`} fill="none" stroke="currentColor" strokeWidth=".7" opacity=".4">
      <path d="M14 37q26-16 72 0 M13 43q33-9 74 3 M14 63q35 20 69-1 M19 71q39 18 67-3 M31 10 70 94" />
      <path d="M12 24 84 82 M20 21 91 75" opacity=".4" />
    </g>
    {kind === "matter" && <path d="M19 34 50 52 81 34 M50 52v35" fill="none" stroke="#f8e7bf" strokeWidth="1.2" opacity=".7" />}
    {kind === "water" && <path d="M34 56q-8 20 11 25" fill="none" stroke="#f8e7bf" strokeWidth="2" strokeLinecap="round" opacity=".65" />}
    {kind === "plant" && <path d="M47 84 39 36 M49 78 70 32" fill="none" stroke="#f8e7bf" strokeWidth="1" opacity=".6" />}
    {kind === "mineral" && <path d="M36 27 45 59 38 83 M52 15 60 58 69 29 M25 65 45 59 60 58 81 65 M60 58v27" fill="none" stroke="#f8e7bf" strokeWidth="1" opacity=".55" />}
    <g fill="#f8e7bf"><circle cx="15" cy="31" r=".9" /><circle cx="86" cy="69" r=".65" /><circle cx="74" cy="17" r=".5" /></g>
  </svg>;
}
