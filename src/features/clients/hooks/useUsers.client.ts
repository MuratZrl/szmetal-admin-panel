// src/features/clients/hooks/useUsers.client.ts
"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import type { ClientUser, UsersTotals } from "../types";

function calcTotals(list: ClientUser[]): UsersTotals {
  const total = list.length;
  const active = list.filter(u => u.status === "active").length;
  const inactive = list.filter(u => u.status === "inactive").length;

  const now = new Date();
  const startThis = new Date(now.getFullYear(), now.getMonth(), 1);
  const startLast = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endLast = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonth = list.filter(u => new Date(u.created_at) >= startThis).length;
  const lastMonth = list.filter(u => {
    const d = new Date(u.created_at);
    return d >= startLast && d <= endLast;
  }).length;

  const changePct = lastMonth === 0 ? (thisMonth > 0 ? 100 : 0) : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  return { total, active, inactive, thisMonth, lastMonth, changePct };
}

export function useUsers(opts?: { initialUsers?: ClientUser[]; initialTotals?: UsersTotals }) {
  const [users, setUsers] = useState<ClientUser[]>(opts?.initialUsers ?? []);
  const [totals, setTotals] = useState<UsersTotals>(
    opts?.initialTotals ?? { total: 0, active: 0, inactive: 0, thisMonth: 0, lastMonth: 0, changePct: 0 }
  );
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // GEREKLİ TÜM KOLONLARI SEÇ: id, image, email, username, company, country, role, phone, status, created_at
      const { data } = await supabase
        .from("users")
        .select("id, image, email, username, company, country, role, phone, status, created_at")
        .order("created_at", { ascending: false })
        .returns<ClientUser[]>();  // ← burası kritik

      // `returns<ClientUser[]>()` da yazabilirdik ama UsersRow’dan türetmek daha güvenli.
      const nextUsers = data ?? [];

      setUsers(nextUsers);
      setTotals(calcTotals(nextUsers));
    } finally {
      setLoading(false);
    }
  }, []);

  return { users, totals, loading, refresh };
}
