"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useRef } from "react";
import type { AudienceJourneySlide } from "@/types/admin-content";

export function MerlionV4Experience({ slides, showPathSlides = true }: { slides?: AudienceJourneySlide[]; showPathSlides?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const enabledSlides = showPathSlides ? (slides || []).filter((slide) => slide.enabled).slice(0, 3) : [];
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 72, damping: 25, mass: 0.42 });

  const whiteCanvasOpacity = useTransform(progress, [0, 0.3, 0.42], [1, 1, 0]);
  const merlionMaskOpacity = useTransform(progress, [0, 0.34, 0.45], [1, 1, 0]);
  const merlionStartSize = showPathSlides ? "auto 132%" : "auto 102%";
  const merlionMidSize = showPathSlides ? "auto 205%" : "auto 148%";
  const merlionEndSize = showPathSlides ? "auto 680%" : "auto 620%";
  const merlionMaskSize = useTransform(
    progress,
    [0, 0.28, 0.42],
    reduceMotion ? [merlionStartSize, merlionStartSize, merlionStartSize] : [merlionStartSize, merlionMidSize, merlionEndSize]
  );
  const cityScale = useTransform(progress, [0, 0.42], reduceMotion ? [1, 1] : [1.2, 1]);
  const openingTextOpacity = useTransform(progress, [0, 0.16, 0.28], [1, 1, 0]);
  const cityStatementOpacity = useTransform(progress, showPathSlides ? [0.28, 0.42, 0.52] : [0.28, 0.42, 1], showPathSlides ? [0, 1, 0] : [0, 1, 1]);
  const cityStatementY = useTransform(progress, [0.28, 0.42], reduceMotion ? [0, 0] : [48, 0]);
  const openingTextClassName = showPathSlides
    ? "absolute left-[27%] top-[17%] w-[22%] text-center"
    : "absolute left-[38%] top-[19%] w-[20%] text-center";

  return (
    <section
      ref={sectionRef}
      data-atlas-merlion-story="true"
      data-atlas-merlion-mode={showPathSlides ? "full" : "intro"}
      className={`relative bg-[#071d3a] ${showPathSlides ? "h-[560vh] min-h-[4000px]" : "h-[260vh] min-h-[1800px]"}`}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-[radial-gradient(circle_at_76%_10%,#5ea9e5_0%,#2e659b_32%,#123b67_68%,#071d3a_100%)]">
        <motion.div className="absolute inset-0" style={{ scale: cityScale }}>
          <Image src="/images/atlas-singapore-hero.png" alt="Singapore skyline at sunset" fill priority sizes="100vw" className="object-cover object-[62%_center]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,18,38,0.88)_0%,rgba(4,18,38,0.45)_48%,rgba(4,18,38,0.26)_100%)]" />
        </motion.div>
        <MerlionMapField />

        <motion.div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_76%_10%,#5ea9e5_0%,#2e659b_32%,#123b67_68%,#071d3a_100%)]" style={{ opacity: whiteCanvasOpacity }}>
          <MerlionDraftingGrid />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            opacity: merlionMaskOpacity,
            WebkitMaskImage: "url('/images/atlas-merlion-side.png')",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            WebkitMaskSize: merlionMaskSize,
            maskImage: "url('/images/atlas-merlion-side.png')",
            maskRepeat: "no-repeat",
            maskPosition: "center",
            maskSize: merlionMaskSize
          }}
        >
          <motion.div className="absolute inset-0" style={{ scale: cityScale }}>
            <Image src="/images/atlas-singapore-hero.png" alt="" fill priority sizes="100vw" className="object-cover object-[62%_center]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,22,45,0.76),rgba(6,22,45,0.18)_68%)]" />
          </motion.div>
          <motion.div className={openingTextClassName} style={{ opacity: openingTextOpacity }}>
            <div className="text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.42)]">
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-atlas-amber sm:text-xs">Atlas</p>
              <h1 className="mt-3 font-serif text-[clamp(1.4rem,2.2vw,2.8rem)] leading-[0.9]">Singapore,<br />in view.</h1>
              <p className="mx-auto mt-4 max-w-[11rem] text-[0.68rem] leading-4 text-white/84 md:text-[0.7rem]">A clearer start, shaped around you.</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="container-shell absolute inset-x-0 bottom-10 z-20 max-w-5xl text-white md:bottom-14" style={{ opacity: cityStatementOpacity, y: cityStatementY }}>
          <div className="grid gap-7 border-t border-white/28 pt-6 md:grid-cols-[0.18fr_0.62fr_0.2fr] md:items-end">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-amber">01 / Singapore</p>
            <div>
              <h2 className="font-serif text-5xl leading-[0.92] md:text-[clamp(4rem,7vw,7.5rem)]">See the path before you take it.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">From the first visa question to a company’s next hire, Atlas keeps the important decisions clear and connected.</p>
            </div>
            <p className="border-l border-white/24 pl-5 text-sm leading-6 text-white/72">Personal immigration<br />Corporate services<br />Singapore clarity</p>
          </div>
        </motion.div>

        {showPathSlides
          ? enabledSlides.map((slide, index) => (
              <V4PathSlide
                key={slide.id}
                slide={slide}
                index={index}
                progress={progress}
                reduceMotion={reduceMotion}
                start={0.48 + index * 0.16}
              />
            ))
          : null}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white/78 md:px-10">
          <span>Singapore / Atlas</span>
          <span>Scroll to explore</span>
        </div>
      </div>
    </section>
  );
}

