import { useQuery } from "@tanstack/react-query";
import { fetchPublicLiveBoxes } from "@/api/live-box";

export function useLiveBoxes() {
  return useQuery({
    queryKey: ["live-box", "list"],
    queryFn: fetchPublicLiveBoxes,
  });
}
