import { useQuery } from "@tanstack/react-query";
import { fetchAdminHomeBroadcasts } from "@/api/admin-home-broadcast";

export function useAdminHomeBroadcasts() {
  return useQuery({
    queryKey: ["admin", "home-broadcasts"],
    queryFn: fetchAdminHomeBroadcasts,
  });
}
