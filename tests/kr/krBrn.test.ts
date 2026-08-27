import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/kr/krBrn/index.ts";
describe("kr/krBrn", () => {
  it("findAll valid", () => { expect(mod.findAll("104-86-56659").length).toBe(1); expect(mod.findAll("1048656659").length).toBe(1); expect(mod.findAll("104-82-13138").length).toBe(1); });
  it("findAll invalid checksum filtered", () => { expect(mod.findAll("123-45-67890").length).toBe(0); expect(mod.findAll("104-86-56658").length).toBe(0); });
  it("validateResult", () => { expect(mod.validateResult("104-86-56659")).toBe(true); expect(mod.validateResult("123-45-67890")).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test 104-86-56659 end"); expect(r.length).toBe(1); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
