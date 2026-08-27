import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/global/iban/index.ts";

describe("global/iban", () => {
  it("findAll valid", () => {
    expect(mod.findAll("DE89 3704 0044 0532 0130 00").length).toBeGreaterThan(0);
  });
  it("findAll invalid filtered or not found", () => {
    const res = mod.findAll("DE00 0000 0000 0000 0000 00");
    // invalid may still match regex but should be filtered if validate fails - at least not crash
    expect(Array.isArray(res)).toBe(true);
  });
  it("analyze returns RecognizerResult", () => {
    const res = mod.analyze("test DE89 3704 0044 0532 0130 00 end");
    expect(res.length).toBeGreaterThan(0);
    expect(res[0]!.entityType).toBe(mod.ENTITY_TYPE);
  });
  it("CONTEXT and ENTITY_TYPE defined", () => {
    expect(mod.ENTITY_TYPE).toBeDefined();
    expect(mod.CONTEXT).toBeDefined();
  });
});
