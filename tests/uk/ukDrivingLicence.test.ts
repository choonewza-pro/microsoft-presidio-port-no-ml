import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/uk/ukDrivingLicence/index.ts";
describe("uk/ukDrivingLicence", () => {
  it("findAll valid", () => { expect(mod.findAll("MORGA753116SM9IJ").length).toBeGreaterThan(0); });
  it("analyze valid", () => { const r=mod.analyze("test MORGA753116SM9IJ end"); expect(r.length).toBeGreaterThan(0); expect(r[0]!.entityType).toBe(mod.ENTITY_TYPE); });
  it("invalid not crash", () => { expect(Array.isArray(mod.findAll("99999"))).toBe(true); });
  it("meta", () => { expect(mod.COUNTRY_CODE).toBeDefined(); expect(mod.ENTITY_TYPE).toBeDefined(); });
});
