/**
 * Tiny classnames helper — filters falsy values and joins with a space.
 * Usage: cn("base", isActive && "active", undefined, "other")
 */
export function cn(
  ...classes: (string | undefined | false | null | 0)[]
): string {
  return classes.filter(Boolean).join(" ");
}