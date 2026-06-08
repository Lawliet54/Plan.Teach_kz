import type { AdaptiveDifficulty } from "@/lib/adaptive-engine/types";
export const LEVELS: AdaptiveDifficulty[] = ["basic","intermediate","advanced"];
export const difficultyCoefficient: Record<AdaptiveDifficulty,number> = { basic:.8, intermediate:1, advanced:1.2 };
export const baseIncrease: Record<AdaptiveDifficulty,number> = { basic:6, intermediate:8, advanced:10 };
export const baseDecrease: Record<AdaptiveDifficulty,number> = { basic:8, intermediate:7, advanced:5 };
export const advanceThreshold=90;
export const passThreshold=70;
