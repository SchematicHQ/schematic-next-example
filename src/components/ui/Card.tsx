import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/utils/cn";

// Radius, padding and shadow all come from the original embed theme
// (borderRadius 10, padding 45, hasShadow true) so a card here and a card
// rendered by an embed are the same object.
const CARD =
  "rounded-card border border-border bg-card p-11.25 shadow-[var(--shadow)]";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  /** Render as a different element — e.g. `aside` for a sidebar panel. */
  as?: ElementType;
}

/** The app's one surface: a bordered, padded panel on the card background. */
export const Card = ({
  as: Element = "div",
  className,
  ...props
}: CardProps) => <Element className={cn(CARD, className)} {...props} />;
