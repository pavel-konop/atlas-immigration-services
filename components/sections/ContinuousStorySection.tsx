"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { geoCentroid, geoGraticule10, geoNaturalEarth1, geoPath } from "d3-geo";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useRef } from "react";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import type { AudienceJourneySlide } from "@/types/admin-content";

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

const singaporePoint = projection([103.8198, 1.3521]) || [660, 392];
const singapore = { x: singaporePoint[0], y: singaporePoint[1] };

const originPoints = [
  { key: "India", label: "India", lngLat: [78.9629, 20.5937] as [number, number], dx: -18, dy: -26, anchor: "end" as const },
  { key: "China", label: "China", lngLat: [104.1954, 35.8617] as [number, number], dx: -14, dy: -26, anchor: "end" as const },
  { key: "Japan", label: "Japan", lngLat: [138.2529, 36.2048] as [number, number], dx: -18, dy: -24, anchor: "end" as const },
  { key: "Philippines", label: "Philippines", lngLat: [121.774, 12.8797] as [number, number], dx: 18, dy: -20, anchor: "end" as const },
  { key: "Indonesia", label: "Indonesia", lngLat: [113.9213, -0.7893] as [number, number], dx: 22, dy: 36, anchor: "start" as const }
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

const supplementalDots = [
  { key: "central-asia", lngLat: [58, 31] as [number, number], radius: 20 },
  { key: "africa", lngLat: [38, -15] as [number, number], radius: 22 }
].map((dot) => {
  const point = projection(dot.lngLat) || [0, 0];
  return {
    ...dot,
    x: point[0],
    y: point[1]
  };
});

const storySteps = ["Partner", "Map", "Path"] as const;
type StoryVariant = "v1" | "v2" | "v3";
type StoryTone = "classic" | "modern" | "transition";

export const ContinuousStorySection = dynamic(() => Promise.resolve(ContinuousStoryExperience), {
  ssr: false,
  loading: () => <section className="min-h-[calc(100vh-5rem)] bg-atlas-navy" />
});

function ContinuousStoryExperience({ slides, variant = "v1" }: { slides: AudienceJourneySlide[]; variant?: StoryVariant }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const enabledSlides = slides.filter((slide) => slide.enabled).slice(0, 3);
  const tone: StoryTone = variant === "v2" ? "modern" : variant === "v3" ? "transition" : "classic";
  const isModern = tone === "modern";
  const isTransition = tone === "transition";
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });
  const progress = useSpring(scrollYProgress, { stiffness: 74, damping: 24, mass: 0.38 });

  const heroOpacity = useTransform(progress, isTransition ? [0, 0.3, 0.46] : [0, 0.22, 0.36], [1, 1, 0]);
  const heroY = useTransform(progress, isTransition ? [0, 0.46] : [0, 0.36], [0, -64]);
  const heroImageOpacity = useTransform(progress, [0, 0.28, 0.46], [1, 0.72, 0.18]);
  const navyOpacity = useTransform(progress, [0, 0.26, 0.5], [0.2, 0.78, 1]);
  const mapOpacity = useTransform(progress, [0.18, 0.34, 0.82], [0, 1, 0.82]);
  const mapScale = useTransform(progress, [0.26, 0.58, 1], reduceMotion ? [1, 1, 1] : [1.02, 1.28, 1.38]);
  const mapX = useTransform(progress, [0.26, 0.58, 1], reduceMotion ? [0, 0, 0] : [20, -92, -130]);
  const mapY = useTransform(progress, [0.26, 0.58, 1], reduceMotion ? [0, 0, 0] : [0, -48, -58]);
  const routeLength = useTransform(progress, [0.34, 0.56], [0, 1]);
  const pathOpacity = useTransform(progress, isTransition ? [0.52, 0.72] : [0.62, 0.78], [0, 1]);
  const pathY = useTransform(progress, isTransition ? [0.52, 0.72] : [0.62, 0.78], [96, 0]);

  return (
    <section ref={sectionRef} data-atlas-continuous-story="true" data-atlas-story-variant={variant} className="relative bg-atlas-navy">
      <div className="h-[360vh] min-h-[2500px]">
        <div className="sticky top-20 min-h-[calc(100vh-5rem)] overflow-hidden text-white">
          <motion.div className="absolute inset-0" style={{ opacity: heroImageOpacity }}>
            <Image src="/images/atlas-singapore-hero.png" alt="" fill priority sizes="100vw" className="object-cover object-[62%_center]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.74)_28%,rgba(255,255,255,0.1)_58%,rgba(7,29,58,0.42)_100%)]" />
          </motion.div>
          <motion.div className="absolute inset-0 bg-atlas-navy" style={{ opacity: navyOpacity }} />
          <motion.div className="absolute inset-0" style={{ opacity: mapOpacity, scale: mapScale, x: mapX, y: mapY, transformOrigin: `${singapore.x}px ${singapore.y}px` }}>
            <StoryMap routeLength={routeLength} tone={tone} />
          </motion.div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_52%,rgba(217,165,40,0.14),transparent_28%),linear-gradient(90deg,rgba(7,29,58,0.92)_0%,rgba(7,29,58,0.7)_28%,rgba(7,29,58,0.16)_58%,rgba(7,29,58,0)_100%)]" />
          {isTransition ? (
            <motion.div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[55%]" style={{ opacity: pathOpacity }}>
              <TransitionGridMap />
            </motion.div>
          ) : null}

          <div className="container-shell relative z-10 flex min-h-[calc(100vh-5rem)] flex-col justify-between py-8">
            <motion.div className="max-w-[680px] pt-8" style={{ opacity: heroOpacity, y: heroY }}>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-atlas-gold">Singapore immigration and corporate services</p>
              <h1 className={isModern || isTransition ? "max-w-[650px] font-serif text-5xl leading-[1.03] text-white drop-shadow-[0_3px_24px_rgba(0,0,0,0.34)] md:text-[4.7rem]" : "max-w-[650px] font-serif text-5xl leading-[1.03] text-atlas-navy md:text-[4.7rem]"}>
                Your trusted <span className={isModern ? "text-cyan-200" : "text-atlas-gold"}>Singapore</span> partner
              </h1>
              <p className={isModern || isTransition ? "mt-6 max-w-lg text-lg leading-8 text-white/86 drop-shadow-[0_2px_12px_rgba(0,0,0,0.34)]" : "mt-6 max-w-lg text-lg leading-8 text-slate-700"}>
                Immigration and corporate services guidance with a personal, practical touch.
              </p>
            </motion.div>

            <motion.div className="max-w-xl" style={{ opacity: mapOpacity }}>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">Singapore journey map</p>
              <p className="mt-4 max-w-sm text-base font-semibold leading-7 text-white">From global origins to a confident Singapore start.</p>
            </motion.div>

            <motion.div className="grid gap-4 md:grid-cols-3" style={{ opacity: pathOpacity, y: pathY }}>
              {enabledSlides.map((slide, index) => (
                <Link
                  key={slide.id}
                  href={slide.href}
                  className={
                    isTransition
                      ? "group grid min-h-[260px] gap-4 rounded-md border border-cyan-200/22 bg-[#0f1621]/88 p-4 text-white shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-md transition hover:-translate-y-1 hover:border-atlas-gold md:grid-cols-[0.48fr_0.52fr] md:items-center"
                      : "group grid min-h-[235px] gap-4 rounded-md border border-white/14 bg-white/10 p-4 text-white shadow-soft backdrop-blur-md transition hover:-translate-y-1 hover:border-atlas-gold"
                  }
                >
                  <span className={isTransition ? "relative block min-h-[210px] overflow-hidden rounded-md bg-white/10" : "relative block aspect-[16/9] overflow-hidden rounded-md bg-white/10"}>
                    <Image src={slide.image} alt="" fill sizes="33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  </span>
                  <span>
                    <span className="text-sm font-bold text-atlas-gold">{String(index + 1).padStart(2, "0")}</span>
                    <span className="mt-2 block font-serif text-2xl leading-tight">{slide.label}</span>
                    <span className="mt-2 block text-sm leading-6 text-white/72">{slide.subtitle}</span>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                      Explore <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </span>
                </Link>
              ))}
            </motion.div>

            <div className="flex flex-wrap gap-2">
              {storySteps.map((step, index) => (
                <span key={step} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/18 bg-white/8 px-4 text-xs font-bold uppercase tracking-[0.12em] text-white/86 backdrop-blur">
                  <span className="text-atlas-gold">{String(index + 1).padStart(2, "0")}</span>
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StoryMap({ routeLength, tone }: { routeLength: MotionValue<number>; tone: StoryTone }) {
  const modern = tone === "modern";
  const transition = tone === "transition";
  const mapDotPattern = modern ? "story-modern-dots" : "story-map-dots";

  return (
    <svg viewBox="0 0 1200 640" aria-hidden="true" className="h-full w-full">
      <defs>
        <pattern id="story-map-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.05" fill="#9BB7D0" opacity="0.42" />
        </pattern>
        <pattern id="story-modern-dots" width="13" height="13" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#63E7FF" opacity="0.5" />
        </pattern>
        <radialGradient id="story-anchor-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F0BD3C" stopOpacity="0.78" />
          <stop offset="62%" stopColor="#D9A528" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#D9A528" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="storyLinearGlow" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#2BD9FF" stopOpacity="0.1" />
          <stop offset="48%" stopColor="#2BD9FF" stopOpacity="0.68" />
          <stop offset="100%" stopColor="#D9A528" stopOpacity="0.38" />
        </linearGradient>
        <filter id="storySoftGlow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="storyContourGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="1200" height="640" fill={modern ? "#041427" : "#071D3A"} />
      {modern || transition ? (
        <g opacity={modern ? "0.78" : "0.28"} filter="url(#storyContourGlow)">
          <path d="M 108 488 C 212 408 274 406 350 480 S 504 554 630 430 S 820 304 1038 370" fill="none" stroke="#1EC7F4" strokeWidth="1.2" opacity="0.48" />
          <path d="M 160 154 C 284 92 388 126 492 194 S 652 276 806 206 S 1008 144 1120 210" fill="none" stroke="#1EC7F4" strokeWidth="1" opacity="0.36" />
          <path d="M 374 542 C 482 456 568 480 664 390 S 792 276 920 290" fill="none" stroke="#F0BD3C" strokeWidth="1.1" opacity="0.42" />
          <path d="M 704 560 C 802 488 910 516 1060 458" fill="none" stroke="#2BD9FF" strokeWidth="1.6" opacity="0.32" />
        </g>
      ) : null}
      <path d={graticulePath} fill="none" stroke="#4A7092" strokeWidth="0.7" strokeDasharray="2 10" opacity="0.34" />
      <path d={landPath} fill={modern ? "#0F3558" : "#12365F"} opacity={modern ? "0.74" : "0.92"} />
      <path d={landPath} fill={`url(#${mapDotPattern})`} opacity={modern ? "0.8" : "0.95"} />
      <path d={countryPath} fill="none" stroke={modern ? "#2AD4FF" : "#254D75"} strokeWidth={modern ? "0.5" : "0.6"} opacity={modern ? "0.34" : "0.62"} />
      {supplementalDots.map((dot) => (
        <g key={dot.key} opacity={modern ? "0.82" : "0.52"}>
          <circle cx={dot.x} cy={dot.y} r={dot.radius} fill="none" stroke={modern ? "#23D4FF" : "#1DBFEA"} strokeWidth="2.2" strokeDasharray={modern ? "16 7" : "none"} />
          <circle cx={dot.x} cy={dot.y} r={dot.radius + 7} fill="none" stroke={modern ? "#23D4FF" : "#1DBFEA"} strokeWidth="1" opacity="0.24" />
          <circle cx={dot.x} cy={dot.y} r="4" fill={modern ? "#23D4FF" : "#1DBFEA"} opacity="0.26" />
        </g>
      ))}
      {originPoints.map((origin) => (
        <g key={origin.key}>
          <motion.path
            d={routePath([origin.x, origin.y], [singapore.x, singapore.y])}
            fill="none"
            stroke={modern ? "url(#storyLinearGlow)" : "#D9A528"}
            strokeWidth={modern ? "2.4" : "3.2"}
            strokeLinecap="round"
            pathLength={routeLength}
            filter="url(#storySoftGlow)"
          />
          <circle cx={origin.x} cy={origin.y} r={modern ? "5" : "6"} fill={modern ? "#28D9FF" : "#D9A528"} stroke="#FFF7DF" strokeWidth="1.8" />
          <circle cx={origin.x} cy={origin.y} r={modern ? "16" : "14"} fill="none" stroke={modern ? "#28D9FF" : "#D9A528"} strokeWidth="1.6" opacity={modern ? "0.44" : "0.32"} />
          <text
            x={origin.labelX}
            y={origin.labelY}
            textAnchor={origin.anchor}
            fill={modern ? "#D9F8FF" : "#FFFFFF"}
            fontSize="14"
            fontWeight="800"
            className={modern ? "drop-shadow-[0_0_8px_rgba(103,232,249,0.75)]" : undefined}
          >
            {origin.label}
          </text>
        </g>
      ))}
      <g>
        <circle cx={singapore.x} cy={singapore.y} r="58" fill="url(#story-anchor-glow)" />
        <circle cx={singapore.x} cy={singapore.y} r="18" fill="#D9A528" stroke="#FFF7DF" strokeWidth="3" />
        <circle cx={singapore.x} cy={singapore.y} r="34" fill="none" stroke="#D9A528" strokeWidth="2.3" opacity="0.5" />
        <text x={singapore.x} y={singapore.y + 52} textAnchor="middle" fill="#F0BD3C" fontSize="18" fontWeight="900">
          Singapore
        </text>
      </g>
    </svg>
  );
}

function TransitionGridMap() {
  return (
    <svg viewBox="0 0 1200 420" aria-hidden="true" className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="transitionGridFade" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#111923" stopOpacity="0.88" />
          <stop offset="46%" stopColor="#102236" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#111923" stopOpacity="0.9" />
        </linearGradient>
        <filter id="transitionGlow" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="1200" height="420" fill="url(#transitionGridFade)" />
      <g opacity="0.42">
        {Array.from({ length: 28 }).map((_, index) => (
          <path key={`grid-${index}`} d={`M ${index * 48 - 80} 420 C ${index * 48 + 20} 318 ${index * 48 + 46} 184 ${index * 48 + 130} 0`} fill="none" stroke="#5DD6FF" strokeWidth="0.7" opacity="0.22" />
        ))}
      </g>
      <g filter="url(#transitionGlow)">
        <path d="M 34 290 C 214 170 392 190 552 244 S 842 342 1136 142" fill="none" stroke="#8BDFFF" strokeWidth="1.3" opacity="0.56" />
        <path d="M 180 360 C 332 266 454 298 594 220 S 828 88 1020 134" fill="none" stroke="#D9A528" strokeWidth="1.5" opacity="0.44" />
        <path d="M 406 382 C 522 242 658 236 752 160 S 912 78 1102 96" fill="none" stroke="#5DD6FF" strokeWidth="1" opacity="0.5" />
        <circle cx="552" cy="244" r="4" fill="#D9A528" />
        <circle cx="752" cy="160" r="4" fill="#8BDFFF" />
        <circle cx="1020" cy="134" r="4" fill="#D9A528" />
      </g>
    </svg>
  );
}

function routePath(from: [number, number], to: [number, number]) {
  const midX = (from[0] + to[0]) / 2;
  const midY = Math.min(from[1], to[1]) - Math.max(70, Math.abs(from[0] - to[0]) * 0.18);
  return `M ${from[0]} ${from[1]} Q ${midX} ${midY} ${to[0]} ${to[1]}`;
}
