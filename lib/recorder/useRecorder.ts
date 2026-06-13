import { useState, useRef } from "react";
import { RecordingPhase } from "./types";
import { MAX_RECORDING_TIME_MS } from "./constants";
import { pickBrowserMimeType } from "./mimeType";

/**
 * 録音のフック
 * @returns 
 * - recordingPhase: 録音の状態
 * - errorMessage: エラーメッセージ
 * - audioBlob: 録音データ
 * - audioUrl: 録音データのURL
 * - selectedMimeType: 選択されたMIMEタイプ
 * - showAudioPlayer: 録音再生プレイヤーの表示可否
 * - handleRecordingStart: 録音の開始ボタンのクリックハンドラ
 * - handleRecordingStop: 録音の停止ボタンのクリックハンドラ
 */
export function useRecorder(): {
    recordingPhase: RecordingPhase;
    errorMessage: string | null;
    audioBlob: Blob | null;
    audioUrl: string | null;
    selectedMimeType: string | null;
    showAudioPlayer: boolean;
    handleRecordingStart: () => Promise<void>;
    handleRecordingStop: () => void;
} {
    const [recordingPhase, setRecordingPhase] = useState<RecordingPhase>(RecordingPhase.Idle);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [selectedMimeType, setSelectedMimeType] = useState<string | null>(null);
    const showAudioPlayer = audioBlob !== null &&
        (recordingPhase === RecordingPhase.Done || recordingPhase === RecordingPhase.Error);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null); // 録音エンジン
    const streamRef = useRef<MediaStream | null>(null);          // 録音ストリーム
    const chunksRef = useRef<Blob[]>([]);                        // 録音データの断片保持
    const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 自動停止タイマー
    const selectedMimeTypeRef = useRef<string | null>(null);     // 選択されたMIMEタイプ
    const audioUrlRef = useRef<string | null>(null);             // revoke漏れ防止のため最新のURL
    
    function setAudioUrlSafe(url: string | null): void {
        // 最新のURLを保持
        audioUrlRef.current = url;
        // 画面表示用のURLを設定
        setAudioUrl(url);
    }
    
    /**
     * 録音のセットアップ
     */
    async function setupRecording(): Promise<void> {
        const mimeType = pickBrowserMimeType();
        if (!mimeType) {
            throw new Error("このブラウザでは録音形式に対応していません");
        }
        selectedMimeTypeRef.current = mimeType;
    
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
    
        chunksRef.current = [];
    
        // 録音エンジンの作成
        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;
    
        // 録音中のデータ断片コールバック
        recorder.ondataavailable = (event: BlobEvent) => {
            if (event.data.size > 0) {
                // 録音データが存在する場合、断片に追加
                chunksRef.current.push(event.data);
            }
        };
    
        // 録音停止コールバック
        recorder.onstop = () => {
            if (!selectedMimeTypeRef.current) {
                setRecordingPhase(RecordingPhase.Error);
                setErrorMessage("録音データのMIMEタイプが未設定です");
                // 録音ストリームを停止
                stream.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
                mediaRecorderRef.current = null;
                return;
            }
            // 録音データの断片をBlobに変換
            const blob = new Blob(chunksRef.current, { type: selectedMimeTypeRef.current });
            // 録音データのBlobをURLに変換
            const url = URL.createObjectURL(blob);
            // ここまで来ればURLの作成に成功しているので、前回のURLをrevoke
            if (audioUrlRef.current) {
                // 前回の録音データのURLをクリア（revoke漏れ防止のため最新のURLを使用）
                URL.revokeObjectURL(audioUrlRef.current);
            }
            setAudioUrlSafe(url);
            // 録音データのBlobを設定
            setAudioBlob(blob);
            chunksRef.current = [];
            setRecordingPhase(RecordingPhase.Done);
            // MimeTypeを設定
            setSelectedMimeType(selectedMimeTypeRef.current);
            // 録音ストリームを停止
            stream.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            mediaRecorderRef.current = null;
        };
    
        recorder.start();
    }
    
    /**
     * 録音の手動および自動停止
     */
    function stopRecording(): void {
        if (autoStopTimerRef.current !== null) {
            // 自動停止タイマーをクリア
            clearTimeout(autoStopTimerRef.current);
            autoStopTimerRef.current = null;
        }
        const recorder = mediaRecorderRef.current;
        // 録音エンジンが存在し、録音中の場合、停止
        if (recorder && recorder.state !== "inactive") {
            recorder.stop();
        }
    }
    
    /**
     * 録音の開始ボタンのクリックハンドラ
     */
    const handleRecordingStart = async () => {
        // エラーメッセージをクリア
        setErrorMessage(null);
        try {
            await setupRecording();
            setRecordingPhase(RecordingPhase.Recording);
        
            // 自動停止タイマーを設定
            autoStopTimerRef.current = setTimeout(() => {
                stopRecording();
            }, MAX_RECORDING_TIME_MS);
        } catch (err) {
            // 録音ストリームを停止
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            mediaRecorderRef.current = null;
            setRecordingPhase(RecordingPhase.Error);
            setErrorMessage(
                err instanceof Error ? err.message : "マイクの取得に失敗しました"
            );
        }
    };
    
    /**
     * 録音の停止ボタンのクリックハンドラ
     */
    const handleRecordingStop = () => {
        stopRecording();
    };
      
    return {
        recordingPhase,
        errorMessage,
        audioBlob,
        audioUrl,
        selectedMimeType,
        showAudioPlayer,
        handleRecordingStart,
        handleRecordingStop,
    };
}
