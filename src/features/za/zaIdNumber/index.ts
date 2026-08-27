/** ZA_ID_NUMBER - ported from za_id_number_recognizer.py
 * Pattern: \b\d{10}[0-2][89]\d\b
 * Validate: 13 digits, birth date pivot, citizenship 0-2, race 8/9, Luhn
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="ZA_ID_NUMBER" as const;
export const COUNTRY_CODE="za" as const;
export const SUPPORTED_LANGUAGE="en" as const;
export const BASE_SCORE=0.2;
export const PATTERN_SOURCE=`\\d{10}[0-2][89]\\d`;
export const REGEX=new RegExp(`\\b${PATTERN_SOURCE}\\b`,"gims");
export const CONTEXT=['id number'] as const;
function hasValidBirthDate(datePart:string):boolean{
  const month=parseInt(datePart.slice(2,4),10);
  const day=parseInt(datePart.slice(4,6),10);
  const yearSuffix=parseInt(datePart.slice(0,2),10);
  const today=new Date();
  const pivot=today.getFullYear()%100;
  const century= yearSuffix>pivot?1900:2000;
  const year=century+yearSuffix;
  const d=new Date(year,month-1,day);
  if(d.getFullYear()!==year || d.getMonth()!==month-1 || d.getDate()!==day) return false;
  if(d>today) return false;
  return month>=1 && month<=12 && day>=1 && day<=31;
}
function isLuhnValid(value:string):boolean{
  const digits=value.split("").map(d=>parseInt(d,10));
  let checksum=0;
  const parity=digits.length%2;
  for(let i=0;i<digits.length;i++){
    let digit=digits[i]!;
    if(i%2===parity){
      digit*=2;
      if(digit>9) digit-=9;
    }
    checksum+=digit;
  }
  return checksum%10===0;
}
export function validateResult(patternText:string):boolean{
  if(patternText.length!==13 || !/^\d{13}$/.test(patternText)) return false;
  if(!hasValidBirthDate(patternText.slice(0,6))) return false;
  if(!["0","1","2"].includes(patternText[10]!)) return false;
  if(!["8","9"].includes(patternText[11]!)) return false;
  return isLuhnValid(patternText);
}
export function findAll(text:string){ const re=new RegExp(REGEX.source, REGEX.flags); const res:Array<{value:string;start:number;end:number;score:number}>=[]; for(const m of text.matchAll(re)){ const value=m[0]; if(!value) continue; if(!validateResult(value)) continue; const start=m.index??0; const end=start+value.length; res.push({value,start,end,score:MAX_SCORE}); } return res.sort((a,b)=>a.start-b.start); }
export function analyze(text:string):RecognizerResult[]{ return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:ENTITY_TYPE},analysisExplanation:{recognizer:ENTITY_TYPE,patternName:"South African ID Number",pattern:PATTERN_SOURCE,originalScore:BASE_SCORE,validationResult:true,textualExplanation:`Detected`}})); }
export class ZaIdNumberRecognizer { findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);} validateResult(t:string){return validateResult(t);} }
