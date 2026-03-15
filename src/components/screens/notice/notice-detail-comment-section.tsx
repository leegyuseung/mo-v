"use client";

import PostDetailCommentPlaceholder from "@/components/common/post-detail-comment-placeholder";

/**
 * 공지사항 댓글 입력 영역.
 * 왜: 댓글 API가 붙기 전에도 실제 배치와 입력 경험을 먼저 맞출 수 있도록 UI를 분리한다.
 */
type NoticeDetailCommentSectionProps = {
  message?: string;
};

export default function NoticeDetailCommentSection({
  message = "공지사항은 댓글 등록을 지원하지 않습니다.",
}: NoticeDetailCommentSectionProps) {
  return <PostDetailCommentPlaceholder message={message} />;
}
