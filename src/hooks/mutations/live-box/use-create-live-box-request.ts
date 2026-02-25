import { useMutation } from "@tanstack/react-query";
import { createLiveBoxRequest } from "@/api/live-box-requests";

export function useCreateLiveBoxRequest() {
  return useMutation({
    mutationFn: createLiveBoxRequest,
  });
}
