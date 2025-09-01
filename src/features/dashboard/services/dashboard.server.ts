// src/features/dashboard/services/fetchStats.server.ts
import { createClient } from "@supabase/supabase-js";
import { calcChange, getTrend } from "../utils/calcChange";
import { getMonthRanges } from "../utils/dateRanges";
import type { DashboardData } from "../types";
import type { Database } from "@/types/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function fetchDashboardData(now = new Date()): Promise<DashboardData> {
  const { startOfThisMonth, startOfLastMonth, endOfLastMonth } = getMonthRanges(now);

  // 1) Totaller
  const [{ data: allUsers }, { data: allRequests }, { data: allSystems }] = await Promise.all([
    supabase.from("users").select("id"),
    supabase.from("requests").select("id").eq("status", "pending"),
    supabase.from("system_drafts").select("slug"),
  ]);

  const totalUsers = allUsers?.length ?? 0;
  const totalRequests = allRequests?.length ?? 0;
  const uniqueSystems = new Set((allSystems ?? []).map(s => s.slug)).size;

  // 2) Aylık kıyaslar
  const [
    { data: thisMonthUsers },
    { data: lastMonthUsers },
    { data: thisMonthRequests },
    { data: lastMonthRequests },
    { data: thisMonthSystems },
    { data: lastMonthSystems },
  ] = await Promise.all([
    supabase.from("users")
      .select("id")
      .gte("created_at", startOfThisMonth.toISOString()),
    supabase.from("users")
      .select("id")
      .gte("created_at", startOfLastMonth.toISOString())
      .lte("created_at", endOfLastMonth.toISOString()),
    supabase.from("requests")
      .select("id")
      .eq("status", "pending")
      .gte("created_at", startOfThisMonth.toISOString()),
    supabase.from("requests")
      .select("id")
      .eq("status", "pending")
      .gte("created_at", startOfLastMonth.toISOString())
      .lte("created_at", endOfLastMonth.toISOString()),
    supabase.from("system_drafts")
      .select("slug")
      .gte("created_at", startOfThisMonth.toISOString()),
    supabase.from("system_drafts")
      .select("slug")
      .gte("created_at", startOfLastMonth.toISOString())
      .lte("created_at", endOfLastMonth.toISOString()),
  ]);

  const thisMonthUserCount = thisMonthUsers?.length ?? 0;
  const lastMonthUserCount = lastMonthUsers?.length ?? 0;

  const thisMonthActiveCount = thisMonthRequests?.length ?? 0;
  const lastMonthActiveCount = lastMonthRequests?.length ?? 0;

  const uniqueThisMonth = new Set((thisMonthSystems ?? []).map(s => s.slug)).size;
  const uniqueLastMonth = new Set((lastMonthSystems ?? []).map(s => s.slug)).size;

  const userChange = calcChange(thisMonthUserCount, lastMonthUserCount);
  const requestChange = calcChange(thisMonthActiveCount, lastMonthActiveCount);
  const systemChange = calcChange(uniqueThisMonth, uniqueLastMonth);

  return {
    totals: {
      totalUsers,
      totalRequests,
      uniqueSystems,
    },
    trends: {
      user: { change: userChange, trend: getTrend(thisMonthUserCount, lastMonthUserCount) },
      request: { change: requestChange, trend: getTrend(thisMonthActiveCount, lastMonthActiveCount) },
      system: { change: systemChange, trend: getTrend(uniqueThisMonth, uniqueLastMonth) },
    },
  };
}
