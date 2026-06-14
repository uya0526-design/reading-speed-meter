/**
 * Claude Haikuに渡す整理済みの事実情報
 */
export interface FeedbackFacts {
    pureSpeakingSpeed: number;
    pureSpeakingSpeedEvaluation: string;
    stagnationRate: number;
    stagnationRateEvaluation: string;
}
