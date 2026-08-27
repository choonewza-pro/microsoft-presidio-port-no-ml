import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/tr/trNationalId/index.ts";
describe("tr/trNationalId", () => {
  it("findAll valid", () => { expect(mod.findAll("10000000146").length).toBe(1); expect(mod.findAll("76543210794").length).toBe(1); expect(mod.findAll("36493665440").length).toBe(1); });
  it("findAll invalid filtered", () => { expect(mod.findAll("12345678900").length).toBe(0); expect(mod.findAll("10000000145").length).toBe(0); expect(mod.findAll("02531814694").length).toBe(0); });
  it("validateResult", () => { expect(mod.validateResult("10000000146")).toBe(true); expect(mod.validateResult("12345678900")).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test 10000000146 end"); expect(r.length).toBe(1); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
