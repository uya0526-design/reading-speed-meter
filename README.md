# Reading Speed Meter / 音読速度計測アプリ

日本語テキストを音読し、その速度・流暢性を計測・評価する Web アプリ。  
A web app that measures and evaluates the speed and fluency of Japanese read-aloud.

> 🏆 本プロジェクトは **Zennfes Spring 2026 / AmiVoice 協賛コンテスト** 応募作です。  
> This project is an entry for the **Zennfes Spring 2026 AmiVoice-sponsored contest**.

---

## 📸 Screenshots / 画面イメージ

Phase 1 のモック画面です。AmiVoice API には未接続で、あらかじめ用意した音声認識データ（モック）を選び **「計測する」** を押すと、純粋発話速度と淀み率が表示されます。  
Phase 1 mock UI: pick a preset sample and click **計測する** to see pure speaking speed and stagnation rate — no AmiVoice API yet.

下図は **サンプル2（途中で淀む音読）** の計測結果です（80 字/分・淀み率 16.7%）。原稿用紙風のテキスト表示・サンプル切替・指標カードが一覧できます。  
Below: **Sample 2 (hesitant reading)** — 80 chars/min, 16.7% stagnation.

![Phase 1 モック UI — サンプル2の計測結果（80 字/分・淀み率 16.7%）](./docs/screenshots/mock-ui-overview.png)

### モックデータ 2 パターンの比較 / Two mock samples

| サンプル / Sample | 条件 / Condition | 計測結果 / Result |
|---|---|---|
| サンプル1（なめらか） | 10 文字・6 秒・無音なし | 100 字/分・淀み率 0% |
| サンプル2（淀む） | 20 文字・発話 15 秒・無音 3 秒 | 80 字/分・淀み率 16.7% |

<p align="center">
  <img src="./docs/screenshots/mock-ui-sample1-smooth.png" alt="サンプル1 — なめらかな音読（100 字/分・淀み率 0%）" width="48%" />
  <img src="./docs/screenshots/mock-ui-sample2-hesitant.png" alt="サンプル2 — 途中で淀む音読（80 字/分・淀み率 16.7%）" width="48%" />
</p>

左: サンプル1（なめらか） / Left: Sample 1 (smooth) — 右: サンプル2（淀む） / Right: Sample 2 (hesitant)

---

## 🚀 Getting Started / セットアップ

```bash
npm install   # 初回のみ / first time only
npm run dev   # 開発サーバー → http://localhost:3000
npm test      # Vitest（単体テスト / unit tests）
npm run build # 本番ビルド確認 / production build check
```

ブラウザで `http://localhost:3000` を開き、モックデータを選んで「計測する」を押すと指標が表示されます。  
Open `http://localhost:3000`, pick a mock sample, and click **計測する** to see the metrics.

---

## 📁 Project Structure / プロジェクト構成

```
reading-speed-meter/
├── app/
│   ├── layout.tsx              # 共通レイアウト / root layout
│   └── page.tsx                # モック UI（Client Component）
├── lib/metrics/
│   ├── types.ts                # 型定義 / type definitions
│   ├── calculateMetrics.ts     # 指標算出の純粋関数 / pure function
│   ├── calculateMetrics.test.ts# Vitest（6 tests）
│   └── mockData.ts             # モックデータ / mock AmiVoice data
├── docs/screenshots/           # README 用キャプチャ / screenshots for README
├── README.md
└── LEARNING_LOG_Phase1.md      # Phase 1 開発記録 / development log
```

---

## 🤖 Development Style / 開発スタイル

締切があるため、従来の「コードは自分で書き AI はレビュー」から **AI 協業開発** に切り替えています（透明に開示）。  
Due to the deadline, this project uses **AI collaborative development** instead of AI-as-reviewer-only (disclosed openly).

**見せる軸 / What this project demonstrates**

