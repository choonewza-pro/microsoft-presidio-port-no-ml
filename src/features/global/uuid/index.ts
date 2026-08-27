/** UUID - generic/uuid_recognizer.py:22 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE = "UUID" as const;
export const BASE_SCORE = 0.5;
export const PATTERN_SOURCE = "[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const CONTEXT = ["uuid","guid","unique identifier"] as const;
export const NIL_UUID = "00000000-0000-0000-0000-000000000000";
const VALID_VERSIONS = new Set(["1","2","3","4","5","6","7","8"]);
const VALID_VARIANT = new Set(["8","9","a","b"]);
export function invalidateResult(t: string): boolean {
  if (t.toLowerCase()===NIL_UUID) return true;
  const g=t.split("-"); if(g.length!==5) return true;
  if(!VALID_VERSIONS.has(g[2]![0]!.toLowerCase())) return true;
  if(!VALID_VARIANT.has(g[3]![0]!.toLowerCase())) return true;
  return false;
}
export function findAll(text:string){
  const re=new RegExp(REGEX.source,REGEX.flags);
  const res:Array<{value:string;start:number;end:number;score:number}>= [];
  for(const m of text.matchAll(re)){
    const value=m[0]; const start=m.index??0; const end=start+value.length;
    if(invalidateResult(value)) continue;
    res.push({value,start,end,score:MAX_SCORE});
  }
  return res;
}
export function analyze(text:string):RecognizerResult[]{
  return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:"UuidRecognizer"},analysisExplanation:{recognizer:"UuidRecognizer",patternName:"UUID (hyphenated)",pattern:REGEX.source,originalScore:BASE_SCORE,validationResult:null,textualExplanation:"Detected by `UuidRecognizer`"}}));
}
export class UuidRecognizer{findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);}}
