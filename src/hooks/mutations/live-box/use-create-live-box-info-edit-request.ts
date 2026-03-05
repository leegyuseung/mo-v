import { useMutation } from "@tanstack/react-query";
import { createLiveBoxInfoEditRequest } from "@/api/live-box";

export function useCreateLiveBoxInfoEditRequest() {
  return useMutation({
    mutationFn: createLiveBoxInfoEditRequest,
  });
}
