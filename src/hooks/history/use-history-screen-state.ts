import { useCallback, useMemo, useState } from "react";
import type { HeartPointHistory } from "@/types/profile";
import type { HistoryFilter, HistoryTypeFilter } from "@/types/history-screen";
import {
  getSeoulDateKey,
  HISTORY_PAGE_SIZE,
} from "@/components/screens/history/history-screen-utils";

export function useHistoryScreenState(historyData: HeartPointHistory[] | undefined) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [typeFilter, setTypeFilter] = useState<HistoryTypeFilter>("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const history = useMemo(() => historyData ?? [], [historyData]);

  const baseHistory = useMemo(
    () => history.filter((item) => (item.type || "").toLowerCase() !== "test"),
    [history]
  );

  const historyTypeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          baseHistory
            .map((item) => item.type)
            .filter((type): type is string => Boolean(type))
        )
      ),
    [baseHistory]
  );

  const filteredHistory = useMemo(() => {
    let next = baseHistory;
    if (filter === "plus") next = next.filter((item) => item.amount > 0);
    if (filter === "minus") next = next.filter((item) => item.amount < 0);
    if (typeFilter !== "all") {
      next = next.filter((item) => item.type === typeFilter);
    }
    if (startDateFilter || endDateFilter) {
      const from =
        startDateFilter && endDateFilter && startDateFilter > endDateFilter
          ? endDateFilter
          : startDateFilter;
      const to =
        startDateFilter && endDateFilter && startDateFilter > endDateFilter
          ? startDateFilter
          : endDateFilter;

      next = next.filter((item) => {
        const dateKey = getSeoulDateKey(item.created_at);
        if (from && dateKey < from) return false;
        if (to && dateKey > to) return false;
        return true;
      });
    }

    return next;
  }, [baseHistory, filter, typeFilter, startDateFilter, endDateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / HISTORY_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const pagedHistory = useMemo(() => {
    const start = (safePage - 1) * HISTORY_PAGE_SIZE;
    return filteredHistory.slice(start, start + HISTORY_PAGE_SIZE);
  }, [filteredHistory, safePage]);

  const setFilterAndResetPage = useCallback((nextFilter: HistoryFilter) => {
    setFilter(nextFilter);
    setCurrentPage(1);
  }, []);

  const setTypeFilterAndResetPage = useCallback((nextTypeFilter: HistoryTypeFilter) => {
    setTypeFilter(nextTypeFilter);
    setCurrentPage(1);
  }, []);

  const setStartDateFilterAndResetPage = useCallback((nextDate: string) => {
    setStartDateFilter(nextDate);
    setCurrentPage(1);
  }, []);

  const setEndDateFilterAndResetPage = useCallback((nextDate: string) => {
    setEndDateFilter(nextDate);
    setCurrentPage(1);
  }, []);

  const resetDateFilter = useCallback(() => {
    setStartDateFilter("");
    setEndDateFilter("");
    setCurrentPage(1);
  }, []);

  const onPageChange = useCallback(
    (page: number) => setCurrentPage(Math.min(Math.max(1, page), totalPages)),
    [totalPages]
  );

  return {
    filter,
    typeFilter,
    startDateFilter,
    endDateFilter,
    historyTypeOptions,
    filteredHistory,
    pagedHistory,
    totalPages,
    safePage,
    setFilterAndResetPage,
    setTypeFilterAndResetPage,
    setStartDateFilterAndResetPage,
    setEndDateFilterAndResetPage,
    resetDateFilter,
    onPageChange,
  };
}
