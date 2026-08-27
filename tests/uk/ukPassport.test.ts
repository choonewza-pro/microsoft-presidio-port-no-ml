import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/uk/ukPassport/index.ts";
describe("uk/ukPassport", () => {
  it("findAll valid", () => { expect(mod.findAll("AB1234567").length).toBeGreaterThan(0); });
  it("analyze valid", () => { const r=mod.analyze("test AB1234567 end"); expect(r.length).toBeGreaterThan(0); expect(r[0]!.entityType).toBe(mod.ENTITY_TYPE); });
  it("invalid not crash", () => { expect(Array.isArray(mod.findAll("123"))).toBe(true); });
  it("meta", () => { expect(mod.COUNTRY_CODE).toBeDefined(); expect(mod.ENTITY_TYPE).toBeDefined(); });
});
