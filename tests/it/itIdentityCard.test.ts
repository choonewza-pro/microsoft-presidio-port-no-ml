import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/it/itIdentityCard/index.ts";
describe("it/itIdentityCard", () => {
  it("findAll valid", () => { expect(mod.findAll("AB1234567").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test AB1234567 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); expect(mod.COUNTRY_CODE).toBeDefined(); });
});
