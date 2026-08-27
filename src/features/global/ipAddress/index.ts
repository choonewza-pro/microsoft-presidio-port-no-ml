/** IP_ADDRESS - generic/ip_recognizer.py:18 5 patterns + invalidate via ipaddress */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="IP_ADDRESS" as const;
export const CONTEXT=["ip","ipv4","ipv6"] as const;
export const PATTERNS=[
  {name:"IPv4_mapped", source:"::(?:ffff(?::0{1,4})?:)?(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:/(?:12[0-8]|1[01]\\d|[1-9]?\\d))?", score:0.6, prefix:"(?<![\\w:])", suffix:"\\b"},
  {name:"IPv4", source:"(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:/(?:[0-2]?\\d|3[0-2]))?", score:0.6, prefix:"\\b", suffix:"\\b"},
  {name:"IPv6", source:"(?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,7}:|:(?::[0-9A-Fa-f]{1,4}){1,7})", score:0.6, prefix:"(?<![\\w:])", suffix:"(?![\\w:]|\\.\\d)"},
  {name:"IPv6_unspecified", source:"::(?:/(?:12[0-8]|1[01]\\d|[1-9]?\\d))?", score:0.1, prefix:"(?<![\\w:])", suffix:"(?![\\w:])"},
];
function isValidIp(s:string):boolean{
  // ใช้ heuristic แทน ipaddress lib: IPv4 0-255, IPv6 มี ::
  if(s.includes(".")){
    const ip=s.split("/")[0]!;
    const parts=ip.replace(/^::ffff:/,"").split(".");
    if(parts.length!==4) return false;
    return parts.every(p=>{const n=parseInt(p,10); return n>=0&&n<=255&&String(n)===p;});
  }
  if(s.includes(":")){
    // ง่าย: ถ้ามี : และไม่มีส่วนเกิน ถือว่า valid ถ้าไม่ใช่ ::
    if(s==="::") return true;
    return /^[0-9A-Fa-f:]+$/.test(s.split("/")[0]!);
  }
  return false;
}
export function findAll(text:string){
  const res:Array<{value:string;start:number;end:number;score:number}>= [];
  for(const p of PATTERNS){
    const re=new RegExp(`${p.prefix}${p.source}${p.suffix}`,"g");
    for(const m of text.matchAll(re)){
      const value=m[0]; const start=m.index??0; const end=start+value.length;
      if(!isValidIp(value)) continue;
      res.push({value,start,end,score:p.score});
    }
  }
  return res.sort((a,b)=>b.score-a.score||a.start-b.start);
}
export function analyze(text:string):RecognizerResult[]{
  return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:"IpRecognizer"},analysisExplanation:{recognizer:"IpRecognizer",patternName:"IP",pattern:"",originalScore:score,validationResult:null,textualExplanation:"Detected by `IpRecognizer`"}}));
}
export class IpRecognizer{findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);}}
