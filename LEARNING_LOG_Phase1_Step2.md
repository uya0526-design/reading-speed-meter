# LEARNING_LOG — Phase 1（Step 2）

音読速度計測アプリ（Reading Speed Meter）の Phase 1 / Step 2 における開発記録。  
Phase 1 Step 1（`LEARNING_LOG_Phase1.md`）の続き。後から振り返り、コンテスト応募時の「何を自分でやったか」の説明材料として残す。

**期間のゴール:** ブラウザでの音声録音（MediaRecorder）のみ。AmiVoice / Claude API 連携は触らない。  
**結果:** 2026年6月時点で Step 2 完了（ブラウザ動作確認・マイク拒否時のエラー確認済み、`main` へマージ済み）。

---

## 開発スタイル（Step 2）

| 項目 | 内容 |
|---|---|
| Step 1 | ヒント中心。コードは自分で書き、AI はレビュー役 |
| Step 2 | **AI 協業を一段強化**。MediaRecorder 周りの定型コードは AI が例示 + 1 行解説、概念の核（状態設計・イベント駆動）は自分で書く |
| 自分が握るもの | 設計判断（mimeType・状態 Enum・エラー UX・Blob 温存方針）、実装、動作確認、Git 運用、AI 提案の取捨選択 |
| 進め方 | 1 ステップ提示 → 自分で書く or AI 定型を取り込む → 「OK」/「動きました」でレビュー |
| Git | `feature/audio-recording` ブランチで作業 → 論理単位でコミット → `main` マージ |

---

## 自分が実装した部分

### Git 運用

- `git checkout -b feature/audio-recording` で feature ブランチを作成
- Step 2 関連 4 コミットを `main` へマージ（fast-forward）
- コミットメッセージは「何をしたか」が後から記事に使える粒度で記載

### 録音の状態設計（`app/page.tsx`）

| 内容 | 自分で書いたこと |
|---|---|
| `RecordingPhase` enum | Idle / Recording / Done / Error の 4 状態（一時停止なし）。JSDoc で各状態の意味を記載 |
| `useState` | `recordingPhase`、`errorMessage`（B案: フェーズとメッセージを分離） |
| 状態表示 | phase ごとの日本語表示、Error 時のみ `errorMessage` を併記 |
| 録音 UI 骨格 | phase ごとにボタンを出し分け（開始 / 停止 / 再録音 / エラー時再録音） |
| `rsm-sub` 更新 | 「Step 2 — ブラウザ録音の動作確認」 |
| 録音ボタン CSS | ネイビー系 `.rsm-recording-btn`、`.rsm-status`、エラー表示スタイル |

### MediaRecorder 録音ロジック（AI 定型を取り込みつつ自分で組み立て）

| 内容 | 自分で書いたこと |
|---|---|
| 定数 | `MAX_RECORDING_TIME_MS = 10_000`、`MIME_CANDIDATES`（`as const`） |
| `pickSupportedMimeType` | C案: 候補を順に `isTypeSupported` で試す（`for` ループ） |
| `useRef` 群 | `mediaRecorderRef`、`streamRef`、`chunksRef`、`autoStopTimerRef`、`selectedMimeTypeRef` |
| `setupRecording` | `getUserMedia` → `MediaRecorder` 生成 → `ondataavailable` / `onstop` 登録 → `start()` |
| `stopRecording` | 10 秒タイマーの `clearTimeout` + `recorder.stop()`（手動・自動停止の共通入口） |
| `handleRecordingStart` | try/catch、`setRecordingPhase(Recording)`、10 秒 `setTimeout`、エラー時ストリーム解放 |
| `handleRecordingStop` | `stopRecording()` のみ（`Done` は `onstop` 内で遷移） |
| `onstop` | Blob 組立、`setAudioBlob`、ストリーム `track.stop()`、Error 分岐（`throw` ではなく state 更新） |

### Blob・再生 UI

| 内容 | 自分で書いたこと |
|---|---|
| `audioBlob` state | 録音成功時に `onstop` でセット。再録音開始時はクリアしない（温存方針） |
| `showAudioPlayer` | `audioBlob !== null` かつ `Done` or `Error` のときのみ表示 |
| 再生 UI | `<audio src={audioUrl} controls />`、Error 時の注意文 |
| `audioUrlRef` + `setAudioUrlSafe` | AI レビュー後に自分で追加。ref と state を同期する入口を 1 関数に集約 |
| URL ライフサイクル | **create → revoke → set** の順に変更（横道の学習を反映） |
| mimeType 表示（Step 7） | `selectedMimeType` state、`audioBlob?.type` / `audioBlob?.size` から描画。情報パネルも `showAudioPlayer` と同条件 |

### 仕様判断（自分で決めたこと）

