import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/kr/krRrn/index.ts";
describe("kr/krRrn", () => {
  it("findAll valid checksum passes", () => { expect(mod.findAll("960121-1021413").length).toBe(1); expect(mod.findAll("050912-2000019").length).toBe(1); expect(mod.findAll("9601211021413").length).toBe(1); });
  it("findAll invalid checksum filtered", () => { expect(mod.findAll("960121-1234567").length).toBe(0); expect(mod.findAll("9601211234567").length).toBe(0); });
  it("validateResult", () => { expect(mod.validateResult("960121-1021413")).toBe(true); expect(mod.validateResult("960121-1234567")).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test 960121-1021413 end"); expect(r.length).toBe(1); expect(r[0]!.value).toBe("960121-1021413"); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBe("KR_RRN"); });
});
