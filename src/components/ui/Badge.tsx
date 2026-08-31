import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/utils/cn";

const BADGE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm font-medium";

const TONE = {
  neutral: "border-border-2 bg-muted text-muted-fg",
  success: "border-green/30 bg-green/10 text-green",
  warning: "border-amber/30 bg-amber-soft text-amber-ink",
  danger: "border-danger-line bg-danger-soft text-danger-deep",
} as const;

export type BadgeTone = keyof typeof TONE;

interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  tone?: BadgeTone;
}

export const Badge = ({
  className,
  tone = "neutral",
  ...props
}: BadgeProps) => (
  <span className={cn(BADGE, TONE[tone], className)} {...props} />
);
