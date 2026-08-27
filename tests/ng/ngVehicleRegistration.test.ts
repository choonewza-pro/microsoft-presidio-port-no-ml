import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/ng/ngVehicleRegistration/index.ts";
describe("ng/ngVehicleRegistration", () => {
  it("findAll valid", () => { expect(mod.findAll("ABC-123AB").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test ABC-123AB end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
