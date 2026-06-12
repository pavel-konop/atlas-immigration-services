import type { Metadata } from "next";
import { business } from "@/content/config/business";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "Privacy policy for Atlas Immigration Services Pte Ltd.",
  path: "/privacy"
});

export default function PrivacyPage() {
  return (
    <section className="bg-white py-18">
      <div className="container-shell prose-atlas max-w-3xl">
        <h1 className="font-serif text-4xl text-atlas-navy md:text-6xl">Privacy Policy</h1>
        <p>
          {business.name} collects contact and enquiry details that visitors choose to submit so the team can respond to
          immigration or corporate services requests.
        </p>
        <h2>Information We Collect</h2>
        <p>We may collect name, email, phone number, service interest, message details, and communication records.</p>
        <h2>How We Use Information</h2>
        <p>Information is used to respond to enquiries, prepare consultations, manage client communication, and improve service delivery.</p>
        <h2>Contact</h2>
        <p>For privacy questions, contact <a href={`mailto:${business.email}`}>{business.email}</a>.</p>
      </div>
    </section>
  );
}
