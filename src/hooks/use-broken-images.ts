import { useState, useCallback } from "react";

/**
 * 이미지 로드 실패를 ID별로 추적하는 훅.
 * group-screen, crew-screen 등에서 동일하게 사용되던 brokenImageById 패턴을 통합한다.
 */
export function useBrokenImages() {
    const [brokenIds, setBrokenIds] = useState<Record<number, boolean>>({});

    const markBroken = useCallback((id: number) => {
        setBrokenIds((prev) => ({ ...prev, [id]: true }));
    }, []);

    const isBroken = useCallback(
        (id: number) => brokenIds[id] === true,
        [brokenIds],
    );

    return { isBroken, markBroken };
}
