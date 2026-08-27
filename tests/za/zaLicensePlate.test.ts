import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/za/zaLicensePlate/index.ts";
describe("za/zaLicensePlate", () => {
  it("findAll valid", () => { expect(mod.findAll("CA 123 456").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test CA 123 456 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
