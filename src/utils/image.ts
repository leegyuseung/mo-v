/**
 * Supabase Storage 공개 URL인지 확인한다.
 * Supabase CDN 이미지는 Next.js Image 최적화가 불필요하므로 unoptimized 플래그 판단에 사용한다.
 */
export function isSupabaseStorageUrl(url: string): boolean {
    return url.includes(".supabase.co/storage/v1/object/public/");
}
