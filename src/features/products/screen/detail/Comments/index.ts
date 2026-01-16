// src/features/products/screen/detail/Comments/index.ts

// Types
export * from './types';

// Utils
export { relativeTime, formatFullDate } from './utils/time';
export { clamp } from './utils/math';

// Hooks
export { useCommentMenu } from './hooks/useCommentMenu';
export { useCommentVoting } from './hooks/useCommentVoting';
export { useCommentEditing } from './hooks/useCommentEditing';
export { useCommentDeleteConfirm } from './hooks/useCommentDeletingConfirm';
export { useCommentPinning } from './hooks/useCommentPining';

// Components (default exports)
export { default as CommentList } from './components/CommentList.client';
export { default as CommentForm } from './components/CommentForm.client';
export { default as UserAvatar } from './components/UserAvatar.client';
export { default as VoteBar } from './components/VoteBar.client';
export { default as CommentActionsMenu } from './components/CommentActionsMenu.client';
export { default as DeleteCommentDialog } from './components/DeleteCommentDialog.client';
