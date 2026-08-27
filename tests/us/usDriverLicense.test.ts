import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/us/usDriverLicense/index.ts";
describe("us/usDriverLicense", () => {
  it("findAll valid", () => { expect(mod.findAll("A1234567").length).toBeGreaterThan(0); });
  it("analyze valid", () => { const r=mod.analyze("test A1234567 end"); expect(r.length).toBeGreaterThan(0); expect(r[0]!.entityType).toBe(mod.ENTITY_TYPE); });
  it("invalid not crash", () => { expect(Array.isArray(mod.findAll("abc"))).toBe(true); });
  it("meta", () => { expect(mod.COUNTRY_CODE).toBeDefined(); expect(mod.ENTITY_TYPE).toBeDefined(); });
});
