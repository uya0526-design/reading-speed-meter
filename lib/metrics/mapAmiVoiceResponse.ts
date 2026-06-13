import { AmiVoiceResponse, AmiVoiceSegment } from "./types";

/**
 * AmiVoiceの生レスポンスをAmiVoiceResponse型に変換する
 * @param rawResponse AmiVoiceの生レスポンス
 * @returns AmiVoiceのレスポンス（認識テキストと発話時間データ）
 */
export function mapAmiVoiceResponse(rawResponse: unknown): AmiVoiceResponse {
    if (typeof rawResponse !== "object" || rawResponse === null) {
        throw new Error("Invalid response");
    }
    // JSON.parseを使用してAmiVoiceResponse型に変換する
    // トップレベルに"text"がある
    // segments.starttimeはresult[0].tokens[i].starttimeが相当する
    // segments.endtimeはresult[0].tokens[i].endtimeが相当する
    const { text, results } = rawResponse as {
        text: string;
        results: { tokens: AmiVoiceSegment[] }[]
    };
    const segments = results[0]?.tokens.map((token) => ({
        starttime: token.starttime ?? 0,
        endtime: token.endtime ?? 0,
    })) ?? [];
    return { text, segments };
}
