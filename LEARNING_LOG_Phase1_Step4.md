# LEARNING_LOG — Phase 1（Step 4）

音読速度計測アプリ（Reading Speed Meter）の Phase 1 / Step 4 における開発記録。  
Phase 1 Step 3（`LEARNING_LOG_Phase1_Step3.md`）の続き。後から振り返り、コンテスト応募時の「何を自分でやったか」の説明材料として残す。

**期間のゴール:** 算出済みメトリクスを Claude Haiku に渡し、「褒め 1 文 + 改善 1 つ」の一言フィードバックを生成する。計算・しきい値判定はコード側、言語化のみ LLM。  
**結果:** 2026年6月時点で Step 4 完了（curl / ブラウザ正常系・フィードバック API エラー系確認済み、Vitest 28 本 PASS、`npm run build` 成功）。Phase 1 の**機能開発**は本 Step で完了。Step 5（Vercel デプロイ）は別途。

---

## 開発スタイル（Step 4）

| 項目 | 内容 |
|---|---|
| Step 1〜3 | ヒント中心〜協業強化。設計は表から選び、コードは自分で書く |
| Step 4 | **同じ協業モードを継続**。5 つの判断ポイント（ルート / ラベル化 / JSON / プロンプト / エラー UX）を表から選択してから実装。Route 骨子・Vitest 例は AI 例示 + 1 行解説を取り込み自分で組み込む |
| 自分が握るもの | しきい値の根拠（アナウンサー基準 300 字/分など）、MVP スコープ（正確性は Phase 2）、プロンプト文面、`prompt.ts` の調整、原稿・UI 文言、動作確認、AI 提案の検証（文献・音読実測） |
| 進め方 | 1 ステップ提示 → 自分で書く → 「OK」/「動きました」でレビュー → 次へ |
| Git | Step 4 関連 3 論理コミット（下記）。見た目仕上げ（古典原稿・Phase 1 完了表示）はコミット前または追加コミット予定 |

---

## 自分が実装した部分

### Git 運用

| コミット | メッセージ | 主な内容 |
|---|---|---|
| `f19b790` | feat: 境界値・ラベリング設定 | `thresholds.ts`、`labelMetrics.ts`、`labelMetrics.test.ts`、`lib/feedback/types.ts` |
| `442e14b` | feat: ClaudeAPI連携追加 | `app/api/feedback/route.ts`、`prompt.ts`、`.env.local` に `ANTHROPIC_*`、`@anthropic-ai/sdk` |
| `97c1ef6` | feat: フィードバックの画面表示 | `page.tsx` 配線、`FeedbackPhase`、フィードバック UI |

### Step 4-1: しきい値 → ラベル化（T1）

AI の表から **T1（`thresholds.ts` + `labelMetrics.ts` + Vitest）** を選択。速度・淀みの境界値は自分で根拠を整理して決定。

| ファイル | 自分で書いた内容 |
|---|---|
| `lib/metrics/thresholds.ts` | 速度 5 段階・淀み率 5 段階の境界定数（`as const`） |
| `lib/metrics/labelMetrics.ts` | `ReadingMetrics` → `FeedbackFacts` の純粋関数。内部ヘルパー `labelPureSpeakingSpeed` / `labelStagnationRate` |
| `lib/feedback/types.ts` | `FeedbackFacts` 型（Haiku 入力 DTO） |
| `lib/metrics/labelMetrics.test.ts` | 境界値 13 本（149/150、350/351、淀み 0%/20% など）+ mockData アンカー相当の数値 |

**しきい値（自分で決めた内容）**

| 軸 | ラベル | 範囲 |
|---|---|---|
| 速度（字/分） | 遅い / やや遅い / 標準 / やや速い / 速い | <150 / 150–199 / 200–299 / 300–350 / >350 |
| 速度の根拠 | アナウンサー基準 **300 字/分** を「やや速い」帯の下限に採用（学術論文より一般論・業界目安） |
| 淀み率（%） | 少ない / やや少ない / 普通 / やや多い / 多い | 0% / 1–5% / 6–10% / 11–20% / >20% |
| 淀みの根拠 | 学術論拠は薄いため **アプリ指標として独自定義**（ポーズなし＝流暢とは限らない、という一般論を踏まえ MVP で採用） |

