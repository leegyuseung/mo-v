import { useQuery } from "@tanstack/react-query";
import { fetchChzzkChannelProfile } from "@/api/admin";

export function useChzzkChannelProfile(channelId: string, enabled: boolean) {
    return useQuery({
        queryKey: ["admin", "chzzk-channel-profile", channelId],
        queryFn: () => fetchChzzkChannelProfile(channelId),
        enabled,
        staleTime: 1000 * 60 * 5,
    });
}
