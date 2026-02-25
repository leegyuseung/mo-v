import { useQuery } from "@tanstack/react-query";
import { fetchLiveBoxes } from "@/api/admin-live-box";

export function useLiveBoxes() {
  return useQuery({
    queryKey: ["admin", "live-box"],
    queryFn: fetchLiveBoxes,
  });
}
