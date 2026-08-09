const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:'];

/**
 * Records can arrive from a shared Google Sheet, so a stored "URL" is untrusted
 * input. Anything that isn't a plain web link (notably `javascript:`) is dropped
 * rather than handed to an anchor's href.
 */
export function safeUrl(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  try {
    const parsed = new URL(trimmed, window.location.origin);
    return SAFE_PROTOCOLS.includes(parsed.protocol) ? parsed.href : undefined;
  } catch {
    return undefined;
  }
}
