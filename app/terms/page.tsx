import type { Metadata } from "next";
import { business } from "@/content/config/business";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms",
  description: "Website terms for Atlas Immigration Services Pte Ltd.",
  path: "/terms"
});

export default function TermsPage() {
  return (
    <section className="bg-white py-18">
      <div className="container-shell prose-atlas max-w-3xl">
        <h1 className="font-serif text-4xl text-atlas-navy md:text-6xl">Terms</h1>
        <p>
          This website provides general information about {business.shortName}. It does not guarantee application outcomes
          or replace a consultant review of your specific circumstances.
        </p>
        <h2>Use of Website</h2>
        <p>Visitors should not rely on website content as legal, tax, or financial advice. Requirements may change and individual circumstances matter.</p>
        <h2>Enquiries</h2>
        <p>Submitting an enquiry does not create a client engagement until scope and terms are confirmed by Atlas.</p>
        <h2>Contact</h2>
        <p>Questions about these terms can be sent to <a href={`mailto:${business.email}`}>{business.email}</a>.</p>
      </div>
    </section>
  );
}
