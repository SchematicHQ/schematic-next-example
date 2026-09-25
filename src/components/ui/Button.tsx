import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/utils/cn";

const BUTTON =
  "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border-2 text-fg transition-colors duration-150 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

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

const LINK_BUTTON =
  "cursor-pointer text-sm font-semibold underline underline-offset-[0.2em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:text-muted-fg disabled:no-underline";

/** `danger` marks the action that destroys something, such as Remove. */
const LINK_TONE = {
  accent: "text-accent hover:text-accent-deep",
  danger: "text-danger hover:text-danger-deep",
} as const;

interface LinkButtonProps extends ComponentPropsWithoutRef<"button"> {
  tone?: keyof typeof LINK_TONE;
}

/** An action that reads as a link — Edit, Cancel, Remove — not a control. */
export const LinkButton = ({
  className,
  tone = "accent",
  type = "button",
  ...props
}: LinkButtonProps) => (
  <button
    className={cn(LINK_BUTTON, LINK_TONE[tone], className)}
    type={type}
    {...props}
  />
);
