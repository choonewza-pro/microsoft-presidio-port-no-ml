// @ts-nocheck
import { describe, expect, test } from "bun:test";
import { check } from "recheck";
import * as features from "../../src/features/index.ts";
import { AnalyzerEngine } from "../../src/analyzer/engine.ts";

describe("Security: ReDoS & Input Guard", () => {
  test("All 89 features and regex patterns must be safe from catastrophic backtracking", () => {
    const all = (features as any).allFeatures as Record<string, any>;
    const vulnerable: Array<{ feature: string; pattern: string; complexity: string }> = [];

    for (const [key, feat] of Object.entries(all)) {
      const regexList: RegExp[] = [];

      if (feat.REGEX instanceof RegExp) regexList.push(feat.REGEX);
      if (feat.PATTERNS && Array.isArray(feat.PATTERNS)) {
        feat.PATTERNS.forEach((p: any) => {
          if (p.regex instanceof RegExp) regexList.push(p.regex);
        });
      }
      if (typeof feat.PATTERN_SOURCE === "string" && !feat.REGEX) {
        regexList.push(new RegExp(feat.PATTERN_SOURCE));
      }

      for (const [propKey, propVal] of Object.entries(feat)) {
        if (propVal instanceof RegExp && propKey !== "REGEX") {
          regexList.push(propVal);
        }
      }

      for (const rx of regexList) {
        const result = check(rx.source, rx.flags);
        if (result.status === "vulnerable") {
          vulnerable.push({
            feature: key,
            pattern: rx.source,
            complexity: (result as any).complexity?.type || "vulnerable",
          });
        }
      }
    }

    expect(vulnerable).toEqual([]);
  });

  test("AnalyzerEngine rejects input exceeding maxTextLength by default (100,000 chars)", () => {
    const engine = new AnalyzerEngine();
    const hugeText = "a".repeat(100_001);

    expect(() => {
      engine.analyze(hugeText, { language: "en" });
    }).toThrow(/exceeds maximum allowed limit of 100000 characters/);
  });

  test("AnalyzerEngine truncates input exceeding maxTextLength when configured", () => {
    const engine = new AnalyzerEngine();
    const payload = "test@example.com " + "a".repeat(10_000);

    const results = engine.analyze(payload, {
      language: "en",
      maxTextLength: 50,
      onMaxLengthExceeded: "truncate",
    });

    expect(results.some((r) => r.entityType === "EMAIL_ADDRESS")).toBe(true);
  });

  test("AnalyzerEngine with custom defaultMaxTextLength from constructor", () => {
    const engine = new AnalyzerEngine({
      defaultMaxTextLength: 1000,
      defaultOnMaxLengthExceeded: "reject",
    });

    const payload = "a".repeat(1500);
    expect(() => {
      engine.analyze(payload, { language: "en" });
    }).toThrow(/exceeds maximum allowed limit/);
  });
});