※ 淀み率ラベル中間帯は速度の「標準」と混同しないよう **「普通」** を使用（レビュー指摘を反映）。

### Step 4-2: 型整理

4-1 と同時に `FeedbackFacts` を `lib/feedback/types.ts` に配置。独立ステップとしてはスキップ相当。

### Step 4-3 / 4-4: Claude API Route（BFF）

AI の表から **A（`/api/feedback` 新設）** を選択。`/api/recognize` は変更しない。

| 内容 | 自分で書いたこと |
|---|---|
| 環境変数 | `.env.local` に `ANTHROPIC_API_KEY`、`ANTHROPIC_MODEL`（例: `claude-haiku-4-5`） |
| Route | `app/api/feedback/route.ts` — JSON 受信 → Messages API → `{ feedback: text }` 返却 |
| バリデーション | `?? ""` による存在チェック（`0` を有効値として通過） |
| プロンプト | `lib/feedback/prompt.ts` — 静的 `FEEDBACK_PROMPT`（P1: 温かいコーチ、2 文、100 字は**努力目標**） |
| キャッシュ | `system` に `cache_control: { type: "ephemeral" }` |
| 動作確認 | curl で `FeedbackFacts` 相当 JSON を POST。キー欠落時 500 も確認 |

※ 初版返却キー `feadback` typo、初版バリデーション `!value`（0 弾き）をレビュー後に修正。

### Step 4-5: ブラウザ配線

| 内容 | 自分で書いたこと |
|---|---|
| `handleMeasure` | 計測成功後 `labelMetrics(metrics)` → `POST /api/feedback` → `setFeedback` |
| state | `feedback: string \| null` |
| リセット | 計測開始・`selectSample` で `feedback` を null に |

### Step 4-6: フィードバック状態（F1）

AI の表から **F1（`FeedbackPhase` を `AnalysisPhase` と別 enum）** を選択。

| 内容 | 自分で書いたこと |
|---|---|
| `lib/feedback/types.ts` | `FeedbackPhase` enum（Idle / Generating / Generated / Error） |
| `handleMeasure` | **二段 try/catch** — 外側: AmiVoice〜計測、内側: フィードバックのみ |
| 成功順序 | 先に `setMetrics` + `AnalysisPhase.Analyzed`、その後 Haiku 呼び出し |
| 失敗 UX | フィードバック失敗時も指標は表示維持。`feedbackPhase.Error` + `feedbackErrorMessage` |
| UI | 「フィードバック生成の進捗状況」セクション。`Generating` 中は録音・タブ・計測を disabled |
| 検証 | `ANTHROPIC_API_KEY` を一時除去し、計測完了 + 指標表示 + フィードバック 500 を確認。キー復帰後に正常系再確認 |

### 見た目・原稿の仕上げ（Step 4 締め）

| 内容 | 自分で書いたこと |
|---|---|
| `lib/metrics/mockData.ts` | あいうえお系 → **平家物語・方丈記**の冒頭抜粋（表示専用。計測は録音 Blob のみ） |
| 原稿長 | 自分で音読し **10 秒に収まるよう文字数を削減**（長文時は約 370 字/分必要と体感） |
| 出典 | 作者表記を修正（`（伝）信濃前司行長` / 鴨長明）。**AI レビューの誤りを文献で裏取りして訂正** |
| `app/page.tsx` | シール「Phase 1 機能開発完了」、`rsm-sub` を AmiVoice → Haiku の流れに。「読み上げ原稿を選ぶ」「読み上げ原稿」。フッターに MVP 限界（照合なし・間の考慮なし） |

### 仕様判断（自分で決めたこと）

