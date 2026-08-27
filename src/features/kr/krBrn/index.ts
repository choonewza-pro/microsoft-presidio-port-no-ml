/** KR_BRN - ported from kr_brn_recognizer.py */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="KR_BRN" as const;
export const COUNTRY_CODE="kr" as const;
export const SUPPORTED_LANGUAGE="ko" as const;
export const BASE_SCORE=0.1;
export const PATTERN_SOURCE=`\\d{3}-\\d{2}-\\d{5}`;
export const REGEX=new RegExp(`\\b(?:${PATTERN_SOURCE}|\\d{10})\\b`,"gims");
export const CONTEXT=['BRN'] as const;
function sanitize(v:string):string{ return v.replace(/-/g,"").replace(/ /g,""); }
export function validateResult(patternText:string):boolean{
  const s=sanitize(patternText);
  if(s.length!==10) return false;
  if(!/^\d{10}$/.test(s)) return false;
  const digits=s.split("").map(d=>parseInt(d,10));
  const magic=[1,3,7,1,3,7,1,3,5] as const;
  let total=0;
  for(let i=0;i<8;i++) total+= digits[i]!*magic[i]!;
  const lm=digits[8]!*magic[8]!;
  total+= Math.floor(lm/10)+lm;
  const check=(10-(total%10))%10;
  return check===digits[9];
}
export function findAll(text:string){ const re=new RegExp(REGEX.source, REGEX.flags); const res:Array<{value:string;start:number;end:number;score:number}>=[]; for(const m of text.matchAll(re)){ const value=m[0]; if(!value) continue; if(!validateResult(value)) continue; const start=m.index??0; const end=start+value.length; res.push({value,start,end,score:MAX_SCORE}); } return res.sort((a,b)=>a.start-b.start); }
export function analyze(text:string):RecognizerResult[]{ return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:ENTITY_TYPE},analysisExplanation:{recognizer:ENTITY_TYPE,patternName:ENTITY_TYPE,pattern:PATTERN_SOURCE,originalScore:BASE_SCORE,validationResult:true,textualExplanation:`Detected`}})); }
export class KrBrnRecognizer { findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);} validateResult(t:string){return validateResult(t);} }
