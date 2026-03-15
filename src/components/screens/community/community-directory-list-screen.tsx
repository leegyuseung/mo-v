import Image from "next/image";
import Link from "next/link";
import { Gem, MicVocal, Star, UserRound, UsersRound } from "lucide-react";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import CommunityDirectoryFilters from "@/components/screens/community/community-directory-filters";
import PlatformBadge from "@/components/common/platform-badge";
import { shouldBypassNextImageOptimization } from "@/utils/image";
import type {
  CommunityDirectoryItem,
  CommunitySearchEntityType,
} from "@/types/community";

type CommunityDirectoryListScreenProps = {
  title: string;
  items: CommunityDirectoryItem[];
  emptyMessage: string;
  searchPlaceholder: string;
  initialKeyword: string;
  initialStarredOnly: boolean;
  type: CommunitySearchEntityType;
  initialPlatform?: string;
  initialGenre?: string;
  genreOptions?: string[];
  initialSortBy?: "latest" | "name" | "postCount";
  initialSortOrder?: "asc" | "desc";
};

function getFallbackIcon(type: CommunitySearchEntityType) {
  if (type === "vlist") return Gem;
  if (type === "group") return MicVocal;
  return UsersRound;
}

export default function CommunityDirectoryListScreen({
  title,
  items,
  emptyMessage,
  searchPlaceholder,
  initialKeyword,
  initialStarredOnly,
  type,
  initialPlatform = "all",
  initialGenre = "all",
  genreOptions = [],
  initialSortBy = "latest",
  initialSortOrder = "desc",
}: CommunityDirectoryListScreenProps) {
  const sectionLabel =
    type === "vlist" ? "버츄얼" : type === "group" ? "그룹" : "소속";

  return (
    <div className="mx-auto w-full max-w-[1440px] p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <PageBreadcrumb
            items={[
              { label: "커뮤니티", href: "/community" },
              { label: sectionLabel },
            ]}
          />
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">{title}</h1>
        </div>
        <span className="text-sm text-gray-500">{items.length.toLocaleString()}개</span>
      </div>

      <CommunityDirectoryFilters
        type={type}
        initialKeyword={initialKeyword}
        initialStarredOnly={initialStarredOnly}
        initialPlatform={initialPlatform}
        initialGenre={initialGenre}
        genreOptions={genreOptions}
        initialSortBy={initialSortBy}
        initialSortOrder={initialSortOrder}
        placeholder={searchPlaceholder}
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <ul className="divide-y divide-gray-100">
            {items.map((item) => {
              const FallbackIcon = getFallbackIcon(item.type);
              const remainingMemberCount = Math.max(
                0,
                (item.memberCount || 0) - (item.memberImages?.length || 0)
              );

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 object-cover"
                          unoptimized={shouldBypassNextImageOptimization(item.imageUrl)}
                        />
                      ) : item.type === "vlist" ? (
                        <UserRound className="h-5 w-5 text-gray-300" />
                      ) : (
                        <FallbackIcon className="h-5 w-5 text-gray-300" />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        {item.isStarred ? (
                          <Star className="h-4 w-4 shrink-0 fill-yellow-400 text-yellow-400" />
                        ) : null}
                        <span className="truncate text-sm font-medium text-gray-900 md:text-base">
                          {item.name}
                        </span>
                        <span className="shrink-0 text-xs font-medium text-gray-500">
                          [{item.recentPostCount24h}]
                        </span>
                      </div>

                      {item.type === "vlist" ? (
                        <div className="ml-auto flex shrink-0 items-center gap-1.5">
                          {item.genres?.map((genre) => (
                            <span
                              key={`${item.id}-genre-${genre}`}
                              className="hidden rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600 md:inline-flex"
                            >
                              {genre}
                            </span>
                          ))}
                          {item.platform ? <PlatformBadge platform={item.platform} /> : null}
                        </div>
                      ) : item.type === "group" || item.type === "crew" ? (
                        <div className="ml-auto hidden shrink-0 items-center gap-1 md:flex">
                          {item.memberImages?.map((member) => (
                            <div
                              key={`${item.id}-member-${member.id}`}
                              className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-white bg-gray-100 shadow-sm"
                              title={member.name}
                            >
                              {member.imageUrl ? (
                                <Image
                                  src={member.imageUrl}
                                  alt={member.name}
                                  width={28}
                                  height={28}
                                  className="h-7 w-7 object-cover"
                                  unoptimized={shouldBypassNextImageOptimization(
                                    member.imageUrl
                                  )}
                                />
                              ) : (
                                <UserRound className="h-3.5 w-3.5 text-gray-300" />
                              )}
                            </div>
                          ))}
                          {remainingMemberCount > 0 ? (
                            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-gray-200 bg-gray-50 px-2 text-[10px] font-semibold text-gray-600">
                              +{remainingMemberCount}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
