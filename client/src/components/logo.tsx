/**
 * Webloom logo — a minimal flower made from spider-web geometry.
 * Six outer nodes bloom from a center point, with just enough connected
 * structure to suggest both web strands and petals at small sizes.
 */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`} aria-label="Webloom">
      <svg
        viewBox="0 0 48 48"
        width="32"
        height="32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* outer bloom */}
        <path
          d="M24 7.5 L37.5 15.25 L37.5 30.75 L24 38.5 L10.5 30.75 L10.5 15.25 Z"
          stroke="currentColor"
          strokeWidth="2.35"
          strokeLinejoin="round"
          opacity="0.92"
        />
        {/* minimal web spokes */}
        <path
          d="M24 23 L24 7.5 M24 23 L37.5 15.25 M24 23 L37.5 30.75 M24 23 L24 38.5 M24 23 L10.5 30.75 M24 23 L10.5 15.25"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.62"
        />
        {/* petal ring */}
        <circle cx="24" cy="23" r="7.8" stroke="currentColor" strokeWidth="1.75" opacity="0.78" />
        {/* node points */}
        <circle cx="24" cy="7.5" r="2.2" fill="currentColor" />
        <circle cx="37.5" cy="15.25" r="2.2" fill="currentColor" />
        <circle cx="37.5" cy="30.75" r="2.2" fill="currentColor" />
        <circle cx="24" cy="38.5" r="2.2" fill="currentColor" />
        <circle cx="10.5" cy="30.75" r="2.2" fill="currentColor" />
        <circle cx="10.5" cy="15.25" r="2.2" fill="currentColor" />
        <circle cx="24" cy="23" r="2.9" fill="currentColor" />
      </svg>
      {showWordmark && (
        <span className="font-display text-lg font-bold tracking-tight leading-none">
          webloom
          <span className="text-accent">.</span>
        </span>
      )}
    </div>
  );
}
