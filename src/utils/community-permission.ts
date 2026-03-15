import { hasAdminAccess } from "@/utils/role";

type CommunityPostPermissionInput = {
  authorId: string;
  viewerId?: string | null;
  role?: string | null;
};

export type CommunityPostPermission = {
  isLoggedIn: boolean;
  isAuthor: boolean;
  canManage: boolean;
  canReport: boolean;
};

export function canManageCommunityNoticeCategory(role?: string | null) {
  return hasAdminAccess(role);
}

export function getCommunityPostPermission({
  authorId,
  viewerId,
  role,
}: CommunityPostPermissionInput): CommunityPostPermission {
  const isLoggedIn = Boolean(viewerId);
  const isAuthor = Boolean(viewerId) && viewerId === authorId;
  const canManage = isAuthor || (isLoggedIn && hasAdminAccess(role));

  return {
    isLoggedIn,
    isAuthor,
    canManage,
    canReport: isLoggedIn && !canManage,
  };
}
