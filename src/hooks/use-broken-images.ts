import { useState, useCallback } from "react";

function buildBrokenImageKey(id: number, version?: string) {
    return version ? `${id}:${version}` : String(id);
}

/**
 * 이미지 로드 실패를 ID별로 추적하는 훅.
 * group-screen, crew-screen 등에서 동일하게 사용되던 brokenImageById 패턴을 통합한다.
 */
export function useBrokenImages() {
    const [brokenIds, setBrokenIds] = useState<Record<string, boolean>>({});

    const markBroken = useCallback((id: number, version?: string) => {
        const key = buildBrokenImageKey(id, version);
        setBrokenIds((prev) => ({ ...prev, [key]: true }));
    }, []);

    const isBroken = useCallback(
        (id: number, version?: string) =>
            brokenIds[buildBrokenImageKey(id, version)] === true,
        [brokenIds],
    );

    return { isBroken, markBroken };
}
