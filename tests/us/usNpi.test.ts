import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/us/usNpi/index.ts";
describe("us/usNpi", () => {
  it("findAll valid", () => { expect(mod.findAll("1234567893").length).toBeGreaterThan(0); });
  it("analyze valid", () => { const r=mod.analyze("test 1234567893 end"); expect(r.length).toBeGreaterThan(0); expect(r[0]!.entityType).toBe(mod.ENTITY_TYPE); });
  it("invalid not crash", () => { expect(Array.isArray(mod.findAll("0000000000"))).toBe(true); });
  it("meta", () => { expect(mod.COUNTRY_CODE).toBeDefined(); expect(mod.ENTITY_TYPE).toBeDefined(); });
});
