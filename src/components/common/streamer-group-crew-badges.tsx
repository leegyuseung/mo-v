/**
 * 스트리머의 그룹·크루 태그 배지 목록을 렌더링하는 공통 컴포넌트.
 * vlist-screen, live-screen 등에서 동일하게 사용되던 패턴을 통합한다.
 */
export default function StreamerGroupCrewBadges({
    streamerId,
    groupNames,
    crewNames,
    groupNameByCode,
}: {
    streamerId: number;
    groupNames?: string[] | null;
    crewNames?: string[] | null;
    groupNameByCode?: Map<string, string>;
}) {
    const hasGroups = groupNames && groupNames.length > 0;
    const hasCrews = crewNames && crewNames.length > 0;

    if (!hasGroups && !hasCrews) return null;

    return (
        <div className="mt-1 flex flex-wrap gap-1.5">
            {groupNames?.map((group) => (
                <span
                    key={`${streamerId}-group-${group}`}
                    className="inline-flex items-center rounded-full border border-pink-100 bg-pink-50 px-2 py-0.5 text-[10px] font-medium text-pink-700"
                >
                    {groupNameByCode?.get(group.trim().toLowerCase()) || group}
                </span>
            ))}
            {crewNames?.map((crew) => (
                <span
                    key={`${streamerId}-crew-${crew}`}
                    className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700"
                >
                    {crew}
                </span>
            ))}
        </div>
    );
}
