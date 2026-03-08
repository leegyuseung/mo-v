"use client";

import { useMemo, useState } from "react";
import { Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import LiveBoxFormPanel from "@/components/screens/admin/live-box-form-panel";
import LiveBoxesTable from "@/components/screens/admin/live-boxes-table";
import { useLiveBoxes } from "@/hooks/queries/admin/use-live-boxes";
import { useStreamers } from "@/hooks/queries/admin/use-streamers";
import { useAdminLiveBoxFormState } from "@/hooks/use-admin-live-box-form-state";
import type { LiveBoxStatus } from "@/types/live-box";

const STATUS_OPTIONS: LiveBoxStatus[] = ["대기", "진행중", "종료"];
const LIVE_BOX_STATUS_FILTERS: Array<{ value: "all" | LiveBoxStatus; label: string }> = [
  { value: "all", label: "전체" },
  { value: "진행중", label: "진행중" },
  { value: "대기", label: "대기" },
  { value: "종료", label: "마감" },
];

/** 관리자 라이브 박스 관리 화면 */
export default function LiveBoxesScreenClient() {
  const { data: boxes, isLoading, isError } = useLiveBoxes();
  const { data: streamers = [] } = useStreamers();
  const formState = useAdminLiveBoxFormState({ boxes, streamers });
  const [statusFilter, setStatusFilter] = useState<"all" | LiveBoxStatus>("진행중");
  const filteredBoxes = useMemo(() => {
    const list = boxes || [];
    if (statusFilter === "all") return list;
    return list.filter((box) => box.status === statusFilter);
  }, [boxes, statusFilter]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-indigo-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">박스 관리</h1>
            <p className="text-sm text-gray-500">주제별 라이브박스를 생성하고 상태를 관리합니다.</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">상태 필터</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | LiveBoxStatus)}
            className="h-9 min-w-[120px] rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700"
          >
            {LIVE_BOX_STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            onClick={formState.onToggleAddPanel}
            className="cursor-pointer bg-gray-800 hover:bg-gray-900 text-white"
          >
            {formState.isAddOpen ? "폼 닫기" : "박스 추가"}
          </Button>
        </div>
      </div>

      {formState.isAddOpen ? (
        <LiveBoxFormPanel
          editingLiveBoxId={formState.editingLiveBoxId}
          title={formState.title}
          categoryInput={formState.categoryInput}
          participantSearch={formState.participantSearch}
          selectedParticipants={formState.selectedParticipants}
          filteredParticipants={formState.filteredParticipants}
          startsAt={formState.startsAt}
          endsAt={formState.endsAt}
          urlTitle={formState.urlTitle}
          url={formState.url}
          description={formState.description}
          status={formState.status}
          statusOptions={STATUS_OPTIONS}
          isSubmitting={formState.isSubmitting}
          onTitleChange={formState.setTitle}
          onCategoryInputChange={formState.setCategoryInput}
          onParticipantSearchChange={formState.setParticipantSearch}
          onAddParticipant={formState.addParticipant}
          onRemoveParticipant={formState.removeParticipant}
          onStartsAtChange={formState.setStartsAt}
          onEndsAtChange={formState.setEndsAt}
          onUrlTitleChange={formState.setUrlTitle}
          onUrlChange={formState.setUrl}
          onDescriptionChange={formState.setDescription}
          onStatusChange={formState.setStatus}
          onCancel={formState.closeFormPanel}
          onSubmit={formState.handleSubmit}
        />
      ) : null}

      <LiveBoxesTable
        boxes={filteredBoxes}
        isLoading={isLoading}
        isError={isError}
        onStartEdit={formState.startEdit}
      />
    </div>
  );
}
