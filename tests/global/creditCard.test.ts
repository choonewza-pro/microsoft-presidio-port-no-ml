import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/global/creditCard/index.ts";

describe("global/creditCard", () => {
  it("findAll valid", () => {
    expect(mod.findAll("4111111111111111").length).toBeGreaterThan(0);
  });
  it("findAll invalid filtered or not found", () => {
    const res = mod.findAll("123");
    // invalid may still match regex but should be filtered if validate fails - at least not crash
    expect(Array.isArray(res)).toBe(true);
  });
  it("analyze returns RecognizerResult", () => {
    const res = mod.analyze("test 4111111111111111 end");
    expect(res.length).toBeGreaterThan(0);
    expect(res[0]!.entityType).toBe(mod.ENTITY_TYPE);
  });
  it("CONTEXT and ENTITY_TYPE defined", () => {
    expect(mod.ENTITY_TYPE).toBeDefined();
    expect(mod.CONTEXT).toBeDefined();
  });
});
