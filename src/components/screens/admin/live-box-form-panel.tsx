import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LiveBoxStatus } from "@/types/live-box";
import type { LiveBoxParticipantCandidate } from "@/types/admin-live-box";

type LiveBoxFormPanelProps = {
  editingLiveBoxId: number | null;
  title: string;
  categoryInput: string;
  participantSearch: string;
  selectedParticipants: LiveBoxParticipantCandidate[];
  filteredParticipants: LiveBoxParticipantCandidate[];
  endsAt: string;
  description: string;
  status: LiveBoxStatus;
  statusOptions: LiveBoxStatus[];
  isSubmitting: boolean;
  onTitleChange: (value: string) => void;
  onCategoryInputChange: (value: string) => void;
  onParticipantSearchChange: (value: string) => void;
  onAddParticipant: (platformId: string) => void;
  onRemoveParticipant: (platformId: string) => void;
  onEndsAtChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStatusChange: (value: LiveBoxStatus) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

/**
 * 라이브박스 생성/수정 폼 프레젠테이션 컴포넌트.
 * 왜: 화면 컨테이너와 폼 UI를 분리해 관리 비용을 낮춘다.
 */
export default function LiveBoxFormPanel({
  editingLiveBoxId,
  title,
  categoryInput,
  participantSearch,
  selectedParticipants,
  filteredParticipants,
  endsAt,
  description,
  status,
  statusOptions,
  isSubmitting,
  onTitleChange,
  onCategoryInputChange,
  onParticipantSearchChange,
  onAddParticipant,
  onRemoveParticipant,
  onEndsAtChange,
  onDescriptionChange,
  onStatusChange,
  onCancel,
  onSubmit,
}: LiveBoxFormPanelProps) {
  return (
    <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
      <div className="mb-3 text-sm font-medium text-gray-700">
        {editingLiveBoxId ? `박스 수정 #${editingLiveBoxId}` : "박스 추가"}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-xs text-gray-500">제목 *</p>
          <Input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="예: 예시서버"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-gray-500">카테고리 * (쉼표 구분)</p>
          <Input
            value={categoryInput}
            onChange={(event) => onCategoryInputChange(event.target.value)}
            placeholder="예: 게임, 합방, 이벤트"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <p className="text-xs text-gray-500">참여자 검색 (닉네임)</p>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={participantSearch}
              onChange={(event) => onParticipantSearchChange(event.target.value)}
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
                    onClick={() => onAddParticipant(candidate.platformId)}
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
                    onClick={() => onRemoveParticipant(participant.platformId)}
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
          <Input type="date" value={endsAt} onChange={(event) => onEndsAtChange(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-gray-500">상태</p>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value as LiveBoxStatus)}
            className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-300"
          >
            {statusOptions.map((option) => (
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
            onChange={(event) => onDescriptionChange(event.target.value)}
            rows={3}
            placeholder="박스 설명을 입력해 주세요"
          />
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="cursor-pointer"
        >
          취소
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isSubmitting
            ? editingLiveBoxId
              ? "수정중..."
              : "추가중..."
            : "저장"}
        </Button>
      </div>
    </div>
  );
}
