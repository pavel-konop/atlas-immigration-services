"use client";

import dynamic from "next/dynamic";

const InteractiveJourneyMap = dynamic(() => import("@/components/map/InteractiveJourneyMap").then((module) => module.InteractiveJourneyMap), {
  ssr: false,
  loading: () => <section className="min-h-[calc(100vh-5rem)] bg-atlas-navy" />
});

export function RouteMapSection() {
  return <InteractiveJourneyMap />;
}
