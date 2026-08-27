import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/au/auMedicare/index.ts";
describe("au/auMedicare", () => {
  it("findAll valid spaced", () => { expect(mod.findAll("2123 45670 1").length).toBe(1); });
  it("findAll valid compact", () => { expect(mod.findAll("2123456701").length).toBe(1); });
  it("findAll invalid filtered", () => { expect(mod.findAll("2123 25870 1").length).toBe(0); expect(mod.findAll("1234567890").length).toBe(0); });
  it("analyze valid", () => { const r=mod.analyze("test 2123456701 end"); expect(r.length).toBe(1); expect(r[0]!.score).toBe(1); });
  it("validateResult", () => { expect(mod.validateResult("2123456701")).toBe(true); expect(mod.validateResult("2123258701")).toBe(false); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
