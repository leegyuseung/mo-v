import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useApproveLiveBoxRequest } from "@/hooks/mutations/admin/use-approve-live-box-request";
import type { LiveBoxAdminPendingRequest } from "@/types/live-box-request";
import type { LiveBoxStatus } from "@/types/live-box";
import type {
  LiveBoxFormSubmitPayload,
  LiveBoxParticipantCandidate,
} from "@/types/admin-live-box";
import { normalizeLiveBoxExternalLink, parseLiveBoxCategoryInput, validateLiveBoxExternalLink } from "@/utils/admin-live-box";
import { toSeoulBoundaryIso } from "@/utils/seoul-time";

type UseLiveBoxRequestApprovalFormParams = {
  request: LiveBoxAdminPendingRequest;
  participantCandidates: LiveBoxParticipantCandidate[];
};

export function useLiveBoxRequestApprovalForm({
  request,
  participantCandidates,
}: UseLiveBoxRequestApprovalFormParams) {
  const { mutate: approveLiveBoxRequest, isPending } = useApproveLiveBoxRequest();
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [title, setTitle] = useState(request.topic.trim());
  const [categoryInput, setCategoryInput] = useState("");
  const [participantSearch, setParticipantSearch] = useState("");
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [urlTitle, setUrlTitle] = useState("관련 사이트");
  const [url, setUrl] = useState(request.related_site);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<LiveBoxStatus>("대기");

  const participantCandidateById = useMemo(() => {
    return new Map(participantCandidates.map((candidate) => [candidate.platformId, candidate]));
  }, [participantCandidates]);

  const selectedParticipants = useMemo(() => {
    return selectedParticipantIds.map((platformId) => {
      const found = participantCandidateById.get(platformId);
      if (found) return found;
      return {
        streamerId: -1,
        platformId,
        platformLabel: "CHZZK" as const,
        nickname: null,
      };
    });
  }, [participantCandidateById, selectedParticipantIds]);

  const filteredParticipants = useMemo(() => {
    const keyword = participantSearch.trim().toLowerCase();
    if (!keyword) return [];

    return participantCandidates
      .filter((candidate) => {
        if (selectedParticipantIds.includes(candidate.platformId)) return false;
        return (candidate.nickname || "").toLowerCase().includes(keyword);
      })
      .slice(0, 8);
  }, [participantCandidates, participantSearch, selectedParticipantIds]);

  const addParticipant = useCallback((platformId: string) => {
    setSelectedParticipantIds((prev) => {
      if (prev.includes(platformId)) return prev;
      return [...prev, platformId];
    });
    setParticipantSearch("");
  }, []);

  const removeParticipant = useCallback((platformId: string) => {
    setSelectedParticipantIds((prev) => prev.filter((id) => id !== platformId));
  }, []);

  const closeApprovePanel = useCallback(() => {
    setIsApproveOpen(false);
  }, []);

  const openApprovePanel = useCallback(() => {
    setIsApproveOpen(true);
  }, []);

  const handleApprove = useCallback(() => {
    if (!title.trim()) {
      toast.error("제목은 필수입니다.");
      return;
    }

    const categories = parseLiveBoxCategoryInput(categoryInput);
    if (categories.length === 0) {
      toast.error("카테고리를 1개 이상 입력해 주세요.");
      return;
    }

    if (startsAt && endsAt && startsAt > endsAt) {
      toast.error("시작일시는 종료일시보다 늦을 수 없습니다.");
      return;
    }

    const linkValidationMessage = validateLiveBoxExternalLink({
      urlTitle,
      url,
    });
    if (linkValidationMessage) {
      toast.error(linkValidationMessage);
      return;
    }

    const normalizedExternalLink = normalizeLiveBoxExternalLink({
      urlTitle,
      url,
    });

    const startsAtIso = startsAt ? toSeoulBoundaryIso(startsAt, "start") : null;
    const endsAtIso = endsAt ? toSeoulBoundaryIso(endsAt, "end") : null;

    if (startsAt && !startsAtIso) {
      toast.error("시작일시 형식이 올바르지 않습니다.");
      return;
    }

    if (endsAt && !endsAtIso) {
      toast.error("종료일시 형식이 올바르지 않습니다.");
      return;
    }

    const payload: LiveBoxFormSubmitPayload = {
      title: title.trim(),
      category: categories,
      participant_streamer_ids: selectedParticipantIds,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
      url_title: normalizedExternalLink.urlTitle || null,
      url: normalizedExternalLink.url || null,
      description: description.trim() || null,
      status,
    };

    approveLiveBoxRequest(
      { requestId: request.id, payload },
      {
        onSuccess: () => {
          setIsApproveOpen(false);
        },
      }
    );
  }, [
    approveLiveBoxRequest,
    categoryInput,
    description,
    endsAt,
    request.id,
    selectedParticipantIds,
    startsAt,
    status,
    title,
    url,
    urlTitle,
  ]);

  return {
    isApproveOpen,
    title,
    categoryInput,
    participantSearch,
    selectedParticipants,
    filteredParticipants,
    startsAt,
    endsAt,
    urlTitle,
    url,
    description,
    status,
    isSubmitting: isPending,
    setTitle,
    setCategoryInput,
    setParticipantSearch,
    setStartsAt,
    setEndsAt,
    setUrlTitle,
    setUrl,
    setDescription,
    setStatus,
    addParticipant,
    removeParticipant,
    openApprovePanel,
    closeApprovePanel,
    handleApprove,
  };
}
