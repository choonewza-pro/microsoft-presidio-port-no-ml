import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/fi/fiPersonalIdentityCode/index.ts";
describe("fi/fiPersonalIdentityCode", () => {
  it("findAll valid 131052-308T", () => { expect(mod.findAll("131052-308T").length).toBe(1); });
  it("findAll valid lower case 131052-308t", () => { expect(mod.findAll("131052-308t").length).toBe(1); });
  it("findAll valid 010594Y9032", () => { expect(mod.findAll("010594Y9032").length).toBe(1); });
  it("findAll valid 020594X903P", () => { expect(mod.findAll("020594X903P").length).toBe(1); });
  it("findAll valid 010516B903X", () => { expect(mod.findAll("010516B903X").length).toBe(1); });
  it("findAll invalid checksum 111111-111A", () => { expect(mod.findAll("111111-111A").length).toBe(0); });
  it("findAll invalid date 310289-211C", () => { expect(mod.findAll("310289-211C").length).toBe(0); });
  it("findAll invalid separator slash 131052/308T", () => { expect(mod.findAll("131052/308T").length).toBe(0); });
  it("findAll invalid non-leap 29Feb 1800 290200+311B", () => { expect(mod.findAll("290200+311B").length).toBe(0); });
  it("validateResult valid", () => { expect(mod.validateResult("131052-308T")).toBe(true); expect(mod.validateResult("131052-308t")).toBe(true); });
  it("validateResult invalid", () => { expect(mod.validateResult("111111-111A")).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test 131052-308T end"); expect(r.length).toBe(1); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
