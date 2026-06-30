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

const standardOriginPoints = [
  { key: "India", label: "India", lngLat: [78.9629, 20.5937] as [number, number], dx: -18, dy: -26, anchor: "end" as const },
  { key: "China", label: "China", lngLat: [104.1954, 35.8617] as [number, number], dx: -14, dy: -26, anchor: "end" as const },
  { key: "Japan", label: "Japan", lngLat: [138.2529, 36.2048] as [number, number], dx: -18, dy: -24, anchor: "end" as const },
  { key: "Philippines", label: "Philippines", lngLat: [121.774, 12.8797] as [number, number], dx: 18, dy: -20, anchor: "end" as const },
  { key: "Indonesia", label: "Indonesia", lngLat: [113.9213, -0.7893] as [number, number], dx: 22, dy: 36, anchor: "start" as const }
];

const v1AdditionalOriginPoints = [
  { key: "Central Asia", label: "Central Asia", lngLat: [58, 31] as [number, number], dx: -18, dy: -26, anchor: "end" as const, radius: 20 },
  { key: "Africa", label: "Africa", lngLat: [38, -15] as [number, number], dx: 18, dy: -20, anchor: "start" as const, radius: 22 }
];

const originPoints = [...standardOriginPoints, ...v1AdditionalOriginPoints].map((origin) => {
  const point = projection(origin.lngLat) || [0, 0];
  return {
    ...origin,
    x: point[0],
    y: point[1],
    labelX: point[0] + origin.dx,
    labelY: point[1] + origin.dy
  };
});

type StoryVariant = "v1";

export const ContinuousStorySection = dynamic(() => Promise.resolve(ContinuousStoryExperience), {
  ssr: false,
  loading: () => <section className="min-h-screen bg-atlas-navy" />
});

