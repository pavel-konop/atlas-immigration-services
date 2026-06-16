import Image from "next/image";

export function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-white">
      <Image
        src="/images/atlas-singapore-hero.png"
        alt=""
        fill
        sizes="100vw"
        priority
        className="object-cover object-[62%_center]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#ffffff_0%,rgba(255,255,255,0.98)_26%,rgba(255,255,255,0.78)_43%,rgba(255,255,255,0.16)_68%,rgba(255,255,255,0)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-[radial-gradient(120%_80%_at_50%_100%,#ffffff_0%,#ffffff_46%,rgba(255,255,255,0)_47%)]" />
      <div className="container-shell relative z-10 flex min-h-[calc(100vh-5rem)] items-center py-14 md:py-18">
        <div className="max-w-[680px]">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-atlas-gold">Singapore immigration and corporate services</p>
          <h1 className="max-w-[620px] font-serif text-5xl leading-[1.03] text-atlas-navy md:text-[4.7rem]">
            Your trusted <span className="text-atlas-gold">Singapore</span> partner
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">Immigration and corporate services guidance with a personal, practical touch.</p>
        </div>
      </div>
    </section>
  );
}
