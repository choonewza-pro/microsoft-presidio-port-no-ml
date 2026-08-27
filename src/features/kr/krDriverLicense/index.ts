/** KR_DRIVER_LICENSE - ported from kr_driver_license_recognizer.py
 * Validate: sanitize 12 digits, region code in allowed set
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="KR_DRIVER_LICENSE" as const;
export const COUNTRY_CODE="kr" as const;
export const SUPPORTED_LANGUAGE="ko" as const;
export const BASE_SCORE=0.05;
export const PATTERN_SOURCE=`\\d{2}[- ]?\\d{2}[- ]?\\d{6}[- ]?\\d{2}`;
export const REGEX=new RegExp(`(?<!\\d)${PATTERN_SOURCE}(?!\\d)`,"gims");
export const CONTEXT=['driver license'] as const;
const REGION_CODES=new Set(["11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","28"]);
function sanitize(v:string):string{ return v.replace(/-/g,"").replace(/ /g,""); }
export function validateResult(patternText:string):boolean{
  const s=sanitize(patternText);
  if(s.length!==12) return false;
  if(!/^\d{12}$/.test(s)) return false;
  const region=s.slice(0,2);
  return REGION_CODES.has(region);
}
export function findAll(text:string){ const re=new RegExp(REGEX.source, REGEX.flags); const res:Array<{value:string;start:number;end:number;score:number}>=[]; for(const m of text.matchAll(re)){ const value=m[0]; if(!value) continue; if(!validateResult(value)) continue; const start=m.index??0; const end=start+value.length; res.push({value,start,end,score:MAX_SCORE}); } return res.sort((a,b)=>a.start-b.start); }
export function analyze(text:string):RecognizerResult[]{ return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:ENTITY_TYPE},analysisExplanation:{recognizer:ENTITY_TYPE,patternName:ENTITY_TYPE,pattern:PATTERN_SOURCE,originalScore:BASE_SCORE,validationResult:true,textualExplanation:`Detected`}})); }
export class KrDriverLicenseRecognizer { findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);} validateResult(t:string){return validateResult(t);} }
