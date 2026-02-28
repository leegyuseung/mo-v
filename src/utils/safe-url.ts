/**
 * 외부 링크를 렌더링하기 전 http/https 프로토콜만 허용한다.
 * 왜: javascript:, data: 같은 스킴 주입으로 인한 XSS 위험을 줄인다.
 */
export function toSafeExternalHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}
