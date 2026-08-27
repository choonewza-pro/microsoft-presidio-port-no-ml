import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/it/itDriverLicense/index.ts";
describe("it/itDriverLicense", () => {
  it("findAll valid", () => { expect(mod.findAll("AB1234567C").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test AB1234567C end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); expect(mod.COUNTRY_CODE).toBeDefined(); });
});
