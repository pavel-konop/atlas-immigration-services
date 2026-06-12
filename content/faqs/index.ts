export type FAQ = {
  question: string;
  answer: string;
  category: "General" | "Immigration" | "Corporate";
};

export const faqs: FAQ[] = [
  {
    category: "General",
    question: "Which service is right for my situation?",
    answer:
      "Start with a short consultation. Atlas will review whether your goals are individual, family, entrepreneur, or employer-led, then recommend a practical path and document checklist."
  },
  {
    category: "General",
    question: "What should I prepare before speaking with a consultant?",
    answer:
      "Bring your goal, current Singapore status if any, timeline, employer or company context, and key documents such as passport, qualifications, employment details, or company records."
  },
  {
    category: "Immigration",
    question: "Can Atlas support both individuals and companies?",
    answer:
      "Yes. Atlas supports individuals, families, entrepreneurs, and businesses, especially where immigration and corporate administration overlap."
  },
  {
    category: "Immigration",
    question: "Does Atlas guarantee application approval?",
    answer:
      "No consultancy can guarantee an authority decision. Atlas focuses on careful preparation, realistic guidance, and responsive follow-up based on your circumstances."
  },
  {
    category: "Corporate",
    question: "Can Atlas help with company incorporation in Singapore?",
    answer:
      "Yes. Atlas can guide founders through incorporation preparation, company details, required documents, and follow-on corporate secretarial or compliance support."
  },
  {
    category: "General",
    question: "How quickly will Atlas respond?",
    answer:
      "The team prioritizes responsive communication. For urgent matters, WhatsApp or phone is the fastest way to reach Bernie and the consulting team."
  }
];
