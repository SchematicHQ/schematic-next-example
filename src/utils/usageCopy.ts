import type {
  CreditLedgerRow,
  EntitlementText,
  MeteredHeadline,
  MeteredLimit,
  UsageSegment,
  UsageSummary,
} from "@schematichq/schematic-components/elements";

/**
 * The app's own wording for the usage derivations' parts. The derivations
 * hand back numbers, names and dates already formatted, keyed by `kind`;
 * these put the words around them.
 */

/** "mo", "qtr", "yr"; the period itself for one without a short form. */
export function shortPeriod(period: string): string {
  switch (period) {
    case "month":
      return "mo";
    case "quarter":
      return "qtr";
    case "year":
      return "yr";
    default:
      return period;
  }
}

export function entitlementText(text: EntitlementText): string {
  switch (text.kind) {
    case "units":
      return `${text.amount} ${text.units}`;
    case "perUnit":
      return `${text.cost} per ${text.unit}`;
    case "perPackage":
      return `${text.cost} per ${text.size} ${text.units}`;
    case "tierUpTo":
      return `Up to ${text.amount} ${text.feature} in this tier`;
    case "tierUnlimited":
      return `Unlimited ${text.feature} in this tier`;
    case "perUse":
      return `${text.amount} ${text.units} per use`;
    case "unlimited":
      return `Unlimited ${text.item}`;
  }
}

/** The usage line: its parts joined by " • ", else how much is used. */
export function usageText(
  segments: UsageSegment[],
  summary: UsageSummary | null,
): string | null {
  if (segments.length > 0) {
    return segments
      .map((segment) => {
        switch (segment.kind) {
          case "unitPricePerPeriod":
            return segment.size > 1
              ? `${segment.cost}/${segment.size} ${segment.units}/${shortPeriod(segment.period)}`
              : `${segment.cost}/${segment.units}/${shortPeriod(segment.period)}`;
          case "used":
            return `${segment.amount} ${segment.units} used`;
          case "cost":
            return segment.period === null
              ? segment.cost
              : `${segment.cost}/${shortPeriod(segment.period)}`;
          case "resets":
            return `Resets ${segment.date}`;
        }
      })
      .join(" • ");
  }
  if (summary === null) {
    return null;
  }
  return summary.kind === "limited"
    ? `${summary.amount} of ${summary.allocation} used`
    : `${summary.amount} used`;
}

export function headlineText(headline: MeteredHeadline): string {
  if (headline.kind === "used") {
    return `${headline.amount} ${headline.units} used`;
  }
  return headline.amount === null
    ? headline.units
    : `${headline.amount} ${headline.units}`;
}

export function limitText(limit: MeteredLimit): string {
  switch (limit.kind) {
    case "tierUpTo":
      return `Up to ${limit.amount} ${limit.feature} in this tier`;
    case "tierUnlimited":
      return `Unlimited ${limit.feature} in this tier`;
    case "included":
      return `${limit.amount} included`;
    case "used":
      return `${limit.amount} used`;
    case "cost":
      return limit.cost;
    case "perUse":
      return `${limit.amount} ${limit.units} per use`;
    case "limitOf":
      return `Limit of ${limit.amount}`;
    case "noLimit":
      return "No limit";
  }
}

export function ledgerText(row: CreditLedgerRow): string {
  switch (row.kind) {
    case "plan":
      return `${row.amount} ${row.item} included in plan`;
    case "bundle":
      return `${row.amount} ${row.item} bundle purchased ${row.createdAt}`;
    case "autoTopup":
      return `${row.amount} ${row.item} auto-topup purchased ${row.createdAt}`;
    case "promotional":
      return `${row.amount} promotional ${row.item} granted ${row.createdAt}`;
  }
}
