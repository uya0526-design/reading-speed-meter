/**
 * 録音の最大時間 10秒
 */
export const MAX_RECORDING_TIME_MS = 10_000;

/**
 * 録音のMIMEタイプの候補（不変）
 */
export const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
] as const;
