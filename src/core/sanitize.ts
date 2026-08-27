/**
 * sanitizeValue - ตรง entity_recognizer.py:310
 * ทำความสะอาดค่าก่อน validate แบบ literal replace ทั้งหมด
 */
export type ReplacementPair = [string, string];

/**
 * @example sanitizeValue("1-2345-67890-12-1", [["-", ""]]) // "1234567890121"
 */
export function sanitizeValue(
  text: string,
  replacementPairs: ReplacementPair[] = [],
): string {
  let result = text;
  for (const [search, replacement] of replacementPairs) {
    result = result.split(search).join(replacement);
  }
  return result;
}
