import type { ReactNode } from "react";
import Image from "next/image";
import { InstitutionCrest } from "@/components/layout/InstitutionCrest";

export function AuthLayout({
  children,
  institutionName = "Defence Headquarters",
}: {
  children: ReactNode;
  institutionName?: string;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-grey px-6 py-12 lg:justify-between lg:px-24">
      <div className="flex w-full max-w-[490px] flex-col items-center lg:items-start">
        <div className="mb-10 flex flex-col items-center gap-2 lg:items-start">
          <InstitutionCrest size={223} />
          <h1 className="text-center font-display text-[26px] uppercase leading-tight text-primary lg:whitespace-nowrap lg:text-left lg:text-[32px]">
            {institutionName}
          </h1>
        </div>
        <div className="w-full max-w-[450px]">{children}</div>
      </div>

      {/* Green artwork panel from the Figma login screen (672 x 948, 80px radius) */}
      <div className="relative hidden h-[85vh] max-h-[948px] w-[45%] max-w-[672px] shrink-0 overflow-hidden rounded-[80px] lg:block">
        <Image
          src="/branding/login-visual.png"
          alt=""
          fill
          priority
          sizes="672px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
