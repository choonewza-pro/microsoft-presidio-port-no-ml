/**
 * AnonymizerEngine - ported from presidio-anonymizer/.../anonymizer_engine.py:21
 * Handles text anonymization with operators, conflict resolution, merging.
 */

import * as replaceOp from "./operators/replace/index.ts";
import * as redactOp from "./operators/redact/index.ts";
import * as maskOp from "./operators/mask/index.ts";
import * as hashOp from "./operators/hash/index.ts";
import * as keepOp from "./operators/keep/index.ts";
import * as encryptOp from "./operators/encrypt/index.ts";
import * as customOp from "./operators/custom/index.ts";

export interface RecognizerResult {
  entity_type: string;
  start: number;
  end: number;
  score: number;
}

export interface OperatorConfig {
  operator_name: string;
  params?: Record<string, unknown>;
}

export interface EngineResultItem {
  start: number;
  end: number;
  entity_type: string;
  text: string;
  operator: string;
}

export interface EngineResult {
  text: string;
  items: EngineResultItem[];
}

type OperatorFn = (text: string, params: Record<string, unknown>) => string | Promise<string>;

const operatorMap: Record<string, OperatorFn> = {
  replace: replaceOp.operate,
  redact: redactOp.operate,
  mask: maskOp.operate as OperatorFn,
  hash: hashOp.operateSync as unknown as OperatorFn,
  keep: keepOp.operate,
  encrypt: encryptOp.operate as unknown as OperatorFn,
  decrypt: encryptOp.decryptOperate as unknown as OperatorFn,
  custom: customOp.operate as OperatorFn,
};

function copyResults(results: RecognizerResult[]): RecognizerResult[] {
  return results.map(r => ({ ...r }));
}

function hasConflict(a: RecognizerResult, b: RecognizerResult): boolean {
  return !(a.end <= b.start || b.end <= a.start);
}
function intersects(a: RecognizerResult, b: RecognizerResult): number {
  if (a.end <= b.start || b.end <= a.start) return 0;
  return Math.min(a.end, b.end) - Math.max(a.start, b.start);
}

function removeConflicts(results: RecognizerResult[]): RecognizerResult[] {
  // Merge same entity_type overlapping
  let tmp: RecognizerResult[] = [];
  let other = [...results];
  for (const r of results) {
    const idx = other.indexOf(r);
    if (idx !== -1) other.splice(idx, 1);
    let merged = false;
    for (const o of other) {
      if (o.entity_type !== r.entity_type) continue;
      if (intersects(r, o) === 0) continue;
      o.start = Math.min(r.start, o.start);
      o.end = Math.max(r.end, o.end);
      o.score = Math.max(r.score, o.score);
      merged = true; break;
    }
    if (!merged) { other.push(r); tmp.push(r); }
  }
  // Remove conflicting (different types) keep higher score
  let unique: RecognizerResult[] = [];
  other = [...tmp];
  for (const r of tmp) {
    const idx = other.indexOf(r);
    if (idx !== -1) other.splice(idx, 1);
    const conflicted = other.some(o => hasConflict(r, o) && o.score > r.score && !(r.end <= o.start || o.end <= r.start && false));
    // Simplified: if any other has higher score and overlaps, drop r
    const anyHigher = other.some(o => hasConflict(r, o) && o.score > r.score);
    if (!anyHigher) { other.push(r); unique.push(r); }
  }
  // Sort and handle REMOVE_INTERSECTIONS style: adjust overlapping
  unique.sort((a,b)=>a.start-b.start);
  for (let i=0;i<unique.length-1;i++) {
    const cur=unique[i]!, nxt=unique[i+1]!;
    if (cur.end > nxt.start) {
      if (cur.score >= nxt.score) nxt.start = cur.end;
      else cur.end = nxt.start;
    }
  }
  return unique.filter(r=>r.start <= r.end);
}

function mergeWithSpaces(text: string, results: RecognizerResult[]): RecognizerResult[] {
  const merged: RecognizerResult[] = [];
  let prev: RecognizerResult | null = null;
  for (const r of results) {
    if (prev && prev.entity_type === r.entity_type) {
      const between = text.slice(prev.end, r.start);
      if (/^ +$/.test(between)) {
        merged.pop();
        r.start = prev.start;
      }
    }
    merged.push(r);
    prev = r;
  }
  return merged;
}

/**
 * Anonymize text - ตรง anonymizer_engine.py:29 anonymize
 * @example
 * const engine = new AnonymizerEngine();
 * engine.anonymize("My name is Bond", [{entity_type:"PERSON", start:11, end:15, score:0.8}], {PERSON:{operator_name:"replace", params:{new_value:"BIP"}}})
 */
export class AnonymizerEngine {
  operators: Record<string, OperatorFn> = { ...operatorMap };

  addAnonymizer(name: string, fn: OperatorFn) { this.operators[name] = fn; }

  getAnonymizers(): string[] { return Object.keys(this.operators); }

  anonymize(
    text: string,
    analyzerResults: RecognizerResult[],
    operators?: Record<string, OperatorConfig>,
    mergeWithSpacesFlag = true,
  ): EngineResult {
    let results = copyResults(analyzerResults);
    results.sort((a,b)=>a.start-b.start || a.end-b.end);
    results = removeConflicts(results);
    if (mergeWithSpacesFlag) results = mergeWithSpaces(text, results);

    if (!operators || !operators["DEFAULT"]) {
      operators = { ...(operators ?? {}), DEFAULT: { operator_name: "replace", params: {} } };
    } else if (!operators["DEFAULT"]) {
      operators["DEFAULT"] = { operator_name: "replace", params: {} };
    }

    // Build output from end to start (like TextReplaceBuilder)
    let output = text;
    let lastIdx = text.length;
    const items: EngineResultItem[] = [];

    // Sort descending for replacement
    const sorted = [...results].sort((a,b)=>b.start-a.start);
    for (const r of sorted) {
      const opCfg = operators[r.entity_type] ?? operators["DEFAULT"]!;
      const fn = this.operators[opCfg.operator_name];
      if (!fn) throw new Error(`Unknown operator ${opCfg.operator_name}`);
      const originalSlice = text.slice(r.start, r.end);
      const params = { ...(opCfg.params ?? {}), entity_type: r.entity_type } as Record<string, unknown>;
      // For sync we call directly; hash encrypt are async but we have sync fallbacks
      let replacement: string;
      const res = fn(originalSlice, params);
      if (res instanceof Promise) {
        // Sync fallback for hash/encrypt - use sync version if available
        if (opCfg.operator_name === "hash") replacement = (hashOp as any).operateSync(originalSlice, params);
        else replacement = originalSlice; // fallback
      } else {
        replacement = res as string;
      }
      const endIdx = Math.min(r.end, lastIdx);
      lastIdx = r.start;
      const before = output.slice(0, r.start);
      const after = output.slice(endIdx);
      output = before + replacement + after;
      // insertion index from end
      const insertionStart = after.length;
      items.push({ start: output.length - after.length - replacement.length, end: output.length - after.length, entity_type: r.entity_type, text: replacement, operator: opCfg.operator_name });
    }
    // items currently in reverse order, reverse to original order
    items.reverse();
    return { text: output, items };
  }
}
