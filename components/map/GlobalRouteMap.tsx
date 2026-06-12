import { approvedClientOrigins } from "@/content/config/origins";

export function GlobalRouteMap() {
  return (
    <figure className="overflow-hidden rounded-md bg-atlas-navy text-white shadow-soft">
      <svg viewBox="0 0 1100 520" role="img" aria-labelledby="routeMapTitle routeMapDesc" className="h-full w-full">
        <title id="routeMapTitle">Routes connecting regional clients to Singapore</title>
        <desc id="routeMapDesc">A stylized map showing approved client origins connecting toward Singapore.</desc>
        <defs>
          <radialGradient id="goldPulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F0BD3C" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#D9A528" stopOpacity="0" />
          </radialGradient>
          <pattern id="mapDots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="#7ea2c8" opacity="0.35" />
          </pattern>
        </defs>
        <rect width="1100" height="520" fill="#071D3A" />
        <path
          d="M126 150c118-49 213-47 325-16 81 23 144 15 238-9 109-28 207-8 303 53M150 310c87-40 180-46 296-12 103 30 192 24 310-11 86-26 161-15 244 32"
          stroke="#40698f"
          strokeWidth="38"
          strokeLinecap="round"
          opacity="0.24"
        />
        <rect x="70" y="70" width="960" height="360" fill="url(#mapDots)" opacity="0.92" />
        <Route from={[555, 200]} to={[606, 342]} />
        <Route from={[720, 135]} to={[606, 342]} />
        <Route from={[395, 245]} to={[606, 342]} />
        <Route from={[790, 285]} to={[606, 342]} />
        <circle cx="606" cy="342" r="58" fill="url(#goldPulse)" />
        <circle cx="606" cy="342" r="20" fill="#D9A528" stroke="#FFF7DF" strokeWidth="4" />
        <text x="606" y="396" textAnchor="middle" fill="#F0BD3C" fontSize="24" fontWeight="700">
          Singapore
        </text>
        {approvedClientOrigins
          .filter((origin) => origin.city !== "Singapore")
          .map((origin, index) => {
            const points = [
              [555, 200],
              [720, 135],
              [395, 245],
              [790, 285]
            ] as const;
            const [x, y] = points[index];
            return (
              <g key={origin.city}>
                <circle cx={x} cy={y} r="9" fill="#D9A528" stroke="#FFF7DF" strokeWidth="2" />
                <text x={x + 16} y={y - 10} fill="#FFFFFF" fontSize="17" fontWeight="700">
                  {origin.label}
                </text>
                <text x={x + 16} y={y + 11} fill="#B8C7D8" fontSize="13">
                  client-approved origin
                </text>
              </g>
            );
          })}
      </svg>
      <figcaption className="sr-only">Stylized route map with Singapore as the anchor destination.</figcaption>
    </figure>
  );
}

function Route({ from, to }: { from: [number, number]; to: [number, number] }) {
  const midX = (from[0] + to[0]) / 2;
  const midY = Math.min(from[1], to[1]) - 90;
  return (
    <path
      d={`M ${from[0]} ${from[1]} Q ${midX} ${midY} ${to[0]} ${to[1]}`}
      fill="none"
      stroke="#D9A528"
      strokeWidth="4"
      strokeLinecap="round"
      opacity="0.86"
    />
  );
}
