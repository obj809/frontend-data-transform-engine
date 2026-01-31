"use client";

type SubmitButtonState =
  | "disabled"
  | "ready"
  | "uploading"
  | "success"
  | "error";

interface SubmitButtonProps {
  state: SubmitButtonState;
  onClick: () => void;
}

export default function SubmitButton({ state, onClick }: SubmitButtonProps) {
  const isDisabled = state === "disabled" || state === "uploading";

  const stateStyles: Record<SubmitButtonState, string> = {
    disabled: "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed",
    ready:
      "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 cursor-pointer",
    uploading: "bg-green-400 dark:bg-green-700 cursor-wait animate-pulse",
    success: "bg-green-500 dark:bg-green-600 cursor-pointer",
    error:
      "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 cursor-pointer",
  };

  return (
    <button
      data-testid="submit-button"
      data-state={state}
      onClick={onClick}
      disabled={isDisabled}
      className={`h-18 w-18 rounded-md text-4xl transition-colors ${stateStyles[state]}`}
    >
      ⚙️
    </button>
  );
}
