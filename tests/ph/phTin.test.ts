import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/ph/phTin/index.ts";
describe("ph/phTin", () => {
  it("findAll valid", () => { expect(mod.findAll("000-123-456-000").length).toBe(1); expect(mod.findAll("000123456").length).toBe(1); expect(mod.findAll("000-123-456-001").length).toBe(1); });
  it("findAll invalid checksum filtered", () => { expect(mod.findAll("000-123-457-000").length).toBe(0); expect(mod.findAll("123456789").length).toBe(0); expect(mod.findAll("111-111-111-111").length).toBe(0); expect(mod.findAll("111111111").length).toBe(0); });
  it("validateResult", () => { expect(mod.validateResult("000-123-456-000")).toBe(true); expect(mod.validateResult("000-123-457-000")).toBe(false); expect(mod.validateResult("111111111")).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test 000-123-456-000 end"); expect(r.length).toBe(1); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
