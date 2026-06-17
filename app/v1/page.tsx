import { HomeVariantPage } from "@/components/sections/HomeVariant";

export const dynamic = "force-dynamic";

export default async function V1Page() {
  return <HomeVariantPage variant="v1" />;
}
