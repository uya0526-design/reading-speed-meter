import { describe, test, expect } from "vitest";
import { mapAmiVoiceResponse } from "./mapAmiVoiceResponse";
import amiVoiceFixture01 from "../../fixtures/test_01.json";
import amiVoiceFixture02 from "../../fixtures/test_02.json";

describe("mapAmiVoiceResponse", () => {
    test("AmiVoiceのレスポンス01をAmiVoiceResponse型に変換する", () => {
        const result = mapAmiVoiceResponse(amiVoiceFixture01);
        expect(result.text).toBe(amiVoiceFixture01.text);
        expect(result.segments).toEqual(amiVoiceFixture01.results[0].tokens.map((token) => ({
            starttime: token.starttime,
            endtime: token.endtime,
        })));
        // 短めのJSONで全量確認
        expect(result.text).toBe("一番買った");
        expect(result.segments).toHaveLength(3);
        expect(result.segments[0].starttime).toBe(1080);
        expect(result.segments[0].endtime).toBe(1480);
        expect(result.segments[1].starttime).toBe(1480);
        expect(result.segments[1].endtime).toBe(1672);
        expect(result.segments[2].starttime).toBe(1720);
        expect(result.segments[2].endtime).toBe(1800);
    });
    test("AmiVoiceのレスポンス02をAmiVoiceResponse型に変換する", () => {
        const result = mapAmiVoiceResponse(amiVoiceFixture02);
        expect(result.text).toBe(amiVoiceFixture02.text);
        expect(result.segments).toEqual(amiVoiceFixture02.results[0].tokens.map((token) => ({
            starttime: token.starttime,
            endtime: token.endtime,
        })));
        // 生JSONは一部確認のみ
        expect(result.text).toBe("一番買ったラーメン屋NPUコピー癒しをできる");
        expect(result.segments).toHaveLength(9);
        expect(result.segments[8].starttime).toBe(9550);
        expect(result.segments[8].endtime).toBe(9886);
    });
});
