"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface ApiResponse {
  message: string;
}

export default function Home() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    apiGet<ApiResponse>("/")
      .then((data) => {
        setMessage(data.message);
        setStatus("connected");
      })
      .catch(() => {
        setStatus("error");
      });
  }, []);

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
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-green-600 dark:text-green-400">
                  Connected
                </span>
              </div>
              <p className="text-lg text-zinc-800 dark:text-zinc-200">
                Backend says: {message}
              </p>
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
      </main>
    </div>
  );
}
