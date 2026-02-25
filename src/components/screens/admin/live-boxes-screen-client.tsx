"use client";

import { useMemo, useState } from "react";
import { Boxes } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LiveBoxFormPanel from "@/components/screens/admin/live-box-form-panel";
import LiveBoxPendingRequestRow from "@/components/screens/admin/live-box-pending-request-row";
import { useLiveBoxes } from "@/hooks/queries/admin/use-live-boxes";
import { usePendingLiveBoxRequests } from "@/hooks/queries/admin/use-pending-live-box-requests";
import { useCreateLiveBox } from "@/hooks/mutations/admin/use-create-live-box";
import { useUpdateLiveBox } from "@/hooks/mutations/admin/use-update-live-box";
import { useStreamers } from "@/hooks/queries/admin/use-streamers";
import type {
  LiveBoxFormSubmitPayload,
  LiveBoxParticipantCandidate,
} from "@/types/admin-live-box";
import type { LiveBoxStatus } from "@/types/live-box";
import {
  formatLiveBoxDate,
  formatLiveBoxDateTime,
  getLiveBoxParticipantCandidate,
  normalizeLiveBoxStatus,
  parseLiveBoxCategoryInput,
} from "@/utils/admin-live-box";

const STATUS_OPTIONS: LiveBoxStatus[] = ["대기", "진행중", "종료"];

/** 관리자 라이브 박스 관리 화면 */
export default function LiveBoxesScreen() {
  const { data: boxes, isLoading, isError } = useLiveBoxes();
  const {
    data: pendingLiveBoxRequests,
    isLoading: isPendingLiveBoxRequestsLoading,
    isError: isPendingLiveBoxRequestsError,
  } = usePendingLiveBoxRequests();
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
        return nickname.includes(keyword);
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
    setEndsAt(target.ends_at ? formatLiveBoxDate(target.ends_at) : "");
    setDescription(target.description || "");
    setStatus(normalizeLiveBoxStatus(target.status));
    setParticipantSearch("");
    setIsAddOpen(true);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("제목은 필수입니다.");
      return;
    }

    const categories = parseLiveBoxCategoryInput(categoryInput);
    if (categories.length === 0) {
      toast.error("카테고리를 1개 이상 입력해 주세요.");
      return;
    }

    const payload: LiveBoxFormSubmitPayload = {
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
        <LiveBoxFormPanel
          editingLiveBoxId={editingLiveBoxId}
          title={title}
          categoryInput={categoryInput}
          participantSearch={participantSearch}
          selectedParticipants={selectedParticipants}
          filteredParticipants={filteredParticipants}
          endsAt={endsAt}
          description={description}
          status={status}
          statusOptions={STATUS_OPTIONS}
          isSubmitting={isCreating || isUpdating}
          onTitleChange={setTitle}
          onCategoryInputChange={setCategoryInput}
          onParticipantSearchChange={setParticipantSearch}
          onAddParticipant={addParticipant}
          onRemoveParticipant={removeParticipant}
          onEndsAtChange={setEndsAt}
          onDescriptionChange={setDescription}
          onStatusChange={setStatus}
          onCancel={() => {
            resetForm();
            setIsAddOpen(false);
          }}
          onSubmit={handleSubmit}
        />
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
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {box.creator_profile?.nickname || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatLiveBoxDateTime(box.created_at)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatLiveBoxDate(box.ends_at)}</td>
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

      <div className="mt-10 mb-4 flex items-center gap-2">
        <Boxes className="w-5 h-5 text-cyan-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">박스 등록 요청 대기</h2>
          <p className="text-sm text-gray-500">대기 상태(pending) 요청만 표시됩니다.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[1220px] text-left whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">요청자</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[380px]">주제</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">관련 사이트</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">요청일시</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">처리</th>
            </tr>
          </thead>
          <tbody>
            {isPendingLiveBoxRequestsLoading ? (
              [...Array(4)].map((_, index) => (
                <tr key={`pending-live-box-request-skeleton-${index}`} className="border-b border-gray-100">
                  <td className="px-4 py-3" colSpan={6}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : isPendingLiveBoxRequestsError ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                  박스 등록 요청 목록을 불러오지 못했습니다.
                </td>
              </tr>
            ) : pendingLiveBoxRequests && pendingLiveBoxRequests.length > 0 ? (
              pendingLiveBoxRequests.map((request) => (
                <LiveBoxPendingRequestRow key={`pending-live-box-request-${request.id}`} request={request} />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                  대기 중인 박스 등록 요청이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
