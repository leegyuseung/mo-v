"use client";

import { useDashboardStats } from "@/hooks/queries/admin/use-dashboard-stats";
import {
  Users,
  Mail,
  Globe,
  MessageCircle,
  TvMinimalPlay,
  UsersRound,
  Building2,
  Boxes,
  Clapperboard,
  Clock,
  Pencil,
  Siren,
  Bug,
} from "lucide-react";
import { StatCard, StatCardSkeleton } from "@/components/screens/admin/stat-card";
import SignupTrendChart, {
  SignupTrendChartSkeleton,
} from "@/components/screens/admin/signup-trend-chart";
import type { SectionTitleProps } from "@/types/admin-component-props";

/** 대시보드 내 섹션 구분 제목 + 설명을 표시한다 */
function SectionTitle({ title, description }: SectionTitleProps) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="mt-0.5 text-xs text-gray-500">{description}</p>
    </div>
  );
}

/** 관리자 대시보드 화면 — 유저 통계, 등록 자산, 요청 대기 현황을 카드와 차트로 표시 */
export default function DashboardScreen() {
  const { data: stats, isLoading } = useDashboardStats();

  /** 가입자 현황 카드 데이터 (유저 수 · 가입 방식 분포) */
  const userCards = stats
    ? [
      {
        title: "전체 유저",
        value: stats.totalUsers,
        icon: Users,
        color: "from-blue-500 to-blue-600",
        bgLight: "bg-blue-50",
        textColor: "text-blue-600",
        ratioBase: stats.totalUsers,
        unit: "명",
      },
      {
        title: "이메일 가입",
        value: stats.emailUsers,
        icon: Mail,
        color: "from-emerald-500 to-emerald-600",
        bgLight: "bg-emerald-50",
        textColor: "text-emerald-600",
        ratioBase: stats.totalUsers,
        unit: "명",
      },
      {
        title: "구글 가입",
        value: stats.googleUsers,
        icon: Globe,
        color: "from-red-500 to-red-600",
        bgLight: "bg-red-50",
        textColor: "text-red-600",
        ratioBase: stats.totalUsers,
        unit: "명",
      },
      {
        title: "카카오 가입",
        value: stats.kakaoUsers,
        icon: MessageCircle,
        color: "from-yellow-500 to-amber-500",
        bgLight: "bg-yellow-50",
        textColor: "text-yellow-600",
        ratioBase: stats.totalUsers,
        unit: "명",
      },
    ]
    : [];

  /** 등록 자산 카드의 비율 계산 기준 */
  const entityBase = stats
    ? Math.max(
      stats.totalStreamers,
      stats.totalGroups,
      stats.totalCrews,
      stats.totalLiveBoxes,
      stats.totalContents,
      1
    )
    : 1;
  /** 등록 자산 카드 데이터 (버츄얼 · 그룹 · 소속 수) */
  const entityCards = stats
    ? [
      {
        title: "등록된 버츄얼",
        value: stats.totalStreamers,
        icon: TvMinimalPlay,
        color: "from-purple-500 to-purple-600",
        bgLight: "bg-purple-50",
        textColor: "text-purple-600",
        ratioBase: entityBase,
        unit: "개",
      },
      {
        title: "등록된 그룹",
        value: stats.totalGroups,
        icon: UsersRound,
        color: "from-indigo-500 to-indigo-600",
        bgLight: "bg-indigo-50",
        textColor: "text-indigo-600",
        ratioBase: entityBase,
        unit: "개",
      },
      {
        title: "등록된 소속",
        value: stats.totalCrews,
        icon: Building2,
        color: "from-sky-500 to-sky-600",
        bgLight: "bg-sky-50",
        textColor: "text-sky-600",
        ratioBase: entityBase,
        unit: "개",
      },
      {
        title: "등록된 박스",
        value: stats.totalLiveBoxes,
        icon: Boxes,
        color: "from-cyan-500 to-cyan-600",
        bgLight: "bg-cyan-50",
        textColor: "text-cyan-600",
        ratioBase: entityBase,
        unit: "개",
      },
      {
        title: "등록된 콘텐츠",
        value: stats.totalContents,
        icon: Clapperboard,
        color: "from-indigo-500 to-violet-600",
        bgLight: "bg-indigo-50",
        textColor: "text-indigo-600",
        ratioBase: entityBase,
        unit: "개",
      },
    ]
    : [];

  /** 요청 대기 카드의 비율 계산 기준 */
  const pendingBase = stats
    ? Math.max(
      stats.pendingStreamerRequests,
      stats.pendingInfoEditRequests,
      stats.pendingReportRequests,
      stats.pendingHomepageErrorReports,
      stats.pendingLiveBoxRequests,
      stats.pendingContentRequests,
      1
    )
    : 1;
  /** 요청 대기 카드 데이터 (등록 대기 · 정보 수정 · 신고) */
  const pendingCards = stats
    ? [
      {
        title: "버츄얼 등록 대기",
        value: stats.pendingStreamerRequests,
        icon: Clock,
        color: "from-emerald-500 to-emerald-600",
        bgLight: "bg-emerald-50",
        textColor: "text-emerald-600",
        ratioBase: pendingBase,
        unit: "건",
      },
      {
        title: "정보 수정 요청(버츄얼+그룹/크루/콘텐츠)",
        value: stats.pendingInfoEditRequests,
        icon: Pencil,
        color: "from-orange-500 to-orange-600",
        bgLight: "bg-orange-50",
        textColor: "text-orange-600",
        ratioBase: pendingBase,
        unit: "건",
      },
      {
        title: "신고 관리",
        value: stats.pendingReportRequests,
        icon: Siren,
        color: "from-rose-500 to-rose-600",
        bgLight: "bg-rose-50",
        textColor: "text-rose-600",
        ratioBase: pendingBase,
        unit: "건",
      },
      {
        title: "홈페이지 오류 신고",
        value: stats.pendingHomepageErrorReports,
        icon: Bug,
        color: "from-amber-500 to-amber-600",
        bgLight: "bg-amber-50",
        textColor: "text-amber-600",
        ratioBase: pendingBase,
        unit: "건",
      },
      {
        title: "박스 등록 요청",
        value: stats.pendingLiveBoxRequests,
        icon: Boxes,
        color: "from-cyan-500 to-cyan-600",
        bgLight: "bg-cyan-50",
        textColor: "text-cyan-600",
        ratioBase: pendingBase,
        unit: "건",
      },
      {
        title: "콘텐츠 등록 요청 대기",
        value: stats.pendingContentRequests,
        icon: Clapperboard,
        color: "from-indigo-500 to-violet-600",
        bgLight: "bg-indigo-50",
        textColor: "text-indigo-600",
        ratioBase: pendingBase,
        unit: "건",
      },
    ]
    : [];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">mo-v 서비스 현황을 한눈에 확인하세요.</p>
      </div>

      {/* ─── 가입자 현황 섹션 ─── */}
      <section>
        <SectionTitle
          title="가입자 현황"
          description="전체 유저 및 가입 방식 분포와 최근 가입자 변화입니다."
        />
        {isLoading ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {[...Array(4)].map((_, index) => (
                <StatCardSkeleton key={`user-card-skeleton-${index}`} />
              ))}
            </div>
            <div className="mt-5">
              <SignupTrendChartSkeleton />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {userCards.map((card) => (
                <StatCard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  color={card.color}
                  bgLight={card.bgLight}
                  textColor={card.textColor}
                  ratioBase={card.ratioBase}
                  unit={card.unit}
                />
              ))}
            </div>
            <div className="mt-5">
              <SignupTrendChart data={stats?.signupTrend || []} />
            </div>
          </>
        )}
      </section>

      {/* ─── 등록 자산 섹션 ─── */}
      <section>
        <SectionTitle
          title="등록 자산"
          description="서비스에 등록된 버츄얼, 그룹, 소속, 박스, 콘텐츠 수입니다."
        />
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {[...Array(5)].map((_, index) => (
              <StatCardSkeleton key={`entity-card-skeleton-${index}`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {entityCards.map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
                bgLight={card.bgLight}
                textColor={card.textColor}
                ratioBase={card.ratioBase}
                unit={card.unit}
              />
            ))}
          </div>
        )}
      </section>

      {/* ─── 요청 대기 섹션 ─── */}
      <section>
        <SectionTitle
          title="요청 대기"
          description="관리자 처리 대상인 등록 대기, 정보 수정 요청, 정보 신고/오류 신고, 박스/콘텐츠 등록 요청 수입니다."
        />
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {[...Array(6)].map((_, index) => (
              <StatCardSkeleton key={`pending-card-skeleton-${index}`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {pendingCards.map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
                bgLight={card.bgLight}
                textColor={card.textColor}
                ratioBase={card.ratioBase}
                unit={card.unit}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
