import Link from "next/link";
import { UserRound } from "lucide-react";
import type { PublicUserHeaderSectionProps } from "@/types/public-user-profile";

export default function PublicUserHeaderSection({ identity, isOwner }: PublicUserHeaderSectionProps) {
  const displayName = identity.nickname || "이름 미등록";
  const displayCode = identity.nicknameCode ? `#${identity.nicknameCode}` : null;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
            {identity.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={identity.avatarUrl}
                alt={displayName}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <UserRound className="h-8 w-8 text-gray-300" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-gray-900">
              {displayName}
              {displayCode ? <span className="ml-2 text-base font-medium text-gray-500">{displayCode}</span> : null}
            </h1>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
              {identity.bio?.trim() || "자기소개가 없습니다."}
            </p>
          </div>
        </div>
        {isOwner ? (
          <Link
            href="/profile/setting"
            className="self-start rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-gray-400"
          >
            공개 범위 설정
          </Link>
        ) : null}
      </div>
    </section>
  );
}
