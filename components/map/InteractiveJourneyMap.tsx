"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, UsersRound } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useRef } from "react";
import { approvedClientOrigins } from "@/content/config/origins";

const singapore = { x: 660, y: 392 };

const originPoints = [
  { key: "India", x: 330, y: 322, labelX: 238, labelY: 304, anchor: "end" },
  { key: "China", x: 542, y: 245, labelX: 472, labelY: 218, anchor: "end" },
  { key: "Japan", x: 850, y: 275, labelX: 884, labelY: 252, anchor: "start" },
  { key: "Southeast Asia", x: 806, y: 390, labelX: 838, labelY: 412, anchor: "start" }
] as const;

const stages = [
  { label: "World Map", progress: 0.02 },
  { label: "Routes", progress: 0.3 },
  { label: "Singapore", progress: 0.58 },
  { label: "Pathways", progress: 0.84 }
] as const;

const pathways = [
  {
    title: "For Individuals",
    href: "/services/employment-pass",
    text: "Work passes, PR and immigration support for you and your family.",
    icon: UsersRound
  },
  {
    title: "For Entrepreneurs",
    href: "/services/company-incorporation",
    text: "Start and grow your business presence in Singapore.",
    icon: BriefcaseBusiness
  },
  {
    title: "For Businesses",
    href: "/services/corporate-compliance",
    text: "Corporate setup, hiring and compliance support.",
    icon: Building2
  }
];

