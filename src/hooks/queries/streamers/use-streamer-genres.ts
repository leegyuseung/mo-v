import { useQuery } from "@tanstack/react-query";
import { fetchStreamerGenres } from "@/api/streamers";

export function useStreamerGenres() {
  return useQuery({
    queryKey: ["streamer-genres"],
    queryFn: fetchStreamerGenres,
  });
}
