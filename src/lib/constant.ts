import type { StreamerPlatform, StreamerSortOrder } from "@/types/streamer";

export const STREAMER_PAGE_SIZE = 12;

export const STREAMER_PLATFORM_OPTIONS: { label: string; value: StreamerPlatform }[] = [
  { label: "전체", value: "all" },
  { label: "치지직", value: "chzzk" },
  { label: "SOOP", value: "soop" },
];

export const STREAMER_SORT_OPTIONS: { label: string; value: StreamerSortOrder }[] = [
  { label: "가나다순", value: "asc" },
  { label: "역순", value: "desc" },
];

export const STREAMER_REQUEST_MODAL_TEXT = {
  title: "스트리머 추가 요청",
  description: "관리자가 확인 후 등록합니다. 플랫폼과 채널/방송국 주소를 입력해 주세요.",
  urlRequired: "주소를 입력해 주세요.",
  urlInvalid: "올바른 플랫폼 주소 형식으로 입력해 주세요.",
  alreadyPending: "이미 처리대기중입니다.",
  submitSuccess: "등록대기 요청이 접수되었습니다.",
  submitButton: "등록대기",
  cancelButton: "취소",
} as const;

export const STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT = {
  title: "정보 수정 요청",
  description: "수정이 필요한 내용을 입력해 주세요. 관리자가 확인 후 반영합니다.",
  contentRequired: "수정 요청 내용을 입력해 주세요.",
  submitSuccess: "정보 수정 요청이 접수되었습니다.",
  submitButton: "확인",
  cancelButton: "취소",
} as const;

export const GROUP_INFO_EDIT_REQUEST_MODAL_TEXT = {
  title: "그룹 정보 수정 요청",
  description: "수정이 필요한 내용을 입력해 주세요. 관리자가 확인 후 반영합니다.",
  contentRequired: "수정 요청 내용을 입력해 주세요.",
  submitSuccess: "정보 수정 요청이 접수되었습니다.",
  submitButton: "확인",
  cancelButton: "취소",
} as const;

export const STREAMER_TABLE = "streamers";
export const STREAMER_REQUEST_TABLE = "streamer_registration_requests";
export const STREAMER_INFO_EDIT_REQUEST_TABLE = "streamer_info_edit_requests";
