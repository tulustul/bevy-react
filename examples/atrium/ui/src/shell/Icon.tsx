import type { AppId } from "../apps";

/** Each app's glyph, white line art on a 24-unit grid. */
export function Icon({ app, size }: { app: AppId; size: number }) {
  const line = {
    fill: "none",
    stroke: "#ffffff",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      {app === "skies" && (
        <>
          <circle cx={12} cy={12} r={8.5} {...line} />
          <path d="M3.5 12h17" {...line} />
          <path
            d="M12 3.5c2.6 2.4 3.9 5.2 3.9 8.5s-1.3 6.1-3.9 8.5c-2.6-2.4-3.9-5.2-3.9-8.5s1.3-6.1 3.9-8.5z"
            {...line}
          />
        </>
      )}
      {app === "notes" && (
        <>
          <rect x={5} y={3.5} width={14} height={17} rx={3} {...line} />
          <path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" {...line} />
        </>
      )}
      {app === "lenses" && (
        <>
          <circle cx={12} cy={12} r={8.5} {...line} />
          <circle cx={12} cy={12} r={3.6} {...line} />
          <circle cx={16.6} cy={7.6} r={0.9} fill="#ffffff" />
        </>
      )}
    </svg>
  );
}
