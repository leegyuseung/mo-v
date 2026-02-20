"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { useMyStars } from "@/hooks/queries/star/use-my-stars";
import { useLiveStreamers } from "@/hooks/queries/live/use-live-streamers";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { getPlatformBorderColor } from "@/utils/platform";
import { removeStar, type StarTargetType } from "@/api/star";
import { toast } from "sonner";

function AvatarItem({
  children,
  title,
  isEditMode = false,
  isMarked = false,
  onToggleMarked,
}: {
  children: ReactNode;
  title: string;
  isEditMode?: boolean;
  isMarked?: boolean;
  onToggleMarked?: () => void;
}) {
  return (
    <div className="w-16 shrink-0 pt-1">
      <div className="relative flex justify-center overflow-visible">
        {children}
        {isEditMode ? (
          <button
            type="button"
            aria-label="삭제 선택"
            onClick={onToggleMarked}
            className={`absolute -right-1 top-0 z-20 inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border text-xs font-bold ${isMarked
                ? "border-red-600 bg-red-600 text-white"
                : "border-gray-300 bg-white text-gray-600"
              }`}
          >
            ×
          </button>
        ) : null}
      </div>
      <span className="mt-1 block h-4 w-full truncate px-0.5 text-center text-[11px] font-medium text-gray-700">
        {title}
      </span>
    </div>
  );
}

function HorizontalRow({
  title,
  emptyText,
  searchValue,
  onSearchChange,
  addHref,
  isEditable = false,
  isEditMode = false,
  onToggleEditMode,
  children,
}: {
  title: string;
  emptyText: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  addHref?: string;
  isEditable?: boolean;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  children: ReactNode[];
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (amount: number) => {
    rowRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        <div className="flex items-center gap-2">
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="이름 검색"
            className="h-7 w-32 rounded-md border-gray-200 text-xs"
          />
          {isEditable && addHref ? (
            <Link
              href={addHref}
              className="inline-flex h-7 items-center rounded-md border border-gray-200 px-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              추가
            </Link>
          ) : null}
          {isEditable ? (
            <button
              type="button"
              onClick={onToggleEditMode}
              className="inline-flex h-7 cursor-pointer items-center rounded-md border border-gray-200 px-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {isEditMode ? "완료" : "수정"}
            </button>
          ) : null}
          <button
            type="button"
            aria-label={`${title} 왼쪽으로 이동`}
            onClick={() => scrollByAmount(-280)}
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`${title} 오른쪽으로 이동`}
            onClick={() => scrollByAmount(280)}
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        className="no-scrollbar flex flex-nowrap items-center gap-2 overflow-x-auto pb-1"
      >
        {children.length === 0 ? <p className="text-sm text-gray-400">{emptyText}</p> : children}
      </div>
    </section>
  );
}

