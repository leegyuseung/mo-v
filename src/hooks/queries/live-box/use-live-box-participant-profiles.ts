import { useQuery } from "@tanstack/react-query";
import { fetchLiveBoxParticipantProfiles } from "@/api/live-box";

export function useLiveBoxParticipantProfiles() {
  return useQuery({
    queryKey: ["live-box", "participant-profiles"],
    queryFn: fetchLiveBoxParticipantProfiles,
  });
}
