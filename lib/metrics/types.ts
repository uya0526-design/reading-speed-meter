/**
 * AmiVoiceの発話時間データ（segments）の型
 * 1発話区間の開始時間と終了時間
 **/
export interface AmiVoiceSegment {
  starttime: number;
  endtime: number;
}
/**
 * AmiVoiceのレスポンスの型
 * 認識テキストと発話時間データ（segments）
 **/
export interface AmiVoiceResponse {
  text: string;
  segments: AmiVoiceSegment[];
}
/**
 * 音読速度計測の指標の型
 * 純粋発話速度と淀み率
 **/
export interface ReadingMetrics {
  pureSpeakingSpeed: number;
  stagnationRate: number;
}
/**
 * UI表示用の型
 */
export interface UiData {
  id: string;
  label: string;
  note: string;
  response: AmiVoiceResponse;
}
/**
 * 計測フェーズ
 * - Idle: 待機中・再計測前
 * - Analyzing: 計測中
 * - Analyzed: 計測完了
 * - Error: 計測エラー（APIエラーなど）
 */
export enum AnalysisPhase {
  Idle,
  Analyzing,
  Analyzed,
  Error,
}
