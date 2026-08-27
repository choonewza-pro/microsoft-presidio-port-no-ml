/** KR_FRN - ported from kr_frn_recognizer.py
 * FRN checksum: (13 - (weightedSum %11)) %10 == last digit, weights [2,3,4,5,6,7,8,9,2,3,4,5]
 * Pattern: (?<!\d)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(-?)[5-8]\d{6}(?!\d)
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="KR_FRN" as const;
export const COUNTRY_CODE="kr" as const;
export const SUPPORTED_LANGUAGE="ko" as const;
export const BASE_SCORE=0.5;
export const PATTERN_SOURCE=`\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])(-?)[5-8]\\d{6}`;
export const REGEX=new RegExp(`\\b${PATTERN_SOURCE}\\b`,"gims");
export const CONTEXT=['frn'] as const;
function sanitize(v:string):string{ return v.replace(/-/g,"").replace(/ /g,""); }
function computeChecksum(rn:string):number{ const w=[2,3,4,5,6,7,8,9,2,3,4,5]; let s=0; for(let i=0;i<12;i++) s+= parseInt(rn[i]!,10)*w[i]!; return s; }
function validateChecksum(frn:string):boolean{ const s=computeChecksum(frn); const c=(13-(s%11))%10; return c===parseInt(frn[12]!,10); }
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
export function analyze(text:string):RecognizerResult[]{ return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:ENTITY_TYPE},analysisExplanation:{recognizer:ENTITY_TYPE,patternName:ENTITY_TYPE,pattern:PATTERN_SOURCE,originalScore:BASE_SCORE,validationResult:true,textualExplanation:`Detected`}})); }
export class KrFrnRecognizer { findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);} validateResult(t:string){return validateResult(t);} }
