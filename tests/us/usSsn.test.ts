import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/us/usSsn/index.ts";
describe("us/usSsn", () => {
  it("findAll valid", () => { expect(mod.findAll("456-78-9021").length).toBeGreaterThan(0); });
  it("analyze valid", () => { const r=mod.analyze("test 456-78-9021 end"); expect(r.length).toBeGreaterThan(0); expect(r[0]!.entityType).toBe(mod.ENTITY_TYPE); });
  it("invalid not crash", () => { expect(Array.isArray(mod.findAll("000-00-0000"))).toBe(true); });
  it("meta", () => { expect(mod.COUNTRY_CODE).toBeDefined(); expect(mod.ENTITY_TYPE).toBeDefined(); });
});
