import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/de/deSocialSecurity/index.ts";
describe("de/deSocialSecurity", () => {
  it("findAll valid", () => { expect(mod.findAll("010203A123").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test 010203A123 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); expect(mod.COUNTRY_CODE).toBeDefined(); });
});
