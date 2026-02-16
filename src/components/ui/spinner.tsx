import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
};

export function Spinner({ className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "h-8 w-8 rounded-full border-3 border-gray-200 border-t-gray-600 animate-spin",
        className
      )}
      aria-label="로딩 중"
    />
  );
}
