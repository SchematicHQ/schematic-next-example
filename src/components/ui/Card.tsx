import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/utils/cn";

const CARD =
  "rounded-card border border-border bg-card p-11.25 shadow-[var(--shadow)]";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  as?: ElementType;
}

export const Card = ({
  as: Element = "div",
  className,
  ...props
}: CardProps) => <Element className={cn(CARD, className)} {...props} />;
