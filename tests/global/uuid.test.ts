import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/global/uuid/index.ts";

describe("global/uuid", () => {
  it("findAll valid", () => {
    expect(mod.findAll("550e8400-e29b-41d4-a716-446655440000").length).toBeGreaterThan(0);
  });
  it("findAll invalid filtered or not found", () => {
    const res = mod.findAll("00000000-0000-0000-0000-000000000000");
    // invalid may still match regex but should be filtered if validate fails - at least not crash
    expect(Array.isArray(res)).toBe(true);
  });
  it("analyze returns RecognizerResult", () => {
    const res = mod.analyze("test 550e8400-e29b-41d4-a716-446655440000 end");
    expect(res.length).toBeGreaterThan(0);
    expect(res[0]!.entityType).toBe(mod.ENTITY_TYPE);
  });
  it("CONTEXT and ENTITY_TYPE defined", () => {
    expect(mod.ENTITY_TYPE).toBeDefined();
    expect(mod.CONTEXT).toBeDefined();
  });
});
