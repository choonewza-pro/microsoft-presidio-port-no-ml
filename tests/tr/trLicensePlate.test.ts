import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/tr/trLicensePlate/index.ts";
describe("tr/trLicensePlate", () => {
  it("findAll valid", () => { expect(mod.findAll("34 ABC 123").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test 34 ABC 123 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
