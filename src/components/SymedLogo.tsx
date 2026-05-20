'use client';

interface SymedLogoProps {
  size?: number;
}

export default function SymedLogo({ size = 28 }: SymedLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Cross gradient: dark blue → cyan */}
        <linearGradient id="sl-cross" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#1A3FD4" />
          <stop offset="100%" stopColor="#00C8D0" />
        </linearGradient>
        {/* Ring gradient: dark blue left → cyan top-right */}
        <linearGradient id="sl-ring" x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#1A3FD4" />
          <stop offset="100%" stopColor="#00C8D0" />
        </linearGradient>
      </defs>

      {/* ── Outer ring: 4 solid arcs with gap at each compass point ── */}
      {/* Top-left arc  ~200° → 350° (gap ±10° around 0°/top and 90°/right etc.) */}
      {/* Using strokeDasharray on a full circle for simplicity */}
      {/* Circumference of r=44 ≈ 276.5 */}
      {/* We want 4 solid segments ~55° each, 4 gaps ~10° each, plus dotted fills */}

      {/* Solid arcs — stroke-dasharray trick on circle r=44 */}
      <circle
        cx="50" cy="50" r="44"
        stroke="url(#sl-ring)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="23 10 23 10 23 10 23 10"
        transform="rotate(-100 50 50)"
      />

      {/* Dotted arcs in the gaps (smaller dots) */}
      <circle
        cx="50" cy="50" r="44"
        stroke="url(#sl-ring)"
        strokeWidth="2.5"
        fill="none"
        strokeDasharray="2 5 2 5 2 5 2 5 2 5 2 5 2 5 2 5 2 5 2 5 2 5 2 5"
        strokeLinecap="round"
        transform="rotate(-68 50 50)"
        opacity="0.6"
      />

      {/* ── Rounded cross ── */}
      {/* Vertical bar */}
      <rect x="36" y="16" width="28" height="68" rx="8" fill="url(#sl-cross)" />
      {/* Horizontal bar */}
      <rect x="16" y="36" width="68" height="28" rx="8" fill="url(#sl-cross)" />

      {/* ── Network nodes ── */}
      {/* Center */}
      <circle cx="50" cy="50" r="4.5" fill="white" />
      {/* 4 satellite nodes */}
      <circle cx="34" cy="34" r="3"   fill="white" />
      <circle cx="66" cy="34" r="3"   fill="white" />
      <circle cx="34" cy="66" r="3"   fill="white" />
      <circle cx="66" cy="66" r="3"   fill="white" />
      {/* Connecting lines */}
      <line x1="50" y1="50" x2="34" y2="34" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="50" y1="50" x2="66" y2="34" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="50" y1="50" x2="34" y2="66" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="50" y1="50" x2="66" y2="66" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
