import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "secondary" | "destructive" | "muted" | "ghost";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark disabled:bg-[#9fc9b6]",
  outline: "border border-primary bg-white text-primary hover:bg-primary-light",
  secondary: "border border-border bg-white text-ink hover:bg-grey disabled:text-muted",
  destructive: "bg-red text-white hover:bg-[#c11a1f] disabled:bg-[#f3a6a8]",
  muted: "bg-[#c9cbcd] text-white disabled:bg-[#c9cbcd] disabled:text-white",
  ghost: "bg-transparent text-ink hover:bg-grey disabled:text-muted",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-sm",
  lg: "h-[52px] px-8 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[4px] font-semibold transition-colors disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
