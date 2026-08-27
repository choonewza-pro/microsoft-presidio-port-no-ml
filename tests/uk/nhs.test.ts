import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/uk/nhs/index.ts";
describe("uk/nhs", () => {
  it("findAll valid", () => { expect(mod.findAll("9434765919").length).toBeGreaterThan(0); });
  it("analyze valid", () => { const r=mod.analyze("test 9434765919 end"); expect(r.length).toBeGreaterThan(0); expect(r[0]!.entityType).toBe(mod.ENTITY_TYPE); });
  it("invalid not crash", () => { expect(Array.isArray(mod.findAll("0000000000"))).toBe(true); });
  it("meta", () => { expect(mod.COUNTRY_CODE).toBeDefined(); expect(mod.ENTITY_TYPE).toBeDefined(); });
});
