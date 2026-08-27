/** NG_NIN - ported from ng_nin_recognizer.py
 * 11 digits, Verhoeff checksum
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="NG_NIN" as const;
export const COUNTRY_CODE="ng" as const;
export const SUPPORTED_LANGUAGE="en" as const;
export const BASE_SCORE=0.01;
export const PATTERN_SOURCE=`\\d{11}`;
export const REGEX=new RegExp(`\\b${PATTERN_SOURCE}\\b`,"gims");
export const CONTEXT=['nin'] as const;
const D = [
 [0,1,2,3,4,5,6,7,8,9],
 [1,2,3,4,0,6,7,8,9,5],
 [2,3,4,0,1,7,8,9,5,6],
 [3,4,0,1,2,8,9,5,6,7],
 [4,0,1,2,3,9,5,6,7,8],
 [5,9,8,7,6,0,4,3,2,1],
 [6,5,9,8,7,1,0,4,3,2],
 [7,6,5,9,8,2,1,0,4,3],
 [8,7,6,5,9,3,2,1,0,4],
 [9,8,7,6,5,4,3,2,1,0],
];
const P = [
 [0,1,2,3,4,5,6,7,8,9],
 [1,5,7,6,2,8,3,0,9,4],
 [5,8,0,3,7,9,6,1,4,2],
 [8,9,1,6,0,4,3,5,2,7],
 [9,4,5,3,1,2,6,8,7,0],
 [4,2,8,6,5,7,3,9,0,1],
 [2,7,9,3,8,0,6,4,1,5],
 [7,0,4,6,9,1,3,2,5,8],
];
const INV=[0,4,3,2,1,5,6,7,8,9];
function isVerhoeff(value:string):boolean{
  let c=0;
  const rev=value.split("").map(d=>parseInt(d,10)).reverse();
  for(let i=0;i<rev.length;i++){
    c=D[c]![P[i%8]![rev[i]!]!]!;
  }
  return INV[c]===0;
}
export function validateResult(patternText:string):boolean{
  if(patternText.length!==11) return false;
  if(!/^\d{11}$/.test(patternText)) return false;
  return isVerhoeff(patternText);
}
export function findAll(text:string){ const re=new RegExp(REGEX.source, REGEX.flags); const res:Array<{value:string;start:number;end:number;score:number}>=[]; for(const m of text.matchAll(re)){ const value=m[0]; if(!value) continue; if(!validateResult(value)) continue; const start=m.index??0; const end=start+value.length; res.push({value,start,end,score:MAX_SCORE}); } return res.sort((a,b)=>a.start-b.start); }
export function analyze(text:string):RecognizerResult[]{ return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:ENTITY_TYPE},analysisExplanation:{recognizer:ENTITY_TYPE,patternName:ENTITY_TYPE,pattern:PATTERN_SOURCE,originalScore:BASE_SCORE,validationResult:true,textualExplanation:`Detected`}})); }
export class NgNinRecognizer { findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);} validateResult(t:string){return validateResult(t);} }