function V4PathSlide({
  slide,
  index,
  progress,
  reduceMotion,
  start
}: {
  slide: AudienceJourneySlide;
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean | null;
  start: number;
}) {
  const end = start + 0.14;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const clipPath = useTransform(progress, [start, end], ["polygon(0 100%,100% 100%,100% 100%,0 100%)", "polygon(0 0,100% 0,100% 100%,0 100%)"]);
  const imageScale = useTransform(progress, [start, end], reduceMotion ? [1, 1] : [1.18, 1]);
  const contentY = useTransform(progress, [start, end], reduceMotion ? [0, 0] : [64, 0]);

  return (
    <motion.article className="absolute inset-0 z-20 overflow-hidden bg-[#071d3a] text-white" style={{ opacity, clipPath }}>
      <motion.div className="absolute inset-0" style={{ scale: imageScale }}>
        <Image src={slide.image} alt="" fill priority={index === 0} sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,18,38,0.94)_0%,rgba(5,29,57,0.58)_48%,rgba(4,18,38,0.14)_100%)]" />
      <MerlionMapField />
      <motion.div className="container-shell relative z-10 flex h-full flex-col justify-end pb-10 pt-24 md:pb-14" style={{ y: contentY }}>
        <div className="grid gap-7 border-t border-white/28 pt-6 md:grid-cols-[0.18fr_0.56fr_0.26fr] md:items-end">
          <p className="font-serif text-5xl leading-none text-atlas-amber md:text-7xl">0{index + 2}</p>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-atlas-amber">{slide.label}</p>
            <h2 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.92] md:text-[clamp(4.5rem,8vw,8.5rem)]">{slide.title}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82 md:text-xl">{slide.subtitle}</p>
          </div>
          <div className="border-l border-white/25 pl-5">
            <p className="text-sm leading-6 text-white/74">{slide.description}</p>
            <Link href={slide.href} className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:text-atlas-amber">
              Explore <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

function MerlionDraftingGrid() {
  return (
    <>
      <div className="absolute inset-[6%_4%] border border-white/[0.16]" />
      <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(220,241,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(220,241,255,0.14)_1px,transparent_1px)] [background-size:25%_100%,25%_100%]" />
      <div className="absolute inset-x-[5%] top-1/2 border-t border-white/[0.16]" />
      <div className="absolute left-1/2 top-[8%] h-[84%] border-l border-white/[0.16]" />
      <div className="absolute inset-x-[13%] top-[18%] h-[64%] rounded-[50%] border border-white/[0.12]" />
    </>
  );
}

function MerlionMapField() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(205,236,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(205,236,255,0.14)_1px,transparent_1px)] [background-size:25%_100%,25%_100%]" />
  );
}
