// src/features/dashboard/utils/dateRanges.ts
export function getMonthRanges(now = new Date()) {
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  return { startOfThisMonth, startOfLastMonth, endOfLastMonth };
}
