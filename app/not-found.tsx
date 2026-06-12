import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-atlas-navy py-24 text-white">
      <div className="container-shell max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">404</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight">This page has moved on</h1>
        <p className="mt-5 leading-8 text-white/72">
          The page you are looking for is not available. Start from services or contact Atlas for direct guidance.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/services" className="rounded-md bg-atlas-gold px-5 py-3 text-sm font-semibold text-atlas-navy">
            View services
          </Link>
          <Link href="/contact" className="rounded-md border border-white/25 px-5 py-3 text-sm font-semibold text-white">
            Contact Atlas
          </Link>
        </div>
      </div>
    </section>
  );
}
