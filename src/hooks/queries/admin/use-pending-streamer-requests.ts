import { useQuery } from "@tanstack/react-query";
import { fetchPendingStreamerRequests } from "@/api/admin-streamers";

export function usePendingStreamerRequests() {
    return useQuery({
        queryKey: ["admin", "pending-streamer-requests"],
        queryFn: fetchPendingStreamerRequests,
    });
}
