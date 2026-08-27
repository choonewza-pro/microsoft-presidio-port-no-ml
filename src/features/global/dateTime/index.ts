/** DATE_TIME - generic/date_recognizer.py:17 14 patterns */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="DATE_TIME" as const;
export const CONTEXT=["date","birthday"] as const;
export const PATTERNS=[
  {name:"Datetime", source:"(?:\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])T[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z))|(?:\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])T[0-2]\\d:[0-5]\\d:[0-5]\\d([+-][0-2]\\d:[0-5]\\d|Z))|(?:\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])T[0-2]\\d:[0-5]\\d([+-][0-2]\\d:[0-5]\\d|Z))", score:0.8},
  {name:"mm/dd/yyyy", source:"([1-9]|0[1-9]|1[0-2])/([1-9]|0[1-9]|[1-2][0-9]|3[0-1])/(\\d{4}|\\d{2})", score:0.6},
  {name:"dd/mm/yyyy", source:"([1-9]|0[1-9]|[1-2][0-9]|3[0-1])/([1-9]|0[1-9]|1[0-2])/(\\d{4}|\\d{2})", score:0.6},
  {name:"yyyy/mm/dd", source:"\\d{4}/([1-9]|0[1-9]|1[0-2])/([1-9]|0[1-9]|[1-2][0-9]|3[0-1])", score:0.6},
  {name:"mm-dd-yyyy", source:"([1-9]|0[1-9]|1[0-2])-([1-9]|0[1-9]|[1-2][0-9]|3[0-1])-\\d{4}", score:0.6},
  {name:"dd-mm-yyyy", source:"([1-9]|0[1-9]|[1-2][0-9]|3[0-1])-([1-9]|0[1-9]|1[0-2])-\\d{4}", score:0.6},
  {name:"yyyy-mm-dd", source:"\\d{4}-([1-9]|0[1-9]|1[0-2])-([1-9]|0[1-9]|[1-2][0-9]|3[0-1])", score:0.6},
  {name:"dd.mm.yyyy", source:"([1-9]|0[1-9]|[1-2][0-9]|3[0-1])\\.([1-9]|0[1-9]|1[0-2])\\.(\\d{4}|\\d{2})", score:0.6},
  {name:"dd-MMM-yyyy", source:"([1-9]|0[1-9]|[1-2][0-9]|3[0-1])-(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)-(\\d{4}|\\d{2})", score:0.6},
  {name:"MMM-yyyy", source:"(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)-(\\d{4}|\\d{2})", score:0.6},
  {name:"dd-MMM", source:"([1-9]|0[1-9]|[1-2][0-9]|3[0-1])-(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)", score:0.6},
  {name:"mm/yyyy", source:"([1-9]|0[1-9]|1[0-2])/\\d{4}", score:0.2},
  {name:"mm/yy", source:"([1-9]|0[1-9]|1[0-2])/\\d{2}", score:0.1},
];
export function findAll(text:string){
  const res:Array<{value:string;start:number;end:number;score:number;pattern:string}>= [];
  for(const p of PATTERNS){
    const re=new RegExp(`\\b${p.source}\\b`,"g");
    for(const m of text.matchAll(re)){
      const value=m[0]; const start=m.index??0; const end=start+value.length;
      res.push({value,start,end,score:p.score,pattern:p.name});
    }
  }
  return res.sort((a,b)=>b.score-a.score||a.start-b.start);
}
export function analyze(text:string):RecognizerResult[]{
  return findAll(text).map(({value,start,end,score,pattern})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:"DateRecognizer"},analysisExplanation:{recognizer:"DateRecognizer",patternName:pattern,pattern:PATTERNS.find(p=>p.name===pattern)!.source,originalScore:score,validationResult:null,textualExplanation:`Detected by \`DateRecognizer\``}}));
}
export class DateRecognizer{findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);}}
