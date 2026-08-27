/** IN_VEHICLE_REGISTRATION - ported */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE="IN_VEHICLE_REGISTRATION" as const;
export const COUNTRY_CODE="in" as const;
export const SUPPORTED_LANGUAGE="en" as const;
export const BASE_SCORE=0.5;
export const PATTERN_SOURCE=`\\b[A-Z]{2}\\d{1,2}[A-Z]{1,3}\\d{1,4}\\b`;
export const REGEX=new RegExp(PATTERN_SOURCE,"gims");
export const CONTEXT=['vehicle'] as const;
export function findAll(text:string){ const re=new RegExp(REGEX.source, REGEX.flags); const res:Array<{value:string;start:number;end:number;score:number}>=[]; for(const m of text.matchAll(re)){ const value=m[0]; const start=m.index??0; const end=start+value.length; res.push({value,start,end,score:BASE_SCORE}); } return res; }
export function analyze(text:string):RecognizerResult[]{ return findAll(text).map(({value,start,end,score})=>({entityType:ENTITY_TYPE,start,end,score,value,recognitionMetadata:{recognizerName:ENTITY_TYPE},analysisExplanation:{recognizer:ENTITY_TYPE,patternName:ENTITY_TYPE,pattern:PATTERN_SOURCE,originalScore:BASE_SCORE,validationResult:null,textualExplanation:`Detected`}})); }
export class InVehicleRegistrationRecognizer { findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);} }
