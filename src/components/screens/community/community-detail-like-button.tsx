"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { toggleCommunityPostLike } from "@/api/community";

type CommunityDetailLikeButtonProps = {
  postId: number;
  initialLikeCount: number;
  initialLiked: boolean;
};

export default function CommunityDetailLikeButton({
  postId,
  initialLikeCount,
  initialLiked,
}: CommunityDetailLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    if (isPending) return;

    const previousLiked = liked;
    const previousLikeCount = likeCount;
    const nextLiked = !previousLiked;
    const nextLikeCount = Math.max(0, previousLikeCount + (nextLiked ? 1 : -1));

    setLiked(nextLiked);
    setLikeCount(nextLikeCount);
    setIsPending(true);

    try {
      const result = await toggleCommunityPostLike(postId);
      setLiked(Boolean(result.liked));
      setLikeCount(typeof result.like_count === "number" ? result.like_count : 0);
    } catch (error) {
      setLiked(previousLiked);
      setLikeCount(previousLikeCount);
      toast.error(
        error instanceof Error ? error.message : "좋아요 처리에 실패했습니다."
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        liked
          ? "border-rose-200 bg-rose-50 text-rose-600"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      }`}
    >
      <ThumbsUp className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      <span>{likeCount.toLocaleString()}</span>
    </button>
  );
}
