import type { ReactNode } from "react";
import Image from "next/image";

/**
 * Login and forced-password-change screens are shared across every tenant —
 * there's no institution context yet at this point, so this shows the
 * platform's own identity (Green Lunar VMS), not any one institution's.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-grey px-6 py-12 lg:justify-between lg:px-24">
      <div className="flex w-full max-w-[490px] flex-col items-center lg:items-start">
        <div className="mb-10 flex flex-col items-center gap-2 lg:items-start">
          <Image src="/branding/green-lunar.png" alt="Green Lunar Nigeria Limited" width={180} height={137} priority />
          <h1 className="text-center font-display text-[26px] uppercase leading-tight text-primary lg:whitespace-nowrap lg:text-left lg:text-[32px]">
            Green Lunar VMS
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