| 日本語 | English |
|---|---|
| 設計・技術選定・仕様の判断は自分 | Design, tech selection, and spec decisions are mine |
| AI の提案を取捨選択・検証・修正したのは自分 | I select, verify, and revise AI suggestions |
| コードの動作を理解している | I understand how the code works |

詳細な振り返りは [`LEARNING_LOG_Phase1.md`](./LEARNING_LOG_Phase1.md) を参照。  
See [`LEARNING_LOG_Phase1.md`](./LEARNING_LOG_Phase1.md) for a detailed learning log.

---

## 🛠 Tech Stack / 技術構成

| レイヤー / Layer | 採用技術 / Technology | 備考 / Notes |
| :--- | :--- | :--- |
| フレームワーク / Framework | Next.js 16 (App Router) + API Routes | Phase 2 以降で API Routes を追加 |
| 言語 / Language | TypeScript | |
| 音声認識 / Speech-to-Text | AmiVoice API | Phase 2 以降 |
| AI フィードバック / AI Feedback | Claude API (Haiku / `claude-haiku-4-5`) | Phase 2 以降 |
| テスト / Testing | Vitest | `npm test`（6 tests） |
| デプロイ / Deploy | Vercel | Phase 1 末 |

---

## 🏗 Architecture (BFF) / アーキテクチャ

AmiVoice / Claude の API キーは **絶対にブラウザに出さない**。  
Next.js の API Routes がキーを預かる中継役（BFF / プロキシ）を担う（Phase 2 以降で実装）。

API keys for AmiVoice / Claude are **never exposed to the browser**.  
Next.js API Routes will act as a BFF (Backend for Frontend) proxy (planned for Phase 2).

```
[ブラウザ Browser] ──音声 audio──▶ [API Routes (BFF)] ──▶ [AmiVoice API]（音声→テキスト）
 録音・計測・表示              キーを保持 hold keys    ──▶ [Claude Haiku]（一言フィードバック）
```

> Phase 1（現在地）では API は未使用。モックデータで `calculateMetrics` の動作を確認している。  
> Phase 1 (current): no API yet — metrics are verified with mock data.

---

## ✅ Progress / 進捗

### Phase 1 — Step 1（完了 / Done）

評価指標の純粋関数・単体テスト・モック UI を完成。  
Completed the pure metric function, unit tests, and mock UI.

- [x] `segments` から指標を算出する **純粋関数**（`lib/metrics/calculateMetrics.ts`）
- [x] **Vitest 単体テスト**（6 本・異常系・正常系・境界値）
- [x] モックデータでの **UI 動作確認**（認識テキスト表示 + 計測ボタン + 結果表示）

### Phase 1 — Step 2 以降（予定 / Planned）

- [ ] ブラウザ録音（MediaRecorder）
- [ ] API Routes 経由で AmiVoice 連携
- [ ] Claude Haiku で一言フィードバック生成
- [ ] Vercel デプロイ + 環境変数（`AMIVOICE_API_KEY` / `ANTHROPIC_API_KEY`）

---

## 📐 Metrics Spec / 指標仕様

### 入力・出力 / Input & Output

```typescript
// 入力 / Input（AmiVoice レスポンスの一部を詰め替えた型）
interface AmiVoiceSegment {
  starttime: number; // ミリ秒 / ms
  endtime: number;   // ミリ秒 / ms
}
interface AmiVoiceResponse {
  text: string;
  segments: AmiVoiceSegment[]; // 各発話区間 / per-utterance segments
}

// 出力 / Output
interface ReadingMetrics {
  pureSpeakingSpeed: number; // 純粋発話速度（文字/分）/ chars per minute
  stagnationRate: number;    // 淀み率（0〜1）/ stagnation ratio (0–1)
}

// 純粋関数 / Pure function
function calculateMetrics(response: AmiVoiceResponse): ReadingMetrics
```

### 算出ロジック / Calculation

