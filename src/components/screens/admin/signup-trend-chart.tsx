import type { DashboardSignupTrendPoint } from "@/types/admin";

const CHART_WIDTH = 840;
const CHART_HEIGHT = 280;
const PAD_LEFT = 40;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 34;

const SERIES = [
  { key: "total", label: "전체", color: "#111827" },
  { key: "email", label: "이메일", color: "#059669" },
  { key: "google", label: "구글", color: "#dc2626" },
  { key: "kakao", label: "카카오", color: "#ca8a04" },
] as const;

type SeriesKey = (typeof SERIES)[number]["key"];

type SignupTrendChartProps = {
  data: DashboardSignupTrendPoint[];
};

function formatDayLabel(date: string): string {
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));
  return `${month}/${day}`;
}

function buildLinePath(
  data: DashboardSignupTrendPoint[],
  key: SeriesKey,
  getX: (index: number) => number,
  getY: (value: number) => number
): string {
  if (data.length === 0) return "";

  return data
    .map((item, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command}${getX(index)} ${getY(item[key])}`;
    })
    .join(" ");
}

export default function SignupTrendChart({ data }: SignupTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-400">가입 추이 데이터가 없습니다.</p>
      </div>
    );
  }

  const innerWidth = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerHeight = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const maxValue = Math.max(
    1,
    ...data.flatMap((point) => [
      point.total,
      point.email,
      point.google,
      point.kakao,
    ])
  );

  const getX = (index: number) => {
    if (data.length <= 1) return PAD_LEFT;
    return PAD_LEFT + (index / (data.length - 1)) * innerWidth;
  };

  const getY = (value: number) => {
    const ratio = value / maxValue;
    return PAD_TOP + innerHeight - ratio * innerHeight;
  };

  const yTicks = 4;
  const xLabelStep = Math.max(1, Math.floor(data.length / 6));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {SERIES.map((series) => (
          <div key={series.key} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: series.color }}
            />
            <span>{series.label}</span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="h-[240px] w-full min-w-[760px]"
          role="img"
          aria-label="최근 가입자 수 변화 그래프"
        >
          {Array.from({ length: yTicks + 1 }).map((_, index) => {
            const y = PAD_TOP + (innerHeight * index) / yTicks;
            const tickValue = Math.round(maxValue * (1 - index / yTicks));
            return (
              <g key={`y-tick-${index}`}>
                <line
                  x1={PAD_LEFT}
                  y1={y}
                  x2={CHART_WIDTH - PAD_RIGHT}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={PAD_LEFT - 8}
                  y={y + 4}
                  fontSize="11"
                  textAnchor="end"
                  fill="#9ca3af"
                >
                  {tickValue}
                </text>
              </g>
            );
          })}

          {SERIES.map((series) => (
            <path
              key={`line-${series.key}`}
              d={buildLinePath(data, series.key, getX, getY)}
              fill="none"
              stroke={series.color}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {SERIES.map((series) =>
            data.map((point, index) => (
              <circle
                key={`${series.key}-${point.date}`}
                cx={getX(index)}
                cy={getY(point[series.key])}
                r="2"
                fill={series.color}
              />
            ))
          )}

          {data.map((point, index) => {
            const shouldShowLabel =
              index === 0 ||
              index === data.length - 1 ||
              index % xLabelStep === 0;

            if (!shouldShowLabel) return null;

            return (
              <text
                key={`x-label-${point.date}`}
                x={getX(index)}
                y={CHART_HEIGHT - 8}
                fontSize="11"
                textAnchor="middle"
                fill="#9ca3af"
              >
                {formatDayLabel(point.date)}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function SignupTrendChartSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex gap-2">
        <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-14 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-14 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="h-[240px] animate-pulse rounded-xl bg-gray-50" />
    </div>
  );
}
