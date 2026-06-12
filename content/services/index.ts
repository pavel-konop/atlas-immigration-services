import {
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FileBadge2,
  Landmark,
  PlaneTakeoff,
  ShieldCheck,
  UserRoundCheck
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ServiceAudience = "Individuals" | "Entrepreneurs" | "Businesses";

export type Service = {
  slug: string;
  title: string;
  category: "Immigration Services" | "Corporate Services";
  audience: ServiceAudience[];
  summary: string;
  description: string;
  outcomes: string[];
  process: string[];
  documents: string[];
  icon: LucideIcon;
};

export const services: Service[] = [
  {
    slug: "employment-pass",
    title: "Employment Pass",
    category: "Immigration Services",
    audience: ["Individuals", "Businesses"],
    summary: "Support for eligible foreign professionals and employers hiring talent in Singapore.",
    description:
      "Atlas helps employers and professionals prepare Employment Pass applications with careful document review, practical positioning, and responsive guidance throughout the process.",
    outcomes: [
      "Clear review of role, salary, qualifications, and company context",
      "Application preparation aligned with MOM expectations",
      "Follow-up support for clarifications or next steps"
    ],
    process: ["Eligibility discussion", "Document checklist", "Application preparation", "Submission support", "Outcome review"],
    documents: ["Passport biodata page", "Educational certificates", "Employment contract or offer details", "Company profile"],
    icon: BriefcaseBusiness
  },
  {
    slug: "s-pass",
    title: "S Pass",
    category: "Immigration Services",
    audience: ["Individuals", "Businesses"],
    summary: "Guidance for mid-skilled foreign employees and hiring companies.",
    description:
      "We help companies understand S Pass requirements and prepare applications with attention to salary, levy, quota, qualifications, and role fit.",
    outcomes: [
      "Requirement and quota readiness review",
      "Practical checklist for employer and candidate",
      "Support for submission, status tracking, and follow-up"
    ],
    process: ["Business review", "Candidate document check", "Quota and levy guidance", "Submission support", "Post-approval guidance"],
    documents: ["Candidate passport", "Qualifications", "Employment details", "Company registration information"],
    icon: UserRoundCheck
  },
  {
    slug: "dependants-pass",
    title: "Dependant's Pass",
    category: "Immigration Services",
    audience: ["Individuals"],
    summary: "Family relocation support for eligible dependants of pass holders.",
    description:
      "Atlas supports families with practical guidance for Dependant's Pass preparation, helping reduce uncertainty during a Singapore move.",
    outcomes: [
      "Family document checklist",
      "Application preparation for spouse or children",
      "Guidance for related family relocation questions"
    ],
    process: ["Family profile review", "Document preparation", "Application support", "Follow-up", "Arrival guidance"],
    documents: ["Pass holder details", "Marriage or birth certificate", "Passport biodata pages", "Residential details"],
    icon: FileBadge2
  },
  {
    slug: "permanent-residency",
    title: "Permanent Residency",
    category: "Immigration Services",
    audience: ["Individuals", "Entrepreneurs"],
    summary: "Structured support for Singapore PR candidates and families.",
    description:
      "We help clients prepare thoughtful Singapore Permanent Residency applications that present employment, family, business, and local ties clearly.",
    outcomes: [
      "Profile assessment and strategy",
      "Evidence planning for work, family, and Singapore ties",
      "Careful compilation of submission materials"
    ],
    process: ["Profile assessment", "Evidence map", "Document review", "Application assembly", "Submission support"],
    documents: ["Identity documents", "Employment records", "Tax records", "Education records", "Family documents"],
    icon: Landmark
  },
  {
    slug: "ltvp",
    title: "Long-Term Visit Pass",
    category: "Immigration Services",
    audience: ["Individuals"],
    summary: "Support for eligible family members and long-term stay situations.",
    description:
      "Atlas guides clients through Long-Term Visit Pass requirements with clear expectations and careful document preparation.",
    outcomes: ["Eligibility review", "Document checklist", "Application and follow-up support"],
    process: ["Situation review", "Requirements check", "Document preparation", "Submission", "Status follow-up"],
    documents: ["Passport details", "Sponsor information", "Family relationship documents", "Residential information"],
    icon: PlaneTakeoff
  },
  {
    slug: "company-incorporation",
    title: "Company Incorporation",
    category: "Corporate Services",
    audience: ["Entrepreneurs", "Businesses"],
    summary: "Singapore company setup support for founders and international teams.",
    description:
      "We support practical incorporation steps for Singapore companies, including structure discussion, filing readiness, and post-incorporation guidance.",
    outcomes: [
      "Business structure discussion",
      "Incorporation document preparation",
      "Next-step guidance for bank, compliance, and hiring needs"
    ],
    process: ["Founder consultation", "Structure and name check", "Document preparation", "Filing coordination", "Post-setup guidance"],
    documents: ["Shareholder and director details", "Proposed company name", "Business activity", "Registered address details"],
    icon: Building2
  },
  {
    slug: "corporate-secretary",
    title: "Corporate Secretary",
    category: "Corporate Services",
    audience: ["Entrepreneurs", "Businesses"],
    summary: "Company secretarial support to keep Singapore entities organized and compliant.",
    description:
      "Atlas assists with recurring company secretarial obligations, records, resolutions, and practical compliance reminders.",
    outcomes: ["Company record maintenance", "Resolution and filing support", "Clear reminders for statutory obligations"],
    process: ["Company record review", "Compliance calendar setup", "Resolution support", "Filing coordination", "Ongoing reminders"],
    documents: ["Company profile", "Constitution", "Director and shareholder records", "Prior filings"],
    icon: ClipboardCheck
  },
  {
    slug: "corporate-compliance",
    title: "Corporate Compliance Support",
    category: "Corporate Services",
    audience: ["Businesses"],
    summary: "Practical guidance for corporate administration, renewals, and employer obligations.",
    description:
      "We help companies stay organized across common compliance workflows, especially where corporate administration intersects with immigration needs.",
    outcomes: ["Compliance workflow review", "Renewal planning", "Responsive support for administrative questions"],
    process: ["Needs review", "Calendar planning", "Document clean-up", "Filing or renewal support", "Ongoing communication"],
    documents: ["Company records", "Existing passes or approvals", "Compliance calendar", "Prior correspondence"],
    icon: ShieldCheck
  }
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}
