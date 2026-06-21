"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, MoveUpRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useRef } from "react";
import { business } from "@/content/config/business";
import type { Article } from "@/lib/content/articles";
import type { AudienceJourneySlide, ShowcaseItem } from "@/types/admin-content";

type VariantExperienceProps = {
  slides: AudienceJourneySlide[];
  articles: Article[];
  showcaseItems: ShowcaseItem[];
};

export function EditorialV2Experience({ slides, articles, showcaseItems }: VariantExperienceProps) {
  const enabledSlides = slides.filter((slide) => slide.enabled).slice(0, 3);
  const enabledShowcaseItems = showcaseItems.filter((item) => item.enabled).slice(0, 2);

  return (
    <main className="bg-[#06162d] text-[#f4f8fb]">
      <EditorialHero />
      {enabledSlides.length > 0 ? <EditorialAudienceStory slides={enabledSlides} /> : null}
      <EditorialProof />
      <EditorialJournal items={enabledShowcaseItems} articles={articles} />
    </main>
  );
}

function EditorialHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 72, damping: 25, mass: 0.42 });
  const imageScale = useTransform(progress, [0, 1], reduceMotion ? [1, 1] : [1.04, 1.18]);
  const headlineY = useTransform(progress, [0, 0.55], [0, -92]);
  const headlineOpacity = useTransform(progress, [0, 0.38, 0.6], [1, 1, 0]);
  const metricsOpacity = useTransform(progress, [0.34, 0.62], [0, 1]);
  const metricsY = useTransform(progress, [0.34, 0.62], [52, 0]);
  const statementOpacity = useTransform(progress, [0.5, 0.72], [0, 1]);
  const statementY = useTransform(progress, [0.5, 0.72], [48, 0]);

  return (
    <section ref={sectionRef} className="relative h-[260vh] min-h-[1900px] bg-[#06162d]">
      <div className="sticky top-0 flex h-screen overflow-hidden">
        <motion.div className="absolute inset-0" style={{ scale: imageScale }}>
          <Image src="/images/atlas-singapore-hero.png" alt="Singapore skyline at dusk" fill priority sizes="100vw" className="object-cover object-[62%_center] saturate-[0.78]" />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,22,45,0.18)_0%,rgba(6,22,45,0.26)_42%,rgba(6,22,45,0.74)_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(228,243,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(228,243,255,0.16)_1px,transparent_1px)] [background-size:25%_100%,25%_100%]" />

        <motion.div className="container-shell relative z-10 flex min-h-screen flex-col justify-between py-8 md:py-12" style={{ opacity: headlineOpacity, y: headlineY }}>
          <div className="flex items-center justify-between text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#f4f8fb]/84">
            <span>Atlas immigration services</span>
            <span>Singapore / A focused team</span>
          </div>
          <div className="max-w-6xl pb-16">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-atlas-amber">A considered move, carefully guided</p>
            <h1 className="font-serif text-5xl leading-[0.92] text-[#f4f8fb] sm:text-7xl md:text-[clamp(5.5rem,10vw,10.5rem)]">
              Singapore, <span className="text-[#f0bd3c]">made</span> personal.
            </h1>
          </div>
        </motion.div>

        <motion.div className="container-shell absolute inset-x-0 bottom-10 z-20 grid gap-6 sm:grid-cols-3" style={{ opacity: metricsOpacity, y: metricsY }}>
          <EditorialMetric value={`${business.yearsOperating}`} label="Years of Singapore focus" />
          <EditorialMetric value={`${business.teamSize}`} label="Focused specialists" />
          <EditorialMetric value="3" label="Guided client paths" />
        </motion.div>
        <motion.div className="container-shell absolute inset-x-0 top-0 z-10 flex items-center justify-center pb-28 pt-20 text-center" style={{ opacity: statementOpacity, y: statementY }}>
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-atlas-amber">Atlas in numbers</p>
            <h2 className="mt-5 font-serif text-5xl leading-[0.95] text-[#f4f8fb] md:text-8xl">The details stay in view.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#f4f8fb]/76">Immigration and corporate decisions need more than a checklist. They need context, timing, and a team that stays close to the work.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function EditorialMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t border-[#f4f8fb]/45 pt-4">
      <p className="font-serif text-5xl leading-none text-[#f4f8fb] md:text-7xl">{value}</p>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-[#f4f8fb]/72">{label}</p>
    </div>
  );
}