| 項目 | 決定内容 |
|---|---|
| ルート | **A** — `/api/feedback` 新設。責務分離継続 |
| ラベル化 | **T1** — `thresholds.ts` + `labelMetrics.ts` + Vitest |
| Haiku 入力 | 当初 **J1（日本語キー）** を選択後、実装は **英語キー + `prompt.ts` 整合** に変更（`FeedbackFacts` とプロンプトのキー名を一致） |
| 正確性 | **Phase 2 まで送らない**（MVP）。Haiku に原稿全文も渡さない |
| プロンプト | **P1** — 温かいコーチ。100 字は努力目標（LLM は文字数を正確に測れない） |
| エラー UX | **F1** — `FeedbackPhase` 独立。計測成功 + フィードバック失敗を分離 |
| 設計の背骨 | Service 層 = 計算・しきい値・ラベル / プレゼン層 = Haiku による言語化のみ |

### 動作確認（自分で実施）

- `npm test` — **28 本 PASS**（+13 `labelMetrics.test.ts`）
- `npm run build` — 成功（`/api/feedback` ルート含む）
- curl: `/api/feedback` に `FeedbackFacts` JSON → `{ feedback: "..." }`
- curl: `stagnationRate: 0` が 400 にならないこと
- ブラウザ: 録音 → 計測 → 指標 + AI フィードバック表示
- ブラウザ: API キー欠落 → 指標は表示、フィードバックのみエラー
- 音読実測: 長い原稿は 10 秒録音上限と両立しない → 文字数調整

---

## AI（Cursor）に頼った部分

### 進行・設計支援

| 領域 | AI の役割 | 自分の関与 |
|---|---|---|
| Step 4 開始 | 現状整理 + **5 判断ポイント**を「疑問点 + ヒント + 方針表」で提示 | A / T1 / J1 / P1 / F1 を選択 |
| 小ステップ分割 | 4-1〜4-7 の作業順 | 各ステップ完了後に「OK」「動きました」で確認 |
| しきい値案 | 速度・淀みの仮境界表 | **アナウンサー 300 字/分** 等、自分で根拠を付けて確定 |
| MVP 線引き | 正確性・原稿渡しは Phase 2 と整理 | 自分で「今回はやらない」と明言してスコープ固定 |

### 定型コードの例示（1 行ずつ解説 + Java 比較）

| 領域 | AI が提示した内容 | 自分の関与 |
|---|---|---|
| `labelMetrics.ts` 骨子 | 純粋関数 + `%` 変換 + 境界 if | 定数名・テスト 13 本・「普通」ラベルを自分で実装 |
| `app/api/feedback/route.ts` 骨子 | SDK、`FEEDBACK_PROMPT`、`cache_control`、返却形式 | バリデーション・try/catch・typo 修正を自分で反映 |
| `handleMeasure` 配線 | fetch + 二段 try/catch の流れ | `FeedbackPhase` state・disabled 拡張・UI セクションを自分で追加 |
| curl 例 | PowerShell 向け POST 例 | 自分で実行・キー除去テスト |

### コードレビュー

| 領域 | AI の指摘 | 自分の対応 |
|---|---|---|
| `feadback` typo | 返却キー誤字 | `feedback` に修正 |
| バリデーション `!value` | `stagnationRate: 0` が 400 | `=== undefined` / `?? ""` に変更 |
| 生 JSON 返却 | BFF は `{ feedback }` に絞ると UI が楽 | テキスト抽出して返却 |
| F1 未達 | フィードバック失敗で `AnalysisPhase.Error` になる | 内側 try/catch + `FeedbackPhase` を実装 |
| 再計測時 | `feedbackPhase` が残る | 計測開始時に `Idle` リセット |
| J1 vs 英語キー | `prompt.ts` と JSON キーの不一致 | 英語キー + プロンプト側を整合（または日本語キー化の選択肢提示） |
| **古典文学の出典** | **AI が平家物語/方丈記の冒頭を逆に説明** | **自分で文献確認し、実装が正しいと判断。AI 指摘を却下** |

