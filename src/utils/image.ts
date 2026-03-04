/**
 * Supabase Storage 공개 URL인지 확인한다.
 * Supabase CDN 이미지는 Next.js Image 최적화가 불필요하므로 unoptimized 플래그 판단에 사용한다.
 */
export function isSupabaseStorageUrl(url: string): boolean {
    return url.includes(".supabase.co/storage/v1/object/public/");
}

/**
 * Vercel Image Optimization cache write 절감을 위해
 * 외부(절대 URL) 이미지는 기본적으로 optimizer를 우회한다.
 * - 상대 경로(/logo.png)는 optimizer 유지
 * - http/https/프로토콜 상대 URL은 우회
 */
export function shouldBypassNextImageOptimization(
    url: string | null | undefined
): boolean {
    if (!url) return false;
    if (url.startsWith("/")) return false;
    return /^https?:\/\//i.test(url) || url.startsWith("//");
}
