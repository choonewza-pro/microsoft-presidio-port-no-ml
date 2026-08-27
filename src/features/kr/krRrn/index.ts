/** KR_RRN - ported from kr_rrn_recognizer.py
 * Pattern: (?<!\d)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(-?)[1-4]\d{6}(?!\d)
 * Validate: 13 digits, region 0-95, checksum mod11 weights [2,3,4,5,6,7,8,9,2,3,4,5], checksum = (11 - sum%11)%10
 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="KR_RRN" as const;
export const COUNTRY_CODE="kr" as const;
export const SUPPORTED_LANGUAGE="ko" as const;
export const BASE_SCORE=0.5;
export const PATTERN_SOURCE=`\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])(-?)[1-4]\\d{6}`;
export const REGEX=new RegExp(`\\b${PATTERN_SOURCE}\\b`,"gims");
export const CONTEXT=['Korean RRN','RRN'] as const;
function sanitize(v:string):string{ return v.replace(/-/g,"").replace(/ /g,""); }
function computeChecksum(rn:string):number{ const w=[2,3,4,5,6,7,8,9,2,3,4,5]; let s=0; for(let i=0;i<12;i++) s+= parseInt(rn[i]!,10)*w[i]!; return s; }
function validateChecksum(rrn:string):boolean{ const s=computeChecksum(rrn); const c=(11-(s%11))%10; return c===parseInt(rrn[12]!,10); }
function validateRegion(region:number):boolean{ return region>=0 && region<=95; }
export function validateResult(patternText:string):boolean{
  const sanitized=sanitize(patternText);
  if(sanitized.length!==13) return false;
  if(!/^\d{13}$/.test(sanitized)) return false;
  const regionCode=parseInt(sanitized.slice(7,9),10);
  if(!validateRegion(regionCode)) return false;
  return validateChecksum(sanitized);
}
export function findAll(text:string){ const re=new RegExp(REGEX.source, REGEX.flags); const res:Array<{value:string;start:number;end:number;score:number}>=[]; for(const m of text.matchAll(re)){ const value=m[0]; if(!value) continue; if(!validateResult(value)) continue; const start=m.index??0; const end=start+value.length; res.push({value,start,end,score:MAX_SCORE}); } return res.sort((a,b)=>a.start-b.start); }
export function analyze(text:string):RecognizerResult[]{ return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:ENTITY_TYPE},analysisExplanation:{recognizer:ENTITY_TYPE,patternName:"RRN (Medium)",pattern:PATTERN_SOURCE,originalScore:BASE_SCORE,validationResult:true,textualExplanation:`Detected`}})); }
export class KrRrnRecognizer { findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);} validateResult(t:string){return validateResult(t);} }
