"use client";

import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import { ViewIcon, ViewOffSlashIcon, ArrowDown01Icon } from "@hugeicons/core-free-icons";

interface FieldWrapperProps {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
  htmlFor?: string;
}

function FieldWrapper({ label, hint, error, className, children, htmlFor }: FieldWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <span className="text-xs text-muted">{hint}</span>}
      {error && <span className="text-xs text-red">{error}</span>}
    </div>
  );
}

const fieldBase =
  "h-12 w-full rounded border border-border bg-white px-3.5 text-sm text-ink placeholder:text-border outline-none transition-colors focus:border-primary disabled:bg-grey disabled:text-muted";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, id, leftIcon, type, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    return (
      <FieldWrapper label={label} hint={hint} error={error} htmlFor={fieldId}>
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={fieldId}
            type={isPassword ? (show ? "text" : "password") : type}
            className={cn(fieldBase, leftIcon && "pl-10", isPassword && "pr-11", error && "border-red", className)}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShow((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink"
              aria-label={show ? "Hide password" : "Show password"}
            >
              <Icon icon={show ? ViewIcon : ViewOffSlashIcon} size={20} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </FieldWrapper>
    );
  },
);
Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    return (
      <FieldWrapper label={label} hint={hint} error={error} htmlFor={fieldId}>
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          className={cn(
            "w-full resize-none rounded border border-border bg-white px-3.5 py-3 text-sm text-ink placeholder:text-border outline-none transition-colors focus:border-primary",
            error && "border-red",
            className,
          )}
          {...props}
        />
      </FieldWrapper>
    );
  },
);
Textarea.displayName = "Textarea";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, className, id, options, placeholder, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    return (
      <FieldWrapper label={label} hint={hint} error={error} htmlFor={fieldId}>
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            className={cn(fieldBase, "appearance-none pr-10", error && "border-red", className)}
            defaultValue={props.defaultValue ?? ""}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-border">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink">
            <Icon icon={ArrowDown01Icon} size={18} strokeWidth={1.75} />
          </span>
        </div>
      </FieldWrapper>
    );
  },
);
Select.displayName = "Select";
