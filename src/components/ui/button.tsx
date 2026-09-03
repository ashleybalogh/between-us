import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,box-shadow,color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] select-none",
  {
    variants: {
      variant: {
        solid:
          "bg-accent text-accent-fg shadow-[var(--shadow-border)] hover:opacity-95",
        outline:
          "bg-transparent text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] hover:bg-raised/60",
        ghost: "bg-transparent text-muted hover:text-fg hover:bg-raised/70",
        danger: "bg-transparent text-muted shadow-[var(--shadow-border)] hover:text-fg",
      },
      size: {
        sm: "h-10 rounded-md px-3.5 text-sm",
        md: "h-12 rounded-lg px-5 text-sm",
        lg: "h-14 rounded-xl px-6 text-base",
        xl: "h-16 rounded-xl px-6 text-base tracking-wide",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      type={asChild ? undefined : type}
      {...props}
    />
  );
}
