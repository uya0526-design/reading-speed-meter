import { describe, test, expect } from "vitest";
import { calculateMetrics } from "./calculateMetrics";

describe("calculateMetrics", () => {
  test("認識テキストと発話時間データが空の場合は、淀み率0、純粋発話速度0を返す", () => {
    const response = { text: "", segments: [] };
    const result = calculateMetrics(response);
    expect(result).toEqual({ pureSpeakingSpeed: 0, stagnationRate: 0 });
  });
  test("認識テキストが空の場合は、淀み率0、純粋発話速度0を返す", () => {
    const response = { text: "", segments: [{ starttime: 0, endtime: 1000 }] };
    const result = calculateMetrics(response);
    expect(result).toEqual({ pureSpeakingSpeed: 0, stagnationRate: 0 });
  });
  test("発話時間データが空の場合は、淀み率0、純粋発話速度0を返す", () => {
    const response = { text: "こんにちは", segments: [] };
    const result = calculateMetrics(response);
    expect(result).toEqual({ pureSpeakingSpeed: 0, stagnationRate: 0 });
  });
  test("ゼロ幅区間（経過時間の開始と終了が一致）の場合は、淀み率0、純粋発話速度0を返す", () => {
    const response = { text: "こんにちは", segments: [{ starttime: 1000, endtime: 1000 }] };
    const result = calculateMetrics(response);
    expect(result).toEqual({ pureSpeakingSpeed: 0, stagnationRate: 0 });
  });
  test("発話1区間・無音なし・10文字・発話6秒、速度100・淀み率0", () => {
    // 10文字を6秒（6000ミリ秒）で読むと100文字/分となる
    const response = { text: "あいうえおあいうえお", segments: [{ starttime: 0, endtime: 6000 }] };
    const result = calculateMetrics(response);
    expect(result).toEqual({ pureSpeakingSpeed: 100, stagnationRate: 0 });
  });
  test("発話2区間・無音1区間・20文字・発話15秒・無音3秒、速度80・淀み率0.167", () => {
    // 20文字を15秒（15000ミリ秒）で読むと80文字/分となる
    // 18秒中、3秒無音なので淀み率は0.167となる
    const text = "あいうえおかきくけこさしすせそたちつてと";
    const segments = [
      { starttime: 0, endtime: 9000 },
      // 3秒無音
      { starttime: 12000, endtime: 18000 },
    ]
    const response = { text, segments };
    const result = calculateMetrics(response);
    expect(result).toEqual({ pureSpeakingSpeed: 80, stagnationRate: 0.167 });
  });
});