| 指標 / Metric | 式 / Formula |
|---|---|
| 純粋発話時間 / pure speaking time | `totalSpeakingTimeMs` = Σ(endtime − starttime) |
| 総経過時間 / total elapsed time | `totalElapsedTimeMs` = 最後の endtime − 最初の starttime |
| 純粋発話速度 / pure speaking speed | 文字数 ÷ 純粋発話時間(分)、`Math.round` で整数化 |
| 淀み率 / stagnation rate | (総経過時間 − 純粋発話時間) ÷ 総経過時間、小数第 3 位まで |

- **文字数 / character count:** 認識テキスト基準・コードポイント単位 `[...text].length`

### 異常系・境界値ガード / Guards

| 条件 / Condition | 戻り値 / Return |
|---|---|
| `segments` が空 / `text` が空 | `{ pureSpeakingSpeed: 0, stagnationRate: 0 }` |
| 純粋発話時間 0ms / 総経過時間 0ms | ゼロ除算を防ぎ 0 |
| 純粋発話時間 0 かつ総経過時間 > 0 | 発話なし（計算不能）として `{ 0, 0 }` |

### 任意（未実装）/ Optional (not yet implemented)

- **テンポ安定性（変動係数）** — 区間ごとの所要時間の標準偏差 ÷ 平均

---

## ⚖️ Design Decisions / 仕様判断

| 項目 / Topic | 決定内容 / Decision |
|---|---|
| 指標名 / metric name | `stagnationRate`（淀み率）。`silenceRate` は意味が狭いため見送り |
| 文字数 / character count | 認識テキスト基準。元テキスト基準は飛ばし読みで速度が過大評価されるため見送り |
| マッパー / mapper | 生 AmiVoice レスポンス（`results` 形式）→ `AmiVoiceResponse` への詰め替えは純粋関数の外に 1 枚 |
| テスト配置 / test location | Step 1 では `lib/metrics/` 直下（co-locate） |

---

## 🧪 Tests / テスト

`npm test` で 6 本実行（すべて PASS）。

| カテゴリ / Category | 内容 / Case |
|---|---|
| 異常系 / error | `segments: []`、`text: ""`、両方空 → `{ 0, 0 }` |
| 境界 / boundary | ゼロ幅区間（`starttime === endtime`）→ 速度 0、割り算が壊れない |
| 正常系 / normal | 1 区間・無音なし → 速度 100 字/分、淀み率 0 |
| 無音あり / with pause | 2 区間・無音 3 秒 → 速度 80 字/分、淀み率 0.167 |

---

## 🖥 Mock UI / モック画面の構成

画面の見た目は Claude で作成したたたき台をベースに、計測ロジックは `lib/metrics/calculateMetrics.ts` に接続しています。  
UI layout from a Claude mockup; metrics powered by `lib/metrics/calculateMetrics.ts`.

| 要素 / Element | 役割 / Role |
|---|---|
| サンプル切替タブ | `mockData.ts` の 2 パターンを選択 / pick one of two presets |
| 原稿用紙グリッド | 認識テキストを 1 文字ずつ表示 / recognized text, one char per cell |
| 計測するボタン | `calculateMetrics()` を実行 / runs the pure function |
| 結果カード | 純粋発話速度・淀み率（%）を表示 / speed (chars/min) and stagnation (%) |

画面キャプチャは上記 **Screenshots / 画面イメージ** セクションを参照。  
See the **Screenshots** section above for captures.

---

## 🗺 Roadmap / ロードマップ

**Phase 1（積み上げ式 / incremental）**

1. ✅ 純粋関数 + Vitest + モック UI
2. ブラウザ録音（MediaRecorder）
3. API Routes 経由で AmiVoice 連携
4. Claude Haiku で一言フィードバック生成
5. Vercel デプロイ + 環境変数

**Phase 2 以降 / Later**

編集距離による正確性、テンポ安定性の本採用、抑揚（感情解析エンジン）、履歴表示、デザイン磨き込み。

Accuracy via edit distance, tempo stability (CV), prosody, history, and UI polish.
