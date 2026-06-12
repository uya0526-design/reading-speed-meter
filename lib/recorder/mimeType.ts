import { MIME_CANDIDATES } from "./constants";

/**
 * サポートされているMIMEタイプを選ぶ関数
 * @param candidates 候補のMIMEタイプ
 * @param isTypeSupported  MIMEタイプがサポートされているかどうかを判定する関数
 * @returns サポートされているMIMEタイプ
 */
export function pickSupportedMimeType(
    candidates: readonly string[],
    isTypeSupported: (mimeType: string) => boolean): string | null {
    for (const mime of candidates) {
        // MediaRecorder.isTypeSupported を使って
        // MIME タイプがサポートされているかどうかを判定
        if (isTypeSupported(mime)) {
            return mime;
        }
    }
    return null;
}

/**
 * ブラウザ用のサポートされているMIMEタイプを選ぶ関数
 * @returns サポートされているMIMEタイプ
 */
export function pickBrowserMimeType(): string | null {
    if (typeof MediaRecorder === "undefined") {
        return null;
    }
    const mimeType = pickSupportedMimeType(
        MIME_CANDIDATES, MediaRecorder.isTypeSupported.bind(MediaRecorder));
    return mimeType;
}
