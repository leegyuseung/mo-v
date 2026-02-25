import { createClient } from "@/utils/supabase/client";
import { LIVE_BOX_REQUEST_MODAL_TEXT, LIVE_BOX_REQUEST_TABLE } from "@/lib/constant";
import type { CreateLiveBoxRequestInput } from "@/types/live-box-request";

const supabase = createClient();

function normalizeRelatedSite(rawSite: string) {
  const trimmed = rawSite.trim();
  if (!trimmed) {
    throw new Error(LIVE_BOX_REQUEST_MODAL_TEXT.relatedSiteRequired);
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(candidate).toString();
  } catch {
    throw new Error(LIVE_BOX_REQUEST_MODAL_TEXT.relatedSiteInvalid);
  }
}

/** 라이브박스 추가 요청을 생성한다. */
export async function createLiveBoxRequest({
  requesterId,
  topic,
  relatedSite,
}: CreateLiveBoxRequestInput) {
  const trimmedTopic = topic.trim();
  if (!trimmedTopic) {
    throw new Error(LIVE_BOX_REQUEST_MODAL_TEXT.topicRequired);
  }

  const normalizedRelatedSite = normalizeRelatedSite(relatedSite);

  const { data: existingPending, error: existingPendingError } = await supabase
    .from(LIVE_BOX_REQUEST_TABLE)
    .select("id")
    .eq("requester_id", requesterId)
    .eq("topic", trimmedTopic)
    .eq("status", "pending")
    .limit(1);

  if (existingPendingError) {
    throw existingPendingError;
  }

  if (existingPending && existingPending.length > 0) {
    throw new Error(LIVE_BOX_REQUEST_MODAL_TEXT.alreadyPending);
  }

  const { error } = await supabase.from(LIVE_BOX_REQUEST_TABLE).insert({
    requester_id: requesterId,
    topic: trimmedTopic,
    related_site: normalizedRelatedSite,
    status: "pending",
  });

  if (error) {
    throw error;
  }
}
