"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarClock, Search, Tag, UserRound, Users } from "lucide-react";
import Pagination from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LiveBox, LiveBoxParticipantProfile } from "@/types/live-box";

const PAGE_SIZE = 9;

type LiveBoxStatusFilter = "all" | "ongoing" | "closed";
type LiveBoxSortOption = "created_desc" | "title_asc" | "participants_desc";

type LiveBoxParticipantPreview = {
  platformId: string;
  nickname: string | null;
  imageUrl: string | null;
};

type LiveBoxScreenProps = {
  initialLiveBoxes: LiveBox[];
  initialParticipantProfiles: LiveBoxParticipantProfile[];
  hasLiveBoxesError?: boolean;
  hasParticipantProfilesError?: boolean;
};

function formatEndsAt(value: string | null) {
  if (!value) return "미설정";

  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getStatusBadgeClass(status: string) {
  if (status === "진행중") return "bg-green-50 text-green-700 border-green-200";
  if (status === "종료") return "bg-gray-100 text-gray-600 border-gray-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

/** 라이브박스 목록 화면 (검색 + 필터/정렬 + 페이지네이션) */
export default function LiveBoxScreen({
  initialLiveBoxes,
  initialParticipantProfiles,
  hasLiveBoxesError = false,
  hasParticipantProfilesError = false,
}: LiveBoxScreenProps) {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<LiveBoxStatusFilter>("all");
  const [sortOption, setSortOption] = useState<LiveBoxSortOption>("created_desc");
  const [brokenParticipantImageById, setBrokenParticipantImageById] = useState<
    Record<string, boolean>
  >({});

  const participantByPlatformId = useMemo(() => {
    const map = new Map<string, LiveBoxParticipantPreview>();

    initialParticipantProfiles.forEach((profile) => {
      if (profile.chzzk_id) {
        map.set(profile.chzzk_id, {
          platformId: profile.chzzk_id,
          nickname: profile.nickname,
          imageUrl: profile.image_url,
        });
      }

      if (profile.soop_id) {
        map.set(profile.soop_id, {
          platformId: profile.soop_id,
          nickname: profile.nickname,
          imageUrl: profile.image_url,
        });
      }
    });

    return map;
  }, [initialParticipantProfiles]);

  const filteredLiveBoxes = useMemo(() => {
    const trimmedKeyword = keyword.trim().toLowerCase();

    return initialLiveBoxes
      .filter((box) => {
        if (!trimmedKeyword) return true;

        const matchTitle = box.title.toLowerCase().includes(trimmedKeyword);
        const matchCategory = box.category.some((item) =>
          item.toLowerCase().includes(trimmedKeyword)
        );
        const matchParticipant = box.participant_streamer_ids.some((platformId) => {
          const participant = participantByPlatformId.get(platformId);
          const nickname = (participant?.nickname || "").toLowerCase();
          return (
            platformId.toLowerCase().includes(trimmedKeyword) ||
            nickname.includes(trimmedKeyword)
          );
        });

        return matchTitle || matchCategory || matchParticipant;
      })
      .filter((box) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "ongoing") return box.status === "진행중";
        return box.status === "종료";
      })
      .sort((a, b) => {
        if (sortOption === "title_asc") {
          return a.title.localeCompare(b.title, "ko");
        }

        if (sortOption === "participants_desc") {
          const diff =
            b.participant_streamer_ids.length - a.participant_streamer_ids.length;
          if (diff !== 0) return diff;
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [initialLiveBoxes, keyword, participantByPlatformId, sortOption, statusFilter]);

  const totalCount = filteredLiveBoxes.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedLiveBoxes = filteredLiveBoxes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
            placeholder="제목, 카테고리, 참가자(닉네임/플랫폼 ID) 검색"
            className="pl-9"
          />
        </div>

        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setStatusFilter("all");
                setPage(1);
              }}
              className={`cursor-pointer ${
                statusFilter === "all" ? "bg-gray-900 text-white hover:bg-gray-800" : ""
              }`}
            >
              전체
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setStatusFilter("ongoing");
                setPage(1);
              }}
              className={`cursor-pointer ${
                statusFilter === "ongoing" ? "bg-gray-900 text-white hover:bg-gray-800" : ""
              }`}
            >
              진행중
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setStatusFilter("closed");
                setPage(1);
              }}
              className={`cursor-pointer ${
                statusFilter === "closed" ? "bg-gray-900 text-white hover:bg-gray-800" : ""
              }`}
            >
              마감
            </Button>
          </div>

          <div className="w-full md:w-auto">
            <select
              value={sortOption}
              onChange={(event) => {
                setSortOption(event.target.value as LiveBoxSortOption);
                setPage(1);
              }}
              className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-300 md:w-48"
            >
              <option value="created_desc">등록순 (최신)</option>
              <option value="title_asc">제목순</option>
              <option value="participants_desc">참여자순</option>
            </select>
          </div>
        </div>

        <p className="mt-2 text-xs text-gray-500">총 {totalCount.toLocaleString()}개 결과</p>
      </div>

      {hasLiveBoxesError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          라이브박스 목록을 불러오지 못했습니다.
        </div>
      ) : filteredLiveBoxes.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          검색 조건에 맞는 라이브박스가 없습니다.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pagedLiveBoxes.map((box) => {
              const participantPreviews = box.participant_streamer_ids.map((platformId) => {
                const participant = participantByPlatformId.get(platformId);
                return {
                  platformId,
                  nickname: participant?.nickname || null,
                  imageUrl: participant?.imageUrl || null,
                };
              });

              const visibleParticipants = participantPreviews.slice(0, 10);
              const hiddenParticipantCount = Math.max(
                0,
                participantPreviews.length - visibleParticipants.length
              );

              return (
                <Link
                  key={box.id}
                  href={`/live-box/${box.id}`}
                  className="group block cursor-pointer rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-400 hover:bg-gray-50/40 hover:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.45)]"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h2 className="text-base font-semibold text-gray-900 transition-colors group-hover:text-black">
                      {box.title}
                    </h2>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                        box.status
                      )}`}
                    >
                      {box.status}
                    </span>
                  </div>

                  <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-600">
                    <Tag className="h-3.5 w-3.5" />
                    <div className="flex flex-wrap gap-1.5">
                      {box.category.length > 0 ? (
                        box.category.map((item) => (
                          <span
                            key={`${box.id}-category-${item}`}
                            className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </div>

                  <p className="mb-4 truncate text-sm text-gray-600">
                    {box.description?.trim() || "설명이 없습니다."}
                  </p>

                  <div className="mb-4">
                    <p className="mb-2 text-xs font-medium text-gray-500">참여자</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {visibleParticipants.length > 0 ? (
                        <>
                          {visibleParticipants.map((participant, index) => {
                            const isBroken =
                              brokenParticipantImageById[participant.platformId] === true;

                            return (
                              <div
                                key={`${box.id}-participant-${participant.platformId}-${index}`}
                                title={participant.nickname || "이름 미등록"}
                                className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100"
                              >
                                {participant.imageUrl && !isBroken ? (
                                  <Image
                                    src={participant.imageUrl}
                                    alt={participant.nickname || participant.platformId}
                                    fill
                                    sizes="32px"
                                    className="object-cover"
                                    unoptimized
                                    onError={() =>
                                      setBrokenParticipantImageById((prev) => ({
                                        ...prev,
                                        [participant.platformId]: true,
                                      }))
                                    }
                                  />
                                ) : (
                                  <UserRound className="h-4 w-4 text-gray-500" />
                                )}
                              </div>
                            );
                          })}

                          {hiddenParticipantCount > 0 ? (
                            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-1.5 text-[10px] font-medium text-violet-700">
                              +{hiddenParticipantCount}
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">참여자 없음</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-gray-100 pt-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      <span>참여자 수 {box.participant_streamer_ids.length.toLocaleString()}명</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5 text-gray-400" />
                      <span>마감일시 {formatEndsAt(box.ends_at)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalCount > PAGE_SIZE ? (
            <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
          ) : null}
        </>
      )}

      {hasParticipantProfilesError && !hasLiveBoxesError ? (
        <p className="mt-3 text-xs text-amber-700">
          참여자 프로필 일부를 불러오지 못해 기본 아이콘으로 표시됩니다.
        </p>
      ) : null}
    </div>
  );
}
