import { useQuery } from "@tanstack/react-query";
import { fetchAdminStreamersPage } from "@/api/admin-streamers";
import type { AdminStreamerPageParams } from "@/types/admin-streamer";

export function useAdminStreamersPage(params: AdminStreamerPageParams) {
  return useQuery({
    queryKey: ["admin", "streamers-page", params],
    queryFn: () => fetchAdminStreamersPage(params),
  });
}
