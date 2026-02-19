import { useQuery } from "@tanstack/react-query";
import { fetchCrewCards } from "@/api/crews";

export function useCrewCards() {
  return useQuery({
    queryKey: ["crew-cards"],
    queryFn: fetchCrewCards,
  });
}
