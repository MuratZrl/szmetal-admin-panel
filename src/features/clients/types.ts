// src/features/clients/types.ts
import type { Database } from "@/types/supabase";

type UsersRow = Database["public"]["Tables"]["users"]["Row"];

// DB'deki alanlarla birebir. Nullable olanlar nullable kalsın.
export type ClientUser = Pick<
  UsersRow,
  | "id"
  | "image"
  | "email"
  | "username"
  | "company"
  | "country"
  | "role"
  | "phone"
  | "status"
  | "created_at"
>;

export type UsersTotals = {
  total: number;
  active: number;
  inactive: number;
  thisMonth: number;
  lastMonth: number;
  changePct: number;
};

export type ClientsPageData = {
  users: ClientUser[];
  totals: UsersTotals;
};
