// src/features/dashboard/services/dashboard.server.ts
import type { DateRangeConfig, DashboardPayload } from '../types/dashboardData';
import { generateBuckets, getDateRangeConfig6m, getDateRangeConfig } from '../utils/dateRanges';
import { fetchDashboardCards } from './card.server';
import { fetchUsersSeriesForRange } from './usersChart.server';
import { fetchProductsSeriesForRange } from './productsChart.server';
import { fetchCategoryForRange } from './categoryChart.server';
import { fetchCustomerMoldRateAllTime } from './customerMoldRate.server';


export async function fetchDashboardDataForRange(
  config: DateRangeConfig,
): Promise<DashboardPayload> {
  const { range, bucketStrategy, timeLabel } = config;
  const buckets = generateBuckets(range, bucketStrategy);

  // Fixed 6-month range for "Yeni Kullanıcılar" & "Yeni Ürünler" charts
  const fixed6mConfig = getDateRangeConfig6m();
  const fixed6mBuckets = generateBuckets(fixed6mConfig.range, fixed6mConfig.bucketStrategy);

  // Fixed all-time range for "Kategori Dağılımı"
  const allTimeConfig = getDateRangeConfig('allTime');

  const [
    cards,
    usersSeries,
    productsSeries,
    categoryPie,
    customerMoldResult,
    usersSeries6m,
    productsSeries6m,
    categoryPieAllTime,
  ] = await Promise.all([
    fetchDashboardCards(),
    fetchUsersSeriesForRange(range, buckets, bucketStrategy),
    fetchProductsSeriesForRange(range, buckets, bucketStrategy),
    fetchCategoryForRange(range),
    fetchCustomerMoldRateAllTime(),
    fetchUsersSeriesForRange(fixed6mConfig.range, fixed6mBuckets, fixed6mConfig.bucketStrategy),
    fetchProductsSeriesForRange(fixed6mConfig.range, fixed6mBuckets, fixed6mConfig.bucketStrategy),
    fetchCategoryForRange(allTimeConfig.range),
  ]);

  return {
    cards,
    usersSeries,
    productsSeries,
    categoryPie,
    customerMoldRate: customerMoldResult.rate,
    customerMoldCount: customerMoldResult.moldCount,
    timeLabel,
    usersSeries6m,
    productsSeries6m,
    timeLabel6m: fixed6mConfig.timeLabel,
    categoryPieAllTime,
  };
}
