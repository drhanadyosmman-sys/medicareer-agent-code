/**
 * Turn a tRPC error into something worth showing a person.
 *
 * Input validation failures arrive as a JSON-encoded array of Zod issues, which
 * is unreadable in a toast. Pull out the first issue's message; fall back to the
 * raw message for ordinary errors (wrong password, email taken, and so on).
 */
export function readableError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const raw = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  if (!raw) return fallback;

  const trimmed = raw.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const issues = Array.isArray(parsed) ? parsed : [parsed];
      const message = issues.find(i => typeof i?.message === 'string')?.message;
      if (message) return message;
    } catch {
      // Not JSON after all - fall through and use the raw text.
    }
  }

  return trimmed || fallback;
}
