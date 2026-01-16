// src/features/products/screen/detail/Comments/types.ts

export type VoteValue = -1 | 0 | 1;

export type CommentItem = {
  id: number;

  // Bazı yerlerde numeric, bazı yerlerde string geliyorsa normalize etmeyi servis katmanında yap.
  product_id: number;

  author_id: string;

  author_name: string | null;
  author_username: string | null;
  author_email?: string | null;
  author_avatar_url: string | null;

  content: string;

  created_at: string;          // ISO
  updated_at?: string | null;  // ISO

  like_count: number | null;
  dislike_count: number | null;

  my_vote: VoteValue | null;

  is_pinned: boolean | null;
};

export type VoteSnapshot = {
  likes: number;
  dislikes: number;
  mine: VoteValue;
};

export type VoteState = Record<number, VoteSnapshot>;
