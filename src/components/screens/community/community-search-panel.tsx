"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, UserRound, UsersRound } from "lucide-react";
import SearchInput from "@/components/common/search-input";
import { Spinner } from "@/components/ui/spinner";
import { useCommunitySearch } from "@/hooks/queries/community/use-community-search";
import type { CommunitySearchItem } from "@/types/community";

const RESULT_ICON_BY_TYPE = {
  vlist: UserRound,
  group: UsersRound,
  crew: Building2,
} as const;

function CommunitySearchResultItem({
  item,
}: {
  item: CommunitySearchItem;
}) {
  const Icon = RESULT_ICON_BY_TYPE[item.type];

  return (
    <Link
      href={item.href}
      className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-gray-50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Icon className="h-4 w-4 text-gray-400" />
        )}
      </div>
      <span className="truncate text-sm font-medium text-gray-900">
        {item.name}
      </span>
    </Link>
  );
}

export default function CommunitySearchPanel() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const trimmedKeyword = keyword.trim();
  const { data: results = [], isLoading } = useCommunitySearch(trimmedKeyword);
  const shouldOpenDropdown = trimmedKeyword.length > 0;
  const firstResult = results[0];

  return (
    <div className="relative">
      <SearchInput
        value={keyword}
        onChange={setKeyword}
        placeholder="버츄얼이름, 그룹이름, 소속이름으로 커뮤니티를 찾아보세요"
        containerClassName="w-full"
        inputClassName="h-11 rounded-md border-gray-200 bg-white pl-10 text-sm focus-visible:ring-0"
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          if (!firstResult) return;
          router.push(firstResult.href);
        }}
      />

      {shouldOpenDropdown ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-[0_16px_28px_-22px_rgba(15,23,42,0.32)]">
          <div className="max-h-[240px] overflow-y-auto p-1.5">
            {isLoading ? (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-500">
                <Spinner className="h-4 w-4 border-2" />
                검색 결과를 불러오는 중입니다.
              </div>
            ) : results.length > 0 ? (
              results.map((item) => (
                <CommunitySearchResultItem key={item.id} item={item} />
              ))
            ) : (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-500">
                <Search className="h-4 w-4" />
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
