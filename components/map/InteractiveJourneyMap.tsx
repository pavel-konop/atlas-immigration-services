"use client";

import { geoCentroid, geoGraticule10, geoNaturalEarth1, geoPath } from "d3-geo";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useRef } from "react";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";

const mapFocus = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [34, 58],
        [146, 58],
        [146, -36],
        [34, -36],
        [34, 58]
      ]
    ]
  },
  properties: {}
};

const projection = geoNaturalEarth1().fitExtent(
  [
    [-92, 24],
    [1326, 664]
  ],
  mapFocus as never
);
const pathGenerator = geoPath(projection);
const topology = worldAtlas as unknown as {
  objects: {
    countries: unknown;
  };
};
const countryFeatures = feature(worldAtlas as never, topology.objects.countries as never) as unknown as {
  type: "FeatureCollection";
  features: unknown[];
};
const focusCountryFeatures = {
  type: "FeatureCollection",
  features: countryFeatures.features.filter((country) => {
    const [lng, lat] = geoCentroid(country as never);
    return lng >= 20 && lng <= 158 && lat >= -44 && lat <= 68;
  })
};
const landPath = pathGenerator(focusCountryFeatures as never) || "";
const countryPath = pathGenerator(focusCountryFeatures as never) || "";
const graticulePath = pathGenerator(geoGraticule10()) || "";

const singaporeLngLat: [number, number] = [103.8198, 1.3521];
const singaporePoint = projection(singaporeLngLat) || [660, 392];
const singapore = { x: singaporePoint[0], y: singaporePoint[1] };

const originPoints = [
  { key: "India", label: "India", lngLat: [78.9629, 20.5937] as [number, number], dx: -18, dy: -26, anchor: "end" as const },
  { key: "China", label: "China", lngLat: [104.1954, 35.8617] as [number, number], dx: -14, dy: -26, anchor: "end" as const },
  { key: "Japan", label: "Japan", lngLat: [138.2529, 36.2048] as [number, number], dx: -18, dy: -24, anchor: "end" as const },
  {
    key: "Philippines",
    label: "Philippines",
    lngLat: [121.774, 12.8797] as [number, number],
    dx: 18,
    dy: -20,
    anchor: "end" as const
  },
  {
    key: "Indonesia",
    label: "Indonesia",
    lngLat: [113.9213, -0.7893] as [number, number],
    dx: 22,
    dy: 36,
    anchor: "start" as const
  }
].map((origin) => {
  const point = projection(origin.lngLat) || [0, 0];
  return {
    ...origin,
    x: point[0],
    y: point[1],
    labelX: point[0] + origin.dx,
    labelY: point[1] + origin.dy
  };
});

const stages = [
  { label: "Map", progress: 0.02 },
  { label: "Routes", progress: 0.3 },
  { label: "Singapore", progress: 0.58 },
  { label: "Services", progress: 0.84 }
] as const;

