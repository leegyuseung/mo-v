import type { Metadata } from "next";
import { fetchCommunityDirectoryItemsOnServer } from "@/api/community-server";
import CommunityDirectoryListScreen from "@/components/screens/community/community-directory-list-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/community/crew",
  },
};

type CommunityCrewPageProps = {
  searchParams?: Promise<{
    keyword?: string;
    starred?: string;
    sort?: string;
    order?: string;
  }>;
};

export default async function CommunityCrewPage({
  searchParams,
}: CommunityCrewPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialKeyword = resolvedSearchParams?.keyword?.trim() || "";
  const initialStarredOnly = resolvedSearchParams?.starred === "1";
  const initialSortBy =
    resolvedSearchParams?.sort === "name" || resolvedSearchParams?.sort === "postCount"
      ? resolvedSearchParams.sort
      : "latest";
  const initialSortOrder = resolvedSearchParams?.order === "asc" ? "asc" : "desc";
  const items = await fetchCommunityDirectoryItemsOnServer({
    type: "crew",
    keyword: initialKeyword,
    starredOnly: initialStarredOnly,
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
  });

  return (
    <CommunityDirectoryListScreen
      title="크루 커뮤니티"
      type="crew"
      items={items}
      searchPlaceholder="크루 이름을 입력해 주세요"
      initialKeyword={initialKeyword}
      initialStarredOnly={initialStarredOnly}
      initialSortBy={initialSortBy}
      initialSortOrder={initialSortOrder}
      emptyMessage={
        initialKeyword || initialStarredOnly
          ? "검색 결과에 맞는 크루 커뮤니티가 없습니다."
          : "표시할 크루 커뮤니티가 없습니다."
      }
    />
  );
}
