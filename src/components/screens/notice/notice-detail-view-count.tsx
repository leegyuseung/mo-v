"use client";

import { useEffect, useState } from "react";
import { trackNoticeView } from "@/api/notice";
import { formatNoticeViewCount } from "@/utils/notice-format";

type NoticeDetailViewCountProps = {
  noticeId: number;
  initialViewCount: number;
};

export default function NoticeDetailViewCount({
  noticeId,
  initialViewCount,
}: NoticeDetailViewCountProps) {
  const [viewCount, setViewCount] = useState(initialViewCount);

  useEffect(() => {
    let isMounted = true;

    void trackNoticeView(noticeId)
      .then((result) => {
        if (!isMounted) return;
        if (typeof result.view_count === "number") {
          setViewCount(result.view_count);
        }
      })
      .catch(() => {
        // 조회수 실패가 상세 화면을 막을 이유는 없다.
      });

    return () => {
      isMounted = false;
    };
  }, [noticeId]);

  return <span>{formatNoticeViewCount(viewCount)}</span>;
}
