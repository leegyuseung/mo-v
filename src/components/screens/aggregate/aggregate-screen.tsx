import AggregateScreenClient from "@/components/screens/aggregate/aggregate-screen-client";
import {
  fetchAggregateRankPeriodKeysOnServer,
  fetchAggregateRankSnapshotOnServer,
} from "@/api/aggregate-rank-server";
import {
  getKstNowParts,
  getMonthOptions,
  getWeekOptions,
  getYearOptions,
  isSelectionReady,
} from "@/components/screens/aggregate/aggregate-screen-utils";
import type { AggregatePeriod, AggregateScreenClientProps } from "@/types/aggregate-rank";

const DEFAULT_PERIOD: AggregatePeriod = "weekly";
const MIN_AGGREGATE_YEAR = 2026;

async function getInitialAggregateScreenProps(): Promise<AggregateScreenClientProps> {
  const now = getKstNowParts();
  const initialSelection = {
    period: DEFAULT_PERIOD,
    year: now.year,
    month: now.month,
    weekOfMonth: 1,
  };

  try {
    const initialPeriodKeys = await fetchAggregateRankPeriodKeysOnServer(
      DEFAULT_PERIOD,
      MIN_AGGREGATE_YEAR
    );

    const yearOptions = getYearOptions(initialPeriodKeys);
    const selectedYear = yearOptions.includes(now.year) ? now.year : yearOptions[0] || now.year;
    const monthOptions = getMonthOptions(DEFAULT_PERIOD, initialPeriodKeys, selectedYear);
    const selectedMonth = monthOptions.includes(now.month) ? now.month : monthOptions[0] || now.month;
    const weekOptions = getWeekOptions(DEFAULT_PERIOD, initialPeriodKeys, selectedYear, selectedMonth);
    const selectedWeekOfMonth = weekOptions[0] || 1;

    const ready = isSelectionReady(
      DEFAULT_PERIOD,
      yearOptions,
      selectedYear,
      monthOptions,
      selectedMonth,
      weekOptions,
      selectedWeekOfMonth
    );

    const initialSnapshot = ready
      ? await fetchAggregateRankSnapshotOnServer(
          DEFAULT_PERIOD,
          selectedYear,
          selectedMonth,
          selectedWeekOfMonth
        )
      : [];

    return {
      minAggregateYear: MIN_AGGREGATE_YEAR,
      initialSelection: {
        period: DEFAULT_PERIOD,
        year: selectedYear,
        month: selectedMonth,
        weekOfMonth: selectedWeekOfMonth,
      },
      initialPeriodKeys,
      initialSnapshot,
    };
  } catch {
    return {
      minAggregateYear: MIN_AGGREGATE_YEAR,
      initialSelection,
      initialPeriodKeys: [],
      initialSnapshot: [],
    };
  }
}

export default async function AggregateScreen() {
  const initialProps = await getInitialAggregateScreenProps();
  return <AggregateScreenClient {...initialProps} />;
}
