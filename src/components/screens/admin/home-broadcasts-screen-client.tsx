"use client";

import { useMemo, useState } from "react";
import { Megaphone } from "lucide-react";
import { toast } from "sonner";
import HomeBroadcastDeleteDialog from "@/components/screens/admin/home-broadcast-delete-dialog";
import HomeBroadcastsFilters from "@/components/screens/admin/home-broadcasts-filters";
import HomeBroadcastsTable from "@/components/screens/admin/home-broadcasts-table";
import { useAdminHomeBroadcasts } from "@/hooks/queries/admin/use-admin-home-broadcasts";
import { useDeleteAdminHomeBroadcast } from "@/hooks/mutations/admin/use-delete-home-broadcast";
import type {
  AdminHomeBroadcastItem,
  AdminHomeBroadcastStatusFilter,
} from "@/types/admin-home-broadcast";

export default function HomeBroadcastsScreenClient() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminHomeBroadcastStatusFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<AdminHomeBroadcastItem | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const { data, isLoading, isError } = useAdminHomeBroadcasts();
  const { mutateAsync: deleteBroadcast, isPending: isDeleting } = useDeleteAdminHomeBroadcast();

  const filteredItems = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();

    return (data || []).filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      if (!normalizedKeyword) {
        return true;
      }

      return [
        item.content,
        item.author_nickname || "",
        item.deleted_by_label || "",
        item.deleted_reason || "",
      ].some((value) => value.toLowerCase().includes(normalizedKeyword));
    });
  }, [data, searchKeyword, statusFilter]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    const trimmedReason = deleteReason.trim();
    if (!trimmedReason) {
      toast.error("삭제 사유를 입력해 주세요.");
      return;
    }

    try {
      await deleteBroadcast({
        id: deleteTarget.id,
        reason: trimmedReason,
      });
      toast.success("전광판을 삭제했습니다.");
      setDeleteTarget(null);
      setDeleteReason("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "전광판 삭제에 실패했습니다.");
    }
  };

  return (
    <>
      <div className="mx-auto max-w-7xl p-6 md:p-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-indigo-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">전광판 관리</h1>
              <p className="text-sm text-gray-500">진행중, 종료, 삭제 상태의 전광판 메시지를 함께 관리합니다.</p>
            </div>
          </div>
          <HomeBroadcastsFilters
            searchKeyword={searchKeyword}
            statusFilter={statusFilter}
            onSearchKeywordChange={setSearchKeyword}
            onStatusFilterChange={setStatusFilter}
          />
        </div>

        <HomeBroadcastsTable
          items={filteredItems}
          isLoading={isLoading}
          isError={isError}
          onDeleteClick={(item) => {
            setDeleteTarget(item);
            setDeleteReason("");
          }}
        />
      </div>

      <HomeBroadcastDeleteDialog
        deleteTarget={deleteTarget}
        deleteReason={deleteReason}
        isDeleting={isDeleting}
        onDeleteReasonChange={setDeleteReason}
        onClose={() => {
          if (isDeleting) return;
          setDeleteTarget(null);
          setDeleteReason("");
        }}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
