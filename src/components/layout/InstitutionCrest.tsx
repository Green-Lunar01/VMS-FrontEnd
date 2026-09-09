import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The institution's crest. Defaults to the Defence Headquarters coat of arms
 * exported from Figma; `src` accepts Institution.logoUrl once the API is wired up.
 */
export function InstitutionCrest({
  size = 64,
  src = "/branding/dhq-crest.png",
  alt = "Defence Headquarters",
  className,
}: {
  size?: number;
  src?: string;
  alt?: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      priority
      className={cn("shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
