import { NextRequest, NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";
import { FEEDBACK_PROMPT } from "@/lib/feedback/prompt";
import { FeedbackFacts } from "@/lib/feedback/types";


// POST だけ受け付ける
export async function POST(request: NextRequest) {
    // Claudeクライアント
    const claudeClient = new Anthropic();
    // サーバー環境変数から API キーを取得（ブラウザには絶対出さない）
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "ANTHROPIC_API_KEY is not configured" },
            { status: 500 }
        );
    }
    claudeClient.apiKey = apiKey;

    // サーバー環境変数から モデル を取得
    const claudeModel = process.env.ANTHROPIC_MODEL;
    if (!claudeModel) {
        return NextResponse.json(
            { error: "ANTHROPIC_MODEL is not configured" },
            { status: 500 }
        );
    }

    // リクエストからパラメータを取得
    let feedbackFacts: FeedbackFacts | null = null;
    try {
        const body = await request.json();
        if ((body.pureSpeakingSpeed ?? "") === ""
            || (body.pureSpeakingSpeedEvaluation ?? "") === ""
            || (body.stagnationRate ?? "") === ""
            || (body.stagnationRateEvaluation ?? "") === "") {
            // 空文字はそのまま、nullやundefinedは空文字に変えてチェック
            // 空文字、null、undefinedはパラメータが不足していることを意味する
            return NextResponse.json(
                { error: "pureSpeakingSpeed, pureSpeakingSpeedEvaluation, stagnationRate, stagnationRateEvaluation are required" },
                { status: 400 }
            );
        }
        feedbackFacts = {
            pureSpeakingSpeed: Number(body.pureSpeakingSpeed),
            pureSpeakingSpeedEvaluation: body.pureSpeakingSpeedEvaluation,
            stagnationRate: Number(body.stagnationRate),
            stagnationRateEvaluation: body.stagnationRateEvaluation,
        }
    } catch (error) {
        return NextResponse.json(
            { error: "request is not valid" },
            { status: 400 }
        );
    }

    // Claude API からメッセージを取得
    try {
        const apiResponse = await claudeClient.messages.create({
        model: claudeModel,
        // 100文字程度なので100トークン以下の消費だと予想するが
        // 念のため256トークンにしておく
        max_tokens: 256,
        system: [
            {
                type: "text",
                text: FEEDBACK_PROMPT,
                // 明示的キャッシュを利用
                cache_control: { type: "ephemeral" },
            }
        ],
        messages: [
            {
                role: "user",
                content: JSON.stringify(feedbackFacts),
            },
            ],
        });
        const textContent = apiResponse.content[0]?.type === "text" ? apiResponse.content[0].text : "";
        return NextResponse.json({ feedback: textContent });
    } catch (error) {
        return NextResponse.json(
            { error: "failed to get api response" },
            { status: 500 }
        );
    }
}