function ContinuousStoryExperience({ slides, variant = "v1" }: { slides: AudienceJourneySlide[]; variant?: StoryVariant }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const enabledSlides = slides.filter((slide) => slide.enabled).slice(0, 3);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });
  const progress = useSpring(scrollYProgress, { stiffness: 74, damping: 24, mass: 0.38 });

  const heroOpacity = useTransform(progress, [0, 0.22, 0.36], [1, 1, 0]);
  const heroY = useTransform(progress, [0, 0.36], [0, -64]);
  const heroImageOpacity = useTransform(progress, [0, 0.28, 0.46], [1, 0.72, 0.18]);
  const navyOpacity = useTransform(progress, [0, 0.26, 0.5], [0.2, 0.78, 1]);
  const mapOpacity = useTransform(progress, [0.18, 0.34, 0.58, 0.68], [0, 1, 1, 0]);
  const mapScale = useTransform(
    progress,
    [0.26, 0.55, 0.62, 0.68],
    reduceMotion ? [1, 1, 1, 1] : [1.02, 1.28, 2.75, 3.25]
  );
  const mapX = useTransform(progress, [0.26, 0.55, 0.68], reduceMotion ? [0, 0, 0] : [20, -92, -150]);
  const mapY = useTransform(progress, [0.26, 0.55, 0.68], reduceMotion ? [0, 0, 0] : [0, -48, -96]);
  const mapBlur = useTransform(progress, [0.58, 0.68], ["blur(0px)", "blur(8px)"]);
  const routeLength = useTransform(progress, [0.34, 0.56], [0, 1]);
  const mapInfoOpacity = useTransform(progress, [0.34, 0.48, 0.6], [0, 1, 0]);
  const audienceDeckOpacity = useTransform(progress, [0.62, 0.7], [0, 1]);
  const audienceDeckScale = useTransform(progress, [0.62, 0.7], [1.12, 1]);

  return (
    <section ref={sectionRef} data-atlas-continuous-story="true" data-atlas-story-variant={variant} className="relative bg-atlas-navy">
      <div className="h-[760vh] min-h-[5200px]">
        <div className="sticky top-0 h-screen overflow-hidden text-white">
          <motion.div className="absolute inset-0" style={{ opacity: heroImageOpacity }}>
            <Image src="/images/atlas-singapore-hero.png" alt="" fill priority sizes="100vw" className="object-cover object-[62%_center]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.74)_28%,rgba(255,255,255,0.1)_58%,rgba(7,29,58,0.42)_100%)]" />
          </motion.div>
          <motion.div className="absolute inset-0 bg-atlas-navy" style={{ opacity: navyOpacity }} />
          <motion.div
            className="absolute inset-0"
            style={{
              opacity: mapOpacity,
              scale: mapScale,
              x: mapX,
              y: mapY,
              filter: mapBlur,
              transformOrigin: `${(singapore.x / 1200) * 100}% ${(singapore.y / 640) * 100}%`
            }}
          >
            <StoryMap routeLength={routeLength} />
          </motion.div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_52%,rgba(217,165,40,0.14),transparent_28%),linear-gradient(90deg,rgba(7,29,58,0.92)_0%,rgba(7,29,58,0.7)_28%,rgba(7,29,58,0.16)_58%,rgba(7,29,58,0)_100%)]" />

          <div className="container-shell relative z-10 flex h-full flex-col justify-between py-8">
            <motion.div className="max-w-[680px] pt-8" style={{ opacity: heroOpacity, y: heroY }}>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-atlas-gold">Singapore immigration and corporate services</p>
              <h1 className="max-w-[650px] font-serif text-5xl leading-[1.03] text-white drop-shadow-[0_3px_24px_rgba(0,0,0,0.34)] md:text-[4.7rem]">
                Building Futures <span className="text-atlas-gold">Across Borders</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-white/86 drop-shadow-[0_2px_12px_rgba(0,0,0,0.34)]">
                Helping individuals, families, and businesses navigate global migration with confidence
              </p>
            </motion.div>

            <motion.div className="max-w-xl" style={{ opacity: mapInfoOpacity }}>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">Singapore journey map</p>
              <p className="mt-4 max-w-sm text-base font-semibold leading-7 text-white">Supporting your migration journey across borders</p>
            </motion.div>

            <motion.div
              className="absolute inset-y-0 z-20 overflow-hidden bg-atlas-navy"
              style={{ left: "calc((100% - 100vw) / 2)", width: "100vw", opacity: audienceDeckOpacity, scale: audienceDeckScale }}
            >
              <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(207,236,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(207,236,255,0.16)_1px,transparent_1px)] [background-size:25%_100%,25%_100%]" />
              {enabledSlides.map((slide, index) => (
                <V1SignalPathSlide key={slide.id} slide={slide} index={index} progress={progress} reduceMotion={reduceMotion} revealStart={index === 0 ? 0.62 : 0.76 + (index - 1) * 0.11} />
              ))}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white/84 md:px-10">
                <span>Atlas / Singapore</span>
                <span>{String(enabledSlides.length).padStart(2, "0")} guided paths</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StoryMap({ routeLength }: { routeLength: MotionValue<number> }) {
  return (
    <svg viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="h-full w-full">
      <defs>
        <pattern id="story-map-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.05" fill="#9BB7D0" opacity="0.42" />
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
      <rect width="1200" height="640" fill="#071D3A" />
      <path d={graticulePath} fill="none" stroke="#4A7092" strokeWidth="0.7" strokeDasharray="2 10" opacity="0.34" />
      <path d={landPath} fill="#12365F" opacity="0.92" />
      <path d={landPath} fill="url(#story-map-dots)" opacity="0.95" />
      <path d={countryPath} fill="none" stroke="#254D75" strokeWidth="0.6" opacity="0.62" />
      {originPoints.map((origin) => (
        <g key={origin.key}>
          <motion.path
            d={routePath([origin.x, origin.y], [singapore.x, singapore.y])}
            fill="none"
            stroke="#D9A528"
            strokeWidth="3.2"
            strokeLinecap="round"
            pathLength={routeLength}
            filter="url(#storySoftGlow)"
          />
          <circle cx={origin.x} cy={origin.y} r="6" fill="#D9A528" stroke="#FFF7DF" strokeWidth="1.8" />
          <circle cx={origin.x} cy={origin.y} r="14" fill="none" stroke="#D9A528" strokeWidth="1.6" opacity="0.32" />
          <text
            x={origin.labelX}
            y={origin.labelY}
            textAnchor={origin.anchor}
            fill="#FFFFFF"
            fontSize="14"
            fontWeight="800"
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

function V1SignalPathSlide({
  slide,
  index,
  progress,
  reduceMotion,
  revealStart
}: {
  slide: AudienceJourneySlide;
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean | null;
  revealStart: number;
}) {
  const revealEnd = revealStart + 0.11;
  const clipPath = useTransform(progress, [revealStart, revealEnd], ["inset(100% 0 0 0)", "inset(0% 0 0 0)"]);
  const imageScale = useTransform(progress, [revealStart, revealEnd], reduceMotion ? [1, 1] : [1.14, 1]);
  const imageBlur = useTransform(progress, [revealStart, revealEnd], ["blur(18px)", "blur(0px)"]);
  const contentY = useTransform(progress, [revealStart, revealEnd], reduceMotion ? [0, 0] : [72, 0]);
  const contentOpacity = useTransform(progress, [revealStart, revealEnd], [0, 1]);

  return (
    <motion.article className="absolute inset-0 overflow-hidden bg-atlas-navy" style={{ clipPath: index === 0 ? undefined : clipPath, opacity: index === 0 ? contentOpacity : undefined, zIndex: index + 1 }}>
      <motion.div className="absolute inset-0" style={{ scale: imageScale, filter: imageBlur }}>
        <Image src={slide.image} alt="" fill priority={index === 0} sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,18,38,0.94)_0%,rgba(5,29,57,0.62)_46%,rgba(4,18,38,0.2)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(4,18,38,0.82)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(207,236,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(207,236,255,0.16)_1px,transparent_1px)] [background-size:25%_100%,25%_100%]" />
      <motion.div className="container-shell relative z-10 flex h-full flex-col justify-end pb-10 pt-24 md:pb-14" style={{ opacity: contentOpacity, y: contentY }}>
        <div className="grid gap-8 border-t border-white/25 pt-6 md:grid-cols-[0.18fr_0.56fr_0.26fr] md:items-end">
          <div className="font-serif text-5xl text-atlas-amber md:text-7xl">0{index + 1}</div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-atlas-amber">{slide.label}</p>
            <h2 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.92] md:text-[clamp(4.5rem,8vw,9rem)]">{slide.title}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82 md:text-xl">{slide.subtitle}</p>
          </div>
          <div className="border-l border-white/25 pl-5">
            <p className="text-sm leading-6 text-white/72">{slide.description}</p>
            <Link href={slide.href} className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:text-atlas-amber">
              Explore <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

function routePath(from: [number, number], to: [number, number]) {
  const midX = (from[0] + to[0]) / 2;
  const midY = Math.min(from[1], to[1]) - Math.max(70, Math.abs(from[0] - to[0]) * 0.18);
  return `M ${from[0]} ${from[1]} Q ${midX} ${midY} ${to[0]} ${to[1]}`;
}
