/**
 * AnalyzerEngine - ported from presidio-analyzer/.../analyzer_engine.py:35 (simplified, no NlpEngine)
 * Orchestrates 89 regex recognizers, context boost, allowList, dedup, score thresholds.
 */

import * as features from "../features/index.ts";
import type { RecognizerResult } from "../core/types.ts";

export interface AnalyzeOptions {
  language?: string;
  entities?: string[];
  scoreThreshold?: number;
  allowList?: string[];
  allowListMatch?: "exact" | "regex";
  context?: string[];
  /** Maximum length of text to analyze. Default: 100,000 chars */
  maxTextLength?: number;
  /** Action when text length exceeds maxTextLength: 'reject' throws Error, 'truncate' slices text */
  onMaxLengthExceeded?: "reject" | "truncate";
}

const DEFAULT_SCORE_THRESHOLD = 0;
const DEFAULT_MAX_TEXT_LENGTH = 100_000;
const CONTEXT_WINDOW = 50; // chars

function getRecognizers(language: string, entities?: string[]) {
  const all = (features as any).allFeatures as Record<string, any>;
  let list = Object.values(all) as any[];
  // filter by language: if recognizer has SUPPORTED_LANGUAGE or COUNTRY_CODE
  // For simplicity, allow all if language is en or th
  if (entities && entities.length) {
    list = list.filter((r: any) => entities.includes(r.ENTITY_TYPE));
  } else {
    // filter by language: keep global (COUNTRY_CODE null) + matching language/country
    list = list.filter((r: any) => {
      if (!r.COUNTRY_CODE) return true;
      if (language === "th" && r.COUNTRY_CODE === "th") return true;
      if (r.SUPPORTED_LANGUAGE === language) return true;
      if (r.COUNTRY_CODE === language) return true;
      // en covers global + us/uk etc with en
      if (language === "en" && r.SUPPORTED_LANGUAGE === "en") return true;
      return false;
    });
  }
  return list;
}

function enhanceWithContext(text: string, results: RecognizerResult[], recognizers: any[], extraContext?: string[]): RecognizerResult[] {
  const lower = text.toLowerCase();
  return results.map(r => {
    const rec = recognizers.find((x: any) => x.ENTITY_TYPE === r.entityType);
    if (!rec) return r;
    const ctxWords: string[] = [...(rec.CONTEXT ?? []), ...(extraContext ?? [])];
    if (!ctxWords.length) return r;
    const windowStart = Math.max(0, r.start - CONTEXT_WINDOW);
    const windowEnd = Math.min(text.length, r.end + CONTEXT_WINDOW);
    const windowText = lower.slice(windowStart, windowEnd);
    const hasContext = ctxWords.some(w => windowText.includes(w.toLowerCase()));
    if (hasContext && r.score < 0.85) {
      return { ...r, score: Math.max(r.score, 0.85) };
    }
    return r;
  });
}

function removeDuplicates(results: RecognizerResult[]): RecognizerResult[] {
  const seen = new Set<string>();
  const filtered = results.filter(r => r.score > 0);
  // sort by score desc, start asc
  const sorted = [...filtered].sort((a,b)=> b.score - a.score || a.start - b.start);
  const out: RecognizerResult[] = [];
  for (const r of sorted) {
    const key = `${r.entityType}:${r.start}:${r.end}`;
    if (seen.has(key)) continue;
    // check contained
    let contained = false;
    for (const o of out) {
      if (r.entityType === o.entityType && r.start >= o.start && r.end <= o.end) { contained = true; break; }
    }
    if (!contained) { out.push(r); seen.add(key); }
  }
  return out.sort((a,b)=>a.start-b.start);
}

function removeAllowList(results: RecognizerResult[], text: string, allowList?: string[], match: "exact"|"regex" = "exact"): RecognizerResult[] {
  if (!allowList?.length) return results;
  if (match === "exact") {
    return results.filter(r => !allowList.includes(text.slice(r.start, r.end)));
  } else {
    const re = new RegExp(allowList.join("|"), "gims");
    return results.filter(r => !re.test(text.slice(r.start, r.end)));
  }
}

export class AnalyzerEngine {
  supportedLanguages: string[];
  defaultScoreThreshold: number;
  defaultMaxTextLength: number;
  defaultOnMaxLengthExceeded: "reject" | "truncate";

  constructor(opts: {
    supportedLanguages?: string[];
    defaultScoreThreshold?: number;
    defaultMaxTextLength?: number;
    defaultOnMaxLengthExceeded?: "reject" | "truncate";
  } = {}) {
    this.supportedLanguages = opts.supportedLanguages ?? ["en"];
    this.defaultScoreThreshold = opts.defaultScoreThreshold ?? DEFAULT_SCORE_THRESHOLD;
    this.defaultMaxTextLength = opts.defaultMaxTextLength ?? DEFAULT_MAX_TEXT_LENGTH;
    this.defaultOnMaxLengthExceeded = opts.defaultOnMaxLengthExceeded ?? "reject";
  }

  getRecognizers(language?: string) {
    return getRecognizers(language ?? this.supportedLanguages[0]!, undefined);
  }

  getSupportedEntities(language?: string): string[] {
    return getRecognizers(language ?? this.supportedLanguages[0]!).map((r:any)=>r.ENTITY_TYPE);
  }

  analyze(text: string, opts: AnalyzeOptions & { language: string }): RecognizerResult[] {
    if (!text || typeof text !== "string") {
      return [];
    }

    const maxLen = opts.maxTextLength ?? this.defaultMaxTextLength;
    const overflowAction = opts.onMaxLengthExceeded ?? this.defaultOnMaxLengthExceeded;

    if (text.length > maxLen) {
      if (overflowAction === "reject") {
        throw new Error(
          `[AnalyzerEngine] Input text length (${text.length}) exceeds maximum allowed limit of ${maxLen} characters.`
        );
      } else {
        text = text.slice(0, maxLen);
      }
    }

    const language = opts.language;
    const entities = opts.entities;
    const scoreThreshold = opts.scoreThreshold ?? this.defaultScoreThreshold;
    const allowList = opts.allowList;
    const allowListMatch = opts.allowListMatch ?? "exact";
    const context = opts.context;

    const recognizers = getRecognizers(language, entities);

    let results: RecognizerResult[] = [];
    for (const rec of recognizers) {
      const recResults: RecognizerResult[] = (rec as any).analyze ? (rec as any).analyze(text) : (rec as any).findAll ? (rec as any).findAll(text).map((x:any)=>({ entityType: rec.ENTITY_TYPE, start: x.start, end: x.end, score: x.score, value: x.value, recognitionMetadata:{recognizerName: rec.ENTITY_TYPE}})) : [];
      // Ensure recognitionMetadata
      for (const r of recResults) {
        if (!r.recognitionMetadata) r.recognitionMetadata = { recognizerName: rec.ENTITY_TYPE };
      }
      results.push(...recResults);
    }

    results = enhanceWithContext(text, results, recognizers, context);
    // filter low scores
    results = results.filter(r => r.score >= scoreThreshold);
    results = removeDuplicates(results);
    results = removeAllowList(results, text, allowList, allowListMatch as any);
    return results;
  }
}
