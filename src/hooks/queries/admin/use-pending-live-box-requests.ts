import { useQuery } from "@tanstack/react-query";
import { fetchPendingLiveBoxRequests } from "@/api/admin-live-box-requests";

export function usePendingLiveBoxRequests() {
  return useQuery({
    queryKey: ["admin", "pending-live-box-requests"],
    queryFn: fetchPendingLiveBoxRequests,
  });
}
