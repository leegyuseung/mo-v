import { useQuery } from "@tanstack/react-query";
import { fetchStreamerTopDonors } from "@/api/heart";
import type { DonorPeriod } from "@/types/heart";
import type { StreamerTopDonor } from "@/types/profile";

/** 특정 버츄얼의 기간별 하트 선물 상위 후원자를 조회한다. */
export function useStreamerTopDonors(streamerId: number, donorPeriod: DonorPeriod) {
  return useQuery({
    queryKey: ["streamer-top-donors", streamerId, donorPeriod],
    queryFn: async () => {
      const result = await fetchStreamerTopDonors(streamerId, 10, 0, donorPeriod);
      return result.data as StreamerTopDonor[];
    },
    enabled: Boolean(streamerId),
  });
}
