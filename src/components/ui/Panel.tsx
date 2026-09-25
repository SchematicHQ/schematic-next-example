import { type ComponentPropsWithoutRef, type ReactNode, useId } from "react";

import { cn } from "@/utils/cn";

interface PanelProps extends Omit<
  ComponentPropsWithoutRef<"section">,
  "title"
> {
  children: ReactNode;
  title: string;
}

/**
 * One card for related sections: a titled header, then each section split
 * from the next by a rule.
 */
export const Panel = ({ children, className, title, ...props }: PanelProps) => {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "rounded-card border border-border bg-card shadow-[var(--shadow)]",
        className,
      )}
      {...props}
    >
      <h2
        className="border-b border-border px-6 py-5 text-2xl md:px-9"
        id={titleId}
      >
        {title}
      </h2>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
};

interface PanelSectionProps extends Omit<
  ComponentPropsWithoutRef<"section">,
  "title"
> {
  /** Right of the heading: a status the section wants seen at a glance. */
  aside?: ReactNode;
  children: ReactNode;
  title: string;
}

/**
 * A section of a `Panel`: a small heading with its status beside it, the
 * content beneath. The heading names the section for assistive tech, so
 * loading and error states keep their place in the outline.
 */
export const PanelSection = ({
  aside,
  children,
  className,
  title,
  ...props
}: PanelSectionProps) => {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cn("space-y-4 px-6 py-7 md:px-9", className)}
      {...props}
    >
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3
          className="text-xs font-semibold tracking-wider text-muted-fg uppercase"
          id={titleId}
        >
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
};
