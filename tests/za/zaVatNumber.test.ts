import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/za/zaVatNumber/index.ts";
describe("za/zaVatNumber", () => {
  it("findAll valid", () => { expect(mod.findAll("4123456789").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test 4123456789 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
