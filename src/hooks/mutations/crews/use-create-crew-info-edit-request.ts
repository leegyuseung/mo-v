import { useMutation } from "@tanstack/react-query";
import { createCrewInfoEditRequest } from "@/api/crews";

export function useCreateCrewInfoEditRequest() {
  return useMutation({
    mutationFn: createCrewInfoEditRequest,
  });
}
