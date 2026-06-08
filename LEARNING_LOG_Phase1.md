# LEARNING_LOG — Phase 1（Step 1）

音読速度計測アプリ（Reading Speed Meter）の Phase 1 / Step 1 における開発記録。  
後から振り返り、コンテスト応募時の「何を自分でやったか」の説明材料として残す。

**期間のゴール:** API を使わず、評価指標の純粋関数 + Vitest テスト + モック UI を完成させる。  
**結果:** 2026年6月時点で Step 1 完了（`npm test` 6 本 PASS、ブラウザ動作確認済み）。

---

## 開発スタイルの切り替え

| 項目 | 内容 |
|---|---|
| これまで | コードは自分で書き、AI はレビュー役 |
| Phase 1 以降 | **AI 協業開発**（締切があるため） |
| 自分が握るもの | 設計・技術選定・仕様判断・AI 提案の取捨選択・検証 |
| 透明性 | 本ログおよび README に、AI 利用範囲を明記する |

---

## 自分が実装した部分

### プロジェクト基盤

- `create-next-app` による Next.js プロジェクト作成（App Router / TypeScript）
- Vitest の導入、`package.json` の `"test": "vitest run"` 設定
- `lib/metrics/` ディレクトリ構成の採用（テストは同フォルダに co-locate）
- Git リポジトリの初期化（`reading-speed-meter/` をルートとする方針）

### ドメインロジック（`lib/metrics/`）

| ファイル | 自分で書いた内容 |
|---|---|
| `types.ts` | `AmiVoiceSegment` / `AmiVoiceResponse` / `ReadingMetrics`。後から UI 用に `UiData` を追加 |
| `calculateMetrics.ts` | ガード、純粋発話時間の `reduce`、速度・淀み率の算出、ゼロ除算ガード、丸め処理 |
| `calculateMetrics.test.ts` | 異常系 3 本、ゼロ幅区間 1 本、正常系 1 本、無音あり 1 本（計 6 テスト） |
| `mockData.ts` | サンプルデータ 2 件、`UiData` 配列 `MOCK_SAMPLES` の export |

### 画面（`app/`）

- Claude で作成した UI たたき台を `page.tsx` に貼り付け、Cursor のヒントに沿って Next.js 向けに修正
  - `"use client"` の追加
  - インライン `calculateMetrics` の削除 → `@/lib/metrics/calculateMetrics` の import
  - インライン `MOCK_SAMPLES` の削除 → `mockData.ts` への集約
  - `ReadingMetrics` 型付き `useState`、`selectSample(id: string)`、`if (!sample)` ガード
  - フッター文言の更新
- `layout.tsx` の `metadata`（title / description）と `lang="ja"` の設定

### 仕様判断（自分で決めたこと）

- **指標名:** `stagnationRate`（淀み率）を維持。`silenceRate` は中立的すぎるため見送り
- **計算不能:** 純粋発話時間 0 かつ総経過時間 > 0 → 発話なしとして `{ 0, 0 }` を返す
- **文字数:** 認識テキスト基準・コードポイント単位 `[...text].length`
- **丸め:** 速度は `Math.round`（整数）、淀み率は小数第 3 位（`Math.round(x * 1000) / 1000`）
- **`toFixed` は使わない:** 戻り値が文字列になるため、数値型を保つ実装を採用
- **テスト配置:** 専用 `tests/` フォルダではなく `lib/metrics/` 直下（Step 1 の規模に合わせる）
- **README:** 親フォルダの README を `reading-speed-meter/README.md` に統合し、親は削除

---

## AI（Cursor / Claude）に頼った部分

### Cursor（本セッション）

| 領域 | AI の役割 | 自分の関与 |
|---|---|---|
| 初期設計レビュー | フォルダ構成案、Step 分割、テスト観点表、仕様の不足点の洗い出し | 質問・判断・方針の確定 |
| 実装の進め方 | 1 ステップずつ「次に何をするか」を日本語で提示（ヒント中心） | 各ステップを自分でコーディング、「OK」で確認 |
| コードレビュー | 良い点 → 改善点の順でフィードバック | 指摘を反映（ゼロ除算ガード、テスト名修正など） |
| README 統合 | `reading-speed-meter/README.md` への親 README 統合・Getting Started 追加 | 統合方針の承認、親 README の削除 |
| `page.tsx` 移植 | Next.js 向け修正のヒント ①〜⑤（use client、import、型付けなど） | たたき台の貼り付けと、ヒントに沿った手直し |
| 用語説明 | Java 経験者向けの対比（Optional、DTO、BFF など） | 理解の確認・追加質問（`toFixed`、`silenceRate` など） |

