# LEARNING_LOG — Phase 1（Step 3）

音読速度計測アプリ（Reading Speed Meter）の Phase 1 / Step 3 における開発記録。  
Phase 1 Step 2（`LEARNING_LOG_Phase1_Step2.md`）の続き。後から振り返り、コンテスト応募時の「何を自分でやったか」の説明材料として残す。

**期間のゴール:** 録音 Blob を AmiVoice 同期 HTTP API で音声認識し、実データで `calculateMetrics` を動かす（モック → 実データ経路への接続）。  
**結果:** 2026年6月時点で Step 3 完了（curl / ブラウザ動作確認済み、`feature/amivoice-integration` ブランチ上、4 論理コミット）。

---

## 開発スタイル（Step 3）

| 項目 | 内容 |
|---|---|
| Step 1 | ヒント中心。コードは自分で書き、AI はレビュー役 |
| Step 2 | AI 協業強化。MediaRecorder 定型は AI 例示 + 1 行解説、状態設計は自分 |
| Step 3 | **同じ協業モードを継続**。設計判断（分離方針・API 返却形式・segments 作り方・計測 UI 文言）は自分。fetch / FormData / Route 骨子は AI 例示 + 解説を取り込み自分で組み込む |
| 自分が握るもの | 設計選択（表から選ぶ）、実装、動作確認、Git 運用、公式マニュアル確認、AI 提案の取捨選択 |
| 進め方 | 1 ステップ提示 → 自分で書く → 「OK」/「動きました」でレビュー → 次へ |
| Git | `feature/amivoice-integration` ブランチ → 論理単位 4 コミット |

---

## 自分が実装した部分

### Git 運用

- `git checkout -b feature/amivoice-integration` で feature ブランチを作成
- Step 3 関連 4 コミット（責務分離 / AmiVoice 中継 / マッパー / 配線完了）
- コミットメッセージは後から記事・振り返りに使える粒度

### Step 3-1: 録音ロジックのリファクタ（振る舞い不変）

AI が提示した分離方針から **B + T2 + R1 + E1** を自分で選択し、実装。

| ファイル | 自分で書いた内容 |
|---|---|
| `lib/recorder/types.ts` | `RecordingPhase` enum を `page.tsx` から移動（JSDoc 付き） |
| `lib/recorder/constants.ts` | `MAX_RECORDING_TIME_MS`、`MIME_CANDIDATES`（`as const`） |
| `lib/recorder/mimeType.ts` | T2: `pickSupportedMimeType(candidates, isSupported)` 純粋関数 + `pickBrowserMimeType()` ラッパー |
| `lib/recorder/mimeType.test.ts` | 全 true / 全 false / 空配列 / **フォールバック（2 番目の候補）** / `MediaRecorder` モック |
| `lib/recorder/useRecorder.ts` | Step 2 の録音ロジックを R1 方針でフック化。8 項目を return |
| `app/page.tsx` | 録音ロジック削除 → `useRecorder()` 配線。import 整理 |

### Step 3-2: AmiVoice API Route（BFF）

