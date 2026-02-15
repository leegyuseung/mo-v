import { useMutation } from "@tanstack/react-query";
import { createStreamerRegistrationRequest } from "@/api/streamers";

export function useCreateStreamerRequest() {
  return useMutation({
    mutationFn: createStreamerRegistrationRequest,
  });
}
