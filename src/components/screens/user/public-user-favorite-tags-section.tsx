import Link from "next/link";
import { UserRound } from "lucide-react";
import type { PublicUserFavoriteTagsSectionProps } from "@/types/public-user-profile";

export default function PublicUserFavoriteTagsSection({
  title,
  items,
  emptyText,
  large = false,
}: PublicUserFavoriteTagsSectionProps) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-gray-50 ${large ? "p-5" : "p-4"}`}>
      <h3 className={`${large ? "text-base" : "text-sm"} font-semibold text-gray-900`}>{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">{emptyText}</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2.5">
          {items.map((item) => (
            <Link
              key={`${title}-${item.href}-${item.label}`}
              href={item.href}
              className={`inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-gray-400 ${
                large ? "px-3 py-2 text-sm" : "px-2.5 py-1.5 text-sm"
              }`}
            >
              {/* 이미지가 있으면 작은 원형 썸네일 표시, 없으면 기본 아이콘 */}
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.label}
                  className={`shrink-0 rounded-full object-cover ${large ? "h-6 w-6" : "h-5 w-5"}`}
                />
              ) : (
                <span
                  className={`flex shrink-0 items-center justify-center rounded-full bg-gray-200 ${large ? "h-6 w-6" : "h-5 w-5"}`}
                >
                  <UserRound className={large ? "h-3.5 w-3.5 text-gray-500" : "h-3 w-3 text-gray-500"} />
                </span>
              )}
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
