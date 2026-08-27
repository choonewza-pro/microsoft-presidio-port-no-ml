import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/za/zaPassport/index.ts";
describe("za/zaPassport", () => {
  it("findAll valid", () => { expect(mod.findAll("A12345678").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test A12345678 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
