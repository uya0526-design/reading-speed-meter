import { ReadingMetrics } from "./types";
import { FeedbackFacts } from "@/lib/feedback/types";
import { PURE_SPEAKING_SPEED_THRESHOLDS, STAGNATION_RATE_THRESHOLDS } from "./thresholds";

/**
 * 音読速度をラベルに変換する
 * @param pureSpeakingSpeed 音読速度
 * @returns 音読速度のラベル
 */
function labelPureSpeakingSpeed(pureSpeakingSpeed: number): string {
    if (pureSpeakingSpeed <= PURE_SPEAKING_SPEED_THRESHOLDS.SLOW.max) return "遅い";
    if (pureSpeakingSpeed <= PURE_SPEAKING_SPEED_THRESHOLDS.SLIGHTLY_SLOW.max) return "やや遅い";
    if (pureSpeakingSpeed <= PURE_SPEAKING_SPEED_THRESHOLDS.STANDARD.max) return "標準";
    if (pureSpeakingSpeed <= PURE_SPEAKING_SPEED_THRESHOLDS.SLIGHTLY_FAST.max) return "やや速い";
    if (pureSpeakingSpeed <= PURE_SPEAKING_SPEED_THRESHOLDS.FAST.max) return "速い";
    // 最大超過時は「速い」とする
    return "速い";
}

/**
 * 淀み率をラベルに変換する
 * @param stagnationRate 淀み率
 * @returns 淀み率のラベル
 */
function labelStagnationRate(stagnationRate: number): string {
    if (stagnationRate <= STAGNATION_RATE_THRESHOLDS.LESS.max) return "少ない";
    if (stagnationRate <= STAGNATION_RATE_THRESHOLDS.SLIGHTLY_LESS.max) return "やや少ない";
    if (stagnationRate <= STAGNATION_RATE_THRESHOLDS.STANDARD.max) return "普通";
    if (stagnationRate <= STAGNATION_RATE_THRESHOLDS.SLIGHTLY_MUCH.max) return "やや多い";
    if (stagnationRate <= STAGNATION_RATE_THRESHOLDS.MUCH.max) return "多い";
    // 最大超過時は「多い」とする
    return "多い";
}

/**
 * 音読速度計測の指標をラベルに変換する
 * @param metrics 音読速度計測の指標
 * @returns 音読速度計測の指標のラベル
 */
export function labelMetrics(metrics: ReadingMetrics): FeedbackFacts {
    // 淀み率を0.167->16.7のように変換しておく
    const stagnationRate = Math.round(metrics.stagnationRate * 1000) / 10;
    return {
        pureSpeakingSpeed: metrics.pureSpeakingSpeed,
        pureSpeakingSpeedEvaluation: labelPureSpeakingSpeed(metrics.pureSpeakingSpeed),
        stagnationRate,
        stagnationRateEvaluation: labelStagnationRate(stagnationRate),
    };
}
