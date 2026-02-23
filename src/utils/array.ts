/**
 * 지정된 길이의 빈 배열을 생성한다.
 * 반복 렌더링이나 스켈레톤 UI 생성 시 사용한다.
 *
 * @param length - 생성할 배열의 길이
 * @returns 지정된 길이의 빈 배열
 *
 * @example
 * generateArray(3).map((_, i) => <div key={i}>Item {i}</div>)
 */
export function generateArray(length: number): undefined[] {
    return Array.from({ length });
}
