/**
 * Joins class names, dropping falsy entries so conditionals read inline:
 *
 *     cn("p-4", isActive && "bg-muted", className)
 *
 * This does not resolve conflicts between Tailwind utilities that set the
 * same property — `cn("px-4", "px-0")` emits both, and CSS source order
 * decides the winner. Prefer variants (see `ui/Button.tsx`) over passing
 * conflicting overrides through `className`.
 */
export const cn = (...classes: (string | false | null | undefined)[]): string =>
  classes.filter(Boolean).join(" ");
