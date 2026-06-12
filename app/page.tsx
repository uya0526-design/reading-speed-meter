"use client";
import { useState } from "react";
import { calculateMetrics } from "@/lib/metrics/calculateMetrics";
import { MOCK_SAMPLES } from "@/lib/metrics/mockData";
import { ReadingMetrics } from "@/lib/metrics/types";
import { useRecorder } from "@/lib/recorder/useRecorder";
import { RecordingPhase } from "@/lib/recorder/types";

export default function ReadingSpeedMeterMock() {
  const {
    recordingPhase,
    errorMessage,
    audioBlob,
    audioUrl,
    selectedMimeType,
    showAudioPlayer,
    handleRecordingStart,
    handleRecordingStop,
  } = useRecorder();
  
  const [sampleId, setSampleId] = useState<string>("smooth");
  const [metrics, setMetrics] = useState<ReadingMetrics | null>(null);

  const sample = MOCK_SAMPLES.find((s) => s.id === sampleId);
  if (!sample) {
    return <div>サンプルが見つかりません</div>;
  }
  const chars = [...sample.response.text];

  const handleMeasure = () => {
    setMetrics(calculateMetrics(sample.response));
  };

  const selectSample = (id: string) => {
    setSampleId(id);
    setMetrics(null); // サンプルを変えたら結果はリセット
  };

  const stagnationPct =
    metrics === null ? null : (metrics.stagnationRate * 100).toFixed(1);

  return (
    <div className="rsm-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@500;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap');

        .rsm-root {
          --paper: #f2ebdc;
          --paper-deep: #e8dfca;
          --ink: #2a241d;
          --ink-soft: #7a6f5d;
          --navy: #000080;
          --navy-deep: #001F3F;
          --vermillion: #be3a22;
          --vermillion-deep: #9c2c17;
          --grid: #b9c4ad;
          --rule: #d8ccb2;
          min-height: 100%;
          background-color: var(--paper);
          background-image:
            radial-gradient(circle at 18% 12%, rgba(190,58,34,0.05), transparent 42%),
            radial-gradient(circle at 85% 88%, rgba(120,111,93,0.07), transparent 45%);
          color: var(--ink);
          font-family: 'Zen Kaku Gothic New', sans-serif;
          padding: 48px 22px 60px;
          display: flex;
          justify-content: center;
        }
        .rsm-wrap { width: 100%; max-width: 600px; }

        .rsm-kicker {
          font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase;
          color: var(--ink-soft); font-weight: 700; margin-bottom: 10px;
        }
        .rsm-title {
          font-family: 'Shippori Mincho B1', serif; font-weight: 700;
          font-size: 40px; letter-spacing: 0.14em; line-height: 1.1; margin: 0;
        }
        .rsm-title .seal {
          display: inline-block; margin-left: 12px; transform: translateY(-6px);
          background: var(--vermillion); color: var(--paper);
          font-size: 12px; letter-spacing: 0.18em; font-family: 'Zen Kaku Gothic New';
          font-weight: 700; padding: 4px 7px; border-radius: 3px; vertical-align: middle;
        }
        .rsm-sub {
          margin-top: 14px; font-size: 13px; color: var(--ink-soft);
          letter-spacing: 0.04em; padding-bottom: 22px;
          border-bottom: 1px solid var(--rule);
        }

        /* セクションラベル */
        .rsm-section-label {
          font-size: 12px; letter-spacing: 0.28em; color: var(--ink-soft);
          font-weight: 700; margin: 30px 0 12px;
        }

        .rsm-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .rsm-tab {
          flex: 1; min-width: 200px; text-align: left; cursor: pointer;
          background: transparent; border: 1px solid var(--rule);
          padding: 12px 14px; border-radius: 6px; transition: all .18s ease;
          font-family: inherit; color: var(--ink-soft);
        }
        .rsm-tab:hover { border-color: var(--ink-soft); }
        .rsm-tab.active {
          border-color: var(--vermillion); background: rgba(190,58,34,0.05);
          color: var(--ink);
        }
        .rsm-tab .t-label { font-size: 13px; font-weight: 700; letter-spacing: .03em; }
        .rsm-tab .t-note { font-size: 11px; margin-top: 3px; opacity: .8; }

        /* 原稿用紙 */
        .rsm-genko {
          margin-top: 14px; background: #fbf6ec;
          border: 1px solid var(--grid);
          border-radius: 4px; padding: 16px;
          box-shadow: 0 1px 0 rgba(0,0,0,0.02), inset 0 0 0 4px #fbf6ec, inset 0 0 0 5px var(--grid);
        }
        .rsm-grid {
          display: grid; grid-template-columns: repeat(10, 1fr); gap: 0;
        }
        .rsm-cell {
          aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center;
          border: 0.5px solid var(--grid);
          font-family: 'Shippori Mincho B1', serif; font-size: clamp(15px, 4.4vw, 22px);
          color: var(--ink);
        }
        .rsm-count {
          margin-top: 10px; font-size: 11px; color: var(--ink-soft);
          letter-spacing: .1em; text-align: right;
        }

        /* 計測ボタン */
        .rsm-btn {
          margin-top: 22px; width: 100%; cursor: pointer;
          background: var(--vermillion); color: #fbf6ec;
          border: none; border-radius: 6px; padding: 16px;
          font-family: 'Shippori Mincho B1', serif; font-weight: 700;
          font-size: 18px; letter-spacing: 0.3em;
          box-shadow: 0 4px 0 var(--vermillion-deep);
          transition: transform .08s ease, box-shadow .08s ease;
        }
        .rsm-btn:hover { filter: brightness(1.04); }
        .rsm-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--vermillion-deep); }

        /* 録音ボタン */
        .rsm-recording-btn {
          margin-top: 22px; width: 100%; cursor: pointer;
          background: var(--navy); color: #fbf6ec;
          border: none; border-radius: 6px; padding: 16px;
          font-family: 'Shippori Mincho B1', serif; font-weight: 700;
          font-size: 18px; letter-spacing: 0.3em;
          box-shadow: 0 4px 0 var(--navy-deep);
          transition: transform .08s ease, box-shadow .08s ease;
        }
        .rsm-recording-btn:hover { filter: brightness(1.04); }
        .rsm-recording-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--navy-deep); }

        .rsm-audio-player-cautions {
          margin-top: 16px; padding: 4px; text-align: center; background-color: var(--paper-deep);
          border: 1px dashed var(--rule); border-radius: 8px;
          color: var(--vermillion); font-size: 13px; letter-spacing: .08em;
        }
        
        .rsm-audio-player {
          margin-top: 16px; padding: 4px;
          text-align: center; background-color: var(--paper-deep);
          border: 1px dashed var(--rule); border-radius: 8px;
          color: var(--ink); font-size: 13px; letter-spacing: .08em;
        }
        
        .rsm-audio-player-audio {
          margin-top: 16px; margin-bottom: 16px;
          padding-left: 16px; padding-right: 16px;
          width: 100%;
        }
        
        .rsm-audio-player-details {
          margin-top: 16px; padding-top: 16px; padding-bottom: 16px; padding-left: 32px; padding-right: 32px;
          text-align: left; background-color: var(--paper-deep);
          border: 1px dashed var(--rule); border-radius: 8px;
          color: var(--ink); font-size: 13px; letter-spacing: .08em;
        }

        .rsm-results { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 16px; }
        .rsm-card {
          background: #fbf6ec; border: 1px solid var(--rule); border-radius: 8px;
          padding: 20px 18px; opacity: 0; transform: translateY(8px);
          animation: rsm-rise .5s ease forwards;
        }
        .rsm-card:nth-child(2) { animation-delay: .1s; }
        @keyframes rsm-rise { to { opacity: 1; transform: translateY(0); } }
        .rsm-card .c-label {
          font-size: 12px; color: var(--ink-soft); letter-spacing: .14em; font-weight: 700;
        }
        .rsm-card .c-value {
          font-family: 'Shippori Mincho B1', serif; font-weight: 700;
          font-size: 46px; line-height: 1; margin-top: 12px; color: var(--ink);
        }
        .rsm-card .c-unit {
          font-size: 14px; color: var(--ink-soft); margin-left: 6px;
          font-family: 'Zen Kaku Gothic New'; font-weight: 500;
        }
        .rsm-bar { margin-top: 14px; height: 6px; background: var(--paper-deep); border-radius: 3px; overflow: hidden; }
        .rsm-bar > span { display: block; height: 100%; background: var(--vermillion); border-radius: 3px; transition: width .6s ease; }

        .rsm-placeholder {
          margin-top: 16px; padding: 28px; text-align: center;
          border: 1px dashed var(--rule); border-radius: 8px;
          color: var(--ink-soft); font-size: 13px; letter-spacing: .08em;
        }

        .rsm-status {
          margin-top: 16px; padding: 4px; text-align: center; background-color: var(--paper-deep);
          border: 1px dashed var(--rule); border-radius: 8px;
          color: var(--ink); font-size: 13px; letter-spacing: .08em;
        }
        .rsm-error-message {
          color: var(--vermillion); font-size: 13px; letter-spacing: .08em;
        }

        .rsm-foot {
          margin-top: 30px; font-size: 11px; color: var(--ink-soft);
          letter-spacing: .04em; line-height: 1.7; border-top: 1px solid var(--rule); padding-top: 16px;
        }
      `}</style>

      <div className="rsm-wrap">
        <div className="rsm-kicker">Reading Speed Meter</div>
        <h1 className="rsm-title">
          音読速度計測<span className="seal">試作</span>
        </h1>
        <p className="rsm-sub">
          Step 2 — ブラウザ録音の動作確認
        </p>

        <div className="rsm-section-label">モックデータを選ぶ</div>
        <div className="rsm-tabs">
          {MOCK_SAMPLES.map((s) => (
            <button
              key={s.id}
              className={`rsm-tab ${s.id === sampleId ? "active" : ""}`}
              onClick={() => selectSample(s.id)}
            >
              <div className="t-label">{s.label}</div>
              <div className="t-note">{s.note}</div>
            </button>
          ))}
        </div>

        <div className="rsm-section-label">認識テキスト</div>
        <div className="rsm-genko">
          <div className="rsm-grid">
            {chars.map((c, i) => (
              <div className="rsm-cell" key={i}>
                {c}
              </div>
            ))}
          </div>
          <div className="rsm-count">{chars.length} 文字</div>
        </div>

        <div className="rsm-section-label">録音の状態</div>
        <div className="rsm-status">
          {recordingPhase === RecordingPhase.Idle && "録音待機中"}
          {recordingPhase === RecordingPhase.Recording && "録音中"}
          {recordingPhase === RecordingPhase.Done && "録音完了"}
          {recordingPhase === RecordingPhase.Error &&
            <span className="rsm-error-message">録音エラー: {errorMessage}</span>}
        </div>

        <div className="rsm-section-label">録音ボタン</div>
        {recordingPhase === RecordingPhase.Idle && (
          <button className="rsm-recording-btn" onClick={handleRecordingStart}>
            録 音 開 始
          </button>
        )}
        {recordingPhase === RecordingPhase.Recording && (
          <button className="rsm-recording-btn" onClick={handleRecordingStop}>
            録 音 停 止
          </button>
        )}
        {recordingPhase === RecordingPhase.Done && (
          <button className="rsm-recording-btn" onClick={handleRecordingStart}>
            再 度 録 音
          </button>
        )}
        {recordingPhase === RecordingPhase.Error && (
          <button className="rsm-recording-btn" onClick={handleRecordingStart}>
            再 度 録 音（エラーにより録音失敗）
          </button>
        )}

        {showAudioPlayer && (
          <div className="rsm-audio-player-container">
            <div className="rsm-section-label">録音データの確認</div>
            {recordingPhase === RecordingPhase.Error && audioUrl && (
              <div className="rsm-audio-player-cautions">
                録音に失敗しました。過去の録音が使用可能です。<br />
                もしくは、再度録音を試してください。
              </div>
            )}
            {audioUrl && (
              <div className="rsm-audio-player">
                <audio src={audioUrl} controls className="rsm-audio-player-audio" />
              </div>
            )}
          </div>
        )}
        {showAudioPlayer && audioUrl && (
          <div className="rsm-section-label">録音データの情報</div>
        )}
        {showAudioPlayer && audioUrl && (
          <div className="rsm-audio-player-details">
            MimeType: {selectedMimeType ?? "不明"}<br />
            BlobType: {audioBlob?.type ?? "不明"}<br />
            BlobSize: {audioBlob?.size ?? "不明"} bytes<br />
          </div>
        )}

        <div className="rsm-section-label">計測ボタン</div>
        <button className="rsm-btn" onClick={handleMeasure}>
          計 測 す る
        </button>

        {metrics === null ? (
          <div className="rsm-placeholder">
            「計測する」を押すと、純粋発話速度と淀み率が表示されます
          </div>
        ) : (
          <div className="rsm-results">
            <div className="rsm-card">
              <div className="c-label">純粋発話速度</div>
              <div className="c-value">
                {metrics.pureSpeakingSpeed}
                <span className="c-unit">文字/分</span>
              </div>
            </div>
            <div className="rsm-card">
              <div className="c-label">淀み率</div>
              <div className="c-value">
                {stagnationPct}
                <span className="c-unit">%</span>
              </div>
              <div className="rsm-bar">
                <span style={{ width: `${stagnationPct}%` }} />
              </div>
            </div>
          </div>
        )}

        <div className="rsm-foot">
          ※ これはモックデータでの動作確認です。実装 calculateMetrics の動作確認をしています。
          今後のフェーズでは、AmiVoice API と連携して、実際の音声データを計測します。
        </div>
      </div>
    </div>
  );
}
