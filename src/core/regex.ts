/**
 * regex helper - ตรง pattern_recognizer.py:59 global_regex_flags = DOTALL|MULTILINE|IGNORECASE (26) => gims
 */

/** สร้าง RegExp global แบบ Presidio (gims) */
export function buildGlobalRegex(source: string, withWordBoundary = true): RegExp {
  const pattern = withWordBoundary ? `\\b${source}\\b` : source;
  return new RegExp(pattern, "gims");
}

/** แบบไม่มี global ไว้เช็คเดี่ยว */
export function buildSingleRegex(source: string, withWordBoundary = true): RegExp {
  const pattern = withWordBoundary ? `^${source}$` : `^${source}$`;
  // ใช้ ^$ แทน \b เมื่อต้องการ match ทั้งสตริง
  return new RegExp(pattern, "ims");
}
