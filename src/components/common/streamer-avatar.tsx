import Image from "next/image";
import { UserRound, UsersRound } from "lucide-react";

/** StreamerAvatar에 전달하는 props */
type StreamerAvatarProps = {
    /** 이미지 URL. 없으면 fallback 아이콘을 표시한다 */
    src: string | null | undefined;
    /** 이미지 alt 텍스트 */
    alt: string;
    /** px 단위 렌더링 크기 (width = height) */
    size: number;
    /** object-fit 방식. cover(프로필) / contain(로고) */
    objectFit?: "cover" | "contain";
    /** 그룹 아이콘 형태 여부. true이면 UsersRound 아이콘을 fallback으로 사용한다 */
    isGroup?: boolean;
    /** priority 로드 여부 (LCP 이미지에만 true) */
    priority?: boolean;
    /** 추가 className (border, bg 등) */
    className?: string;
};

/**
 * 스트리머·그룹·소속 프로필 이미지를 표시하는 공통 아바타 컴포넌트.
 * Next.js <Image> 를 사용하여 자동 WebP 변환과 sizes 기반 srcset을 활용한다.
 */
export default function StreamerAvatar({
    src,
    alt,
    size,
    objectFit = "cover",
    isGroup = false,
    priority = false,
    className = "",
}: StreamerAvatarProps) {
    const FallbackIcon = isGroup ? UsersRound : UserRound;
    const iconSize = size <= 32 ? "h-4 w-4" : size <= 56 ? "h-5 w-5" : "h-7 w-7";

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{ width: size, height: size }}
        >
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes={`${size}px`}
                    priority={priority}
                    loading={priority ? "eager" : "lazy"}
                    className={objectFit === "contain" ? "object-contain" : "object-cover"}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <FallbackIcon className={`${iconSize} text-gray-300`} />
                </div>
            )}
        </div>
    );
}
