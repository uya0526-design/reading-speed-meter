import { AmiVoiceResponse, UiData } from "./types";

const sampleAmiVoiceResponse1: AmiVoiceResponse = {
    text: "あいうえおあいうえお",
    segments: [{ starttime: 0, endtime: 6000 }],
};
const uiData1: UiData = {
    id: "smooth",
    label: "サンプル1 ／ なめらかな音読",
    note: "10文字を6秒・無音なし",
    response: sampleAmiVoiceResponse1,
};
const sampleAmiVoiceResponse2: AmiVoiceResponse = {
    text: "あいうえおかきくけこさしすせそたちつてと",
    segments: [
      { starttime: 0, endtime: 9000 },
      // 3秒無音
      { starttime: 12000, endtime: 18000 },
    ],
};
const uiData2: UiData = {
    id: "hesitant",
    label: "サンプル2 ／ 途中で淀む音読",
    note: "20文字・発話15秒・無音3秒",
    response: sampleAmiVoiceResponse2,
};
export const MOCK_SAMPLES: UiData[] = [uiData1, uiData2];
