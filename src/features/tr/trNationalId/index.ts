/** TR_NATIONAL_ID - ported from tr_national_id_recognizer.py
 * NVI checksum: odd_sum*7 - even_sum %10 == digit10, sum first10 %10 == digit11
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="TR_NATIONAL_ID" as const;
export const COUNTRY_CODE="tr" as const;
export const SUPPORTED_LANGUAGE="tr" as const;
export const BASE_SCORE=0.3;
export const PATTERN_SOURCE=`[1-9][0-9]{10}`;
export const REGEX=new RegExp(`\\b${PATTERN_SOURCE}\\b`,"gims");
export const CONTEXT=['national id'] as const;
export function validateResult(patternText:string):boolean{
  const s=patternText.replace(/-/g,"").replace(/ /g,"");
  if(s.length!==11 || !/^\d{11}$/.test(s)) return false;
  if(s[0]==="0") return false;
  const d=s.split("").map(c=>parseInt(c,10));
  let odd=0, even=0;
  for(let i=0;i<9;i+=2) odd+=d[i]!;
  for(let i=1;i<8;i+=2) even+=d[i]!;
  const tenth=(odd*7 - even)%10;
  const tenthPos=((tenth%10)+10)%10;
  if(tenthPos!==d[9]) return false;
  const eleventh=d.slice(0,10).reduce((a,b)=>a+b,0)%10;
  if(eleventh!==d[10]) return false;
  return true;
}
export function findAll(text:string){ const re=new RegExp(REGEX.source, REGEX.flags); const res:Array<{value:string;start:number;end:number;score:number}>=[]; for(const m of text.matchAll(re)){ const value=m[0]; if(!value) continue; if(!validateResult(value)) continue; const start=m.index??0; const end=start+value.length; res.push({value,start,end,score:MAX_SCORE}); } return res.sort((a,b)=>a.start-b.start); }
export function analyze(text:string):RecognizerResult[]{ return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:ENTITY_TYPE},analysisExplanation:{recognizer:ENTITY_TYPE,patternName:ENTITY_TYPE,pattern:PATTERN_SOURCE,originalScore:BASE_SCORE,validationResult:true,textualExplanation:`Detected`}})); }
export class TrNationalIdRecognizer { findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);} validateResult(t:string){return validateResult(t);} }
