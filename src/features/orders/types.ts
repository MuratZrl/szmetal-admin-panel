// src/features/orders/types.ts
export type OrderStatus = 'approved' | 'rejected';

export type OrderRow = {
  id: string;
  user_id: string;
  request_id: string | null;
  order_code: string | null;
  system_slug: string | null;
  system_type: string | null;
  message: string;
  status: OrderStatus;
  is_read: boolean;
  read_at: string | null;
  created_at: string;  // ISO
  updated_at: string;  // ISO
};
