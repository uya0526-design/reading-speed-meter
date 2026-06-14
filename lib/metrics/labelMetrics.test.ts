import { describe, test, expect } from "vitest";
import { labelMetrics } from "./labelMetrics";

describe("labelMetrics", () => {
    test("速度100・淀み率0、速度評価「遅い」、淀み率評価「少ない」", () => {
        const metrics = { pureSpeakingSpeed: 100, stagnationRate: 0 };
        const result = labelMetrics(metrics);
        expect(result).toEqual({
            pureSpeakingSpeed: 100,
            pureSpeakingSpeedEvaluation: "遅い",
            stagnationRate: 0,
            stagnationRateEvaluation: "少ない",
        });
    });
    test("速度80・淀み率0.167、速度評価「遅い」、淀み率評価「やや多い」", () => {
        const metrics = { pureSpeakingSpeed: 80, stagnationRate: 0.167 };
        const result = labelMetrics(metrics);
        expect(result).toEqual({
            pureSpeakingSpeed: 80,
            pureSpeakingSpeedEvaluation: "遅い",
            stagnationRate: 16.7,
            stagnationRateEvaluation: "やや多い",
        });
    });
    test("最大超過確認、速度1000・淀み率2、速度評価「速い」、淀み率評価「多い」", () => {
        const metrics = { pureSpeakingSpeed: 1000, stagnationRate: 2 };
        const result = labelMetrics(metrics);
        expect(result).toEqual({
            pureSpeakingSpeed: 1000,
            pureSpeakingSpeedEvaluation: "速い",
            stagnationRate: 200,
            stagnationRateEvaluation: "多い",
        });
    });
    test("最小超過確認、速度-100・淀み率-1、速度評価「遅い」、淀み率評価「少ない」", () => {
        const metrics = { pureSpeakingSpeed: -100, stagnationRate: -1 };
        const result = labelMetrics(metrics);
        expect(result).toEqual({
            pureSpeakingSpeed: -100,
            pureSpeakingSpeedEvaluation: "遅い",
            stagnationRate: -100,
            stagnationRateEvaluation: "少ない",
        });
    });
    test("境界値確認、速度0・淀み率0、速度評価「遅い」、淀み率評価「少ない」", () => {
        const metrics = { pureSpeakingSpeed: 0, stagnationRate: 0 };
        const result = labelMetrics(metrics);
        expect(result).toEqual({
            pureSpeakingSpeed: 0,
            pureSpeakingSpeedEvaluation: "遅い",
            stagnationRate: 0,
            stagnationRateEvaluation: "少ない",
        });
    });
    test("境界値確認、速度149・淀み率0.009、速度評価「遅い」、淀み率評価「少ない」", () => {
        const metrics = { pureSpeakingSpeed: 149, stagnationRate: 0.009 };
        const result = labelMetrics(metrics);
        expect(result).toEqual({
            pureSpeakingSpeed: 149,
            pureSpeakingSpeedEvaluation: "遅い",
            stagnationRate: 0.9,
            stagnationRateEvaluation: "少ない",
        });
    });
    test("境界値確認、速度150・淀み率0.01、速度評価「やや遅い」、淀み率評価「やや少ない」", () => {
        const metrics = { pureSpeakingSpeed: 150, stagnationRate: 0.01 };
        const result = labelMetrics(metrics);
        expect(result).toEqual({
            pureSpeakingSpeed: 150,
            pureSpeakingSpeedEvaluation: "やや遅い",
            stagnationRate: 1,
            stagnationRateEvaluation: "やや少ない",
        });
    });
    test("境界値確認、速度199・淀み率0.059、速度評価「やや遅い」、淀み率評価「やや少ない」", () => {
        const metrics = { pureSpeakingSpeed: 199, stagnationRate: 0.059 };
        const result = labelMetrics(metrics);
        expect(result).toEqual({
            pureSpeakingSpeed: 199,
            pureSpeakingSpeedEvaluation: "やや遅い",
            stagnationRate: 5.9,
            stagnationRateEvaluation: "やや少ない",
        });
    });
    test("境界値確認、速度200・淀み率0.06、速度評価「標準」、淀み率評価「普通」", () => {
        const metrics = { pureSpeakingSpeed: 200, stagnationRate: 0.06 };
        const result = labelMetrics(metrics);
        expect(result).toEqual({
            pureSpeakingSpeed: 200,
            pureSpeakingSpeedEvaluation: "標準",
            stagnationRate: 6,
            stagnationRateEvaluation: "普通",
        });
    });
    test("境界値確認、速度299・淀み率0.099、速度評価「標準」、淀み率評価「普通」", () => {
        const metrics = { pureSpeakingSpeed: 299, stagnationRate: 0.099 };
        const result = labelMetrics(metrics);
        expect(result).toEqual({
            pureSpeakingSpeed: 299,
            pureSpeakingSpeedEvaluation: "標準",
            stagnationRate: 9.9,
            stagnationRateEvaluation: "普通",
        });
    });
    test("境界値確認、速度300・淀み率0.101、速度評価「やや速い」、淀み率評価「やや多い」", () => {
        const metrics = { pureSpeakingSpeed: 300, stagnationRate: 0.101 };
        const result = labelMetrics(metrics);
        expect(result).toEqual({
            pureSpeakingSpeed: 300,
            pureSpeakingSpeedEvaluation: "やや速い",
            stagnationRate: 10.1,
            stagnationRateEvaluation: "やや多い",
        });
    });
    test("境界値確認、速度350・淀み率0.199、速度評価「やや速い」、淀み率評価「やや多い」", () => {
        const metrics = { pureSpeakingSpeed: 350, stagnationRate: 0.199 };
        const result = labelMetrics(metrics);
        expect(result).toEqual({
            pureSpeakingSpeed: 350,
            pureSpeakingSpeedEvaluation: "やや速い",
            stagnationRate: 19.9,
            stagnationRateEvaluation: "やや多い",
        });
    });
    test("境界値確認、速度351・淀み率0.201、速度評価「速い」、淀み率評価「多い」", () => {
        const metrics = { pureSpeakingSpeed: 351, stagnationRate: 0.201 };
        const result = labelMetrics(metrics);
        expect(result).toEqual({
            pureSpeakingSpeed: 351,
            pureSpeakingSpeedEvaluation: "速い",
            stagnationRate: 20.1,
            stagnationRateEvaluation: "多い",
        });
    });
});