export default function StarScreen() {
  const queryClient = useQueryClient();
  const [liveSearch, setLiveSearch] = useState("");
  const [streamerSearch, setStreamerSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [crewSearch, setCrewSearch] = useState("");
  const [isStreamerEditMode, setIsStreamerEditMode] = useState(false);
  const [isGroupEditMode, setIsGroupEditMode] = useState(false);
  const [isCrewEditMode, setIsCrewEditMode] = useState(false);
  const [markedStreamerIds, setMarkedStreamerIds] = useState<number[]>([]);
  const [markedGroupIds, setMarkedGroupIds] = useState<number[]>([]);
  const [markedCrewIds, setMarkedCrewIds] = useState<number[]>([]);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const { user } = useAuthStore();
  const { data: stars, isLoading: isStarsLoading } = useMyStars(user?.id);
  const { data: liveData } = useLiveStreamers();

  if (!user) {
    return <div className="p-6 text-center text-gray-500">로그인 후 이용해 주세요.</div>;
  }

  if (isStarsLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Spinner />
      </div>
    );
  }

  const liveByStreamerId = new Map((liveData || []).map((item) => [item.id, item]));
  const starredStreamers = stars?.streamers || [];
  const liveStarredStreamers = starredStreamers.filter((streamer) => {
    const live = liveByStreamerId.get(streamer.id);
    return Boolean(live?.isLive && live?.liveUrl);
  });


  const includesKeyword = (value: string | null | undefined, keyword: string) =>
    (value || "").toLowerCase().includes(keyword.trim().toLowerCase());

  const filteredLiveStreamers = liveStarredStreamers.filter((streamer) =>
    includesKeyword(streamer.nickname, liveSearch)
  );
  const filteredStreamers = starredStreamers.filter((streamer) =>
    includesKeyword(streamer.nickname, streamerSearch)
  );
  const filteredGroups = (stars?.groups || []).filter((group) =>
    includesKeyword(group.name, groupSearch)
  );
  const filteredCrews = (stars?.crews || []).filter((crew) =>
    includesKeyword(crew.name, crewSearch)
  );

  /** 선택/해제 토글: 삭제 대상 ID 배열에 추가하거나 제거한다 */
  const toggleMarkedItem = (
    targetId: number,
    markedIds: number[],
    setMarkedIds: (ids: number[]) => void
  ) => {
    if (markedIds.includes(targetId)) {
      setMarkedIds(markedIds.filter((id) => id !== targetId));
      return;
    }
    setMarkedIds([...markedIds, targetId]);
  };

  /** 수정모드 완료 시 선택된 즐겨찾기를 일괄 삭제하고 목록을 갱신한다 */
  const submitEditChanges = async (
    type: StarTargetType,
    targetIds: number[],
    setIsEditMode: (value: boolean) => void,
    clearMarked: () => void
  ) => {
    if (!user?.id) return;
    if (!targetIds.length) {
      setIsEditMode(false);
      clearMarked();
      return;
    }
    setIsSubmittingEdit(true);
    try {
      await Promise.all(targetIds.map((id) => removeStar(user.id, id, type)));
      await queryClient.invalidateQueries({
        queryKey: ["my-stars", user.id],
      });
      toast.success("즐겨찾기가 삭제되었습니다.");
      setIsEditMode(false);
      clearMarked();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "즐겨찾기 삭제에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <HorizontalRow
        title={`라이브 (${filteredLiveStreamers.length})`}
        emptyText="라이브 중인 즐겨찾기 버츄얼이 없습니다."
        searchValue={liveSearch}
        onSearchChange={setLiveSearch}
      >
        {filteredLiveStreamers.map((streamer) => {
          const live = liveByStreamerId.get(streamer.id);
          const liveUrl = live?.liveUrl;
          if (!liveUrl) {
            return null;
          }

          return (
            <AvatarItem key={`live-star-streamer-${streamer.id}`} title={streamer.nickname || "버츄얼"}>
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex cursor-pointer"
              >
                <div
                  className={`relative h-14 w-14 overflow-hidden rounded-full border-2 bg-gray-100 ${getPlatformBorderColor(
                    streamer.platform
                  )}`}
                >
                  {streamer.image_url ? (
                    <Image
                      src={streamer.image_url}
                      alt={streamer.nickname || "streamer"}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserRound className="h-5 w-5 text-gray-300" />
                    </div>
                  )}
                </div>
              </a>
            </AvatarItem>
          );
        })}
      </HorizontalRow>

      <HorizontalRow
        title={`버츄얼 (${filteredStreamers.length})`}
        emptyText="즐겨찾기한 버츄얼이 없습니다."
        searchValue={streamerSearch}
        onSearchChange={setStreamerSearch}
        addHref="/vlist"
        isEditable
        isEditMode={isStreamerEditMode}
        onToggleEditMode={() => {
          if (isSubmittingEdit) return;
          if (isStreamerEditMode) {
            submitEditChanges("streamer", markedStreamerIds, setIsStreamerEditMode, () =>
              setMarkedStreamerIds([])
            );
            return;
          }
          setIsStreamerEditMode(true);
        }}
      >
        {filteredStreamers.map((streamer) => (
          <AvatarItem
            key={`star-streamer-${streamer.id}`}
            title={streamer.nickname || "버츄얼"}
            isEditMode={isStreamerEditMode}
            isMarked={markedStreamerIds.includes(streamer.id)}
            onToggleMarked={() =>
              toggleMarkedItem(streamer.id, markedStreamerIds, setMarkedStreamerIds)
            }
          >
            <Link
              href={`/vlist/${streamer.public_id ?? streamer.id}`}
              className={`inline-flex ${isStreamerEditMode ? "pointer-events-none" : "cursor-pointer"}`}
            >
              <div
                className={`relative h-14 w-14 overflow-hidden rounded-full border-2 bg-gray-100 ${getPlatformBorderColor(
                  streamer.platform
                )}`}
              >
                {streamer.image_url ? (
                  <Image
                    src={streamer.image_url}
                    alt={streamer.nickname || "streamer"}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UserRound className="h-5 w-5 text-gray-300" />
                  </div>
                )}
              </div>
            </Link>
          </AvatarItem>
        ))}
      </HorizontalRow>

      <HorizontalRow
        title={`그룹 (${filteredGroups.length})`}
        emptyText="즐겨찾기한 그룹이 없습니다."
        searchValue={groupSearch}
        onSearchChange={setGroupSearch}
        addHref="/group"
        isEditable
        isEditMode={isGroupEditMode}
        onToggleEditMode={() => {
          if (isSubmittingEdit) return;
          if (isGroupEditMode) {
            submitEditChanges("group", markedGroupIds, setIsGroupEditMode, () =>
              setMarkedGroupIds([])
            );
            return;
          }
          setIsGroupEditMode(true);
        }}
      >
        {filteredGroups.map((group) => (
          <AvatarItem
            key={`star-group-${group.id}`}
            title={group.name}
            isEditMode={isGroupEditMode}
            isMarked={markedGroupIds.includes(group.id)}
            onToggleMarked={() => toggleMarkedItem(group.id, markedGroupIds, setMarkedGroupIds)}
          >
            <Link
              href={`/group/${group.group_code}`}
              className={`inline-flex ${isGroupEditMode ? "pointer-events-none" : "cursor-pointer"}`}
            >
              <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-gray-200 bg-white">
                {group.image_url ? (
                  <Image src={group.image_url} alt={group.name} fill sizes="56px" className="object-contain" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UserRound className="h-5 w-5 text-gray-300" />
                  </div>
                )}
              </div>
            </Link>
          </AvatarItem>
        ))}
      </HorizontalRow>

      <HorizontalRow
        title={`크루 (${filteredCrews.length})`}
        emptyText="즐겨찾기한 크루가 없습니다."
        searchValue={crewSearch}
        onSearchChange={setCrewSearch}
        addHref="/crew"
        isEditable
        isEditMode={isCrewEditMode}
        onToggleEditMode={() => {
          if (isSubmittingEdit) return;
          if (isCrewEditMode) {
            submitEditChanges("crew", markedCrewIds, setIsCrewEditMode, () =>
              setMarkedCrewIds([])
            );
            return;
          }
          setIsCrewEditMode(true);
        }}
      >
        {filteredCrews.map((crew) => (
          <AvatarItem
            key={`star-crew-${crew.id}`}
            title={crew.name}
            isEditMode={isCrewEditMode}
            isMarked={markedCrewIds.includes(crew.id)}
            onToggleMarked={() => toggleMarkedItem(crew.id, markedCrewIds, setMarkedCrewIds)}
          >
            <Link
              href={`/crew/${crew.crew_code}`}
              className={`inline-flex ${isCrewEditMode ? "pointer-events-none" : "cursor-pointer"}`}
            >
              <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-gray-200 bg-white">
                {crew.image_url ? (
                  <Image src={crew.image_url} alt={crew.name} fill sizes="56px" className="object-contain" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UserRound className="h-5 w-5 text-gray-300" />
                  </div>
                )}
              </div>
            </Link>
          </AvatarItem>
        ))}
      </HorizontalRow>
    </div>
  );
}
