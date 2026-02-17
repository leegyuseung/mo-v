import { useQuery } from "@tanstack/react-query";
import { fetchStreamerInfoEditRequests } from "@/api/admin";

export function useStreamerInfoEditRequests() {
  return useQuery({
    queryKey: ["admin", "streamer-info-edit-requests"],
    queryFn: fetchStreamerInfoEditRequests,
  });
}