export function InteractiveJourneyMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 26, mass: 0.35 });

  const mapScale = useTransform(progress, [0, 0.34, 0.68, 1], reduceMotion ? [1, 1, 1, 1] : [1.03, 1.13, 1.34, 1.34]);
  const mapX = useTransform(progress, [0, 0.34, 0.68, 1], reduceMotion ? [0, 0, 0, 0] : [26, -10, -126, -126]);
  const mapY = useTransform(progress, [0, 0.34, 0.68, 1], reduceMotion ? [0, 0, 0, 0] : [0, -14, -64, -64]);
  const routeLength = useTransform(progress, [0.18, 0.46], [0, 1]);
  const originOpacity = useTransform(progress, [0, 0.12, 0.7], [0.65, 1, 0.55]);
  const singaporeScale = useTransform(progress, [0.36, 0.64], [0.75, 1.08]);
  const mapFade = useTransform(progress, [0.74, 0.92], [1, 0.88]);

  function goToStage(targetProgress: number) {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const scrollable = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + scrollable * targetProgress, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <section ref={sectionRef} id="singapore-journey-map" data-atlas-journey-map="true" className="relative bg-white">
      <div className="h-[260vh] min-h-[1680px]">
        <div className="sticky top-20 min-h-[calc(100vh-5rem)] overflow-hidden bg-atlas-navy text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_50%,rgba(217,165,40,0.13),transparent_27%),linear-gradient(90deg,rgba(7,29,58,0.92)_0%,rgba(7,29,58,0.48)_26%,rgba(7,29,58,0.08)_52%,rgba(7,29,58,0)_100%)]" />
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ scale: mapScale, x: mapX, y: mapY, opacity: mapFade, transformOrigin: `${singapore.x}px ${singapore.y}px` }}
          >
            <JourneySvg routeLength={routeLength} originOpacity={originOpacity} singaporeScale={singaporeScale} />
          </motion.div>

          <div className="container-shell relative z-10 flex min-h-[calc(100vh-5rem)] flex-col justify-between py-6 md:py-10">
            <div className="relative z-30 max-w-md pt-2 md:pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">Singapore journey map</p>
              <p className="mt-4 max-w-sm text-base font-semibold leading-7 text-white">From global origins to a confident Singapore start.</p>
            </div>
            <div className="relative z-30 mb-2 flex flex-wrap gap-2 md:flex-nowrap">
                {stages.map((stage, index) => (
                  <button
                    key={stage.label}
                    type="button"
                    onClick={() => goToStage(stage.progress)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/18 bg-white/8 px-4 text-xs font-bold uppercase tracking-[0.12em] text-white/86 backdrop-blur transition hover:border-atlas-gold hover:text-atlas-gold"
                  >
                    <span className="text-atlas-gold">{String(index + 1).padStart(2, "0")}</span>
                    {stage.label}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function JourneySvg({
  routeLength,
  originOpacity,
  singaporeScale
}: {
  routeLength: MotionValue<number>;
  originOpacity: MotionValue<number>;
  singaporeScale: MotionValue<number>;
}) {
  return (
    <svg viewBox="0 0 1200 640" role="img" aria-labelledby="journeyTitle journeyDesc" className="h-full w-full">
      <title id="journeyTitle">Animated routes to Singapore</title>
      <desc id="journeyDesc">A dark blue map with gold routes from approved origin regions converging on Singapore.</desc>
      <defs>
        <pattern id="atlas-map-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.05" fill="#9BB7D0" opacity="0.42" />
        </pattern>
        <radialGradient id="atlas-anchor-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F0BD3C" stopOpacity="0.78" />
          <stop offset="62%" stopColor="#D9A528" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#D9A528" stopOpacity="0" />
        </radialGradient>
        <filter id="softGlow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="atlas-map-focus">
          <rect x="0" y="0" width="1200" height="640" rx="0" />
        </clipPath>
      </defs>
      <rect width="1200" height="640" fill="#071D3A" />
      <g clipPath="url(#atlas-map-focus)">
        <path d={graticulePath} fill="none" stroke="#4A7092" strokeWidth="0.7" strokeDasharray="2 10" opacity="0.34" />
        <path d={landPath} fill="#12365F" opacity="0.92" />
        <path d={landPath} fill="url(#atlas-map-dots)" opacity="0.95" />
        <path d={countryPath} fill="none" stroke="#254D75" strokeWidth="0.6" opacity="0.62" />
        {originPoints.map((origin) => {
          const label = origin.label;
          return (
            <motion.g key={origin.key} opacity={originOpacity}>
              <motion.path
                d={routePath([origin.x, origin.y], [singapore.x, singapore.y])}
                fill="none"
                stroke="#D9A528"
                strokeWidth="4"
                strokeLinecap="round"
                pathLength={routeLength}
                filter="url(#softGlow)"
              />
              <circle cx={origin.x} cy={origin.y} r="6" fill="#D9A528" stroke="#FFF7DF" strokeWidth="1.8" />
              <circle cx={origin.x} cy={origin.y} r="14" fill="none" stroke="#D9A528" strokeWidth="1.6" opacity="0.32" />
              <text x={origin.labelX} y={origin.labelY} textAnchor={origin.anchor} fill="#FFFFFF" fontSize="14" fontWeight="800">
                {label}
              </text>
            </motion.g>
          );
        })}
        <motion.g style={{ scale: singaporeScale, transformOrigin: `${singapore.x}px ${singapore.y}px` }}>
          <circle cx={singapore.x} cy={singapore.y} r="58" fill="url(#atlas-anchor-glow)" />
          <circle cx={singapore.x} cy={singapore.y} r="18" fill="#D9A528" stroke="#FFF7DF" strokeWidth="3" />
          <circle cx={singapore.x} cy={singapore.y} r="34" fill="none" stroke="#D9A528" strokeWidth="2.3" opacity="0.5" />
          <text x={singapore.x} y={singapore.y + 52} textAnchor="middle" fill="#F0BD3C" fontSize="18" fontWeight="900">
            Singapore
          </text>
        </motion.g>
      </g>
    </svg>
  );
}

function routePath(from: [number, number], to: [number, number]) {
  const midX = (from[0] + to[0]) / 2;
  const midY = Math.min(from[1], to[1]) - Math.max(70, Math.abs(from[0] - to[0]) * 0.18);
  return `M ${from[0]} ${from[1]} Q ${midX} ${midY} ${to[0]} ${to[1]}`;
}
