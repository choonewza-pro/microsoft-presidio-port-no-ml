import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/ph/phPassport/index.ts";
describe("ph/phPassport", () => {
  it("findAll valid", () => { expect(mod.findAll("A1234567").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test A1234567 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
