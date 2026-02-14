import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/api/admin";

export function useUsers() {
    return useQuery({
        queryKey: ["admin", "users"],
        queryFn: fetchUsers,
    });
}