### AI がコードを直接書いた部分

- **なし**（本 Step でも AI は方針表・骨子例示・レビューのみ。実装ファイルはすべて自分の手で作成）

---

## 学習したこと

### アーキテクチャ（Service / プレゼン分離）

| トピック | 内容 | Java との対比 |
|---|---|---|
| **二段パイプライン** | `calculateMetrics`（数値）→ `labelMetrics`（ラベル）→ Haiku（文章） | Entity → ViewModel → 外部 API 用 DTO → テンプレート生成 |
| **BFF 2 本** | AmiVoice 用 `/api/recognize`、Claude 用 `/api/feedback` | 外部サービスごとに `@RestController` を分離 |
| **Haiku に渡すもの** | `FeedbackFacts` 4 フィールドのみ。segments・原稿・生 JSON は渡さない | LLM に「判定済み事実」だけ渡し、再計算させない |
| **MVP スコープ** | 正確性（編集距離）・原稿照合は Phase 2。フッターでユーザーに明示 | 機能フラグ / 将来拡張ポイントを先に決める |

### Claude API（Messages API）

| トピック | 内容 | Java との対比 |
|---|---|---|
| **静的 system** | `FEEDBACK_PROMPT` を Route から参照。user は `JSON.stringify(facts)` のみ | 固定 system prompt + 可変 user payload |
| **プロンプトキャッシュ** | `cache_control: { type: "ephemeral" }` on system block | 変更の少ない設定をキャッシュ可能な層に置く |
| **100 字制約** | 厳密 enforce ではなく**努力目標**（LLM は文字数カウントが不正確） | バリデーションはコード側、LLM は自然言語生成に専念 |
| **SDK** | `@anthropic-ai/sdk` の `messages.create` | 公式 HTTP クライアントラッパー |

### 純粋関数・テスト

| トピック | 内容 | Java との対比 |
|---|---|---|
| **T1 分離** | `thresholds.ts`（定数）と `labelMetrics.ts`（ロジック） | 設定クラス + Util / Mapper |
| **% 変換してからラベル** | `stagnationRate` 0.167 → 16.7% で閾値比較 | 表示単位に正規化してから判定 |
| **境界テスト 13 本** | 149/150、350/351、0%/20% 等を固定 assert | 境界値分析どおりの単体テスト |
| **`??` バリデーション** | `0` は falsy だが有効。`!value` とは別 | `Optional` / null チェックと empty チェックの区別 |

### React / 状態設計

| トピック | 内容 | Java との対比 |
|---|---|---|
| **F1: 第 3 の enum** | `RecordingPhase` / `AnalysisPhase` / `FeedbackPhase` | 録音ジョブ / 計測ジョブ / フィードバックジョブを別状態機械 |
| **二段 try/catch** | 計測成功後だけ内側 try で Haiku。失敗しても指標は Analyzed のまま | メイン TX 成功後のサブ処理失敗を分離 |
| **段階表示** | 指標 →「フィードバック生成中」→ 一言 | 非同期ステップごとに UI 更新 |
| **Generating 中ロック** | フィードバック待ち中も操作 disabled | 長時間非同期中の二重送信防止 |

### AI 協業・プロセス

| トピック | 内容 |
|---|---|
| **表から選んでから実装** | Step 3 と同様。5 判断ポイントを先に確定し、4-1〜4-6 を小ステップで進めた |
| **AI 回答は検証が必要** | 古典文学の出典を AI が逆に説明。**ドメイン知識は自分で裏取り**（文献・音読・curl） |
| **自分で dogfooding** | 長い原稿 + 10 秒録音 → 約 370 字/分必要と体感。しきい値設計と UX の接点を発見 |
| **レビューは取捨選択** | typo・`0` バリデーション等は採用。誤った出典指摘は却下 |
| **協業の型** | AI = 方針表 + 骨子 + レビュー / 自分 = 選択 + 実装 + 検証 + スコープ判断 |

