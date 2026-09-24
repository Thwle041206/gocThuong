interface GocThuongLogoProps {
  className?: string;
  size?: number;
  showDomain?: boolean;
}

/**
 * góc Thương Vector Mark & Typography matching image.png
 * Features:
 * - Document with folded top-left corner
 * - Fountain pen with precision nib, collar band, and sweeping curved double-line barrel
 * - 3-node connected vector constellation network
 * - "góc Thương" typography with "gocthuong.com" domain subtitle
 */
export function GocThuongLogo({
  className = 'text-zinc-900',
  size = 38,
  showDomain = true,
}: GocThuongLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group ${className}`}>
      {/* Precision Vector Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-105 flex-shrink-0"
        aria-hidden="true"
      >
        {/* ============================================================ */}
        {/* 1. DOCUMENT WITH FOLDED TOP-LEFT CORNER                      */}
        {/* ============================================================ */}
        {/* Top edge & top-right rounded corner */}
        <path
          d="M 80 34 L 126 34 C 136 34 142 40 142 50 L 142 58"
          stroke="currentColor"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Folded Top-Left Flap: diagonal fold line */}
        <path
          d="M 80 34 L 54 60"
          stroke="currentColor"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner flap fold edges */}
        <path
          d="M 80 34 L 80 58 C 80 60 78 60 76 60 L 54 60"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Left edge of document down to curved bottom */}
        <path
          d="M 54 60 L 54 130 C 54 148 68 158 88 158 C 96 158 106 155 116 148"
          stroke="currentColor"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ============================================================ */}
        {/* 2. FOUNTAIN PEN NIB & ACCENTS                                */}
        {/* ============================================================ */}
        {/* Pen Nib Body */}
        <path
          d="M 160 38 L 132 52 C 122 57 116 66 112 78 L 138 96 C 146 88 152 78 152 66 Z"
          stroke="currentColor"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Slit line from tip to breather hole */}
        <line
          x1="160"
          y1="38"
          x2="137"
          y2="64"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Breather hole on nib */}
        <circle
          cx="137"
          cy="64"
          r="4.5"
          fill="currentColor"
        />

        {/* Pen Collar (Cổ bút) */}
        <path
          d="M 108 76 C 105 80 106 85 110 88 L 134 104 C 138 107 143 106 146 102 C 149 98 148 93 144 90 L 120 74 C 116 71 111 72 108 76 Z"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* ============================================================ */}
        {/* 3. SWEEPING CURVED PEN BARREL (Thân bút cong đôi nét)        */}
        {/* ============================================================ */}
        {/* Outer bottom-left sweeping curve */}
        <path
          d="M 112 89 C 94 110 78 128 62 144 C 58 148 60 154 68 154 C 82 154 102 140 126 116"
          stroke="currentColor"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Inner parallel sweep 1 */}
        <path
          d="M 118 97 C 104 114 90 130 76 144"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Inner parallel sweep 2 */}
        <path
          d="M 124 103 C 112 118 98 134 84 148"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* ============================================================ */}
        {/* 4. CONSTELLATION / VECTOR ANCHOR NODES (Mạng lưới liên kết)  */}
        {/* ============================================================ */}
        {/* Connection from barrel to Node 1 */}
        <line
          x1="130"
          y1="112"
          x2="142"
          y2="120"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Triangle connecting lines between 3 nodes */}
        <line
          x1="142"
          y1="120"
          x2="168"
          y2="102"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <line
          x1="168"
          y1="102"
          x2="142"
          y2="148"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <line
          x1="142"
          y1="148"
          x2="142"
          y2="120"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Node 1 (Center node) */}
        <circle cx="142" cy="120" r="7" fill="currentColor" />

        {/* Node 2 (Top-right node) */}
        <circle cx="168" cy="102" r="7" fill="currentColor" />

        {/* Node 3 (Bottom node) */}
        <circle cx="142" cy="148" r="7" fill="currentColor" />
      </svg>

      {/* Typography: "góc Thương" + "gocthuong.com" */}
      <div className="flex flex-col text-left leading-tight">
        <span className="font-sans font-bold text-base sm:text-[18px] tracking-tight text-inherit">
          góc Thương
        </span>
        {showDomain && (
          <span className="font-sans text-[10px] sm:text-[11px] font-normal tracking-wide opacity-75">
            gocthuong.com
          </span>
        )}
      </div>
    </div>
  );
}

// Keep HirokiLogo alias for seamless compatibility across existing components
export const HirokiLogo = GocThuongLogo;
export default GocThuongLogo;
