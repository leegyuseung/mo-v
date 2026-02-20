const NICKNAME_REGEX = /^[0-9A-Za-z가-힣_]+$/;

/**
 * 닉네임 입력값을 검증하고 정제(trim)된 값을 반환한다.
 * undefined가 입력되면 undefined를 그대로 반환 (미전달 = 변경 없음).
 * 실패 시 한국어 에러 메시지와 함께 Error를 던진다.
 */
export function validateNicknameInput(nickname?: string): string | undefined {
    if (nickname === undefined) return undefined;

    const trimmed = nickname.trim();
    if (!trimmed) {
        throw new Error("닉네임은 비어 있을 수 없습니다.");
    }
    if (trimmed.length < 2 || trimmed.length > 15) {
        throw new Error("닉네임은 2자 이상 15자 이하로 입력해 주세요.");
    }
    if (!NICKNAME_REGEX.test(trimmed)) {
        throw new Error("닉네임은 한글/영문/숫자/_ 만 사용할 수 있습니다.");
    }

    return trimmed;
}
