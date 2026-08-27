import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/ng/ngNin/index.ts";
describe("ng/ngNin", () => {
  it("findAll valid Verhoeff", () => { expect(mod.findAll("12345678902").length).toBe(1); expect(mod.findAll("98765432102").length).toBe(1); expect(mod.findAll("01234567895").length).toBe(1); });
  it("findAll invalid filtered", () => { expect(mod.findAll("12345678901").length).toBe(0); expect(mod.findAll("1234567890").length).toBe(0); });
  it("validateResult", () => { expect(mod.validateResult("12345678902")).toBe(true); expect(mod.validateResult("12345678901")).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test 12345678902 end"); expect(r.length).toBe(1); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