export function InteractiveJourneyMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 26, mass: 0.35 });

  const mapScale = useTransform(progress, [0, 0.34, 0.66, 1], reduceMotion ? [1, 1, 1, 1] : [1, 1.06, 1.38, 1.38]);
  const mapX = useTransform(progress, [0, 0.34, 0.66, 1], reduceMotion ? [0, 0, 0, 0] : [110, 78, -56, -56]);
  const mapY = useTransform(progress, [0, 0.34, 0.66, 1], reduceMotion ? [0, 0, 0, 0] : [0, -4, -68, -68]);
  const routeLength = useTransform(progress, [0.18, 0.46], [0, 1]);
  const originOpacity = useTransform(progress, [0, 0.12, 0.7], [0.65, 1, 0.55]);
  const singaporeScale = useTransform(progress, [0.36, 0.64], [0.65, 1.22]);
  const mapFade = useTransform(progress, [0.74, 0.92], [1, 0.72]);
  const introOpacity = useTransform(progress, [0, 0.62, 0.78], [1, 1, 0]);
  const cardsOpacity = useTransform(progress, [0.62, 0.76], [0, 1]);
  const cardsY = useTransform(progress, [0.62, 0.76], [46, 0]);
  const connectorOpacity = useTransform(progress, [0.58, 0.72], [0, 1]);

  function goToStage(targetProgress: number) {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const scrollable = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + scrollable * targetProgress, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <section ref={sectionRef} id="singapore-journey-map" className="relative bg-white">
      <div className="h-[410vh] min-h-[2600px]">
        <div className="sticky top-20 min-h-[calc(100vh-5rem)] overflow-hidden bg-atlas-navy text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_50%,rgba(217,165,40,0.16),transparent_26%),linear-gradient(90deg,rgba(7,29,58,0.99)_0%,rgba(7,29,58,0.96)_31%,rgba(7,29,58,0.52)_54%,rgba(7,29,58,0.1)_100%)]" />
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ scale: mapScale, x: mapX, y: mapY, opacity: mapFade, transformOrigin: `${singapore.x}px ${singapore.y}px` }}
          >
            <JourneySvg routeLength={routeLength} originOpacity={originOpacity} singaporeScale={singaporeScale} />
          </motion.div>

          <div className="container-shell relative z-10 min-h-[calc(100vh-5rem)] py-6 md:py-10">
            <motion.div className="relative z-30 max-w-md pt-2 md:pt-8" style={{ opacity: introOpacity }}>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">Singapore journey map</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                From global ambitions to a confident start in Singapore
              </h2>
              <p className="mt-5 text-base leading-8 text-white/78">
                Atlas supports individuals, entrepreneurs and businesses as they navigate their next steps in Singapore.
              </p>
              <Link
                href="/services"
                className="mt-7 inline-flex min-h-11 items-center justify-center rounded-md border border-atlas-gold px-5 py-3 text-sm font-semibold text-atlas-gold transition hover:bg-atlas-gold hover:text-atlas-navy"
              >
                Explore how we can help <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
              </Link>
              <div className="mt-6 flex max-w-sm flex-wrap gap-2">
                {stages.map((stage, index) => (
                  <button
                    key={stage.label}
                    type="button"
                    onClick={() => goToStage(stage.progress)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/18 bg-white/7 px-4 text-xs font-bold uppercase tracking-[0.12em] text-white/86 transition hover:border-atlas-gold hover:text-atlas-gold"
                  >
                    <span className="text-atlas-gold">{String(index + 1).padStart(2, "0")}</span>
                    {stage.label}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-[188px] left-1/2 hidden w-full max-w-[760px] -translate-x-1/2 flex-col items-center md:flex"
              style={{ opacity: connectorOpacity }}
            >
              <p className="mb-4 text-center text-sm font-bold text-white">Choose the right path for your goals</p>
              <div className="relative h-16 w-full">
                <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 border-l border-dashed border-atlas-gold" />
                <div className="absolute left-1/2 top-7 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full border-2 border-atlas-gold bg-atlas-gold shadow-gold">
                  <span className="h-3 w-3 rounded-full bg-white" />
                </div>
                <div className="absolute left-[16%] right-[16%] top-12 border-t border-dashed border-atlas-gold" />
                <div className="absolute left-[16%] top-12 h-8 border-l border-dashed border-atlas-gold" />
                <div className="absolute left-1/2 top-12 h-8 border-l border-dashed border-atlas-gold" />
                <div className="absolute right-[16%] top-12 h-8 border-l border-dashed border-atlas-gold" />
              </div>
            </motion.div>

            <motion.div
              className="absolute inset-x-4 bottom-5 z-20 grid gap-4 md:grid-cols-3"
              style={{ opacity: cardsOpacity, y: cardsY }}
            >
              {pathways.map((pathway) => {
                const Icon = pathway.icon;
                return (
                  <Link
                    key={pathway.title}
                    href={pathway.href}
                    className="group rounded-md border border-atlas-line bg-white p-5 text-atlas-navy shadow-soft transition hover:-translate-y-1 hover:border-atlas-gold"
                  >
                    <Icon aria-hidden="true" className="h-7 w-7 text-atlas-gold" />
                    <h3 className="mt-4 text-lg font-semibold">{pathway.title}</h3>
                    <p className="mt-2 min-h-14 text-sm leading-6 text-slate-600">{pathway.text}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                      Explore <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </motion.div>
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
  const originLabels = approvedClientOrigins.filter((origin) => origin.city !== "Singapore");

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
      </defs>
      <rect width="1200" height="640" fill="#071D3A" />
      <g opacity="0.92">
        <MapRegion
          d="M78 205c19-34 58-58 104-61 29-2 49 4 72 19 22 14 37 15 62 8 28-8 53 0 70 20 18 22 14 48-12 59-21 9-49 6-63 25-15 20 11 43 5 66-6 24-43 31-67 17-24-13-36-42-64-45-24-2-39 17-65 15-31-3-52-30-50-62 2-24-8-39 8-61Z"
          opacity="0.72"
        />
        <MapRegion
          d="M326 353c31 6 58 35 58 72 0 36-25 57-31 88-4 20 5 43-10 59-14 15-42 7-49-12-8-21 7-44-2-64-9-21-37-31-45-55-8-25 7-52 30-67 15-10 29-25 49-21Z"
          opacity="0.62"
        />
        <MapRegion
          d="M464 194c24-26 58-37 95-31 33 5 58 24 91 25 29 1 48-14 74-20 45-10 88 12 103 47 15 36-4 71-36 85-36 16-75-2-108 18-27 17-25 50-54 63-27 12-55-8-83-9-34-2-54 25-85 18-34-7-49-44-38-74 10-28 38-39 44-66 5-20-20-35-3-56Z"
          opacity="0.78"
        />
        <MapRegion
          d="M547 317c34 0 61 21 71 52 9 29-9 49-5 77 4 26 31 39 31 68 0 28-27 51-55 45-29-6-33-39-51-59-17-19-47-22-60-47-14-27 2-58 8-86 6-25 29-50 61-50Z"
          opacity="0.68"
        />
        <MapRegion
          d="M692 201c54-42 131-47 192-20 45 20 69 53 117 57 31 3 60-9 89-24 20 49 13 99-21 139-37 43-96 58-153 48-49-9-89-40-139-35-40 5-68 31-109 31-38 0-68-24-73-59-5-39 30-65 56-88 16-15 21-35 41-49Z"
          opacity="0.84"
        />
        <MapRegion
          d="M827 410c33-12 77-1 101 25 21 23 18 52-9 66-23 12-51 1-74 11-21 9-36 32-61 28-25-4-35-33-23-54 12-20 35-25 45-45 5-11 7-25 21-31Z"
          opacity="0.72"
        />
        <MapRegion
          d="M993 421c35-18 83-12 109 16 19 21 16 49-8 62-23 12-53 0-75 14-17 11-26 32-49 27-24-5-32-34-18-53 13-18 35-24 41-47 2-7-4-14 0-19Z"
          opacity="0.62"
        />
      </g>
      <g opacity="0.28">
        <path d="M130 166c164 64 300 66 452 4 198-82 357-53 519 47" fill="none" stroke="#7DA0BF" strokeWidth="2" strokeDasharray="3 14" />
        <path d="M120 480c197-57 374-47 526 15 150 61 287 62 432-3" fill="none" stroke="#7DA0BF" strokeWidth="2" strokeDasharray="3 14" />
      </g>
      {originPoints.map((origin, index) => {
        const label = originLabels[index]?.label || origin.key;
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
            <circle cx={origin.x} cy={origin.y} r="8" fill="#D9A528" stroke="#FFF7DF" strokeWidth="2" />
            <circle cx={origin.x} cy={origin.y} r="17" fill="none" stroke="#D9A528" strokeWidth="2" opacity="0.36" />
            <text
              x={origin.labelX}
              y={origin.labelY}
              textAnchor={origin.anchor}
              fill="#FFFFFF"
              fontSize="18"
              fontWeight="800"
            >
              {label}
            </text>
            <text
              x={origin.labelX}
              y={origin.labelY + 21}
              textAnchor={origin.anchor}
              fill="#C0CEE0"
              fontSize="12"
              fontWeight="600"
            >
              [client-approved count]
            </text>
          </motion.g>
        );
      })}
      <motion.g style={{ scale: singaporeScale, transformOrigin: `${singapore.x}px ${singapore.y}px` }}>
        <circle cx={singapore.x} cy={singapore.y} r="78" fill="url(#atlas-anchor-glow)" />
        <circle cx={singapore.x} cy={singapore.y} r="24" fill="#D9A528" stroke="#FFF7DF" strokeWidth="4" />
        <circle cx={singapore.x} cy={singapore.y} r="43" fill="none" stroke="#D9A528" strokeWidth="3" opacity="0.55" />
        <text x={singapore.x} y={singapore.y + 68} textAnchor="middle" fill="#F0BD3C" fontSize="23" fontWeight="900">
          Singapore
        </text>
      </motion.g>
    </svg>
  );
}

function MapRegion({ d, opacity = "1" }: { d: string; opacity?: string }) {
  return (
    <g opacity={opacity}>
      <path d={d} fill="#12365F" />
      <path d={d} fill="url(#atlas-map-dots)" />
    </g>
  );
}

function routePath(from: [number, number], to: [number, number]) {
  const midX = (from[0] + to[0]) / 2;
  const midY = Math.min(from[1], to[1]) - 115;
  return `M ${from[0]} ${from[1]} Q ${midX} ${midY} ${to[0]} ${to[1]}`;
}
