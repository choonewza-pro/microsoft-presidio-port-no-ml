/**
 * StructuredEngine - ported from presidio-structured/.../structured_engine.py:16 (simplified for JS - no pandas)
 * Supports Dict / Array<Dict> (JSON) without DataFrame dependency.
 */

import { AnonymizerEngine, type RecognizerResult, type OperatorConfig } from "../anonymizer/engine.ts";

export interface StructuredAnalysis {
  entity_mapping: Record<string, string>; // key -> entity_type, e.g. {"name":"PERSON", "address.city":"LOCATION"}
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((acc: any, part) => acc?.[part], obj);
}
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let cur: any = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]!;
    if (!(p in cur) || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]!] = value;
}

/**
 * @example
 * const engine = new StructuredEngine();
 * engine.anonymize({name:"Bond", city:"London"}, {entity_mapping:{name:"PERSON", city:"LOCATION"}}, {PERSON:{operator_name:"replace", params:{new_value:"BIP"}}})
 */
export class StructuredEngine {
  private anonymizer = new AnonymizerEngine();

  anonymize(
    data: Record<string, unknown> | Array<Record<string, unknown>>,
    structuredAnalysis: StructuredAnalysis,
    operators?: Record<string, OperatorConfig>,
  ): Record<string, unknown> | Array<Record<string, unknown>> {
    if (Array.isArray(data)) {
      return data.map(d => this.anonymizeRecord(d, structuredAnalysis, operators) as Record<string, unknown>);
    }
    return this.anonymizeRecord(data as Record<string, unknown>, structuredAnalysis, operators);
  }

  private anonymizeRecord(
    record: Record<string, unknown>,
    analysis: StructuredAnalysis,
    operators?: Record<string, OperatorConfig>,
  ): Record<string, unknown> {
    const out: Record<string, unknown> = JSON.parse(JSON.stringify(record));
    for (const [keyPath, entityType] of Object.entries(analysis.entity_mapping)) {
      const raw = getNestedValue(out, keyPath);
      if (typeof raw !== "string") continue;
      const fakeResult: RecognizerResult = { entity_type: entityType, start: 0, end: raw.length, score: 1 };
      const res = this.anonymizer.anonymize(raw, [fakeResult], operators ? { [entityType]: operators[entityType] ?? operators["DEFAULT"]! } : undefined);
      setNestedValue(out, keyPath, res.text);
    }
    return out;
  }
}

/** Helper to build StructuredAnalysis from JSON keys (like JsonAnalysisBuilder) - simplified without AnalyzerEngine */
export function buildAnalysisFromKeys(keys: string[], entityMap: Record<string, string>): StructuredAnalysis {
  const mapping: Record<string, string> = {};
  for (const k of keys) if (entityMap[k]) mapping[k] = entityMap[k]!;
  return { entity_mapping: mapping };
}
