'use client';

interface SymedLogoProps {
  size?: number;      // высота в px
  showText?: boolean; // показывать «symed» текст
}

export default function SymedLogo({ size = 28, showText = false }: SymedLogoProps) {
  const s = size;
  return (
    <svg
      width={showText ? s * 3.2 : s}
      height={s}
      viewBox={showText ? "0 0 128 40" : "0 0 40 40"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="symed-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1B4FD8" />
          <stop offset="100%" stopColor="#00C2CB" />
        </linearGradient>
      </defs>

      {/* Outer arc — 4 segments */}
      <circle cx="20" cy="20" r="17" stroke="url(#symed-grad)" strokeWidth="2.2"
        strokeDasharray="18 8 18 8 18 8 18 8" strokeLinecap="round"
        transform="rotate(-45 20 20)" />

      {/* Dot accents */}
      <circle cx="20" cy="2.5" r="1.2" fill="#00C2CB" opacity="0.7" />
      <circle cx="37.5" cy="20" r="1.2" fill="#00C2CB" opacity="0.7" />

      {/* Medical cross */}
      <rect x="13.5" y="7" width="13" height="26" rx="3.5" fill="url(#symed-grad)" />
      <rect x="7" y="13.5" width="26" height="13" rx="3.5" fill="url(#symed-grad)" />

      {/* Network nodes */}
      <circle cx="20" cy="20" r="2.2" fill="white" />
      <circle cx="14" cy="15" r="1.5" fill="white" />
      <circle cx="26" cy="15" r="1.5" fill="white" />
      <circle cx="14" cy="25" r="1.5" fill="white" />
      <circle cx="26" cy="25" r="1.5" fill="white" />
      <line x1="20" y1="20" x2="14" y2="15" stroke="white" strokeWidth="1" opacity="0.8" />
      <line x1="20" y1="20" x2="26" y2="15" stroke="white" strokeWidth="1" opacity="0.8" />
      <line x1="20" y1="20" x2="14" y2="25" stroke="white" strokeWidth="1" opacity="0.8" />
      <line x1="20" y1="20" x2="26" y2="25" stroke="white" strokeWidth="1" opacity="0.8" />

      {/* Text "symed" */}
      {showText && (
        <text x="46" y="27" fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
          fontSize="22" fontWeight="700" letterSpacing="-0.5" fill="#0F1F6B">
          symed
        </text>
      )}
    </svg>
  );
}
