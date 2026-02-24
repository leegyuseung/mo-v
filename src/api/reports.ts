import { createClient } from "@/utils/supabase/client";
import type { CreateEntityReportRequestInput } from "@/types/report";
import { ENTITY_REPORT_REQUEST_TABLE } from "@/lib/constant";

const supabase = createClient();

/**
 * 버츄얼, 그룹, 혹은 소속(크루)의 신고 기능을 처리하는 API입니다.
 * 대상의 구분(targetType)과 대상 고유 코드(targetCode)를 받아 `entity_report_requests` 테이블에 저장합니다.
 * @param {CreateEntityReportRequestInput} params - 신고 대상 정보와 작성자 정보를 포함하는 객체 파라미터 
 */
export async function createEntityReportRequest({
  targetType,
  targetCode,
  targetName,
  reporterId,
  reporterNickname,
  content,
}: CreateEntityReportRequestInput) {
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error("신고 내용을 입력해 주세요.");
  }

  const { error } = await supabase.from(ENTITY_REPORT_REQUEST_TABLE).insert({
    target_type: targetType,
    target_code: targetCode.trim(),
    target_name: targetName.trim(),
    reporter_id: reporterId,
    reporter_nickname: reporterNickname,
    content: trimmedContent,
    status: "pending",
  });

  if (error) {
    throw error;
  }
}
