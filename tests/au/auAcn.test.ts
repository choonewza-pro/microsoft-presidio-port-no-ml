import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/au/auAcn/index.ts";
describe("au/auAcn", () => {
  it("findAll valid spaced", () => { expect(mod.findAll("000 000 019").length).toBe(1); });
  it("findAll valid second", () => { expect(mod.findAll("005 499 981").length).toBe(1); });
  it("findAll valid compact", () => { expect(mod.findAll("006249976").length).toBe(1); });
  it("findAll valid check digit 0", () => { expect(mod.findAll("000000180").length).toBe(1); });
  it("findAll invalid filtered", () => { expect(mod.findAll("123 456 789").length).toBe(0); expect(mod.findAll("824 753 557").length).toBe(0); });
  it("analyze valid", () => { const r=mod.analyze("test 000 000 019 end"); expect(r.length).toBe(1); expect(r[0]!.score).toBe(1); });
  it("validateResult", () => { expect(mod.validateResult("000 000 019")).toBe(true); expect(mod.validateResult("123 456 789")).toBe(false); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
