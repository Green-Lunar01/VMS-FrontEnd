import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, className, id, ...props }, ref) => {
  return (
    <label htmlFor={id} className={cn("flex items-center gap-2.5 text-sm text-ink", className)}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className="h-4.5 w-4.5 rounded border-border text-primary accent-primary focus:ring-primary"
        {...props}
      />
      {label}
    </label>
  );
});
Checkbox.displayName = "Checkbox";
