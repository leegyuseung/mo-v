import type { Metadata } from "next";
import {
  fetchCommunityDirectoryItemsOnServer,
  fetchCommunityStreamerGenresOnServer,
} from "@/api/community-server";
import CommunityDirectoryListScreen from "@/components/screens/community/community-directory-list-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/community/vlist",
  },
};

type CommunityVlistPageProps = {
  searchParams?: Promise<{
    keyword?: string;
    starred?: string;
    platform?: string;
    genre?: string;
    sort?: string;
    order?: string;
  }>;
};

export default async function CommunityVlistPage({
  searchParams,
}: CommunityVlistPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialKeyword = resolvedSearchParams?.keyword?.trim() || "";
  const initialStarredOnly = resolvedSearchParams?.starred === "1";
  const initialPlatform = resolvedSearchParams?.platform?.trim() || "all";
  const initialGenre = resolvedSearchParams?.genre?.trim() || "all";
  const initialSortBy =
    resolvedSearchParams?.sort === "name" || resolvedSearchParams?.sort === "postCount"
      ? resolvedSearchParams.sort
      : "latest";
  const initialSortOrder = resolvedSearchParams?.order === "asc" ? "asc" : "desc";
  const genreOptions = await fetchCommunityStreamerGenresOnServer();
  const items = await fetchCommunityDirectoryItemsOnServer({
    type: "vlist",
    keyword: initialKeyword,
    starredOnly: initialStarredOnly,
    platform: initialPlatform,
    genre: initialGenre,
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
  });

  return (
    <CommunityDirectoryListScreen
      title="버츄얼 커뮤니티"
      type="vlist"
      items={items}
      searchPlaceholder="버츄얼 이름을 입력해 주세요"
      initialKeyword={initialKeyword}
      initialStarredOnly={initialStarredOnly}
      initialPlatform={initialPlatform}
      initialGenre={initialGenre}
      genreOptions={genreOptions}
      initialSortBy={initialSortBy}
      initialSortOrder={initialSortOrder}
      emptyMessage={
        initialKeyword || initialStarredOnly
          ? "검색 결과에 맞는 버츄얼 커뮤니티가 없습니다."
          : "표시할 버츄얼 커뮤니티가 없습니다."
      }
    />
  );
}
