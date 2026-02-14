import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "@/api/admin";

export function useDashboardStats() {
    return useQuery({
        queryKey: ["admin", "dashboard-stats"],
        queryFn: fetchDashboardStats,
    });
}
