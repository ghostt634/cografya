// Stylised rotating globe: drifting continent band clipped to a sphere.
export function Globe() {
  const land = (dx: number) => (
    <g transform={`translate(${dx} 0)`} className="fill-primary/70">
      <path d="M40 90c20-20 60-25 80-10s10 40-15 50-40 30-55 15-30-35-10-55z" />
      <path d="M150 60c25-10 55 0 60 20s-20 25-30 45-35 15-40-10 0-45 10-55z" />
      <path d="M90 170c15-5 35 5 35 25s-20 40-35 35-15-55 0-60z" />
      <path d="M230 100c20-5 45 10 40 30s-30 20-45 10-15-35 5-40z" className="fill-accent/70" />
      <path d="M260 190c15 0 30 10 25 20s-25 10-30 0 0-20 5-20z" />
    </g>
  );
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm" aria-hidden>
      <div className="absolute inset-0 rounded-full bg-brand opacity-30 blur-3xl" />
      <svg viewBox="0 0 300 300" className="relative h-full w-full">
        <defs>
          <clipPath id="sphere">
            <circle cx="150" cy="150" r="130" />
          </clipPath>
          <radialGradient id="shade" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="white" stopOpacity="0.18" />
            <stop offset="100%" stopColor="black" stopOpacity="0.45" />
          </radialGradient>
        </defs>
        <circle
          cx="150"
          cy="150"
          r="130"
          className="fill-secondary stroke-accent/40"
          strokeWidth="1.5"
        />
        <g clipPath="url(#sphere)">
          <g className="animate-drift" style={{ transformBox: "view-box" }}>
            <svg x="0" y="0" width="600" height="300" viewBox="0 0 600 300" overflow="visible">
              {land(0)}
              {land(300)}
            </svg>
          </g>
          {[40, 80, 120, 160].map((r) => (
            <ellipse
              key={r}
              cx="150"
              cy="150"
              rx={r * 0.8}
              ry="130"
              fill="none"
              className="stroke-accent/20"
            />
          ))}
          {[-80, -40, 0, 40, 80].map((y) => (
            <line key={y} x1="0" x2="300" y1={150 + y} y2={150 + y} className="stroke-accent/20" />
          ))}
          <circle cx="150" cy="150" r="130" fill="url(#shade)" />
        </g>
        <g className="animate-spin-slow" style={{ transformOrigin: "150px 150px" }}>
          <ellipse
            cx="150"
            cy="150"
            rx="148"
            ry="40"
            fill="none"
            className="stroke-electric/50"
            strokeDasharray="4 6"
            transform="rotate(-20 150 150)"
          />
          <circle cx="290" cy="110" r="5" className="fill-accent" />
        </g>
      </svg>
    </div>
  );
}
