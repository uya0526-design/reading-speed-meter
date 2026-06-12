import { describe, test, expect, vi, beforeEach } from "vitest";
import { pickBrowserMimeType, pickSupportedMimeType } from "./mimeType";
import { MIME_CANDIDATES } from "./constants";

describe("pickBrowserMimeType", () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
    });
    test("サポートされているMIMEタイプが存在する場合は、それを返す", () => {
        vi.stubGlobal("MediaRecorder", {
            isTypeSupported: () => true,
        });
        const mimeType = pickBrowserMimeType();
        expect(mimeType).toBe(MIME_CANDIDATES[0]);
    });
    test("サポートされているMIMEタイプが存在しない場合は、nullを返す", () => {
        vi.stubGlobal("MediaRecorder", {
            isTypeSupported: () => false,
        });
        const mimeType = pickBrowserMimeType();
        expect(mimeType).toBeNull();
    });
    test("MediaRecorderが存在しない場合は、nullを返す", () => {
        vi.stubGlobal("MediaRecorder", undefined);
        const mimeType = pickBrowserMimeType();
        expect(mimeType).toBeNull();
    });
});

describe("pickSupportedMimeType", () => {
    test("サポートされているMIMEタイプが存在する場合は、それを返す", () => {
        // 必ずtrueを返す関数を渡す
        const isTypeSupported = () => true;
        const mimeType = pickSupportedMimeType(MIME_CANDIDATES, isTypeSupported);
        expect(mimeType).toBe(MIME_CANDIDATES[0]);
    });
    test("サポートされているMIMEタイプが存在しない場合は、nullを返す", () => {
        // 必ずfalseを返す関数を渡す
        const isTypeSupported = () => false;
        const mimeType = pickSupportedMimeType(MIME_CANDIDATES, isTypeSupported);
        expect(mimeType).toBeNull();
    });
    test("MIME_CANDIDATESが空の場合は、nullを返す", () => {
        const mimeType = pickSupportedMimeType([], () => true);
        expect(mimeType).toBeNull();
    });
    test("先頭のMIMEタイプがサポートされておらず、2番目がサポートされている場合は、それを返す", () => {
        // 2番目のMIMEタイプがサポートされている場合はtrueを返す関数を渡す
        const isTypeSupported = (mimeType: string) => mimeType === MIME_CANDIDATES[1];
        const mimeType = pickSupportedMimeType(MIME_CANDIDATES, isTypeSupported);
        expect(mimeType).toBe(MIME_CANDIDATES[1]);
    });
});
