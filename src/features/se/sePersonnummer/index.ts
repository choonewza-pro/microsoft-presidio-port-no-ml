/** SE_PERSONNUMMER - ported from se_personnummer_recognizer.py
 * Supports 6-8 digit date part, optional -/+, samordningsnummer day>=61, Luhn on last 10 digits
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="SE_PERSONNUMMER" as const;
export const COUNTRY_CODE="se" as const;
export const SUPPORTED_LANGUAGE="sv" as const;
export const BASE_SCORE=0.5;
export const PATTERN_SOURCE=`(\\d{6,8})([-+]?)\\d{4}`;
export const REGEX=new RegExp(`\\b${PATTERN_SOURCE}\\b`,"gims");
export const CONTEXT=['personnummer'] as const;
function numericPart(pnr:string):string{ return pnr.replace(/\D/g,"").slice(-10); }
function isLuhnValid(pnr:string):boolean{
  const digits=pnr.split("").map(d=>parseInt(d,10));
  const checksum=digits[digits.length-1]!;
  let sum=0;
  for(let i=digits.length-2, pos=0;i>=0;i--,pos++){
    let d=digits[i]!;
    if(pos%2===0){ d*=2; if(d>9) d-=9; }
    sum+=d;
  }
  return (sum+checksum)%10===0;
}
function hasValidDate(pnr:string):boolean{
  try{
    const month=parseInt(pnr.slice(2,4),10);
    let day=parseInt(pnr.slice(4,6),10);
    if(day>=61) day-=60;
    return month>=1 && month<=12 && day>=1 && day<=31;
  }catch{ return false; }
}
export function validateResult(patternText:string):boolean{
  const num=numericPart(patternText);
  if(num.length!==10) return false;
  if(!hasValidDate(num)) return false;
  return isLuhnValid(num);
}
export function findAll(text:string){ const re=new RegExp(REGEX.source, REGEX.flags); const res:Array<{value:string;start:number;end:number;score:number}>=[]; for(const m of text.matchAll(re)){ const value=m[0]; if(!value) continue; if(!validateResult(value)) continue; const start=m.index??0; const end=start+value.length; res.push({value,start,end,score:MAX_SCORE}); } return res.sort((a,b)=>a.start-b.start); }
export function analyze(text:string):RecognizerResult[]{ return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:ENTITY_TYPE},analysisExplanation:{recognizer:ENTITY_TYPE,patternName:ENTITY_TYPE,pattern:PATTERN_SOURCE,originalScore:BASE_SCORE,validationResult:true,textualExplanation:`Detected`}})); }
export class SePersonnummerRecognizer { findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);} validateResult(t:string){return validateResult(t);} }
