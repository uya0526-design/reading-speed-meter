import { AmiVoiceResponse, ReadingMetrics } from "./types";

/**
 * AmiVoiceのレスポンスから音読速度計測の指標を算出する
 * @param response AmiVoiceのレスポンス
 * @returns 音読速度計測の指標
 */
export function calculateMetrics(response: AmiVoiceResponse): ReadingMetrics {
  const { text, segments } = response;
  // 異常系・境界値ガード（認識テキストが空か、発話時間データが空）
  if (text.length === 0 || segments.length === 0) {
    return { pureSpeakingSpeed: 0, stagnationRate: 0 };
  }
  // 純粋発話速度を算出
  // 純粋発話時間 = 各発話区間の経過時間（終了時間 - 開始時間）の合計
  const totalSpeakingTimeMs = segments.reduce((acc, segment) => acc + (segment.endtime - segment.starttime), 0);
  // 純粋発話時間が0の場合はゼロ除算を防ぐ
  if (totalSpeakingTimeMs === 0) {
    return { pureSpeakingSpeed: 0, stagnationRate: 0 };
  }
  // 純粋発話速度 = 認識テキストの文字数（コードポイント単位） ÷ 純粋発話時間（分）※ミリ秒を分に換算
  let pureSpeakingSpeed = [...text].length / (totalSpeakingTimeMs / 60000);
  // 純粋発話速度を整数にしておく
  pureSpeakingSpeed = Math.round(pureSpeakingSpeed);
  // 淀み率を算出
  // 総経過時間 = 最後の発話区間の終了時間 - 最初の発話区間の開始時間
  const totalElapsedTimeMs = segments[segments.length - 1].endtime - segments[0].starttime;
  // 総経過時間が0の場合はゼロ除算を防ぐ
  if (totalElapsedTimeMs === 0) {
    return { pureSpeakingSpeed: 0, stagnationRate: 0 };
  }
  // 淀み率 = (総経過時間 - 純粋発話時間) ÷ 総経過時間
  let stagnationRate = (totalElapsedTimeMs - totalSpeakingTimeMs) / totalElapsedTimeMs;
  // 淀み率を小数点第3位までにしておく
  stagnationRate = Math.round(stagnationRate * 1000) / 1000;
  return { pureSpeakingSpeed, stagnationRate };
}
