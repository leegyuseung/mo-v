"use client";

import { Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import LiveBoxFormPanel from "@/components/screens/admin/live-box-form-panel";
import LiveBoxesTable from "@/components/screens/admin/live-boxes-table";
import LiveBoxPendingRequestsTable from "@/components/screens/admin/live-box-pending-requests-table";
import { useLiveBoxes } from "@/hooks/queries/admin/use-live-boxes";
import { usePendingLiveBoxRequests } from "@/hooks/queries/admin/use-pending-live-box-requests";
import { useStreamers } from "@/hooks/queries/admin/use-streamers";
import { useAdminLiveBoxFormState } from "@/hooks/use-admin-live-box-form-state";
import type { LiveBoxStatus } from "@/types/live-box";

const STATUS_OPTIONS: LiveBoxStatus[] = ["대기", "진행중", "종료"];

/** 관리자 라이브 박스 관리 화면 */
export default function LiveBoxesScreenClient() {
  const { data: boxes, isLoading, isError } = useLiveBoxes();
  const {
    data: pendingLiveBoxRequests,
    isLoading: isPendingLiveBoxRequestsLoading,
    isError: isPendingLiveBoxRequestsError,
  } = usePendingLiveBoxRequests();
  const { data: streamers = [] } = useStreamers();
  const formState = useAdminLiveBoxFormState({ boxes, streamers });

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
        <Button
          type="button"
          onClick={formState.onToggleAddPanel}
          className="cursor-pointer bg-gray-800 hover:bg-gray-900 text-white"
        >
          {formState.isAddOpen ? "폼 닫기" : "박스 추가"}
        </Button>
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
          onDescriptionChange={formState.setDescription}
          onStatusChange={formState.setStatus}
          onCancel={formState.closeFormPanel}
          onSubmit={formState.handleSubmit}
        />
      ) : null}

      <LiveBoxesTable
        boxes={boxes}
        isLoading={isLoading}
        isError={isError}
        onStartEdit={formState.startEdit}
      />

      <div className="mt-10 mb-4 flex items-center gap-2">
        <Boxes className="w-5 h-5 text-cyan-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">박스 등록 요청 대기</h2>
          <p className="text-sm text-gray-500">대기 상태(pending) 요청만 표시됩니다.</p>
        </div>
      </div>

      <LiveBoxPendingRequestsTable
        pendingLiveBoxRequests={pendingLiveBoxRequests}
        isLoading={isPendingLiveBoxRequestsLoading}
        isError={isPendingLiveBoxRequestsError}
      />
    </div>
  );
}
