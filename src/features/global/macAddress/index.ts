/** MAC_ADDRESS - generic/mac_recognizer.py:22 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE = "MAC_ADDRESS" as const;
export const BASE_SCORE = 0.6;
export const PATTERNS = [
  { name:"MAC_COLON_OR_HYPHEN", source:"[0-9A-Fa-f]{2}([:-])(?:[0-9A-Fa-f]{2}\\1){4}[0-9A-Fa-f]{2}", score:0.6 },
  { name:"MAC_CISCO_DOT", source:"[0-9A-Fa-f]{4}\\.[0-9A-Fa-f]{4}\\.[0-9A-Fa-f]{4}", score:0.6 },
];
export const CONTEXT=["mac","mac address","hardware address","physical address","ethernet"] as const;
export function invalidateResult(t:string):boolean{
  const cleaned=t.replace(/[:\-.]/g,"");
  if(!/^[0-9A-Fa-f]{12}$/.test(cleaned)) return true;
  const u=cleaned.toUpperCase();
  if(u==="FFFFFFFFFFFF"||u==="000000000000") return true;
  return false;
}
export function findAll(text:string){
  const res:Array<{value:string;start:number;end:number;score:number;pattern:string}>= [];
  for(const p of PATTERNS){
    const re=new RegExp(`\\b${p.source}\\b`,"g");
    for(const m of text.matchAll(re)){
      const value=m[0]; const start=m.index??0; const end=start+value.length;
      if(invalidateResult(value)) continue;
      res.push({value,start,end,score:MAX_SCORE,pattern:p.name});
    }
  }
  return res.sort((a,b)=>a.start-b.start);
}
export function analyze(text:string):RecognizerResult[]{
  return findAll(text).map(({value,start,end,score,pattern})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:"MacAddressRecognizer"},analysisExplanation:{recognizer:"MacAddressRecognizer",patternName:pattern,pattern:PATTERNS.find(p=>p.name===pattern)!.source,originalScore:BASE_SCORE,validationResult:null,textualExplanation:`Detected by \`MacAddressRecognizer\` using pattern \`${pattern}\``}}));
}
export class MacAddressRecognizer{findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);}}