- **mimeType:** C案（`MediaRecorder.isTypeSupported()` でフォールバック）。Safari シェアを考慮
- **録音状態:** Enum で Idle / Recording / Done / Error。一時停止は考慮しない
- **録音時間:** 最大 10 秒（停止ボタン or 自動停止）。停止処理は `stopRecording()` に共通化
- **エラー UX:** Enum に `Error` + `errorMessage` を別 `useState`（B案）
- **再録音失敗時:** 前回成功した `audioBlob` を温存（2 回目失敗でも 1 回目で計測したい可能性を考慮）
- **再生 UI 表示:** 待機中・録音中は非表示。Error 時は前回録音があればプレーヤー表示
- **情報パネル表示:** プレーヤーと同じ `showAudioPlayer` 条件に揃える（録音中に古い情報が出ないように）
- **派生 state の削減:** `audioBlobType` / `audioBlobSize` は別 state にせず `audioBlob?.type` / `size` から描画

### 動作確認（自分で実施）

- 録音開始 → 停止 → 再生で音声確認
- 10 秒自動停止
- 再録音（成功時は Blob 差し替え）
- ブラウザのマイク許可を操作し、拒否時の Error 表示
- 再録音失敗時に前回の録音が残ること

---

## AI（Cursor）に頼った部分

### 進行・設計支援

| 領域 | AI の役割 | 自分の関与 |
|---|---|---|
| Step 分割 | Step 0〜9 の作業工程を「次に何をするか」として提示 | 各ステップ完了後に「OK」「動きました」で確認 |
| 設計の問いかけ | mimeType・状態 Enum・エラー UX の選択肢を表で提示 | C案・4 状態 Enum・B案（error 分離）・10 秒制限を自分で決定 |
| Git 助言 | ブランチ名、コミット粒度、amend の可否、マージ手順 | 実際のブランチ作成・コミット・マージは自分で実施 |

### 定型コードの例示（1 行ずつ解説 + Java 比較）

| 領域 | AI が提示した内容 | 自分の関与 |
|---|---|---|
| `getUserMedia` | マイク許可と `MediaStream` 取得の骨子 | 自分の `setupRecording` に組み込み、コメント付きで実装 |
| `MediaRecorder` | 生成、`ondataavailable`、`onstop`、`start`/`stop` | 同上 |
| `useRef` の使い分け | 再レンダー不要なインスタンスは ref に置く方針 | ref 宣言と各ハンドラへの接続を自分で記述 |
| 10 秒タイマー | `setTimeout` + `clearTimeout` のパターン | `handleRecordingStart` / `stopRecording` に実装 |

### コードレビュー

| 領域 | AI の役割 | 自分の関与 |
|---|---|---|
| 各ステップレビュー | 良い点 → 改善点の順でフィードバック | 指摘を反映（`errorMessage` クリア、CSS typo、`onstop` の throw 廃止など） |
| stale closure 解説 | `onstop` 内の `audioUrl` が古い値を見る可能性、`audioUrlRef` 案 | 理解後に `setAudioUrlSafe` を自分で実装 |
| create→revoke→set | URL 更新の堅牢な順序、Java の「新ファイル作成後に旧ファイル削除」比喩 | 自分で書き換え。中間の `null` 埋めについても議論し理解 |
| Blob 温存方針 | 再録音開始時に Blob を消さない設計の妥当性を肯定 | 自分から提起し、仕様として確定 |

### AI がコードを直接書いた部分

- **なし**（本セッションでは AI はコード例・解説・レビューのみ。実装はすべて自分の手で `page.tsx` に記述）

---

## 学習したこと

### ブラウザ API（MediaRecorder）

| トピック | 内容 | Java との対比 |
|---|---|---|
| **`getUserMedia`** | マイク許可ダイアログ → `MediaStream` 取得 | `AudioSystem.getLine()` で入力デバイスを開く |
| **`MediaRecorder`** | ストリームを指定形式で録音するエンジン | `Encoder(stream, format)` |
| **`ondataavailable`** | 録音中にデータ断片（chunk）が届くコールバック | `InputStream.read()` でバッファが来るたび |
| **`onstop`** | 停止完了後に 1 回呼ばれる。Blob 組立・後始末のタイミング | `listener.onRecordingStopped()` |
| **`track.stop()`** | マイクランプ消灯・リソース解放 | `stream.close()` |
| **`Blob`** | バイナリデータの塊。`type` / `size` を持つ | `byte[]` + Content-Type メタデータ |
| **`URL.createObjectURL`** | Blob をブラウザ内一時 URL に変換（`<audio src>` 用） | 一時ファイルパスを発行する |
| **`URL.revokeObjectURL`** | 不要になった一時 URL を解放 | 一時ファイルの `delete` / `close` |
| **`isTypeSupported`** | ブラウザが録音形式に対応しているか確認 | 利用可能な `Serializer` を順に試す |

### React（状態管理・イベント駆動）

