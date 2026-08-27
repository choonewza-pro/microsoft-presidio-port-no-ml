/** PH_TIN - ported from ph_tin_recognizer.py
 * Validate weighted modulo 11: weights [9,8,7,6,5,4,3,2] for first 8 digits, remainder == check digit (9th digit)
 * Also reject all same digits, and support 9 or 12 digits (branch code)
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="PH_TIN" as const;
export const COUNTRY_CODE="ph" as const;
export const SUPPORTED_LANGUAGE="en" as const;
export const BASE_SCORE=0.05;
export const PATTERN_SOURCE=`\\d{3}-\\d{3}-\\d{3}(?:-\\d{3})?|\\d{9}|\\d{12}`;
export const REGEX=new RegExp(`\\b(?:${PATTERN_SOURCE})\\b`,"gims");
export const CONTEXT=['tin'] as const;
function sanitize(v:string):string{ return v.replace(/-/g,"").replace(/ /g,""); }
export function validateResult(patternText:string):boolean{
  const s=sanitize(patternText);
  if(!/^\d+$/.test(s)) return false;
  if(s.length!==9 && s.length!==12) return false;
  // all same digits check (strict)
  if(new Set(s).size===1) return false;
  // weighted modulo 11 on first 9 digits
  const weights=[9,8,7,6,5,4,3,2] as const;
  let total=0;
  for(let i=0;i<8;i++) total+= parseInt(s[i]!,10)*weights[i]!;
  const remainder=total%11;
  const check=parseInt(s[8]!,10);
  if(remainder===10) return false; // cannot be single digit
  return remainder===check;
}
export function findAll(text:string){ const re=new RegExp(REGEX.source, REGEX.flags); const res:Array<{value:string;start:number;end:number;score:number}>=[]; for(const m of text.matchAll(re)){ const value=m[0]; if(!value) continue; if(!validateResult(value)) continue; const start=m.index??0; const end=start+value.length; res.push({value,start,end,score:MAX_SCORE}); } return res.sort((a,b)=>a.start-b.start); }
export function analyze(text:string):RecognizerResult[]{ return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:ENTITY_TYPE},analysisExplanation:{recognizer:ENTITY_TYPE,patternName:ENTITY_TYPE,pattern:PATTERN_SOURCE,originalScore:BASE_SCORE,validationResult:true,textualExplanation:`Detected`}})); }
export class PhTinRecognizer { findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);} validateResult(t:string){return validateResult(t);} }
