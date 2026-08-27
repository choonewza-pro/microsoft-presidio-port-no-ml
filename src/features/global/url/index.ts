/** URL - generic/url_recognizer.py:24 BASE_URL_REGEX */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="URL" as const;
export const CONTEXT=["url","website","link"] as const;
// ย่อ TLD list เหลือยอดนิยม + generic 2 ตัวอักษรเพื่อขนาดไฟล์ไม่ใหญ่เกิน
const TLDS="(?:com|org|net|edu|gov|io|co|ai|app|dev|info|me|th|uk|de|fr|jp|cn|au|ca|in|sg|nl|be|ch|se|no|dk|pl|es|it|kr|za|tr|ph|ng|fi|ac|ad|ae|af|ag|ai|al|am|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw)";
const BASE_URL_REGEX=`((www\\d{0,3}[.])?[a-z0-9.\\-]{1,253}[.]${TLDS}(?:/[^\\s()<>\\"']*)?)`;
export const PATTERNS=[
  {name:"Standard Url", source:`(?:https?://)${BASE_URL_REGEX}`, score:0.6},
  {name:"Non schema URL", source:BASE_URL_REGEX, score:0.5},
];
export function findAll(text:string){
  const res:Array<{value:string;start:number;end:number;score:number}>= [];
  for(const p of PATTERNS){
    const re=new RegExp(p.source,"gi");
    for(const m of text.matchAll(re)){
      const value=m[0]; const start=m.index??0; const end=start+value.length;
      if(value.length<4) continue;
      res.push({value,start,end,score:p.score});
    }
  }
  // deduplicate by start
  const seen=new Set<string>(); const out:typeof res=[]; for(const r of res.sort((a,b)=>a.start-b.start)){const k=`${r.start}-${r.end}`; if(!seen.has(k)){seen.add(k); out.push(r);}}
  return out.sort((a,b)=>b.score-a.score||a.start-b.start);
}
export function analyze(text:string):RecognizerResult[]{
  return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:"UrlRecognizer"},analysisExplanation:{recognizer:"UrlRecognizer",patternName:"URL",pattern:"",originalScore:score,validationResult:null,textualExplanation:"Detected by `UrlRecognizer`"}}));
}
export class UrlRecognizer{findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);}}
