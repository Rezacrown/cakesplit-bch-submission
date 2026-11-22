export function WavyInkDivider({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`mx-auto flex w-full max-w-6xl items-center justify-center px-4 sm:px-6 ${className}`}
    >
      <svg
        viewBox="0 0 960 24"
        fill="none"
        className="h-5 w-full text-[#18181B]/25"
        preserveAspectRatio="none"
      >
        <path
          d="M2 12 C 32 3, 62 21, 92 12 C 122 3, 152 21, 182 12 C 212 3, 242 21, 272 12 C 302 3, 332 21, 362 12 C 392 3, 422 21, 452 12 C 482 3, 512 21, 542 12 C 572 3, 602 21, 632 12 C 662 3, 692 21, 722 12 C 752 3, 782 21, 812 12 C 842 3, 872 21, 902 12 C 924 5, 944 18, 958 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function InkHeadlineUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 260 16"
      fill="none"
      className={`w-full ${className}`}
      preserveAspectRatio="none"
    >
      <path
        d="M3 11.5 C 58 4, 152 3.5, 257 10.5"
        stroke="#18181B"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M22 14.5 C 88 10.5, 174 10, 238 13.5"
        stroke="#18181B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
    </svg>
  );
}

export function InkSparkle({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <path
        d="M16 3 C 17.2 11.2, 20.8 14.8, 29 16 C 20.8 17.2, 17.2 20.8, 16 29 C 14.8 20.8, 11.2 17.2, 3 16 C 11.2 14.8, 14.8 11.2, 16 3 Z"
        stroke="#18181B"
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function InkMotionArcs({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 56 56"
      fill="none"
      className={className}
    >
      <path
        d="M14 44 C 10 31, 14 19, 25 11"
        stroke="#18181B"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M25 46 C 22 36, 25 27, 33 21"
        stroke="#18181B"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
    </svg>
  );
}

export function InkStarburstRays({ className = "size-16" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 80"
      fill="none"
      className={className}
    >
      <g stroke="#18181B" strokeWidth="2.5" strokeLinecap="round">
        <line x1="40" y1="6" x2="40" y2="17" />
        <line x1="40" y1="63" x2="40" y2="74" />
        <line x1="6" y1="40" x2="17" y2="40" />
        <line x1="63" y1="40" x2="74" y2="40" />
        <line x1="16" y1="16" x2="24" y2="24" />
        <line x1="56" y1="56" x2="64" y2="64" />
        <line x1="64" y1="16" x2="56" y2="24" />
        <line x1="24" y1="56" x2="16" y2="64" />
      </g>
    </svg>
  );
}
