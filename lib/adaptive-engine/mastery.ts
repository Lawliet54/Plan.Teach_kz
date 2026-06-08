import { baseDecrease,baseIncrease,difficultyCoefficient } from "@/lib/adaptive-engine/constants";
import type { AdaptiveDifficulty,MasteryUpdateInput } from "@/lib/adaptive-engine/types";
const round=(value:number)=>Math.round(value*100)/100;
export function getHintCoefficient(hintCount:number){return hintCount<=0?1:hintCount===1?.7:.5}
export function getAttemptCoefficient(attemptNumber:number){return attemptNumber<=1?1:attemptNumber===2?.85:.7}
export function calculateNewMastery(input:MasteryUpdateInput){
 const {oldMastery,isCorrect,difficulty,hintCount,attemptNumber,skillWeight}=input;
 if(isCorrect){const delta=baseIncrease[difficulty]*difficultyCoefficient[difficulty]*getHintCoefficient(hintCount)*getAttemptCoefficient(attemptNumber)*skillWeight;return Math.min(100,round(oldMastery+delta));}
 return Math.max(0,round(oldMastery-baseDecrease[difficulty]*skillWeight));
}
export function calculateConfidence(totalAttempts:number){return Math.min(1,round(totalAttempts/8))}
export function resolveDifficultyByMastery(score:number):AdaptiveDifficulty{return score<50?"basic":score<80?"intermediate":"advanced"}
export function normalizeAdaptiveDifficulty(value?:string|null):AdaptiveDifficulty { if(value==="hard"||value==="advanced")return "advanced"; if(value==="medium"||value==="intermediate")return "intermediate"; return "basic"; }
