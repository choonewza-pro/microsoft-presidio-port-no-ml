/** PH_PASSPORT - ported from ph_passport_recognizer.py
 * Patterns: [A-Z]\d{7}[A-Z] or [A-Z]{2}\d{7}
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="PH_PASSPORT" as const;
export const COUNTRY_CODE="ph" as const;
export const SUPPORTED_LANGUAGE="en" as const;
export const BASE_SCORE=0.1;
export const PATTERN_SOURCE=`(?:[A-Z]\\d{7}[A-Z]|[A-Z]{2}\\d{7})`;
export const REGEX=new RegExp(`\\b${PATTERN_SOURCE}\\b`,"gims");
export const CONTEXT=['passport'] as const;
export function validateResult(patternText:string):boolean{
  return /^(?:[A-Z]\d{7}[A-Z]|[A-Z]{2}\d{7})$/i.test(patternText);
}
export function findAll(text:string){ const re=new RegExp(REGEX.source, REGEX.flags); const res:Array<{value:string;start:number;end:number;score:number}>=[]; for(const m of text.matchAll(re)){ const value=m[0]; if(!value) continue; if(!validateResult(value)) continue; const start=m.index??0; const end=start+value.length; res.push({value,start,end,score:MAX_SCORE}); } return res.sort((a,b)=>a.start-b.start); }
export function analyze(text:string):RecognizerResult[]{ return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:ENTITY_TYPE},analysisExplanation:{recognizer:ENTITY_TYPE,patternName:ENTITY_TYPE,pattern:PATTERN_SOURCE,originalScore:BASE_SCORE,validationResult:true,textualExplanation:`Detected`}})); }
export class PhPassportRecognizer { findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);} validateResult(t:string){return validateResult(t);} }
