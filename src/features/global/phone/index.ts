/** PHONE_NUMBER - generic/phone_recognizer.py:15 ใช้ libphonenumber-js แบบแม่น */
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="PHONE_NUMBER" as const;
export const BASE_SCORE=0.4;
export const CONTEXT=["phone","number","telephone","cell","cellphone","mobile","call"] as const;
export const DEFAULT_REGIONS=["US","GB","DE","FR","IL","IN","CA","BR"] as const;

/** Simple phone pattern fallback ถ้าไม่ติดตั้ง libphonenumber-js */
const PHONE_REGEX=/\+?[0-9][0-9\s\-().]{6,}[0-9]/g;

let _libphonenumber: any = null;
async function getLib(){
  if(_libphonenumber) return _libphonenumber;
  try{
    // @ts-ignore
    _libphonenumber = await import("libphonenumber-js");
    return _libphonenumber;
  }catch{ return null; }
}

export function findAllSync(text:string):Array<{value:string;start:number;end:number;score:number}>{
  const res:Array<{value:string;start:number;end:number;score:number}>=[];
  for(const m of text.matchAll(PHONE_REGEX)){
    const value=m[0]; const start=m.index??0; const end=start+value.length;
    const digits=value.replace(/\D/g,"");
    if(digits.length<7 || digits.length>15) continue;
    res.push({value,start,end,score:BASE_SCORE});
  }
  return res;
}

export async function findAllAsync(text:string){
  const lib=await getLib();
  if(!lib) return findAllSync(text);
  const res:Array<{value:string;start:number;end:number;score:number}>=[];
  for(const region of DEFAULT_REGIONS){
    try{
      const finder=(lib as any).findPhoneNumbersInText;
      if(typeof finder==="function"){
        for(const m of finder(text, region)){
          res.push({value:m.number? String(m.number.number) : m.startsAt? text.slice(m.startsAt,m.endsAt): String(m.number), start:(m as any).startsAt ?? 0, end:(m as any).endsAt ?? 0, score:BASE_SCORE});
        }
      }
    }catch{}
  }
  if(res.length===0) return findAllSync(text);
  const seen=new Set<string>(); const out:typeof res=[]; for(const r of res){const k=`${r.start}-${r.end}`; if(!seen.has(k)){seen.add(k); out.push(r);}}
  return out.sort((a,b)=>a.start-b.start);
}
export function findAll(text:string){ return findAllSync(text); }

export function analyzeSync(text:string):RecognizerResult[]{
  return findAllSync(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:"PhoneRecognizer"},analysisExplanation:{recognizer:"PhoneRecognizer",patternName:"Phone",pattern:PHONE_REGEX.source,originalScore:BASE_SCORE,validationResult:null,textualExplanation:"Recognized as phone number using PhoneRecognizer"}}));
}

// Sync aliases for test compatibility (findAll/analyze as sync)
export function analyze(text: string): RecognizerResult[] { return analyzeSync(text); }

export class PhoneRecognizer{
  findAllSync(t:string){return findAllSync(t);}
  analyzeSync(t:string){return analyzeSync(t);}
  findAll(t:string){ return findAllSync(t); }
  analyze(t:string){ return analyzeSync(t); }
  async findAllAsync(t:string){return findAll(t);}
}
