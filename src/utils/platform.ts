import type { StreamerPlatform } from "@/types/streamer";

/**
 * 플랫폼 필터 버튼이 활성 상태일 때의 CSS 클래스를 반환한다.
 */
export function getPlatformActiveClass(value: StreamerPlatform): string {
    if (value === "all") {
        return "bg-white text-gray-900 border-gray-300 hover:bg-gray-50";
    }
    if (value === "chzzk") {
        return "bg-green-500 text-white border-green-500 hover:bg-green-600 hover:text-white";
    }
    return "bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:text-white";
}

/**
 * 플랫폼 필터 버튼이 비활성 상태일 때의 CSS 클래스를 반환한다.
 */
export function getPlatformInactiveClass(value: StreamerPlatform): string {
    if (value === "all") {
        return "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800";
    }
    if (value === "chzzk") {
        return "border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700";
    }
    return "border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700";
}

/**
 * 플랫폼에 따른 보더 색상 클래스를 반환한다 (아바타 링 등에 사용).
 */
export function getPlatformBorderColor(platform: string | null): string {
    if (platform === "chzzk") return "border-green-500";
    if (platform === "soop") return "border-blue-500";
    return "border-gray-200";
}
