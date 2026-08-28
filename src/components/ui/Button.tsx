import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/utils/cn";

const BUTTON =
  "inline-flex items-center gap-2 rounded-xl border border-border-2 text-fg transition-colors duration-150 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

// Sizes own the properties a caller would otherwise fight over (padding, text
// size, alignment), so `className` is only ever used for layout.
const SIZE = {
  md: "px-3.5 py-1.5 text-sm font-semibold",
  icon: "size-9 shrink-0 justify-center text-base",
} as const;

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  size?: keyof typeof SIZE;
}

export const Button = ({
  className,
  size = "md",
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    className={cn(BUTTON, SIZE[size], className)}
    type={type}
    {...props}
  />
);
