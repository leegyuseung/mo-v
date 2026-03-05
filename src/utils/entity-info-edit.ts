import type { EntityInfoEditTargetType } from "@/types/entity-info-edit";

const ENTITY_INFO_EDIT_TARGET_LABELS: Record<EntityInfoEditTargetType, string> = {
  group: "그룹",
  crew: "크루",
  contents: "콘텐츠",
  live_box: "라이브박스",
};

export function getEntityInfoEditTargetLabel(targetType: string): string {
  if (targetType in ENTITY_INFO_EDIT_TARGET_LABELS) {
    return ENTITY_INFO_EDIT_TARGET_LABELS[targetType as EntityInfoEditTargetType];
  }

  return "버츄얼";
}
