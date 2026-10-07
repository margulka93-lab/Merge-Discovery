/** Decorative project-owned linework; never a source of gameplay information. */
export function ObservatoryMark({ className = "" }: { className?: string }) {
  return <svg className={`observatory-mark ${className}`} viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="26" />
    <ellipse cx="32" cy="32" rx="29" ry="12" transform="rotate(-35 32 32)" />
    <path d="M32 15 36 27 48 32 36 36 32 49 28 36 16 32 28 27Z" />
    <circle cx="52" cy="15" r="2" className="mark-star" />
  </svg>;
}

export function InstrumentLines() {
  return <svg className="instrument-lines" viewBox="0 0 600 360" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    <g className="instrument-orbits">
      <ellipse cx="300" cy="175" rx="264" ry="142" />
      <ellipse cx="300" cy="175" rx="231" ry="116" transform="rotate(-13 300 175)" />
      <ellipse cx="300" cy="175" rx="278" ry="80" transform="rotate(15 300 175)" />
      <path d="M32 175H568 M300 15V335 M128 61 472 289 M128 289 472 61" />
      <circle cx="300" cy="175" r="37" />
      <path d="M287 175h26 M300 162v26 M294 22h12 M294 328h12 M35 169v12 M565 169v12" />
    </g>
    <g className="instrument-stars">
      <path d="m71 106 4-9 4 9-4 9Z m442 126 3-7 3 7-3 7Z m-83 70 3-7 3 7-3 7Z" />
      <circle cx="103" cy="245" r="2" /><circle cx="503" cy="72" r="2" />
      <circle cx="276" cy="33" r="1.5" /><circle cx="391" cy="310" r="1.5" />
    </g>
  </svg>;
}
