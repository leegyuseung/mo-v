import { useMutation } from "@tanstack/react-query";
import { createStreamerInfoEditRequest } from "@/api/streamers";

export function useCreateStreamerInfoEditRequest() {
  return useMutation({
    mutationFn: createStreamerInfoEditRequest,
  });
}
