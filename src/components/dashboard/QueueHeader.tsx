import { cn } from "@/lib/utils";

type Tone = "indigo" | "teal" | "ink" | "green" | "red";

const toneMain: Record<Tone, string> = {
  indigo: "bg-indigo text-white",
  teal: "bg-teal text-white",
  ink: "bg-ink text-white",
  green: "bg-primary text-white",
  red: "bg-red text-white",
};

const toneAccent: Record<Tone, string> = {
  indigo: "bg-indigo-light",
  teal: "bg-teal-light",
  ink: "bg-[#c9cbcd]",
  green: "bg-primary-light",
  red: "bg-red-light",
};

/** Two-piece column header used on the Home dashboard queues. */
export function QueueHeader({
  title,
  count,
  tone = "indigo",
  className,
}: {
  title: string;
  count?: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1", className)}>
      <div className={cn("flex flex-1 items-center rounded-[6px] px-6 py-4 text-base font-bold", toneMain[tone])}>
        {title}
      </div>
      <div
        className={cn(
          "flex w-[62px] items-center justify-center rounded-[6px] text-sm font-bold text-ink",
          toneAccent[tone],
        )}
      >
        {count !== undefined ? count : ""}
      </div>
    </div>
  );
}
