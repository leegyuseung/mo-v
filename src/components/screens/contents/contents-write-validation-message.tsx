"use client";

type ContentsWriteValidationMessageProps = {
  message?: string;
};

export default function ContentsWriteValidationMessage({
  message,
}: ContentsWriteValidationMessageProps) {
  return (
    <p className={`min-h-4 text-xs ${message ? "text-red-500" : "text-transparent"}`}>
      {message || "\u00a0"}
    </p>
  );
}