---

## 成果物マップ（Step 4 完了時点）

```
reading-speed-meter/
├── app/
│   ├── api/
│   │   ├── recognize/route.ts    # Step 3: AmiVoice BFF
│   │   └── feedback/route.ts     # Step 4: Claude BFF（新規）
│   └── page.tsx                  # 計測 + フィードバック配線 + Phase 1 完了 UI
├── lib/
│   ├── feedback/
│   │   ├── types.ts              # FeedbackFacts, FeedbackPhase
│   │   └── prompt.ts             # FEEDBACK_PROMPT（静的）
│   └── metrics/
│       ├── thresholds.ts         # 速度・淀み境界（新規）
│       ├── labelMetrics.ts       # ラベル化純粋関数（新規）
│       ├── labelMetrics.test.ts  # +13 tests（新規）
│       └── mockData.ts           # 平家物語・方丈記（表示専用）
├── .env.local                    # AMIVOICE_* + ANTHROPIC_*
├── LEARNING_LOG_Phase1_Step1.md
├── LEARNING_LOG_Phase1_Step2.md
├── LEARNING_LOG_Phase1_Step3.md
└── LEARNING_LOG_Phase1_Step4.md  # 本ファイル
```

### データフロー（Step 4 完了時）

```
[ブラウザ]
  原稿表示（mockData.text のみ）
  録音 Blob
    → POST /api/recognize → mapAmiVoiceResponse → calculateMetrics
    → 指標表示（AnalysisPhase.Analyzed）

    → labelMetrics → FeedbackFacts
    → POST /api/feedback
    → feedback 表示（FeedbackPhase.Generated）

[API Routes / BFF]
  /api/recognize … AMIVOICE_API_KEY
  /api/feedback  … ANTHROPIC_API_KEY + ANTHROPIC_MODEL
                   system: FEEDBACK_PROMPT（cache_control: ephemeral）
                   user: JSON.stringify(FeedbackFacts)
```

---

## うまくいったこと / 反省点

### うまくいったこと

- **設計の背骨を守れた:** 計算・ラベルはコード、Haiku は言語化のみ。Step 1 の純粋関数思想が Step 4 までつながった
- **F1 のエラー分離:** キー除去テストで「指標は出る / フィードバックだけ落ちる」を実証できた
- **Vitest で labelMetrics を厚く:** 境界 13 本でしきい値表と実装のズレを防いだ
- **dogfooding:** 音読して原稿長と 10 秒制約のバランスを自分で調整。アプリの有用性を体感
- **MVP 判断:** 正確性・原稿渡しを Phase 2 に回し、締切内で Step 4 を完遂

### 反省点・次回へのメモ

- **AI のドメイン知識は信用しない:** 平家物語/方丈記の出典誤り。コンテスト説明でも「AI 提案は検証した」と書ける事例になった
- **README / スクリーンショット** は Step 3 時点のまま — 4-7 または Step 5 前に更新予定
- **LLM 出力のブレ:** 前置き・改行・改善優先順位がプロンプトどおりにならないことがある — Phase 2 で `improvementHint` をコード側で渡す案あり
- **`mockData` の `segments`:** UI では未使用（Step 1 遺産）。Phase 2 で `UiData` 型の簡素化を検討
- **Phase 1 完全完了** は Step 5（Vercel デプロイ）後。UI は「機能開発完了」と明示済み

---

## Phase 1 Step 5 以降（予定）

1. Vercel デプロイ + 環境変数（`AMIVOICE_API_KEY` / `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL`）
2. README 更新（Step 4 完了、28 tests、フィードバック画面キャプチャ）
3. **Phase 2:** 編集距離による正確性、`FeedbackFacts` 拡張、認識テキスト表示、原稿との比較 UX
4. （任意）`useAnalysis` フック化、`mockData` 型整理

---

*最終更新: Step 4 完了時（Claude Haiku フィードバック・Vitest 28 本 PASS・Phase 1 機能開発完了）*
