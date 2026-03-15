import type { PublicUserFavoritesSectionProps } from "@/types/public-user-profile";
import PublicUserFavoriteTagsSection from "@/components/screens/user/public-user-favorite-tags-section";

export default function PublicUserFavoritesSection({
  canViewFavorites,
  favorites,
}: PublicUserFavoritesSectionProps) {
  return (
    <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 md:p-6">
      <h2 className="text-base font-semibold text-gray-900">즐겨찾기</h2>
      {!canViewFavorites ? (
        <p className="mt-2 text-sm text-gray-500">사용자가 즐겨찾기를 비공개로 설정했습니다.</p>
      ) : (
        <div className="mt-3 space-y-3">
          <PublicUserFavoriteTagsSection
            title="버츄얼"
            large
            items={favorites.streamers.map((item) => ({
              href: `/vlist/${item.public_id || item.id}`,
              label: item.nickname || `버츄얼 ${item.id}`,
              imageUrl: item.image_url,
            }))}
            emptyText="즐겨찾기한 버츄얼이 없습니다."
          />
          <div className="grid gap-3 md:grid-cols-2">
            <PublicUserFavoriteTagsSection
              title="그룹"
              items={favorites.groups.map((item) => ({
                href: `/group/${item.group_code}`,
                label: item.name,
                imageUrl: item.image_url,
              }))}
              emptyText="즐겨찾기한 그룹이 없습니다."
            />
            <PublicUserFavoriteTagsSection
              title="소속"
              items={favorites.crews.map((item) => ({
                href: `/crew/${encodeURIComponent(item.crew_code)}`,
                label: item.name,
                imageUrl: item.image_url,
              }))}
              emptyText="즐겨찾기한 소속이 없습니다."
            />
          </div>
        </div>
      )}
    </section>
  );
}
