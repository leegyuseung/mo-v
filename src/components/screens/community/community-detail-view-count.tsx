"use client";

import { useEffect, useState } from "react";
import { trackCommunityPostView } from "@/api/community";
import { formatCommunityViewCount } from "@/utils/community-format";

type CommunityDetailViewCountProps = {
  postId: number;
  initialViewCount: number;
};

export default function CommunityDetailViewCount({
  postId,
  initialViewCount,
}: CommunityDetailViewCountProps) {
  const [viewCount, setViewCount] = useState(initialViewCount);

  useEffect(() => {
    let isMounted = true;

    void trackCommunityPostView(postId)
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
  }, [postId]);

  return <span>{formatCommunityViewCount(viewCount)}</span>;
}
