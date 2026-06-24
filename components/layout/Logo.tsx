import Image from "next/image";
import Link from "next/link";
import { business } from "@/content/config/business";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center" aria-label={`${business.shortName} home`}>
      <span className={compact ? "relative h-12 w-24 shrink-0" : "relative h-14 w-32 shrink-0"}>
        <Image
          src="/brand/atlas-logo-transparent.png"
          alt=""
          fill
          sizes={compact ? "96px" : "128px"}
          className="object-contain"
          priority
        />
      </span>
    </Link>
  );
}
