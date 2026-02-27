import { createClient } from "@/utils/supabase/client";
import { CONTENT_IMAGE_BUCKET, CONTENT_TABLE } from "@/lib/constant";
import type {
  Content,
  ContentCreateInput,
  ContentUpdateInput,
  ContentWithAuthorProfile,
} from "@/types/content";

const supabase = createClient();

/** 관리자 콘텐츠 목록을 최신순으로 조회한다. */
export async function fetchAdminContents(): Promise<ContentWithAuthorProfile[]> {
  const { data, error } = await supabase
    .from(CONTENT_TABLE)
    .select("*, author_profile:profiles!contents_created_by_fkey(nickname)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as ContentWithAuthorProfile[];
}

/** 콘텐츠를 생성한다. created_by는 DB 기본값(auth.uid())을 사용한다. */
export async function createAdminContent(payload: ContentCreateInput): Promise<Content> {
  const { data, error } = await supabase
    .from(CONTENT_TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/** 콘텐츠를 수정한다. */
export async function updateAdminContent(
  contentId: number,
  payload: ContentUpdateInput
): Promise<Content> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const nowIso = new Date().toISOString();
  const nextPayload: ContentUpdateInput = {
    ...payload,
    updated_at: nowIso,
    updated_by: user.id,
  };

  if (payload.status === "deleted") {
    nextPayload.deleted_at = nowIso;
    nextPayload.deleted_by = user.id;
  }

  const { data, error } = await supabase
    .from(CONTENT_TABLE)
    .update(nextPayload)
    .eq("id", contentId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/** 콘텐츠를 삭제한다. */
export async function deleteAdminContent(contentId: number): Promise<void> {
  const { error } = await supabase.from(CONTENT_TABLE).delete().eq("id", contentId);
  if (error) throw error;
}

/** 콘텐츠 이미지를 Storage에 업로드하고 공개 URL을 반환한다. */
export async function uploadContentImage(file: File, userId: string): Promise<string> {
  const fileExt = (file.name.split(".").pop() || "png").toLowerCase();
  const randomKey =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(36).slice(2, 14);
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  const filePath = `${safeUserId}/${Date.now()}_${randomKey}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(CONTENT_IMAGE_BUCKET)
    .upload(filePath, file, { upsert: false });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(CONTENT_IMAGE_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}
