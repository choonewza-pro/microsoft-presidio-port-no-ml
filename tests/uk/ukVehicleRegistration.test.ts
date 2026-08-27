import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/uk/ukVehicleRegistration/index.ts";
describe("uk/ukVehicleRegistration", () => {
  it("findAll valid", () => { expect(mod.findAll("AB12 CDE").length).toBeGreaterThan(0); });
  it("analyze valid", () => { const r=mod.analyze("test AB12 CDE end"); expect(r.length).toBeGreaterThan(0); expect(r[0]!.entityType).toBe(mod.ENTITY_TYPE); });
  it("invalid not crash", () => { expect(Array.isArray(mod.findAll("ZZZ"))).toBe(true); });
  it("meta", () => { expect(mod.COUNTRY_CODE).toBeDefined(); expect(mod.ENTITY_TYPE).toBeDefined(); });
});
