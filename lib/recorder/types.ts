/**
 * 録音の状態
 * - Idle: 録音待機中
 * - Recording: 録音中
 * - Done: 録音完了
 * - Error: 録音エラー
 */
export enum RecordingPhase {
    Idle,      // 録音待機中
    Recording, // 録音中
    Done,      // 録音完了
    Error,     // 録音エラー
}
