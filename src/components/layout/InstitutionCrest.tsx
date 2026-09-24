import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

/**
 * An institution's own crest/logo — this is tenant-scoped, not the platform's
 * own branding (that's the Green Lunar mark, shown separately). Falls back to
 * an initials avatar, matching how a missing user photo is handled, rather
 * than defaulting to any one specific institution's artwork.
 */
export function InstitutionCrest({
  size = 64,
  src,
  alt = "",
  name = "Institution",
  className,
}: {
  size?: number;
  src?: string;
  alt?: string;
  name?: string;
  className?: string;
}) {
  if (!src) {
    return <Avatar name={name} size={size} className={className} />;
  }
  return (
    <Image
      src={src}
      alt={alt || name}
      width={size}
      height={size}
      priority
      className={cn("shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
