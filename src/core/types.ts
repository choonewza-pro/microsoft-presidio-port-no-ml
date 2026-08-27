import type { ReplacementPair } from "./sanitize.ts";

export type { ReplacementPair };

export interface RecognizerResult {
  entityType: string;
  start: number;
  end: number;
  score: number;
  value: string;
  recognitionMetadata?: {
    recognizerName: string;
    recognizerIdentifier?: string;
  };
  analysisExplanation?: {
    recognizer: string;
    patternName: string;
    pattern: string;
    originalScore: number;
    validationResult: boolean | null;
    textualExplanation: string;
  };
}

export interface FeatureMeta {
  entityType: string;
  countryCode: string | null;
  supportedLanguage: string;
  patternSource: string;
  context: readonly string[];
}
