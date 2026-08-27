/** IBAN_CODE - generic/iban_recognizer.py:55 MOD97 + per-country format */
import { sanitizeValue, type ReplacementPair } from "../../../core/sanitize.ts";
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE="IBAN_CODE" as const;
export const BASE_SCORE=0.5;
export const PATTERN_SOURCE="(?<![A-Z0-9])([A-Z]{2}[0-9]{2}(?:[ -]?[A-Z0-9]{4}){2,6})((?:[ -]?[A-Z0-9]{4})?)((?:[ -]?[A-Z0-9]{1,3})?)(?![A-Z0-9])";
export const REGEX=new RegExp(PATTERN_SOURCE,"g");
export const CONTEXT=["iban","bank","transaction"] as const;
export const DEFAULT_REPLACEMENT_PAIRS: ReplacementPair[]=[["-",""],[" ",""]];

const LETTERS:Record<string,string>={}; "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((c,i)=>{LETTERS[c.charCodeAt(0).toString()]=String(i);});

function numberIban(iban:string):string{
  const rearranged=iban.slice(4)+iban.slice(0,4);
  return [...rearranged].map(c=>{const code=c.charCodeAt(0); if(code>=48&&code<=57) return c; if(code>=65&&code<=90) return String(code-55); if(code>=97&&code<=122) return String(code-87); return c;}).join("");
}
function generateCheckDigits(iban:string):string{
  const transformed=(iban.slice(0,2)+"00"+iban.slice(4)).toUpperCase();
  const num=numberIban(transformed);
  // mod 97 แบบ string (big int)
  let mod=0; for(const ch of num){ mod=(mod*10+parseInt(ch,10))%97; }
  return String(98-mod).padStart(2,"0");
}
export function validateResult(patternText:string, replacementPairs:ReplacementPair[]=DEFAULT_REPLACEMENT_PAIRS):boolean{
  try{
    const sanitized=sanitizeValue(patternText, replacementPairs).toUpperCase().replace(/[^A-Z0-9]/g,"");
    if(sanitized.length<15||sanitized.length>34) return false;
    const check=generateCheckDigits(sanitized);
    return check===sanitized.slice(2,4);
  }catch{return false;}
}
export function findAll(text:string, replacementPairs:ReplacementPair[]=DEFAULT_REPLACEMENT_PAIRS){
  const re=new RegExp(REGEX.source, REGEX.flags);
  const res:Array<{value:string;start:number;end:number;score:number}>= [];
  for(const m of text.matchAll(re)){
    // ลอง 3 กลุ่มย้อนกลับแบบ Python
    for(let grp=m.length-1; grp>=1; grp--){
      const g=m[grp]; if(!g) continue;
      const start=m.index??0;
      // หา end ของกลุ่มนั้น
      const end=start+text.slice(start).indexOf(g)+g.length;
      const value=text.slice(start,end);
      if(!value) continue;
      const ok=validateResult(value, replacementPairs);
      const score=ok?MAX_SCORE:MIN_SCORE;
      if(score>MIN_SCORE){ res.push({value,start,end,score}); break; }
    }
    // fallback ทั้ง match
    if(!res.some(r=>r.start===(m.index??0))){
      const value=m[0]; const start=m.index??0; const end=start+value.length;
      const ok=validateResult(value, replacementPairs);
      if(ok) res.push({value,start,end,score:MAX_SCORE});
    }
  }
  return res.sort((a,b)=>a.start-b.start);
}
export function analyze(text:string):RecognizerResult[]{
  return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:"IbanRecognizer"},analysisExplanation:{recognizer:"IbanRecognizer",patternName:"IBAN Generic",pattern:REGEX.source,originalScore:BASE_SCORE,validationResult:true,textualExplanation:"Detected by `IbanRecognizer`"}}));
}
export class IbanRecognizer{
  static ENTITY_TYPE=ENTITY_TYPE;
  validateResult(t:string){return validateResult(t);}
  findAll(t:string){return findAll(t);}
  analyze(t:string){return analyze(t);}
}
