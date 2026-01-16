// src/features/products/screen/detail/Comments/CommentList.client.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Button,
  IconButton,
  List,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

import type { CommentItem, VoteValue } from '@/features/products/screen/detail/Comments/types';

import { relativeTime, formatFullDate } from '@/features/products/screen/detail/Comments/utils/time';
import UserAvatar from './UserAvatar.client';
import VoteBar from './VoteBar.client';

import CommentActionsMenu from './CommentActionsMenu.client';
import DeleteCommentDialog from './DeleteCommentDialog.client';

import { useCommentVoting } from '@/features/products/screen/detail/Comments/hooks/useCommentVoting';
import { useCommentEditing } from '@/features/products/screen/detail/Comments/hooks/useCommentEditing';
import { useCommentDeleteConfirm } from '@/features/products/screen/detail/Comments/hooks/useCommentDeletingConfirm';
import { useCommentPinning } from '@/features/products/screen/detail/Comments/hooks/useCommentPining';

const MAX_LEN = 2000;

type Props = {
  comments: CommentItem[];
  currentUserId: string | null;
  onDelete: (commentId: number) => Promise<void> | void;
  onUpdate: (commentId: number, content: string) => Promise<void> | void;
  onVote: (commentId: number, value: VoteValue) => Promise<void> | void;
  canPin?: boolean;
  pinnedId: number | null;
  onTogglePin: (commentId: number) => Promise<void> | void;
};

export default function CommentList({
  comments,
  currentUserId,
  onDelete,
  onUpdate,
  onVote,
  canPin = false,
  pinnedId,
  onTogglePin,
}: Props): React.JSX.Element {
  const {
    voteState,
    votingId,
    canVote,
    toggleVote,
  } = useCommentVoting({
    comments,
    currentUserId,
    onVote,
  });

  const {
    editingId,
    draft,
    setDraft,
    saving,
    startEdit,
    cancelEdit,
    saveEdit,
  } = useCommentEditing({
    maxLen: MAX_LEN,
    onUpdate,
  });

  const {
    confirmDeleteId,
    deleting,
    requestDelete,
    closeDelete,
    confirmDelete,
  } = useCommentDeleteConfirm({
    onDelete,
  });

  const {
    pinningId,
    togglePin,
  } = useCommentPinning({
    onTogglePin,
  });

  if (comments.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={(theme) => ({
          p: 1,
          bgcolor: alpha(theme.palette.background.default, 0),
        })}
      >
        <Typography variant="body2" color="text.secondary">
          Henüz yorum yok.
        </Typography>
      </Paper>
    );
  }

  const deletePreview =
    confirmDeleteId !== null
      ? (comments.find((x) => x.id === confirmDeleteId)?.content ?? '')
      : '';

  return (
    <>
      <List
        disablePadding
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: 'minmax(0, 1fr)',
        }}
      >
        {comments.map((c) => {
          const mine = currentUserId !== null && c.author_id === currentUserId;
          const uname = c.author_username || c.author_name || 'Anonim';
          const avatarSrc = c.author_avatar_url ?? undefined;

          const isEditing = editingId === c.id;
          const isPinned = pinnedId === c.id;

          const v = voteState[c.id] ?? {
            likes: c.like_count ?? 0,
            dislikes: c.dislike_count ?? 0,
            mine: (c.my_vote ?? 0) as VoteValue,
          };

          return (
            <Paper
              key={c.id}
              component="li"
              elevation={0}
              sx={(theme) => ({
                listStyle: 'none',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
                px: 1.25,
                py: 1.25,
                bgcolor: isPinned ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                transition: 'none',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  left: 0,
                  width: isPinned ? 2 : 0,
                  borderTopLeftRadius: 'inherit',
                  borderBottomLeftRadius: 'inherit',
                  background: isPinned
                    ? `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                    : 'transparent',
                },
              })}
            >
              <UserAvatar src={avatarSrc} alt={uname} />

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mr: 'auto', lineHeight: 1 }}
                    title={uname}
                  >
                    {uname}
                  </Typography>

                  {isPinned ? (
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontSize: 12,
                        lineHeight: 1,
                        color: 'text.secondary',
                      }}
                      aria-label="Sabitlendi"
                      title="Sabitlendi"
                    >
                      <PushPinIcon sx={{ fontSize: 14 }} />
                      <Box component="span">Sabitlendi</Box>
                    </Box>
                  ) : null}

                  {isPinned ? (
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.disabled"
                      aria-hidden
                      sx={{ mx: 0.75 }}
                    >
                      /
                    </Typography>
                  ) : null}

                  <Tooltip title={formatFullDate(c.created_at)} placement="bottom" arrow>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, whiteSpace: 'nowrap' }}
                    >
                      {relativeTime(c.created_at)}
                      {c.updated_at &&
                      new Date(c.updated_at).getTime() > new Date(c.created_at).getTime() ? (
                        <Box component="span" sx={{ fontStyle: 'italic' }}>
                          · Düzenlendi
                        </Box>
                      ) : null}
                    </Typography>
                  </Tooltip>

                  {canPin ? (
                    <Tooltip placement="bottom" title={isPinned ? 'Sabitliği kaldır' : 'Yorumu sabitle'} arrow>
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => void togglePin(c.id)}
                          disabled={pinningId === c.id}
                          aria-label={isPinned ? 'Sabitliği kaldır' : 'Yorumu sabitle'}
                          sx={{ ml: 0.25 }}
                        >
                          {isPinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : null}

                  {mine && !isEditing ? (
                    <CommentActionsMenu
                      disabled={false}
                      onEdit={() => startEdit(c.id, c.content ?? '')}
                      onDelete={() => requestDelete(c.id)}
                    />
                  ) : null}
                </Box>

                {!isEditing ? (
                  <>
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                        maxWidth: '100%',
                        ...(isPinned
                          ? { color: theme.palette.text.primary, fontWeight: 500 }
                          : { color: theme.palette.text.primary }),
                      })}
                    >
                      {c.content}
                    </Typography>

                    <Box
                      sx={(theme) => ({
                        mt: 1,
                        pt: 0.5,
                        borderTop: `1px dotted ${alpha(theme.palette.divider, 0.75)}`,
                      })}
                    >
                      <VoteBar
                        canVote={canVote}
                        voting={votingId === c.id}
                        likes={v.likes}
                        dislikes={v.dislikes}
                        mine={v.mine}
                        onUp={() => void toggleVote(c.id, 1)}
                        onDown={() => void toggleVote(c.id, -1)}
                      />
                    </Box>
                  </>
                ) : (
                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      maxRows={10}
                      value={draft}
                      autoFocus
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                          e.preventDefault();
                          void saveEdit(c.id);
                        }
                      }}
                      inputProps={{ maxLength: MAX_LEN }}
                      helperText={`${draft.length}/${MAX_LEN}`}
                    />

                    <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                      <Button onClick={cancelEdit} disabled={saving} variant="outlined">
                        Vazgeç
                      </Button>

                      <Button
                        onClick={() => void saveEdit(c.id)}
                        disabled={saving || draft.trim().length === 0}
                        variant="contained"
                        startIcon={<EditOutlinedIcon />}
                      >
                        Kaydet
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          );
        })}
      </List>

      <DeleteCommentDialog
        open={confirmDeleteId !== null}
        deleting={deleting}
        onClose={closeDelete}
        onConfirm={() => void confirmDelete()}
        previewText={deletePreview}
      />
    </>
  );
}
