import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/us/usItin/index.ts";
describe("us/usItin", () => {
  it("findAll valid", () => { expect(mod.findAll("900-70-1234").length).toBeGreaterThan(0); });
  it("analyze valid", () => { const r=mod.analyze("test 900-70-1234 end"); expect(r.length).toBeGreaterThan(0); expect(r[0]!.entityType).toBe(mod.ENTITY_TYPE); });
  it("invalid not crash", () => { expect(Array.isArray(mod.findAll("900-00-1234"))).toBe(true); });
  it("meta", () => { expect(mod.COUNTRY_CODE).toBeDefined(); expect(mod.ENTITY_TYPE).toBeDefined(); });
});
