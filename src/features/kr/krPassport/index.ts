/** KR_PASSPORT - ported from kr_passport_recognizer.py
 * Two patterns: [MmSsRrOoDd]\d{3}[A-Za-z]\d{4} (current) and [MmSsRrOoDd]\d{8} (previous)
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="KR_PASSPORT" as const;
export const COUNTRY_CODE="kr" as const;
export const SUPPORTED_LANGUAGE="ko" as const;
export const BASE_SCORE=0.05;
export const PATTERN_SOURCE=`[MmSsRrOoDd]\\d{3}[A-Za-z]\\d{4}|[MmSsRrOoDd]\\d{8}`;
export const REGEX=new RegExp(`(?<![A-Za-z0-9])(${PATTERN_SOURCE})(?![0-9])`,"gims");
export const CONTEXT=['passport'] as const;
export function validateResult(patternText:string):boolean{
  return /^(?:[MmSsRrOoDd]\d{3}[A-Za-z]\d{4}|[MmSsRrOoDd]\d{8})$/.test(patternText);
}
export function findAll(text:string){ const re=new RegExp(REGEX.source, REGEX.flags); const res:Array<{value:string;start:number;end:number;score:number}>=[]; for(const m of text.matchAll(re)){ const value=m[0]; if(!value) continue; if(!validateResult(value)) continue; const start=m.index??0; const end=start+value.length; res.push({value,start,end,score:BASE_SCORE}); } return res.sort((a,b)=>a.start-b.start); }
export function analyze(text:string):RecognizerResult[]{ return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:ENTITY_TYPE},analysisExplanation:{recognizer:ENTITY_TYPE,patternName:ENTITY_TYPE,pattern:PATTERN_SOURCE,originalScore:BASE_SCORE,validationResult:true,textualExplanation:`Detected`}})); }
export class KrPassportRecognizer { findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);} validateResult(t:string){return validateResult(t);} }
