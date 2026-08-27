import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/us/usReferral/index.ts";
describe("us/usReferral", () => {
  it("findAll valid", () => { expect(mod.findAll("REF-123456").length).toBeGreaterThan(0); });
  it("analyze valid", () => { const r=mod.analyze("test REF-123456 end"); expect(r.length).toBeGreaterThan(0); expect(r[0]!.entityType).toBe(mod.ENTITY_TYPE); });
  it("invalid not crash", () => { expect(Array.isArray(mod.findAll("abc"))).toBe(true); });
  it("meta", () => { expect(mod.COUNTRY_CODE).toBeDefined(); expect(mod.ENTITY_TYPE).toBeDefined(); });
});
