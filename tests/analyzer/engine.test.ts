import { describe, it, expect } from "bun:test";
import { AnalyzerEngine } from "../../src/analyzer/engine.ts";

describe("AnalyzerEngine", () => {
  it("analyze thTnin", () => {
    const engine = new AnalyzerEngine({supportedLanguages:["en","th"]});
    const res = engine.analyze("เลขบัตร 1234567890121", {language:"th"});
    expect(res.some(r=>r.entityType==="TH_TNIN")).toBe(true);
  });
  it("analyze email + creditCard", () => {
    const engine = new AnalyzerEngine();
    const res = engine.analyze("email test@example.com card 4111111111111111", {language:"en"});
    expect(res.some(r=>r.entityType==="EMAIL_ADDRESS")).toBe(true);
    expect(res.some(r=>r.entityType==="CREDIT_CARD")).toBe(true);
  });
  it("allowList exact", () => {
    const engine = new AnalyzerEngine();
    const res = engine.analyze("test@example.com", {language:"en", allowList:["test@example.com"]});
    expect(res.filter(r=>r.entityType==="EMAIL_ADDRESS").length).toBe(0);
  });
  it("context boost", () => {
    const engine = new AnalyzerEngine();
    const res = engine.analyze("Thai National ID 1234567890121", {language:"th"});
    const r = res.find(x=>x.entityType==="TH_TNIN");
    expect(r).toBeDefined();
    expect(r!.score).toBeGreaterThanOrEqual(0.85);
  });
  it("entities filter", () => {
    const engine = new AnalyzerEngine();
    const res = engine.analyze("test@example.com 4111111111111111", {language:"en", entities:["EMAIL_ADDRESS"]});
    expect(res.every(r=>r.entityType==="EMAIL_ADDRESS")).toBe(true);
  });
  it("getSupportedEntities", () => {
    const engine = new AnalyzerEngine();
    expect(engine.getSupportedEntities("en").includes("EMAIL_ADDRESS")).toBe(true);
  });
});