AI の表から **A + F1 + P1** を選択。公式マニュアル（[同期 HTTP](https://docs.amivoice.com/amivoice-api/manual/sync-http-interface)、[リクエストパラメータ](https://docs.amivoice.com/amivoice-api/manual/request-parameters)）を自分で確認し、`app/api/recognize/route.ts` を実装。

| 内容 | 自分で書いたこと |
|---|---|
| 環境変数 | `.env.local` に `AMIVOICE_API_KEY`（`.gitignore` 済み `.env*`） |
| 定数 P1 | `AMIVOICE_ENDPOINT`（nolog）、`AMIVOICE_ENGINE`（`-a-general`）を Route 内に配置 |
| 受信 F1 | ブラウザから `audio` フィールドで Blob 受信 |
| 中継 | AmiVoice 向け FormData: `u`（API キー）→ `d`（エンジン）→ `a`（音声・**最後**） |
| 返却 A | AmiVoice 生 JSON をほぼそのまま返す |
| 動作確認 | curl で `recording.webm` を POST し、認識 JSON（`text` / `results`）を確認 |

※ 初版骨子では `Authorization` ヘッダを想定していたが、レビュー後に **同期 HTTP は `u` フィールド認証** に修正。

### Step 3-3: マッパー（純粋関数）

segments の作り方として **S2（token ごとに segments）** を自分で選択。

| ファイル | 自分で書いた内容 |
|---|---|
| `lib/metrics/mapAmiVoiceResponse.ts` | 生 JSON → `AmiVoiceResponse`。`text` はトップレベル、`segments` は `results[0].tokens` から start/end を抽出 |
| `fixtures/test_01.json` | 短い AmiVoice レスポンス（テスト用に tokens 3 件） |
| `fixtures/test_02.json` | **curl 実データ**をベースにした fixture（tokens 9 件） |
| `lib/metrics/mapAmiVoiceResponse.test.ts` | fixture 2 件 + **具体値 assert**（length、先頭 segment の starttime/endtime） |

※ 初版では `result.tokens`（単数）を参照していたが、レビュー後 **`results[0].tokens`** に修正。

### Step 3-4: 配線（mock → 実データ）

計測フェーズの表現として **M1（`AnalysisPhase` を録音と別 enum）** を選択。実データ経路は **K1（モック計測を全面差し替え）**。

| 内容 | 自分で書いたこと |
|---|---|
| `lib/metrics/types.ts` | `AnalysisPhase` enum 追加（Idle / Analyzing / Analyzed / Error） |
| `handleMeasure` | async 化。`audioBlob` → FormData → `/api/recognize` → `mapAmiVoiceResponse` → `calculateMetrics` |
| エラー処理 | HTTP 失敗、`code !== ""`、catch で `AnalysisPhase.Error` + `analysisErrorMessage` |
| 操作制御 | 計測中（`Analyzing`）は録音・タブ・計測ボタンを `disabled` |
| UI 文言 | 画面表示は **「計測」** に統一（未計測 / 計測中 / 計測完了 / 計測エラー）。内部変数名は `analysisPhase` のまま |
| `selectSample` | サンプル切替時に `analysisPhase` / `analysisErrorMessage` も Idle にリセット |
| 表示更新 | `rsm-sub`「Step 3 — AmiVoice API と連携した音声認識と計測」、`rsm-foot` を実データ計測の説明に変更 |
| 結果表示 | `metrics !== null` のときのみ指標カード表示 |

### 仕様判断（自分で決めたこと）

| 項目 | 決定内容 |
|---|---|
| リファクタ方針 | B（types / constants / mimeType / useRecorder の 4 ファイル + tests） |
| mimeType テスト | T2（依存注入で純粋関数テスト） |
| フック返却 | R1（state / handlers を丸ごと return） |
| API 返却形式 | A（生 JSON）。Step 3-3 マッパー設計の材料にする |
| FormData フィールド | F1（ブラウザ → Route は `audio`） |
| エンジン等 | P1（Route 内定数。公式 curl 例の `-a-general`） |
| segments | S2（各 token の starttime/endtime を segment に） |
| 計測状態 | M1（`RecordingPhase` と `AnalysisPhase` を分離） |
| ユーザー向け文言 | 「解析」ではなく **「計測」**（音声認識〜指標算出をユーザーに分かりやすく） |
| WebM | Chrome の `audio/webm;codecs=opus` はヘッダあり → **`c` パラメータ不要**（curl で実証） |
| モック原稿 | タブは原稿表示用に残し、計測は録音 Blob のみ（K1） |

### 動作確認（自分で実施）

- curl: `recording.webm` → `/api/recognize` → 認識 JSON（`code: ""`、`text` あり）
- ブラウザ: 録音 → 計測する → 純粋発話速度・淀み率表示
- 計測中: 「計測中」表示、ボタン disabled
- 録音前: 計測ボタン非表示（録音完了後のみ）
- `npm run test` — 15 本 PASS（calculateMetrics 6 + mimeType 7 + mapAmiVoiceResponse 2）

---

## AI（Cursor）に頼った部分

### 進行・設計支援

| 領域 | AI の役割 | 自分の関与 |
|---|---|---|
| Step 分割 | 3-1〜3-5 の作業順と「次に 1 ステップだけ」を提示 | 各ステップ完了後に「OK」「動きました」で確認 |
| 分離方針 | 表1〜4（ミニマム / バランス / UI 分離、T1〜T3、R1〜R3、E1/E2） | **B + T2 + R1 + E1** を選択 |
| API Route 設計 | 表（返却形式 A/B/C、FormData F1/F2、パラメータ P1〜P3） | **A + F1 + P1** を選択 |
| segments 設計 | S1/S2/S3 の表と推奨 | **S2** を選択 |
| 計測状態 | M1/M2/M3 の表 | **M1** を選択 |
| 公式仕様 | 同期 HTTP の `u`/`d`/`a`、WebM/Opus 対応、multipart 順序の解説 | [docs.amivoice.com](https://docs.amivoice.com/amivoice-api/manual/) を自分で確認し実装に反映 |

### 定型コードの例示（1 行ずつ解説 + Java 比較）

| 領域 | AI が提示した内容 | 自分の関与 |
|---|---|---|
| `app/api/recognize/route.ts` | POST ハンドラ骨子、`process.env`、`formData` 中継、`fetch` | 公式仕様に合わせて `u`/`d`/`a` に書き換え、定数・コメントを自分で調整 |
| `handleMeasure` | fetch + FormData + `mapAmiVoiceResponse` + `calculateMetrics` の 10 行フロー | 自分の `page.tsx` に組み込み。`isAnalyzing` は後から削除し enum に一本化 |
| 計測状態 UI | `rsm-status` に phase 表示する JSX 例 | 「計測」文言に自分で変更 |
| テスト改善 | 具体値 assert の例（`toHaveLength`、`segments[0]`） | test_01 全 segment + test_02 先頭のみを自分で追加 |

### コードレビュー

| 領域 | AI の指摘 | 自分の対応 |
|---|---|---|
| `result` vs `results` | AmiVoice 生 JSON は `results[0].tokens` | マッパーを修正 |
| `Authorization` ヘッダ | 同期 HTTP では不要。`u` が認証 | Route を修正 |
| `page.tsx` 配線漏れ | `useRecorder()` 呼び出し未実装 | import + destructuring を追加 |
| `pickBrowserMimeType` | フック内でラッパーを使う | constants import + ラッパー呼び出しに変更 |
| テストの二重性 | `.map()` 比較だけでは意図検証が弱い | 具体値 assert を追加 |
| 計測 UI 未表示 | `analysisPhase` が JSX に出ていない | 「計測の状態」セクションを追加 |
| `isAnalyzing` 冗長 | M1 なら `Analyzing` phase で足りる | boolean を削除 |

### AI がコードを直接書いた部分

- **なし**（本 Step では AI は方針表・骨子例示・レビューのみ。実装ファイルはすべて自分の手で作成）

---

## 学習したこと

### アーキテクチャ（BFF）

| トピック | 内容 | Java との対比 |
|---|---|---|
| **BFF（Backend for Frontend）** | Next.js API Routes が API キーを預かり、ブラウザと AmiVoice の中継役になる | Spring の `@RestController` が外部 API キーを `application.yml` から読み、クライアントには見せない |
| **キー漏洩防止** | `AMIVOICE_API_KEY` は `process.env` のみ。bundle / ブラウザに出さない | サーバー側 `@Value` / 環境変数 |
| **2 段 FormData** | ブラウザ→自前 Route（`audio`）、Route→AmiVoice（`u`/`d`/`a`） | 内部 API 受信 DTO → 外部 API 用 multipart の組み直し |

### AmiVoice 同期 HTTP API

| トピック | 内容 | Java との対比 |
|---|---|---|
| **エンドポイント** | `POST https://acp-api.amivoice.com/v1/nolog/recognize`（ログなし） | 固定 URL の REST クライアント |
| **認証 `u`** | API キーを multipart の `u` パートに載せる（ヘッダ `Authorization` ではない） | リクエストボディの専用フィールドに API キー |
| **エンジン `d`** | `-a-general` または `grammarFileNames=-a-general ...` | サービス ID / プロファイル指定 |
| **音声 `a`** | バイナリ。**multipart の最終パート**（後ろにフィールドを足すと無視される） | multipart の最後の `@RequestPart` |
| **生レスポンス** | トップ `text` + `results[].tokens[]`（各 token に starttime/endtime） | 外部 API の生 DTO |
| **エラー判定** | `code !== ""` のとき失敗（成功時は `code: ""`） | レスポンスコードフィールドでの業務エラー |
| **WebM + Opus** | ヘッダありコンテナ → 同期 HTTP では **`c` 省略可** | Content-Type / ファイルヘッダからフォーマット自動判別 |

### 純粋関数・テスト

| トピック | 内容 | Java との対比 |
|---|---|---|
| **マッパー分離** | 生 JSON → `AmiVoiceResponse` は `calculateMetrics` の外に 1 枚 | Controller で DTO 変換 → Service はドメイン型のみ |
| **S2 segments** | token 単位の start/end を segment に。token 間の隙間は淀み率に効く | 細粒度タイムスタンプリスト |
| **fixture 実データ** | curl 結果を `fixtures/test_02.json` に保存 | 本番に近い JSON をテストリソースに |
| **具体値 assert** | `.map()` 再現だけでなく `1080` / `length 9` を固定 | 期待値をハードコードした単体テスト |
| **T2 依存注入** | `pickSupportedMimeType(candidates, fn)` | インタフェースを引数で渡す Util |

### React / Next.js

| トピック | 内容 | Java との対比 |
|---|---|---|
| **`useRecorder` フック** | 録音 state/ref/ハンドラをカプセル化 | Service 層抽出 |
| **`AnalysisPhase`（M1）** | 録音状態と計測状態を別 enum | 注文状態 vs 解析ジョブ状態 |
| **async `handleMeasure`** | 計測ボタン → fetch → state 更新 | 非同期 Controller → 結果表示 |
| **表示と内部名の分離** | 変数 `analysisPhase`、画面文言「計測」 | enum 名と i18n ラベルの分離 |
| **Route Handler** | `app/api/recognize/route.ts` の `export async function POST` | `@PostMapping` |

### 設計・UX

| トピック | 内容 |
|---|---|
| **計測ボタン表示条件** | 録音完了（`showAudioPlayer`）後のみ。未録音で API を叩かない |
| **計測中の disabled** | `analysisPhase === Analyzing` で録音・タブ・計測をロック |
| **エラー UX 再利用** | Step 2 と同様、phase + message を分離（録音 / 計測で別 state） |
| **原稿タブ** | モック原稿は「読むテキスト」表示用。計測データ源は録音 Blob |

---

## Git コミット履歴（Step 3）

| コミット | メッセージ | 主な内容 |
|---|---|---|
| `0c2f600` | feat: 責務分離 | `lib/recorder/`、`useRecorder`、`page.tsx` 薄型化 |
| `e6ec795` | feat: AmiVoiceシンプル中継確認 | `app/api/recognize/route.ts`、curl 確認 |
| `5269994` | feat: Responseマッピング | `mapAmiVoiceResponse`、fixtures、Vitest |
| `e463018` | feat: Step3完了 | `AnalysisPhase`、`handleMeasure` 配線、計測 UI |

※ ブランチ `feature/amivoice-integration` 上。`main` マージは Step 3-5 仕上げ時。

---

## 成果物マップ（Step 3 完了時点）

```
reading-speed-meter/
├── app/
│   ├── api/recognize/route.ts   # AmiVoice BFF（同期 HTTP 中継）
│   └── page.tsx                 # 録音 + 実データ計測 UI
├── fixtures/
│   ├── test_01.json             # マッパーテスト用（短）
│   └── test_02.json             # curl 実データベース
├── lib/
│   ├── metrics/
│   │   ├── mapAmiVoiceResponse.ts
│   │   ├── mapAmiVoiceResponse.test.ts
│   │   └── types.ts             # + AnalysisPhase
│   └── recorder/
│       ├── types.ts
│       ├── constants.ts
│       ├── mimeType.ts
│       ├── mimeType.test.ts
│       └── useRecorder.ts
├── .env.local                   # AMIVOICE_API_KEY（git 除外）
├── LEARNING_LOG_Phase1_Step1.md
├── LEARNING_LOG_Phase1_Step2.md
└── LEARNING_LOG_Phase1_Step3.md  # 本ファイル
```

### データフロー（Step 3 完了時）

```
[ブラウザ]
  録音: getUserMedia → MediaRecorder → audioBlob
  計測: FormData(audio) → POST /api/recognize
           ↓
[API Route / BFF]
  u + d + a → AmiVoice 同期 HTTP → 生 JSON
           ↓
[ブラウザ]
  mapAmiVoiceResponse → calculateMetrics → 指標表示
```

---

## うまくいったこと / 反省点

### うまくいったこと

- **設計を表から選んでから実装:** 分離方針・API 形式・S2・M1 を先に確定し、迷いが少なかった
- **公式マニュアル + curl の二段確認:** `u`/`d`/`a` と WebM 対応をドキュメントと実測の両方で裏付け
- **Step 1 の資産再利用:** `calculateMetrics` とマッパー分離の思想がそのままつながった
- **fixture に実データ:** 「テストが通る ≠ 意図通り」への対策として具体値 assert を自分で追加
- **リファクタ先行:** Step 3-4 の配線前に `lib/recorder/` へ切り出し、`page.tsx` が太りすぎないようにした

### 反省点・次回へのメモ

- 初版マッパーの `result.tokens` は、**生 JSON の形を curl で先に見ていれば防げた**（fixtures 早期作成の重要性）
- S2 では token 間ギャップも淀み率に入る。原稿との文字数差・認識精度は Step 4 以降の UX でどう見せるか要検討
- 原稿タブ（モック）と実計測結果の関係（読んだテキスト vs 認識テキスト）が UI 上まだ弱い — 将来「認識結果テキスト」表示を足す余地あり
- README の Step 3 完了反映は別途更新予定

---

## Phase 1 Step 4 以降（予定）

1. Claude Haiku による一言フィードバック生成
2. Vercel デプロイ + 環境変数（`AMIVOICE_API_KEY` / `ANTHROPIC_API_KEY`）
3. 認識テキストの画面表示、原稿との比較 UX
4. （任意）`useAnalysis` フック化、モック計測経路の切り替え UI

---

*最終更新: Step 3 完了時（AmiVoice 連携・実データ計測・Vitest 15 本 PASS、`feature/amivoice-integration`）*
