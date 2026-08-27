import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/kr/krFrn/index.ts";
describe("kr/krFrn", () => {
  it("findAll valid", () => { expect(mod.findAll("911124-5678906").length).toBe(1); expect(mod.findAll("050912-6000012").length).toBe(1); expect(mod.findAll("0509126000012").length).toBe(1); });
  it("findAll invalid filtered", () => { expect(mod.findAll("911124-5678901").length).toBe(0); expect(mod.findAll("9111245678901").length).toBe(0); });
  it("validateResult", () => { expect(mod.validateResult("911124-5678906")).toBe(true); expect(mod.validateResult("911124-5678901")).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test 911124-5678906 end"); expect(r.length).toBe(1); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
