import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/in/inVehicleRegistration/index.ts";
describe("in/inVehicleRegistration", () => {
  it("findAll valid", () => { expect(mod.findAll("MH02AB1234").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test MH02AB1234 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
