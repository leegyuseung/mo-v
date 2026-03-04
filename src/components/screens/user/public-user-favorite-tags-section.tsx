import Link from "next/link";
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
              className={`rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-gray-400 ${
                large ? "px-4 py-2.5 text-sm" : "px-3 py-2 text-sm"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
