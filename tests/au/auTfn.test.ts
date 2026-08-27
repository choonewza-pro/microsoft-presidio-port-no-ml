import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/au/auTfn/index.ts";
describe("au/auTfn", () => {
  it("findAll valid spaced", () => { expect(mod.findAll("876 543 210").length).toBe(1); });
  it("findAll valid compact", () => { expect(mod.findAll("876543210").length).toBe(1); });
  it("findAll invalid filtered", () => { expect(mod.findAll("824 753 557").length).toBe(0); expect(mod.findAll("12345678").length).toBe(0); });
  it("analyze valid", () => { const r=mod.analyze("test 876543210 end"); expect(r.length).toBe(1); expect(r[0]!.score).toBe(1); });
  it("validateResult", () => { expect(mod.validateResult("876543210")).toBe(true); expect(mod.validateResult("824753557")).toBe(false); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
