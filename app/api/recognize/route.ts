import { NextRequest, NextResponse } from "next/server";

// AmiVoiceエンドポイント ログ保存なし（あり版は /v1/recognize）
const AMIVOICE_ENDPOINT =
    "https://acp-api.amivoice.com/v1/nolog/recognize";
// 会話_汎用（マイページで利用可能エンジン要確認）
const AMIVOICE_ENGINE = "-a-general";

// POST だけ受け付ける（Java の @PostMapping 相当）
export async function POST(request: NextRequest) {
    // サーバー環境変数から API キーを取得（ブラウザには絶対出さない）
    const apiKey = process.env.AMIVOICE_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "AMIVOICE_API_KEY is not configured" },
            { status: 500 }
        );
    }

    // ブラウザから multipart/form-data を受け取る
    const incoming = await request.formData();
    const audio = incoming.get("audio");

    // 音声ファイルの存在・型チェック（File or Blob）
    if (!(audio instanceof Blob)) {
        return NextResponse.json({ error: "audio is required" }, { status: 400 });
    }

    // AmiVoice 向け FormData を新規組み立て（中継用）
    const outgoing = new FormData();
    outgoing.append("u", apiKey);
    outgoing.append("d", AMIVOICE_ENGINE);
    // 音声は必ず最後に配置すること（multipartの作法）
    // 認証や設定を先に読み込んで、最後に音声を順次受け取る
    outgoing.append("a", audio, "recording.webm");

    // AmiVoice 同期 HTTP API へ fetch（サーバー → 外部 API）
    const amiRes = await fetch(AMIVOICE_ENDPOINT, {
        method: "POST",
        // 認証ヘッダはmultipartの"u"パートが担当するので不要
        body: outgoing,
    });

    // AmiVoice のレスポンスをそのまま（または JSON パースして）返す
    const body = await amiRes.text();
    return new NextResponse(body, {
        status: amiRes.status,
        headers: { "Content-Type": amiRes.headers.get("Content-Type") ?? "application/json" },
    });
}
