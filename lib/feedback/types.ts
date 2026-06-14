/**
 * Claude Haikuに渡す整理済みの事実情報
 */
export interface FeedbackFacts {
    pureSpeakingSpeed: number;
    pureSpeakingSpeedEvaluation: string;
    stagnationRate: number;
    stagnationRateEvaluation: string;
}
/**
 * フィードバックの生成状態
 * Idle: 未生成・リセット後
 * Generating: フィードバックの生成中
 * Generated: フィードバックの生成完了
 * Error: フィードバックの取得失敗
 */
export enum FeedbackPhase {
    Idle,
    Generating,
    Generated,
    Error,
}
