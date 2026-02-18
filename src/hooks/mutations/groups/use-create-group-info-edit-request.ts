import { useMutation } from "@tanstack/react-query";
import { createGroupInfoEditRequest } from "@/api/groups";

export function useCreateGroupInfoEditRequest() {
  return useMutation({
    mutationFn: createGroupInfoEditRequest,
  });
}
