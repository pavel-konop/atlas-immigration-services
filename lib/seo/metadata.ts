import type { Metadata } from "next";
import { business } from "@/content/config/business";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || business.url;

export function pageMetadata({
  title,
  description,
  path = ""
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const fullTitle = title === business.shortName ? title : `${title} | ${business.shortName}`;
  const url = new URL(path, siteUrl).toString();

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: business.shortName,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description
    }
  };
}
