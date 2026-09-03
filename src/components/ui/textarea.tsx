import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full min-h-48 resize-y rounded-lg bg-raised px-4 py-3.5 text-sm leading-relaxed text-fg placeholder:text-faint shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:shadow-[var(--shadow-border-hover)]",
        className,
      )}
      {...props}
    />
  );
}
