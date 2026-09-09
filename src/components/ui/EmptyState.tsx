import Image from "next/image";
import { cn } from "@/lib/utils";

export function EmptyState({
  label = "No data yet",
  className,
  size = 130,
}: {
  label?: string;
  className?: string;
  size?: number;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-24", className)}>
      <Image src="/branding/empty-box.png" alt="" width={size} height={size} className="opacity-90" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
