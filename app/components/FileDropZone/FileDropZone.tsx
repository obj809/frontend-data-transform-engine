"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  DragEvent,
  ChangeEvent,
} from "react";

type DropZoneState = "idle" | "dragging" | "selected" | "error";

interface FileDropZoneProps {
  onFileSelected?: (file: File | null) => void;
  onError?: (error: Error) => void;
  accept?: string;
}

export default function FileDropZone({
  onFileSelected,
  onError,
  accept = ".json",
}: FileDropZoneProps) {
  const [state, setState] = useState<DropZoneState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidFile = useCallback(
    (file: File): boolean => {
      const extension = file.name
        .toLowerCase()
        .slice(file.name.lastIndexOf("."));
      return extension === accept;
    },
    [accept]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      setErrorMessage("");
      setFileName(file.name);
      setState("selected");
      onFileSelected?.(file);
    },
    [onFileSelected]
  );

  const clearSelection = useCallback(() => {
    setFileName("");
    setState("idle");
    onFileSelected?.(null);
  }, [onFileSelected]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      clearSelection();
    },
    [clearSelection]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state === "selected") {
        clearSelection();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state, clearSelection]);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState("dragging");
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState("idle");
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      if (files.length === 0) {
        setState("idle");
        return;
      }

      const file = files[0];
      if (!isValidFile(file)) {
        setState("error");
        setErrorMessage(`Only ${accept} files are accepted`);
        onError?.(new Error(`Only ${accept} files are accepted`));
        return;
      }

      handleFileSelect(file);
    },
    [isValidFile, accept, handleFileSelect, onError]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) {
        return;
      }

      const file = files[0];
      if (!isValidFile(file)) {
        setState("error");
        setErrorMessage(`Only ${accept} files are accepted`);
        onError?.(new Error(`Only ${accept} files are accepted`));
        return;
      }

      handleFileSelect(file);
      e.target.value = "";
    },
    [isValidFile, accept, handleFileSelect, onError]
  );

  const stateStyles: Record<DropZoneState, string> = {
    idle: "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900",
    dragging:
      "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950",
    selected:
      "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-950",
    error: "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950",
  };

  const stateText: Record<DropZoneState, string> = {
    idle: "Drop JSON file here or click to browse",
    dragging: "Release to select",
    selected: `Selected: ${fileName}`,
    error: errorMessage || "Selection failed",
  };

  const stateTextColor: Record<DropZoneState, string> = {
    idle: "text-zinc-600 dark:text-zinc-400",
    dragging: "text-blue-600 dark:text-blue-400",
    selected: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
  };

  return (
    <div
      data-testid="file-drop-zone"
      data-state={state}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex min-h-40 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${stateStyles[state]}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        data-testid="file-input"
      />
      <div className="flex flex-col items-center gap-1">
        {state === "idle" ? (
          <>
            <p
              className={`text-center text-sm font-medium ${stateTextColor[state]}`}
            >
              Upload a file to get started
            </p>
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
              Drop JSON file here or click to browse
            </p>
          </>
        ) : (
          <>
            <p
              className={`text-center text-sm font-medium ${stateTextColor[state]}`}
            >
              {stateText[state]}
            </p>
            {state === "selected" && (
              <button
                data-testid="clear-file-button"
                onClick={handleClear}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 underline"
              >
                Cancel
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
