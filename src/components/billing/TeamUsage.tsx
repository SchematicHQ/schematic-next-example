"use client";

import {
  featureName,
  formatNumber,
  useResolvedLocale,
} from "@schematichq/schematic-components/elements";
import { useMemo, useState } from "react";

import { LinkButton } from "@/components/ui";

/** Shown before the list is expanded. */
const COLLAPSED = 3;

interface TeamUsageProps {
  /** Users in all, across pages. */
  count: number;
  total: number;
  /** What every amount is counted in. */
  unit: {
    name: string;
    singularName?: string | null;
    pluralName?: string | null;
  };
  users: { amount: number; id: string; label: string }[];
}

/**
 * Who on the team used a feature or a credit this period, heaviest first:
 * three, then the rest the breakdown carries.
 */
export function TeamUsage({ count, total, unit, users }: TeamUsageProps) {
  const locale = useResolvedLocale();
  const [expanded, setExpanded] = useState(false);
  const sorted = useMemo(
    () => [...users].sort((a, b) => b.amount - a.amount),
    [users],
  );
  if (sorted.length === 0) {
    return null;
  }
  const amount = (value: number) =>
    `${formatNumber(value, locale)} ${featureName(unit, value, locale)}`;
  const shown = expanded ? sorted : sorted.slice(0, COLLAPSED);

  return (
    <div className="space-y-2 rounded-xl bg-muted/50 p-4">
      <div className="space-y-0.5">
        <p className="text-sm font-semibold">Usage by user</p>
        <p className="text-xs text-muted-fg">
          {amount(total)} used by your team this period
        </p>
      </div>
      <ul className="space-y-1.5 text-sm">
        {shown.map((user) => (
          <li className="flex items-center gap-3" key={user.id}>
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[0.625rem] font-semibold"
            >
              {(user.label.trim()[0] ?? "?").toUpperCase()}
            </span>
            <span className="min-w-0 grow truncate">{user.label}</span>
            {/* Never wraps: a long unit takes its room from the name,
                which truncates, so the column keeps its right edge. */}
            <span className="shrink-0 text-right whitespace-nowrap tabular-nums text-muted-fg">
              {amount(user.amount)}
            </span>
          </li>
        ))}
      </ul>
      {sorted.length > COLLAPSED && (
        <LinkButton
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show fewer" : `Show all ${count} users`}
        </LinkButton>
      )}
    </div>
  );
}
