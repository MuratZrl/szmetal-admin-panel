// src/features/notifications/types.ts

export const NOTIFICATION_TYPES = [
  'product_created',
  'product_updated',
  'product_deleted',
  'user_registered',
  'user_role_changed',
  'user_status_changed',
  'comment_added',
  'system',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type NotificationListResponse = {
  items: NotificationRow[];
  hasMore: boolean;
};
