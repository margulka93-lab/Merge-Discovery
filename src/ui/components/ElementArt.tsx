import { useId } from "react";
// Symbolic local placeholders, keyed independently from recipes; never production artwork.
const motifs: Record<string, string> = {
  void: "M50 22a28 28 0 1 0 0 56a21 21 0 1 1 0-56",
  energy: "M56 14 31 54h18l-5 32 28-45H53z",
  matter: "M50 20 77 36v31L50 83 23 67V36z M23 36l27 16 27-16 M50 52v31",
  time: "M32 20h36 M32 80h36 M36 20c0 20 5 23 14 30-9 7-14 10-14 30 M64 20c0 20-5 23-14 30 9 7 14 10 14 30 M41 72l9-13 9 13z",
  water:
    "M50 16C45 32 27 48 27 61a23 23 0 0 0 46 0C73 48 55 32 50 16z M37 59q-2 12 10 16",
  moon: "M60 20a30 30 0 1 0 20 43A29 29 0 0 1 60 20z",
  star: "M50 14 59 39 85 41 65 57 72 83 50 68 28 83 35 57 15 41 41 39z",
  heat: "M49 15c10 24 28 27 23 49-4 24-39 24-44 0-3-14 10-24 12-34 2 17 10 15 9-15z",
  seed: "M69 27C41 22 20 49 34 70 53 86 82 56 69 27z M35 70l27-32",
  life: "M50 21c-23 1-32 26-18 44 14 22 36 13 40-5 7-20-4-39-22-39z M42 42q20-9 20 11t-20 8z",
};
export function ElementArt({ artKey }: { artKey: string }) {
  const uid = useId().replace(/:/g, "");
  const id = artKey.split(".").at(-1)!;
  const hash = [...artKey].reduce((n, c) => n + c.charCodeAt(0), 0);
  const generic = [
    "M50 19 76 50 50 81 24 50z M35 50h30 M50 34v32",
    "M28 62q22-60 44 0 M28 62q22 26 44 0 M38 52q12-25 24 0",
    "M50 22a28 28 0 1 0 0 56a28 28 0 1 0 0-56 M23 43q27-13 54 0 M23 57q27 13 54 0",
  ];
  return (
    <svg
      className="element-art"
      viewBox="0 0 100 100"
      aria-hidden="true"
      data-art-key={artKey}
    >
      <defs>
        <radialGradient id={`${uid}halo`}>
          <stop stopColor="currentColor" stopOpacity=".24" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}light`} x2=".8" y2="1">
          <stop stopColor="#fff3cc" />
          <stop offset="1" stopColor="currentColor" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="52" r="47" fill={`url(#${uid}halo)`} />
      <ellipse
        cx="50"
        cy="55"
        rx="43"
        ry="29"
        fill="none"
        stroke="currentColor"
        opacity=".17"
        transform="rotate(-25 50 50)"
      />
      <path
        d={motifs[id] ?? generic[hash % generic.length]}
        fill={`url(#${uid}light)`}
        fillOpacity=".22"
        stroke={`url(#${uid}light)`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="27" r="1.4" fill="#fff3cc" />
      <circle cx="83" cy="74" r="1" fill="currentColor" />
    </svg>
  );
}
