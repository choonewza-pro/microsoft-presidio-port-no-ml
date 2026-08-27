import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/us/usMbi/index.ts";
describe("us/usMbi", () => {
  it("findAll valid", () => { expect(mod.findAll("1EG4-TE5-MK73").length).toBeGreaterThan(0); });
  it("analyze valid", () => { const r=mod.analyze("test 1EG4-TE5-MK73 end"); expect(r.length).toBeGreaterThan(0); expect(r[0]!.entityType).toBe(mod.ENTITY_TYPE); });
  it("invalid not crash", () => { expect(Array.isArray(mod.findAll("0000-000-0000"))).toBe(true); });
  it("meta", () => { expect(mod.COUNTRY_CODE).toBeDefined(); expect(mod.ENTITY_TYPE).toBeDefined(); });
});
