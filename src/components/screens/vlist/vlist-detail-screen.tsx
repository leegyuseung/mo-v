"use client";

import Image from "next/image";
import Link from "next/link";
import { useStreamerDetail } from "@/hooks/queries/streamers/use-streamer-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tv, Users } from "lucide-react";

export default function VlistDetailScreen({ streamerId }: { streamerId: number }) {
  const { data: streamer, isLoading } = useStreamerDetail(streamerId);

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">로딩중...</div>;
  }

  if (!streamer) {
    return <div className="p-6 text-center text-gray-400">스트리머 정보가 없습니다.</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <Link href="/vlist">
        <Button type="button" variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          리스트로 돌아가기
        </Button>
      </Link>

      <div className="rounded-3xl border border-gray-100 bg-white p-5 md:p-7 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="relative h-52 md:h-64 md:w-64 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-pink-100 via-rose-100 to-amber-100">
            {streamer.image_url ? (
              <Image
                src={streamer.image_url}
                alt={streamer.nickname || "streamer"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 256px"
              />
            ) : null}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {streamer.nickname || "이름 미등록"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              플랫폼: {streamer.platform?.toUpperCase() || "UNKNOWN"}
            </p>

            <div className="mt-5 space-y-3 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <Tv className="w-4 h-4" />
                치지직 ID: {streamer.chzzk_id || "-"}
              </p>
              <p className="flex items-center gap-2">
                <Tv className="w-4 h-4" />
                SOOP ID: {streamer.soop_id || "-"}
              </p>
              <p className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                그룹: {streamer.group_name?.join(", ") || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
