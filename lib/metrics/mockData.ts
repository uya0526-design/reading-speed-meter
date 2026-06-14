import { AmiVoiceResponse, UiData } from "./types";

// モックデータについて、見た目上のサンプル表示のために平家物語と方丈記に差し替えています。
const sampleAmiVoiceResponse1: AmiVoiceResponse = {
    text: "祇園精舎の鐘の声、諸行無常の響きあり。",
    segments: [{ starttime: 0, endtime: 6000 }],
};
const uiData1: UiData = {
    id: "smooth",
    label: "サンプル1 ／ 平家物語",
    note: "（伝）信濃前司行長",
    response: sampleAmiVoiceResponse1,
};
const sampleAmiVoiceResponse2: AmiVoiceResponse = {
    text: "ゆく河の流れは絶えずして、しかも、もとの水にあらず。",
    segments: [
      { starttime: 0, endtime: 9000 },
      // 3秒無音
      { starttime: 12000, endtime: 18000 },
    ],
};
const uiData2: UiData = {
    id: "hesitant",
    label: "サンプル2 ／ 方丈記",
    note: "鴨長明",
    response: sampleAmiVoiceResponse2,
};
export const MOCK_SAMPLES: UiData[] = [uiData1, uiData2];
