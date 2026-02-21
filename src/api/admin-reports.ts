import { createClient } from "@/utils/supabase/client";
import type { EntityReportRequest } from "@/types/report";
import { ENTITY_REPORT_REQUEST_TABLE } from "@/lib/constant";

const supabase = createClient();

export async function fetchEntityReportRequests(): Promise<EntityReportRequest[]> {
  const { data, error } = await supabase
    .from(ENTITY_REPORT_REQUEST_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as EntityReportRequest[];
}

export async function deleteEntityReportRequest(requestId: number) {
  const { error } = await supabase
    .from(ENTITY_REPORT_REQUEST_TABLE)
    .delete()
    .eq("id", requestId);

  if (error) {
    throw error;
  }
}
