/**
 * Generates a unique ID.
 * Uses crypto.randomUUID() when available (Node 18+, modern browsers).
 * Falls back to Math.random() for older environments.
 */
export function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  // Fallback: pseudo-random hex string
  return (
    Math.random().toString(36).slice(2, 10) +
    "-" +
    Math.random().toString(36).slice(2, 10) +
    "-" +
    Date.now().toString(36)
  );
}