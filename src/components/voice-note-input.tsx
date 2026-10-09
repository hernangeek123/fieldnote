"use client";

import {
  AlertCircle,
  FileAudio,
  LoaderCircle,
  Mic,
  RotateCcw,
  Square,
  Trash2,
  Upload,
  WandSparkles,
} from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { transcribeFieldNoteAudio } from "@/app/app/actions";

const MAX_RECORDING_SECONDS = 120;
const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function recorderType() {
  const preferred = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"];
  return preferred.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function extensionFor(type: string) {
  if (type.includes("mp4")) return "m4a";
  if (type.includes("ogg")) return "ogg";
  if (type.includes("wav")) return "wav";
  return "webm";
}

export function VoiceNoteInput({ onStateChange, disabled = false }: {
  onStateChange?: (state: { dirty: boolean; busy: boolean }) => void;
  disabled?: boolean;
}) {
  const [note, setNote] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingErrorRef = useRef<string | null>(null);
  const dirty = Boolean(note || audioFile || isRecording);
  const busy = isRecording || isTranscribing;

  useEffect(() => {
    onStateChange?.({ dirty, busy });
  }, [dirty, busy, onStateChange]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function setSelectedAudio(file: File) {
    if (file.size > MAX_AUDIO_BYTES) {
      setError("The recording is too large. Keep it under 4 MB.");
      return;
    }

    setAudioFile(file);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setError(null);
  }

  function finishRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIsRecording(false);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    const recorder = recorderRef.current;
    const type = recorder?.mimeType || "audio/webm";
    const blob = new Blob(chunksRef.current, { type });
    chunksRef.current = [];
    recorderRef.current = null;

    if (recordingErrorRef.current) {
      setError(recordingErrorRef.current);
      recordingErrorRef.current = null;
      return;
    }
    if (blob.size === 0) {
      setError("No audio was captured. Check microphone access and try again.");
      return;
    }

    setSelectedAudio(
      new File([blob], `field-note.${extensionFor(type)}`, {
        type,
        lastModified: Date.now(),
      }),
    );
  }

  async function startRecording() {
    setError(null);
    setElapsedSeconds(0);

    if (!navigator.mediaDevices || !("MediaRecorder" in window)) {
      setError("Recording is not supported in this browser. Upload an audio file instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      recordingErrorRef.current = null;
      const type = recorderType();
      const recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = finishRecording;
      recorder.onerror = () => {
        recordingErrorRef.current = "Recording stopped unexpectedly. Try again or upload an audio file.";
        if (recorder.state === "recording") recorder.stop();
      };
      recorder.start(1000);
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((current) => {
          const next = current + 1;
          if (next >= MAX_RECORDING_SECONDS && recorderRef.current?.state === "recording") {
            recorderRef.current.stop();
          }
          return Math.min(next, MAX_RECORDING_SECONDS);
        });
      }, 1000);
    } catch {
      setError("Microphone access was not available. Allow access or upload an audio file.");
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function discardAudio() {
    setAudioFile(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setElapsedSeconds(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function chooseAudio(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setSelectedAudio(file);
  }

  async function transcribeAudio() {
    if (!audioFile) return;
    if (note.trim() && !window.confirm("Replace the current note with this transcript?")) return;

    setIsTranscribing(true);
    setError(null);
    const formData = new FormData();
    formData.set("audio", audioFile);

    try {
      const result = await transcribeFieldNoteAudio(formData);
      if (!result.ok) {
        setError(result.error);
      } else {
        setNote(result.transcript);
      }
    } catch {
      setError("The recording could not be transcribed. Your audio is still available to retry.");
    } finally {
      setIsTranscribing(false);
    }
  }

  return (
    <div className="mt-5">
      <label className="field-label" htmlFor="raw-note">What happened on the job?</label>

      <div className="border-y border-[#d7ddd7] bg-[#f7f9f6] px-4 py-5 sm:px-5">
        {!audioFile ? (
          <div className="flex flex-wrap items-center gap-3">
            {isRecording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#a63c32] px-4 text-sm font-semibold text-white hover:bg-[#8f3028]"
              >
                <Square size={15} fill="currentColor" aria-hidden="true" />
                Stop recording
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                disabled={disabled || isTranscribing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#176b3a] px-4 text-sm font-semibold text-white hover:bg-[#11562e] disabled:cursor-wait disabled:bg-[#8fa197]"
              >
                <Mic size={17} aria-hidden="true" />
                Record note
              </button>
            )}

            {!isRecording ? (
              <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#aeb9af] bg-white px-4 text-sm font-semibold text-[#344039] hover:bg-[#eef2ed]">
                <Upload size={17} aria-hidden="true" />
                Upload audio
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/mp4,video/webm"
                  capture="user"
                  onChange={chooseAudio}
                  disabled={disabled || isTranscribing}
                  className="sr-only"
                />
              </label>
            ) : null}

            {isRecording ? (
              <p className="w-24 font-mono text-sm font-semibold tabular-nums text-[#8a2e25]" aria-live="polite">
                {formatDuration(elapsedSeconds)} / 2:00
              </p>
            ) : null}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                <FileAudio size={18} className="shrink-0 text-[#377348]" aria-hidden="true" />
                <span className="truncate">{audioFile.name}</span>
                <span className="shrink-0 font-normal text-[#69736c]">
                  {(audioFile.size / 1024).toFixed(0)} KB
                </span>
              </p>
              <button
                type="button"
                onClick={discardAudio}
                disabled={disabled || isTranscribing}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-[#657068] hover:bg-[#e5ebe5] hover:text-[#8a2e25] disabled:opacity-50"
                title="Discard recording"
                aria-label="Discard recording"
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
            {previewUrl ? <audio className="mt-4 w-full" controls preload="metadata" src={previewUrl} /> : null}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={transcribeAudio}
                disabled={disabled || isTranscribing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#17201a] px-4 text-sm font-semibold text-white hover:bg-[#2c382f] disabled:cursor-wait disabled:bg-[#8fa197]"
              >
                {isTranscribing ? (
                  <LoaderCircle className="animate-spin" size={17} aria-hidden="true" />
                ) : error ? (
                  <RotateCcw size={17} aria-hidden="true" />
                ) : (
                  <WandSparkles size={17} aria-hidden="true" />
                )}
                {isTranscribing ? "Transcribing..." : error ? "Try transcription again" : "Transcribe recording"}
              </button>
            </div>
          </div>
        )}

        {error ? (
          <p className="mt-4 flex items-start gap-2 text-sm text-[#8a2e25]" role="alert">
            <AlertCircle className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
            {error}
          </p>
        ) : null}
      </div>

      <textarea
        id="raw-note"
        className="field-input mt-4 min-h-64 resize-y py-4 text-base leading-7"
        name="raw_note"
        required
        maxLength={10000}
        value={note}
        disabled={disabled || isTranscribing}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Replaced the leaking kitchen faucet for Maria. Used one chrome fixture and two supply lines. Two hours of labor..."
      />
    </div>
  );
}
