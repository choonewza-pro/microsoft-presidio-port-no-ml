/** ZA_DRIVER_LICENSE - ported from za_driver_license_recognizer.py
 * Pattern \b\d{6,10}[A-Z0-9]{2,5}\b, validate 10-14 chars, regex match, must contain letter
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="ZA_DRIVER_LICENSE" as const;
export const COUNTRY_CODE="za" as const;
export const SUPPORTED_LANGUAGE="en" as const;
export const BASE_SCORE=0.3;
export const PATTERN_SOURCE=`\\d{6,10}[A-Z0-9]{2,5}`;
export const REGEX=new RegExp(`\\b${PATTERN_SOURCE}\\b`,"gims");
export const CONTEXT=['driver'] as const;
export function validateResult(patternText:string):boolean{
  const text=patternText.toUpperCase();
  if(text.length<10 || text.length>14) return false;
  if(!/^\d{6,10}[A-Z0-9]{2,5}$/.test(text)) return false;
  return /[A-Z]/.test(text);
}
export function findAll(text:string){ const re=new RegExp(REGEX.source, REGEX.flags); const res:Array<{value:string;start:number;end:number;score:number}>=[]; for(const m of text.matchAll(re)){ const value=m[0]; if(!value) continue; if(!validateResult(value)) continue; const start=m.index??0; const end=start+value.length; res.push({value,start,end,score:MAX_SCORE}); } return res.sort((a,b)=>a.start-b.start); }
export function analyze(text:string):RecognizerResult[]{ return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:ENTITY_TYPE},analysisExplanation:{recognizer:ENTITY_TYPE,patternName:ENTITY_TYPE,pattern:PATTERN_SOURCE,originalScore:BASE_SCORE,validationResult:true,textualExplanation:`Detected`}})); }
export class ZaDriverLicenseRecognizer { findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);} validateResult(t:string){return validateResult(t);} }
