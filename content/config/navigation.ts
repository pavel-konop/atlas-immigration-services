export const navigation = [
  { label: "Services", href: "/services" },
  { label: "For Individuals", href: "/services/employment-pass" },
  { label: "For Entrepreneurs", href: "/services/company-incorporation" },
  { label: "For Businesses", href: "/services/corporate-compliance" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" }
] as const;

export const ctas = {
  primary: "Speak with a Consultant",
  secondary: "WhatsApp Us",
  service: "Explore this service",
  article: "Read article"
} as const;
