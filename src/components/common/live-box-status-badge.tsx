import { Loader, Pause, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LiveBoxStatusBadgeProps } from "@/types/live-box-status-badge";

function getLiveBoxStatusBadgeClassName(status: string) {
  if (status === "진행중") return "bg-green-50 text-green-700 border-green-200";
  if (status === "종료") return "bg-red-50 text-red-700 border-red-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

function LiveBoxStatusIcon({ status }: { status: string }) {
  if (status === "진행중") {
    return <Loader className="h-3.5 w-3.5 animate-spin" />;
  }
  if (status === "종료") {
    return <X className="h-3.5 w-3.5" />;
  }
  return <Pause className="h-3.5 w-3.5" />;
}

export default function LiveBoxStatusBadge({ status, className }: LiveBoxStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        getLiveBoxStatusBadgeClassName(status),
        className
      )}
    >
      <LiveBoxStatusIcon status={status} />
      {status}
    </span>
  );
}