function EditorialAudienceStory({ slides }: { slides: AudienceJourneySlide[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 76, damping: 25, mass: 0.4 });
  const x = useTransform(progress, [0, 1], reduceMotion ? ["0%", "0%"] : ["0%", `${-(slides.length - 1) * 100}%`]);

  return (
    <section ref={sectionRef} className="relative bg-[#eaf2f7] text-atlas-navy" style={{ height: `${Math.max(slides.length * 110, 220)}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-5 text-[0.68rem] font-bold uppercase tracking-[0.2em] md:px-10">
          <span>Where your next chapter begins</span>
          <span>{String(slides.length).padStart(2, "0")} tailored pathways</span>
        </div>
        <motion.div className="flex h-full" style={{ x }}>
          {slides.map((slide, index) => (
            <article key={slide.id} className="grid min-w-full grid-rows-[0.55fr_0.45fr] border-r border-atlas-navy/12 md:grid-cols-[1.08fr_0.92fr] md:grid-rows-none">
              <div className="relative overflow-hidden bg-atlas-navy">
                <Image src={slide.image} alt="" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,rgba(6,22,45,0.68)_100%)]" />
                <span className="absolute bottom-6 left-6 text-xs font-bold uppercase tracking-[0.22em] text-[#f4f8fb] md:bottom-10 md:left-10">0{index + 1} / {slide.label}</span>
              </div>
              <div className="flex flex-col justify-between bg-[#eaf2f7] p-6 md:p-12">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">Your Singapore path</p>
                  <h2 className="mt-5 max-w-lg font-serif text-4xl leading-[0.95] md:text-7xl">{slide.title}</h2>
                  <p className="mt-5 max-w-md text-base leading-7 text-[#3a526a] md:text-xl md:leading-8">{slide.subtitle}</p>
                </div>
                <div className="mt-6 border-t border-atlas-navy/16 pt-5">
                  <p className="max-w-md text-sm leading-6 text-[#4c6074] md:text-base md:leading-7">{slide.description}</p>
                  <Link href={slide.href} className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-atlas-navy transition hover:text-atlas-gold">
                    Explore this path <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function EditorialProof() {
  const commitments = ["Personal attention", "Practical Singapore expertise", "Responsive communication"];
  return (
    <section className="bg-[#06162d] py-20 text-[#f4f8fb] md:py-28">
      <div className="container-shell grid gap-10 md:grid-cols-[0.75fr_1.25fr] md:gap-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-amber">The Atlas approach</p>
          <h2 className="mt-5 font-serif text-5xl leading-[0.98] md:text-7xl">Clear advice for consequential decisions.</h2>
        </div>
        <div className="grid gap-5 border-t border-[#f4f8fb]/20 pt-5">
          {commitments.map((commitment, index) => (
            <div key={commitment} className="flex items-baseline justify-between border-b border-[#f4f8fb]/16 pb-5">
              <span className="font-serif text-3xl text-atlas-amber">0{index + 1}</span>
              <span className="max-w-sm text-right text-xl leading-8 md:text-2xl">{commitment}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EditorialJournal({ items, articles }: { items: ShowcaseItem[]; articles: Article[] }) {
  const article = articles[0];
  return (
    <section className="bg-[#dce8ee] py-20 text-atlas-navy md:py-28">
      <div className="container-shell">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">Atlas notes</p>
            <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight md:text-6xl">Practical perspective, held close.</h2>
          </div>
          <Link href="/insights" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] hover:text-atlas-gold">All insights <MoveUpRight aria-hidden="true" className="size-4" /></Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="group relative min-h-[360px] overflow-hidden bg-atlas-navy p-6 text-[#f4f8fb] md:min-h-[470px] md:p-9">
              <Image src={item.image} alt="" fill sizes="50vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,22,45,0.08)_25%,rgba(6,22,45,0.88)_100%)]" />
              <div className="relative z-10 flex h-full flex-col justify-end">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-atlas-amber">{item.type}</p>
                <h3 className="mt-3 max-w-md font-serif text-3xl leading-tight md:text-5xl">{item.title}</h3>
                <p className="mt-4 max-w-md leading-7 text-[#f4f8fb]/78">{item.context}</p>
              </div>
            </Link>
          ))}
          {article ? (
            <Link href={`/insights/${article.slug}`} className="border border-atlas-navy/20 p-7 transition hover:bg-[#eef4f8] md:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-atlas-gold">{article.category}</p>
              <h3 className="mt-6 font-serif text-4xl leading-tight md:text-5xl">{article.title}</h3>
              <p className="mt-5 max-w-xl leading-8 text-[#4c6074]">{article.description}</p>
              <span className="mt-10 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em]">Read note <ArrowRight aria-hidden="true" className="size-4" /></span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function SignalV3Experience({ slides, articles, showcaseItems }: VariantExperienceProps) {
  const enabledSlides = slides.filter((slide) => slide.enabled).slice(0, 3);
  const firstShowcaseItem = showcaseItems.find((item) => item.enabled);

  return (
    <main className="bg-[#eef4f8] text-atlas-navy">
      <SignalSlideExperience slides={enabledSlides} />
      <SignalCommitment />
      <SignalJournal article={articles[0]} showcaseItem={firstShowcaseItem} />
    </main>
  );
}

function SignalSlideExperience({ slides }: { slides: AudienceJourneySlide[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 78, damping: 26, mass: 0.42 });

  if (slides.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative h-[520vh] min-h-[3800px] bg-atlas-navy">
      <div className="sticky top-0 h-screen overflow-hidden bg-atlas-navy text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(205,236,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(205,236,255,0.2)_1px,transparent_1px)] [background-size:25%_100%,25%_100%]" />
        <SignalPrelude progress={progress} reduceMotion={reduceMotion} />
        {slides.map((slide, index) => (
          <SignalSlide key={slide.id} slide={slide} index={index} progress={progress} reduceMotion={reduceMotion} revealStart={0.2 + index * 0.25} />
        ))}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white/84 md:px-10">
          <span>Atlas / Singapore</span>
          <span>{String(slides.length).padStart(2, "0")} guided paths</span>
        </div>
        <div className="pointer-events-none absolute right-5 top-20 z-30 hidden border-l border-white/25 pl-4 text-xs font-bold uppercase tracking-[0.18em] text-white/76 md:grid md:gap-3">
          {slides.map((slide, index) => (
            <span key={slide.id}>0{index + 1} / {slide.label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SignalPrelude({ progress, reduceMotion }: { progress: MotionValue<number>; reduceMotion: boolean | null }) {
  const opacity = useTransform(progress, [0, 0.14, 0.28], [1, 1, 0]);
  const scale = useTransform(progress, [0, 0.28], reduceMotion ? [1, 1] : [1, 1.1]);
  const y = useTransform(progress, [0.14, 0.28], reduceMotion ? [0, 0] : [0, -80]);

  return (
    <motion.section className="absolute inset-0 z-[1] overflow-hidden bg-atlas-navy" style={{ opacity, scale, y }}>
      <Image src="/images/atlas-singapore-hero.png" alt="Singapore skyline" fill priority sizes="100vw" className="object-cover object-[62%_center] saturate-[0.82]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,18,38,0.94)_0%,rgba(5,29,57,0.54)_50%,rgba(4,18,38,0.3)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,18,38,0.18)_0%,rgba(4,18,38,0.86)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(207,236,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(207,236,255,0.16)_1px,transparent_1px)] [background-size:25%_100%,25%_100%]" />
      <div className="container-shell relative z-10 flex h-full flex-col justify-end pb-12 pt-24 md:pb-16">
        <div className="grid gap-8 border-t border-white/25 pt-6 md:grid-cols-[0.2fr_0.56fr_0.24fr] md:items-end">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-atlas-amber">Atlas Immigration Services</p>
          <div>
            <h1 className="font-serif text-5xl leading-[0.9] md:text-[clamp(5rem,9vw,10rem)]">We make Singapore moves clearer.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80 md:text-xl">Personal immigration and corporate guidance, designed around the decisions that shape your next chapter.</p>
          </div>
          <div className="border-l border-white/25 pl-5 text-sm leading-6 text-white/72">
            <span className="block">Personal attention</span>
            <span className="mt-2 block">Practical Singapore focus</span>
            <span className="mt-2 block">Responsive support</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function SignalSlide({ slide, index, progress, reduceMotion, revealStart }: { slide: AudienceJourneySlide; index: number; progress: MotionValue<number>; reduceMotion: boolean | null; revealStart: number }) {
  const revealEnd = revealStart + 0.19;
  const clipPath = useTransform(
    progress,
    [revealStart, revealEnd],
    ["polygon(100% 0,100% 0,100% 100%,100% 100%)", "polygon(0 0,100% 0,100% 100%,0 100%)"]
  );
  const imageScale = useTransform(progress, [revealStart, revealEnd], reduceMotion ? [1, 1] : [1.14, 1]);
  const contentY = useTransform(progress, [revealStart, revealEnd], reduceMotion ? [0, 0] : [72, 0]);
  const layerOpacity = useTransform(progress, [revealStart, revealEnd], [0, 1]);
  const contentOpacity = useTransform(progress, [revealStart, revealEnd], [0, 1]);

  return (
    <motion.article className="absolute inset-0 overflow-hidden bg-atlas-navy" style={{ clipPath, opacity: layerOpacity, zIndex: index + 1 }}>
      <motion.div className="absolute inset-0" style={{ scale: imageScale }}>
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
            <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.92] md:text-[clamp(4.5rem,8vw,9rem)]">{slide.title}</h1>
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

function SignalCommitment() {
  const points = ["Understand the options", "Prepare with precision", "Stay supported after submission"];
  return (
    <section className="bg-[#dce8ee] py-16 md:py-24">
      <div className="container-shell grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">A calm, practical process</p>
          <h2 className="mt-5 font-serif text-5xl leading-[0.98] md:text-7xl">Steady from first question to next step.</h2>
        </div>
        <div className="grid gap-4">
          {points.map((point, index) => (
            <div key={point} className="flex gap-5 border-t border-atlas-navy/18 py-5">
              <span className="font-serif text-3xl text-atlas-gold">0{index + 1}</span>
              <div>
                <h3 className="text-xl font-semibold">{point}</h3>
                <p className="mt-2 leading-7 text-[#3a526a]">Clear communication and thoughtful preparation, with the details kept in view.</p>
              </div>
              <Check aria-hidden="true" className="ml-auto size-5 text-atlas-gold" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SignalJournal({ article, showcaseItem }: { article?: Article; showcaseItem?: ShowcaseItem }) {
  return (
    <section className="bg-[#f8fbfc] py-16 md:py-24">
      <div className="container-shell grid gap-5 md:grid-cols-[1.08fr_0.92fr]">
        {showcaseItem ? (
          <Link href={showcaseItem.href} className="group relative min-h-[420px] overflow-hidden rounded-md bg-atlas-navy p-7 text-white md:min-h-[560px] md:p-10">
            <Image src={showcaseItem.image} alt="" fill sizes="60vw" className="object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,29,58,0.1),rgba(7,29,58,0.86))]" />
            <div className="relative z-10 flex h-full flex-col justify-end">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-amber">Atlas in practice</p>
              <h2 className="mt-4 max-w-xl font-serif text-4xl leading-tight md:text-6xl">{showcaseItem.title}</h2>
              <p className="mt-4 max-w-md leading-7 text-white/76">{showcaseItem.context}</p>
            </div>
          </Link>
        ) : null}
        <div className="flex min-h-[420px] flex-col justify-between rounded-md border border-atlas-line bg-white p-7 md:min-h-[560px] md:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">Practical notes</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">Clarity beyond the application.</h2>
          </div>
          {article ? (
            <Link href={`/insights/${article.slug}`} className="border-t border-atlas-line pt-6 group">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-atlas-gold">{article.category}</p>
              <h3 className="mt-3 text-2xl font-semibold leading-snug text-atlas-navy">{article.title}</h3>
              <p className="mt-3 leading-7 text-[#4c6074]">{article.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-atlas-navy group-hover:text-atlas-gold">Read insight <ArrowRight aria-hidden="true" className="size-4" /></span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
