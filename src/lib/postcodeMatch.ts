/** Normalise typed text: strip whitespace/punctuation, uppercase. */
export function normalisePostcodeInput(value: string): string {
  return (value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Extract the outward portion of a typed UK postcode.
 * "SO30 2QT" / "so302qt" -> "SO30". Partial input like "SO3" returns "SO3".
 */
export function outwardCode(value: string): string {
  const raw = normalisePostcodeInput(value);
  if (!raw) return '';
  // Full postcode: outward + inward (digit + 2 letters)
  const full = raw.match(/^([A-Z]{1,2}\d[A-Z\d]?)\d[A-Z]{2}$/);
  if (full) return full[1];
  // Otherwise take leading letters plus following digits (and optional letter)
  const partial = raw.match(/^([A-Z]{1,2}\d{0,2}[A-Z]?)/);
  return partial ? partial[1] : raw;
}

/**
 * Postcode-tolerant filter for the directory location dropdown.
 * Matches an option when the typed outward code matches it either way round,
 * so "SO30 2QT", "so302qt", "SO30" and "SO3" all find the SO30 option.
 */
export function postcodeMatches(option: string, query: string): boolean {
  const opt = normalisePostcodeInput(option);
  const q = normalisePostcodeInput(query);
  if (!q) return true;
  const out = outwardCode(q);
  if (out && (opt === out || opt.startsWith(out) || out.startsWith(opt))) return true;
  return opt.startsWith(q);
}
