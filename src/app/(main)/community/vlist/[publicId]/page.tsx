import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CommunityBoardScreen from "@/components/screens/community/community-board-screen";
import {
  canWriteCommunityOnServer,
  fetchCommunityPostsByCommunityIdOnServer,
  fetchCommunityVlistBoardMetaOnServer,
} from "@/api/community-server";
import type { CommunityPostSearchField } from "@/types/community";

const COMMUNITY_PAGE_SIZE = 20;

type CommunityVlistDetailPageProps = {
  params: Promise<{
    publicId: string;
  }>;
  searchParams?: Promise<{
    page?: string;
    q?: string;
    filter?: string;
  }>;
};

function toSafePage(value?: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
}

function toSearchField(value?: string): CommunityPostSearchField {
  if (value === "title" || value === "content") return value;
  return "title_content";
}

export async function generateMetadata({
  params,
}: CommunityVlistDetailPageProps): Promise<Metadata> {
  const { publicId } = await params;
  const meta = await fetchCommunityVlistBoardMetaOnServer(publicId);
  const streamerName = meta?.entityName || "버츄얼 커뮤니티";

  return {
    title: streamerName,
    description: `${streamerName}의 커뮤니티 게시글을 확인하세요.`,
    alternates: {
      canonical: `/community/vlist/${publicId}`,
    },
  };
}

export default async function CommunityVlistDetailPage({
  params,
  searchParams,
}: CommunityVlistDetailPageProps) {
  const { publicId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const page = toSafePage(resolvedSearchParams?.page);
  const keyword = resolvedSearchParams?.q?.trim() || "";
  const searchField = toSearchField(resolvedSearchParams?.filter);

  const meta = await fetchCommunityVlistBoardMetaOnServer(publicId);
  if (!meta) {
    notFound();
  }

  const postList = await fetchCommunityPostsByCommunityIdOnServer({
    communityId: meta.communityId,
    page,
    pageSize: COMMUNITY_PAGE_SIZE,
    keyword,
    searchField,
  });
  const totalPages = Math.max(
    1,
    Math.ceil(postList.totalCount / COMMUNITY_PAGE_SIZE)
  );
  const canWrite = await canWriteCommunityOnServer();

  return (
    <CommunityBoardScreen
      meta={meta}
      posts={postList.items}
      totalCount={postList.totalCount}
      page={page}
      totalPages={totalPages}
      keyword={keyword}
      searchField={searchField}
      canWrite={canWrite}
    />
  );
}
