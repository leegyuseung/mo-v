import { useQuery } from "@tanstack/react-query";
import { fetchStreamers } from "@/api/admin-streamers";

export function useStreamers() {
    return useQuery({
        queryKey: ["admin", "streamers"],
        queryFn: fetchStreamers,
    });
}