| トピック | 内容 | Java との対比 |
|---|---|---|
| **`useState` vs `useRef`** | 画面に反映する状態は state。`MediaRecorder`・タイマー・chunk 配列は ref | 画面用フィールド vs インスタンスフィールド |
| **イベント駆動の phase 更新** | `stop()` は `onstop` のあとで `Done` にする。停止ボタンでは phase を直接変えない | ボタン → `stop()` → コールバックで状態確定 |
| **stale closure** | イベントコールバックが登録時の state を閉じ込めることがある | 古い `Listener` が古いフィールド値を参照 |
| **`setAudioUrlSafe`** | ref と state を 1 関数で同期 | private setter で関連フィールドをまとめて更新 |
| **create → revoke → set** | 新 URL を先に作ってから旧 URL を revoke | 新ファイル作成成功後に旧ファイル削除 |
| **派生値の描画** | `audioBlob?.type` をそのまま表示に使える | ドメインオブジェクトから getter で表示 |

### TypeScript

| トピック | 内容 |
|---|---|
| **`enum RecordingPhase`** | Java の enum に近い 4 状態表現 |
| **`as const`** | `MIME_CANDIDATES` を読み取り専用リテラル型に |
| **`10_000`** | 数値区切り（10 秒 = 10000 ms） |

### Git

| トピック | 内容 |
|---|---|
| **feature ブランチ** | `main` から切って作業、完了後マージ |
| **コミット粒度** | 1 ステップ = 1 コミットが理想だが、Step 1+2 を 1 コミットにまとめた例もあり（実用上は追跡可能） |
| **`git commit --amend`** | push 前ならメッセージ修正可。push 後は原則避ける |

### 設計・UX

| トピック | 内容 |
|---|---|
| **Blob 温存** | 再録音失敗時も前回成功分を残す。計測アプリとしてフォールバックに有効 |
| **表示条件の統一** | プレーヤーと情報パネルを同じ `showAudioPlayer` で制御 |
| **AmiVoice 前準備** | `MimeType`（要求形式）と `BlobType`（実体）を画面に出し、Step 3 での形式相性確認に使う |

---

## Git コミット履歴（Step 2）

| コミット | 日付 | メッセージ | 主な内容 |
|---|---|---|---|
| `135ba22` | 2026-06-09 | 録音 UI セクションの骨格（開始/停止ボタン・状態連動） | Enum、`useState`、状態表示、ボタン骨格 |
| `f950e81` | 2026-06-10 | getUserMedia と MediaRecorder による録音開始・停止と Blob 生成 | 録音コア、10 秒タイマー、Blob、エラー処理 |
| `0c4caeb` | 2026-06-10 | audioUrl の更新を create→revoke→set の順に変更 | 再生 UI、`audioUrlRef`、`setAudioUrlSafe` |
| `57eb8bd` | 2026-06-10 | 録音データの mimeType・Blob 情報を画面に表示 | Step 7、表示条件の統一、CSS 修正 |

※ 当初計画の「Step 1 専用コミット」「Step 6 専用コミット」は上記に統合されている。

---

## 成果物マップ（Step 2 完了時点）

```
reading-speed-meter/
├── app/
│   └── page.tsx            # モック UI + ブラウザ録音（Client Component）
├── lib/metrics/            # Step 1 から変更なし
├── LEARNING_LOG_Phase1.md
├── LEARNING_LOG_Phase2.md  # 本ファイル
└── ...
```

### `page.tsx` に追加された主な要素

- `RecordingPhase` enum、`pickSupportedMimeType`
- 録音用 ref / state 群
- `setupRecording` / `stopRecording` / 録音ハンドラ
- 録音ボタン・状態表示・再生プレーヤー・mimeType 情報パネル
- 既存のモック計測 UI（原稿用紙・「計測する」・指標カード）は維持

---

## うまくいったこと / 反省点

### うまくいったこと

- **設計を先に決めてから実装:** mimeType・状態・エラー UX・Blob 温存を実装前に確定できた
- **段階的レビュー:** 各ステップで「OK」確認し、問題を小さく修正できた
- **横道の学習が設計に活きた:** stale closure と create→revoke→set を理解し、自分で `audioUrlRef` まで実装できた
- **実機確認:** マイク拒否を含むエラー系まで自分で操作して確認した
- **Git 運用の導入:** feature ブランチ + 意味のあるコミットメッセージで履歴が残せた

### 反省点・次回へのメモ

- Step 1 と Step 2 の UI 骨格を 1 コミットにまとめてしまい、当初想定よりコミット粒度が粗くなった
- `page.tsx` が 500 行超え。Step 3 以降で録音ロジックの `lib/` 分離を検討
- `LEARNING_LOG_Phase1.md` 末尾の「Phase 2（予定）」のうち、**AmiVoice 連携・Claude・Vercel は Step 3 以降**

---

## Phase 1 Step 3（予定）で触ること

1. API Routes 経由の AmiVoice 連携（Step 2 で録音した Blob を送信）
2. 認識結果を `calculateMetrics` に接続（モックから実データへ）
3. Claude Haiku による一言フィードバック
4. Vercel デプロイ + 環境変数

---

*最終更新: Step 2 完了時（ブラウザ録音・再生確認・mimeType 表示、`main` マージ済み）*
