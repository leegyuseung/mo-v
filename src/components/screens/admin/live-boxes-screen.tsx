"use client";

import { useMemo, useState } from "react";
import { Boxes, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useLiveBoxes } from "@/hooks/queries/admin/use-live-boxes";
import { useCreateLiveBox } from "@/hooks/mutations/admin/use-create-live-box";
import { useUpdateLiveBox } from "@/hooks/mutations/admin/use-update-live-box";
import { useStreamers } from "@/hooks/queries/admin/use-streamers";
import type { LiveBoxStatus } from "@/types/live-box";
import type { Streamer } from "@/types/streamer";

const STATUS_OPTIONS: LiveBoxStatus[] = ["대기", "진행중", "종료"];

type LiveBoxParticipantCandidate = {
  streamerId: number;
  platformId: string;
  platformLabel: "CHZZK" | "SOOP";
  nickname: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR");
}

function normalizeStatus(value: string): LiveBoxStatus {
  if (value === "진행중") return "진행중";
  if (value === "종료") return "종료";
  return "대기";
}

function parseCategoryInput(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

/**
 * 라이브박스 참여자로 사용할 플랫폼 ID를 결정한다.
 * 우선순위: platform 필드 기준 ID -> 대체 ID
 */
function getLiveBoxParticipantCandidate(streamer: Streamer): LiveBoxParticipantCandidate | null {
  const normalizedPlatform = (streamer.platform || "").trim().toLowerCase();

  if (normalizedPlatform === "soop" && streamer.soop_id) {
    return {
      streamerId: streamer.id,
      platformId: streamer.soop_id,
      platformLabel: "SOOP",
      nickname: streamer.nickname,
    };
  }

  if (normalizedPlatform === "chzzk" && streamer.chzzk_id) {
    return {
      streamerId: streamer.id,
      platformId: streamer.chzzk_id,
      platformLabel: "CHZZK",
      nickname: streamer.nickname,
    };
  }

  if (streamer.soop_id) {
    return {
      streamerId: streamer.id,
      platformId: streamer.soop_id,
      platformLabel: "SOOP",
      nickname: streamer.nickname,
    };
  }

  if (streamer.chzzk_id) {
    return {
      streamerId: streamer.id,
      platformId: streamer.chzzk_id,
      platformLabel: "CHZZK",
      nickname: streamer.nickname,
    };
  }

  return null;
}

/** 관리자 라이브 박스 관리 화면 */
export default function LiveBoxesScreen() {
  const { data: boxes, isLoading, isError } = useLiveBoxes();
  const { data: streamers = [] } = useStreamers();
  const { mutate: createLiveBox, isPending: isCreating } = useCreateLiveBox();
  const { mutate: updateLiveBox, isPending: isUpdating } = useUpdateLiveBox();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLiveBoxId, setEditingLiveBoxId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [participantSearch, setParticipantSearch] = useState("");
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [endsAt, setEndsAt] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<LiveBoxStatus>("대기");

  const participantCandidates = useMemo(() => {
    return streamers
      .map(getLiveBoxParticipantCandidate)
      .filter((item): item is LiveBoxParticipantCandidate => item !== null);
  }, [streamers]);

  const participantCandidateById = useMemo(() => {
    return new Map(participantCandidates.map((candidate) => [candidate.platformId, candidate]));
  }, [participantCandidates]);

  const selectedParticipants = useMemo(() => {
    return selectedParticipantIds.map((platformId) => {
      const found = participantCandidateById.get(platformId);
      if (found) return found;
      return {
        streamerId: -1,
        platformId,
        platformLabel: "CHZZK" as const,
        nickname: null,
      };
    });
  }, [selectedParticipantIds, participantCandidateById]);

  const filteredParticipants = useMemo(() => {
    const keyword = participantSearch.trim().toLowerCase();
    if (!keyword) return [];

    return participantCandidates
      .filter((candidate) => {
        if (selectedParticipantIds.includes(candidate.platformId)) return false;
        const nickname = (candidate.nickname || "").toLowerCase();
        return nickname.includes(keyword) || candidate.platformId.toLowerCase().includes(keyword);
      })
      .slice(0, 8);
  }, [participantCandidates, participantSearch, selectedParticipantIds]);

  const resetForm = () => {
    setEditingLiveBoxId(null);
    setTitle("");
    setCategoryInput("");
    setParticipantSearch("");
    setSelectedParticipantIds([]);
    setEndsAt("");
    setDescription("");
    setStatus("대기");
  };

  const addParticipant = (platformId: string) => {
    setSelectedParticipantIds((prev) => {
      if (prev.includes(platformId)) return prev;
      return [...prev, platformId];
    });
    setParticipantSearch("");
  };

  const removeParticipant = (platformId: string) => {
    setSelectedParticipantIds((prev) => prev.filter((id) => id !== platformId));
  };

  const startEdit = (liveBoxId: number) => {
    const target = boxes?.find((box) => box.id === liveBoxId);
    if (!target) return;

    setEditingLiveBoxId(target.id);
    setTitle(target.title);
    setCategoryInput(target.category.join(", "));
    setSelectedParticipantIds(target.participant_streamer_ids);
    setEndsAt(target.ends_at ? formatDate(target.ends_at) : "");
    setDescription(target.description || "");
    setStatus(normalizeStatus(target.status));
    setParticipantSearch("");
    setIsAddOpen(true);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("제목은 필수입니다.");
      return;
    }

    const categories = parseCategoryInput(categoryInput);
    if (categories.length === 0) {
      toast.error("카테고리를 1개 이상 입력해 주세요.");
      return;
    }

    const payload = {
      title: title.trim(),
      category: categories,
      participant_streamer_ids: selectedParticipantIds,
      ends_at: endsAt ? new Date(`${endsAt}T23:59:59`).toISOString() : null,
      description: description.trim() || null,
      status,
    };

    if (editingLiveBoxId) {
      updateLiveBox(
        {
          liveBoxId: editingLiveBoxId,
          payload,
        },
        {
          onSuccess: () => {
            resetForm();
            setIsAddOpen(false);
          },
        }
      );
      return;
    }

    createLiveBox(payload, {
      onSuccess: () => {
        resetForm();
        setIsAddOpen(false);
      },
    });
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-indigo-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">박스관리</h1>
            <p className="text-sm text-gray-500">주제별 라이브박스를 생성하고 상태를 관리합니다.</p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => {
            if (isAddOpen) {
              resetForm();
              setIsAddOpen(false);
              return;
            }
            setIsAddOpen(true);
          }}
          className="cursor-pointer bg-gray-800 hover:bg-gray-900 text-white"
        >
          {isAddOpen ? "폼 닫기" : "박스 추가"}
        </Button>
      </div>

      {isAddOpen ? (
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
          <div className="mb-3 text-sm font-medium text-gray-700">
            {editingLiveBoxId ? `박스 수정 #${editingLiveBoxId}` : "박스 추가"}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500">제목 *</p>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="예: 픽크타서버"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500">카테고리 * (쉼표 구분)</p>
              <Input
                value={categoryInput}
                onChange={(event) => setCategoryInput(event.target.value)}
                placeholder="예: 게임, 합방, 이벤트"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <p className="text-xs text-gray-500">참여자 검색 (닉네임)</p>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={participantSearch}
                  onChange={(event) => setParticipantSearch(event.target.value)}
                  placeholder="닉네임 입력 후 선택하면 치지직ID/SOOPID가 저장됩니다"
                  className="pl-9"
                />
              </div>

              {participantSearch.trim() ? (
                <div className="max-h-52 overflow-y-auto rounded-md border border-gray-200 bg-white">
                  {filteredParticipants.length > 0 ? (
                    filteredParticipants.map((candidate) => (
                      <button
                        key={`${candidate.platformLabel}-${candidate.platformId}`}
                        type="button"
                        onClick={() => addParticipant(candidate.platformId)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer"
                      >
                        <span className="truncate text-gray-800">
                          {candidate.nickname || "이름 미등록"}
                        </span>
                        <span className="shrink-0 text-xs text-gray-400">
                          {candidate.platformLabel} ID {candidate.platformId}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-gray-400">검색 결과가 없습니다.</p>
                  )}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2 pt-1">
                {selectedParticipants.length > 0 ? (
                  selectedParticipants.map((participant) => (
                    <span
                      key={`selected-participant-${participant.platformId}`}
                      className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700"
                    >
                      {participant.nickname || "이름 미등록"}
                      <span className="text-indigo-500">
                        ({participant.platformLabel}: {participant.platformId})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeParticipant(participant.platformId)}
                        className="cursor-pointer rounded-full p-0.5 hover:bg-indigo-100"
                        aria-label="참여자 제거"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">선택된 참여자가 없습니다.</span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-gray-500">마감일시</p>
              <Input type="date" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500">상태</p>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as LiveBoxStatus)}
                className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-300"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <p className="text-xs text-gray-500">설명</p>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder="박스 설명을 입력해 주세요"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setIsAddOpen(false);
              }}
              className="cursor-pointer"
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isCreating || isUpdating}
              className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isCreating || isUpdating
                ? editingLiveBoxId
                  ? "수정중..."
                  : "추가중..."
                : "저장"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[980px] text-left whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">제목</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">카테고리</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">상태</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">참여자 수</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">생성자</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">생성일시</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">마감일시</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">수정</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, index) => (
                <tr key={`live-box-skeleton-${index}`} className="border-b border-gray-100">
                  <td className="px-4 py-3" colSpan={9}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                  박스 목록을 불러오지 못했습니다.
                </td>
              </tr>
            ) : boxes && boxes.length > 0 ? (
              boxes.map((box) => (
                <tr key={box.id} className="border-b border-gray-100 align-middle">
                  <td className="px-4 py-3 text-sm text-gray-700">{box.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{box.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{box.category.join(", ")}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{box.status}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {box.participant_streamer_ids.length.toLocaleString()}명
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{box.created_by}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(box.created_at)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(box.ends_at)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(box.id)}
                      className="cursor-pointer"
                    >
                      수정
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">
                  등록된 박스가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
