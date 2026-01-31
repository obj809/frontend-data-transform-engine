"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, uploadFile } from "@/lib/api";
import { FileDropZone } from "@/app/components/FileDropZone";
import { SubmitButton } from "@/app/components/SubmitButton";

interface ApiResponse {
  message: string;
}

interface StockDataResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  day_high: number;
  day_low: number;
  previous_close: number;
  timestamp: string;
}

type UploadStatus = "disabled" | "ready" | "uploading" | "success" | "error";

export default function Home() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">(
    "loading"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("disabled");
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [result, setResult] = useState<StockDataResult | null>(null);

  useEffect(() => {
    apiGet<ApiResponse>("/")
      .then(() => {
        setStatus("connected");
      })
      .catch(() => {
        setStatus("error");
      });
  }, []);

  const handleFileSelected = useCallback((file: File | null) => {
    setSelectedFile(file);
    setUploadStatus(file ? "ready" : "disabled");
    setUploadMessage("");
    setResult(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setUploadStatus("uploading");
    setResult(null);
    try {
      const response = await uploadFile<StockDataResult>(
        "/upload",
        selectedFile
      );
      setUploadStatus("success");
      setResult(response);
      setUploadMessage("");
    } catch (err) {
      setUploadStatus("error");
      const error = err instanceof Error ? err : new Error("Upload failed");
      setUploadMessage(`Error: ${error.message}`);
    }
  }, [selectedFile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Enter" &&
        (uploadStatus === "ready" || uploadStatus === "error")
      ) {
        handleUpload();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [uploadStatus, handleUpload]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 px-16 py-32">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Data Transform Engine
        </h1>

        <div className="flex flex-col items-center gap-4">
          {status === "loading" && (
            <p className="text-zinc-600 dark:text-zinc-400">
              Connecting to backend...
            </p>
          )}

          {status === "connected" && (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-green-600 dark:text-green-400">
                Connected to API
              </span>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-red-600 dark:text-red-400">
                  Connection failed
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Make sure the backend is running at localhost:8000
              </p>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col items-center gap-4">
          <FileDropZone
            onFileSelected={handleFileSelected}
            onError={(error) => {
              setUploadMessage(`Error: ${error.message}`);
            }}
          />
          <SubmitButton state={uploadStatus} onClick={handleUpload} />
          {uploadMessage && (
            <p className="text-center text-sm text-red-600 dark:text-red-400">
              {uploadMessage}
            </p>
          )}
          {result && (
            <div className="mt-4 w-full rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <h3 className="mb-2 text-sm font-medium text-green-600 dark:text-green-400">
                Processed Result
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="text-zinc-500">Symbol:</span>
                <span className="font-mono">{result.symbol}</span>
                <span className="text-zinc-500">Name:</span>
                <span>{result.name}</span>
                <span className="text-zinc-500">Price:</span>
                <span className="font-mono">{result.price.toFixed(2)}</span>
                <span className="text-zinc-500">Change:</span>
                <span
                  className={`font-mono ${result.change >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {result.change >= 0 ? "+" : ""}
                  {result.change.toFixed(4)}
                </span>
                <span className="text-zinc-500">Change %:</span>
                <span
                  className={`font-mono ${result.change_percent >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {result.change_percent >= 0 ? "+" : ""}
                  {result.change_percent.toFixed(6)}%
                </span>
                <span className="text-zinc-500">Day High:</span>
                <span className="font-mono">{result.day_high.toFixed(2)}</span>
                <span className="text-zinc-500">Day Low:</span>
                <span className="font-mono">{result.day_low.toFixed(2)}</span>
                <span className="text-zinc-500">Prev Close:</span>
                <span className="font-mono">
                  {result.previous_close.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
