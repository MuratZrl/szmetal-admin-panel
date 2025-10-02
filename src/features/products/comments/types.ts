// src/features/products/comments/types.ts
export type CommentItem = {
  id: number;
  product_id: number;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string; // ISO
  updated_at?: string | null; // <<< eklendi
  author_username?: string | null;
  author_email?: string | null;
  author_avatar_url?: string | null;
  
  like_count?: number;     // ← yeni
  dislike_count?: number;  // ← yeni
  my_vote?: -1 | 0 | 1;    // ← yeni

  is_pinned?: boolean;
};