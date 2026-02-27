import { Image as ImageIcon } from "lucide-react";
import ContentsDetailActionBar from "@/components/screens/contents/contents-detail-action-bar";
import ContentsDetailInfoSection from "@/components/screens/contents/contents-detail-info-section";
import ContentsDetailSummarySection from "@/components/screens/contents/contents-detail-summary-section";
import type { ContentDetailScreenProps, ContentStatus } from "@/types/content";
import type { ContentDetailItem } from "@/types/contents-detail";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const NEW_BADGE_WINDOW_IN_MS = 2 * DAY_IN_MS;

function formatParticipantRange(min: number | null, max: number | null) {
  if (min === null && max === null) return "-";
  const minLabel = min === null ? "-" : `${min.toLocaleString()}명`;
  const maxLabel = max === null ? "-" : `${max.toLocaleString()}명`;
  return `${minLabel} ~ ${maxLabel}`;
}

/** 콘텐츠 상세 UI 화면 */
export default function ContentsDetailScreen({
  content,
  nowTimestamp,
  initialIsLiked,
}: ContentDetailScreenProps) {
  const createdAt = new Date(content.created_at).getTime();
  const isNew = Number.isFinite(createdAt) && nowTimestamp - createdAt <= NEW_BADGE_WINDOW_IN_MS;

  const todayStart = new Date(nowTimestamp);
  todayStart.setHours(0, 0, 0, 0);

  const deadlineDate = content.recruitment_end_at ? new Date(content.recruitment_end_at) : null;
  if (deadlineDate) {
    deadlineDate.setHours(0, 0, 0, 0);
  }

  const deadlineAt = deadlineDate ? deadlineDate.getTime() : null;
  const dayDiff =
    deadlineAt && Number.isFinite(deadlineAt)
      ? Math.floor((deadlineAt - todayStart.getTime()) / DAY_IN_MS)
      : null;
  const isClosingSoon = dayDiff !== null && dayDiff >= 0 && dayDiff <= 3;

  const detailItems: ContentDetailItem[] = [
    { label: "주최자", value: content.host_name || "-" },
    { label: "주최단체", value: content.host_organization || "-" },
    { label: "상금(상품)", value: content.reward || "-" },
    {
      label: "모집인원",
      value: formatParticipantRange(content.min_participants, content.max_participants),
    },
    { label: "이메일", value: content.contact_email || "-" },
    { label: "디스코드", value: content.contact_discord || "-" },
    { label: "기타연락처", value: content.contact_other || "-" },
  ];

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <ContentsDetailActionBar
        authorId={content.created_by ?? null}
        contentId={content.id}
        contentTitle={content.title}
        contentStatus={content.status as ContentStatus}
        initialViewCount={content.view_count}
        initialIsLiked={initialIsLiked}
      />

      <article className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[540px_minmax(0,1fr)] md:items-stretch">
          <div className="relative flex min-h-[270px] self-stretch items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 md:h-[530px]">
            {content.image_url ? (
              <img
                src={content.image_url}
                alt={`${content.title} 이미지`}
                className="h-full w-full object-contain p-3"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <ImageIcon className="h-7 w-7" />
              </div>
            )}
          </div>

          <ContentsDetailSummarySection
            title={content.title}
            status={content.status as ContentStatus}
            participantComposition={content.participant_composition}
            recruitmentStartAt={content.recruitment_start_at}
            recruitmentEndAt={content.recruitment_end_at}
            contentStartAt={content.content_start_at}
            contentEndAt={content.content_end_at}
            applicationUrl={content.application_url}
            contentId={content.id}
            authorId={content.created_by ?? null}
            contentTypes={content.content_type}
            isNew={isNew}
            isClosingSoon={isClosingSoon}
          />

          <ContentsDetailInfoSection
            detailItems={detailItems}
            participationRequirement={content.participation_requirement}
            description={content.description}
          />
        </div>
      </article>
    </div>
  );
}
