"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import type { AudienceJourneySlide } from "@/types/admin-content";

export function AudienceJourneyScroller({
  eyebrow,
  title,
  slides
}: {
  eyebrow: string;
  title: string;
  slides: AudienceJourneySlide[];
}) {
  const enabledSlides = slides.filter((slide) => slide.enabled);
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.4 });
  const totalSlides = enabledSlides.length;
  const x = useTransform(smooth, [0, 1], reduceMotion ? ["0%", "0%"] : ["0%", `${-(totalSlides - 1) * 100}%`]);

  if (enabledSlides.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      data-atlas-audience-journey="true"
      className="relative bg-[#11141c] text-white"
      style={{ height: `${totalSlides * 105}vh` }}
    >
      <div className="sticky top-20 min-h-[calc(100vh-5rem)] overflow-hidden">
        <RotatingEarth />
        <div className="container-shell relative z-10 py-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">{eyebrow}</p>
          <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight md:text-6xl">{title}</h2>
        </div>
        <motion.div className="relative z-10 flex h-[calc(100vh-20rem)] min-h-[430px]" style={{ x }}>
          {enabledSlides.map((slide, index) => (
            <article key={slide.id} className="grid min-w-full items-center gap-8 px-6 md:grid-cols-[0.48fr_0.52fr] md:px-[max(2rem,calc((100vw-1180px)/2))]">
              <div className="relative order-2 aspect-[4/3] overflow-hidden rounded-md md:order-1">
                <Image src={slide.image} alt="" fill sizes="50vw" className="object-cover" />
              </div>
              <div className="order-1 max-w-2xl md:order-2">
                <p className="text-2xl font-bold text-atlas-gold">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">{slide.title}</h3>
                <p className="mt-3 text-lg text-white/68">{slide.subtitle}</p>
                <p className="mt-7 max-w-xl text-lg leading-9 text-white/76">{slide.description}</p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {slide.services.map((service) => (
                    <span key={service} className="rounded-full border border-white/16 px-4 py-2 text-sm text-white/76">
                      {service}
                    </span>
                  ))}
                </div>
                <Link
                  href={slide.href}
                  className="mt-8 inline-flex min-h-11 items-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-atlas-navy transition hover:bg-atlas-gold"
                >
                  Explore {slide.label} <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function RotatingEarth() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
      <div
        className="absolute left-1/2 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_30%,rgba(136,164,196,0.46),rgba(10,23,45,0.72)_42%,rgba(3,8,18,0.95)_72%)] shadow-[inset_-50px_-40px_90px_rgba(0,0,0,0.55)]"
      >
        <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_30%_35%,rgba(217,165,40,0.22),transparent_6%),radial-gradient(circle_at_63%_44%,rgba(217,165,40,0.22),transparent_5%),radial-gradient(circle_at_54%_58%,rgba(217,165,40,0.18),transparent_6%),repeating-linear-gradient(90deg,transparent_0_18px,rgba(255,255,255,0.05)_19px_20px)]" />
        <div className="absolute inset-0 rounded-full border border-white/12" />
      </div>
    </div>
  );
}