### Claude（UI たたき台）

- モック画面の **見た目・レイアウト・CSS**（和風デザイン、原稿用紙グリッド、結果カード）
- たたき台内のインライン `calculateMetrics` / `MOCK_SAMPLES`（→ 後に自分でファイル分離に置き換え）

### もともと AI に依頼していた設計の出発点

- `calculateMetrics` の初期設計案（型定義・算出式・ガードの骨子）
- プロジェクト README の初版（仕様・ロードマップ・BFF 構成の文章）

---

## 学習したこと

### TypeScript / React / Next.js

| トピック | 内容 | Java との対比 |
|---|---|---|
| **純粋関数** | 外部状態・API に依存しない関数を `lib/` に置く | domain パッケージの Service（I/O なし） |
| **`"use client"`** | `useState` / `onClick` を使うコンポーネントは Client Component | サーバー（Servlet）ではなくブラウザ側 UI |
| **`reduce`** | 配列を 1 つの数値に畳み込む | `stream().mapToLong().sum()` |
| **`[...text].length`** | コードポイント単位の文字数 | サロゲートペアを考慮した文字カウント |
| **ジェネリクス付き state** | `useState<ReadingMetrics \| null>(null)` | `Optional<ReadingMetrics>` に近い |
| **`@/` import** | tsconfig の paths エイリアス | パッケージ import の短縮 |
| **`toFixed` の型** | 戻り値は `string`。数値を保つなら `Math.round` 等 | `String.format` と `parseDouble` の往復に相当 |

### テスト（Vitest）

| トピック | 内容 |
|---|---|
| ファイル命名 | `*.test.ts` で Vitest が自動検出 |
| 構成 | `describe` / `test` / `expect(...).toEqual(...)` |
| テスト設計 | 異常系 → 境界 → 正常系の順で信頼性を積み上げる |
| co-locate | Step 1 規模では `lib/metrics/` 直下で十分。大規模化したら `tests/` 分離を検討 |

### 設計・仕様

| トピック | 内容 |
|---|---|
| **淀み率の意味** | (総経過時間 − 純粋発話時間) / 総経過時間。無音検出そのものではない |
| **BFF** | API キーは Next.js API Routes に預け、ブラウザには出さない（Phase 2 以降） |
| **マッパー分離** | 生 AmiVoice レスポンス → `AmiVoiceResponse` の変換は純粋関数の外に 1 枚 |
| **DRY** | `mockData.ts` にデータを集約し、page / test で二重管理しない |
| **README 一元化** | アプリルートに 1 本。create-next-app テンプレ README は残さない |

---

## 成果物マップ（Step 1 完了時点）

```
reading-speed-meter/
├── app/
│   ├── layout.tsx          # metadata, lang=ja
│   └── page.tsx            # モック UI（Client Component）
├── lib/metrics/
│   ├── types.ts
│   ├── calculateMetrics.ts
│   ├── calculateMetrics.test.ts   # 6 tests
│   └── mockData.ts
├── README.md
├── LEARNING_LOG_Phase1.md  # 本ファイル
└── package.json            # vitest run
```

### 動作確認済みの数値

| サンプル | 純粋発話速度 | 淀み率（UI 表示） |
|---|---|---|
| サンプル1（なめらか） | 100 文字/分 | 0% |
| サンプル2（淀む） | 80 文字/分 | 16.7% 前後 |

---

## うまくいったこと / 反省点

### うまくいったこと

- **段階的実装:** 型 → ガード → 計算 → テスト → UI の順で進め、都度 `npm test` で確認できた
- **仕様を先に固定:** 文字数・丸め・計算不能の扱いを実装前に決め、テスト期待値がブレなかった
- **たたき台の活用:** UI デザインは Claude、ロジック接続は自分 + Cursor ヒントで役割分担できた

### 次回へのメモ

- README の Step 1 チェックリストを `[x]` に更新する
- `page.tsx` のインライン `<style>` は Phase 2 以降で CSS Module 等への移行を検討
- 次フェーズ（Step 2）: ブラウザ録音（MediaRecorder）から着手

---

## Phase 2（予定）で触ること

1. ブラウザ録音（MediaRecorder）
2. API Routes 経由の AmiVoice 連携
3. Claude Haiku による一言フィードバック
4. Vercel デプロイ + 環境変数

---

*最終更新: Step 1 完了時（純粋関数・テスト・モック UI）*
