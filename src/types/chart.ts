// src/types/chart.ts
export type ChartRow = {
  id?: string;
  created_at?: string | null; // nullable, çünkü DB'de eksik olabilir
  status?: string | null;
  system_slug?: string | null;
};
