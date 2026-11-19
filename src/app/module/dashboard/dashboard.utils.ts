export const CHART_MONTHS = 12;

export interface IMonthlyRow {
  month: Date;
  count: bigint | number;
  total?: string | number | null;
}

const monthKey = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

const monthLabel = (date: Date) =>
  date.toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

/** First day (UTC) of the month `CHART_MONTHS - 1` months ago. */
export const chartStartDate = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (CHART_MONTHS - 1), 1));
};

/**
 * Turns sparse SQL rows into a continuous series for the last 12 months,
 * filling months without data with zeros (charts need every month).
 */
export const fillMonthlySeries = (rows: IMonthlyRow[]) => {
  const byMonth = new Map(rows.map((row) => [monthKey(new Date(row.month)), row]));
  const start = chartStartDate();

  return Array.from({ length: CHART_MONTHS }, (_, index) => {
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + index, 1));
    const row = byMonth.get(monthKey(date));

    return {
      month: monthKey(date),
      label: monthLabel(date),
      count: Number(row?.count ?? 0),
      total: Number(row?.total ?? 0),
    };
  });
};

export const groupCount = (group: { _count?: unknown }) =>
  (group._count as { _all: number })._all;
