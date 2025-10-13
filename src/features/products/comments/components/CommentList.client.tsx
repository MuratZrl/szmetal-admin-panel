// src/features/products/comments/components/CommentList.client.tsx
'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  List,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

import ConfirmDialog from '@/components/ui/dialogs/ConfirmDialog';
import type { CommentItem } from '@/features/products/comments/types';

/* -------------------------------------------------------------------------- */
/* Sabitler                                                                    */
/* -------------------------------------------------------------------------- */

const MAX_LEN = 2000;

/* -------------------------------------------------------------------------- */
/* Yardımcılar                                                                 */
/* -------------------------------------------------------------------------- */

function relativeTime(iso: string): string {
  const dt = new Date(iso).getTime();
  const now = Date.now();
  // Negatif değer geçmişi temsil eder; Intl.RelativeTimeFormat buna göre "… önce" üretir.
  const diffSeconds = Math.round((dt - now) / 1000);
  const abs = Math.abs(diffSeconds);

  const rtf = new Intl.RelativeTimeFormat('tr-TR', { numeric: 'auto' });

  if (abs < 60) return rtf.format(diffSeconds, 'second');
  const mins = Math.trunc(diffSeconds / 60);
  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute');
  const hours = Math.trunc(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  const days = Math.trunc(hours / 24);
  if (Math.abs(days) < 7) return rtf.format(days, 'day');
  const weeks = Math.trunc(days / 7);
  if (Math.abs(weeks) < 5) return rtf.format(weeks, 'week');
  const months = Math.trunc(days / 30);
  if (Math.abs(months) < 12) return rtf.format(months, 'month');
  const years = Math.trunc(days / 365);
  return rtf.format(years, 'year');
}

function formatFullDate(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return iso;
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

/* -------------------------------------------------------------------------- */
/* Avatar                                                                      */
/* -------------------------------------------------------------------------- */

function UserAvatar({ src, alt }: { src?: string | null; alt?: string }) {
  const [broken, setBroken] = React.useState(false);

  React.useEffect(() => {
    setBroken(false);
  }, [src]);

  return (
    <Avatar
      src={!broken && src ? src : undefined}
      alt={alt}
      imgProps={{
        onError: () => setBroken(true),
        crossOrigin: 'anonymous',
        referrerPolicy: 'no-referrer-when-downgrade',
        loading: 'lazy',
      }}
      sx={{ width: 36, height: 36, mt: 0, bgcolor: theme => alpha(theme.palette.text.disabled, 0.12) }}
    >
      <PersonOutlineIcon fontSize="small" />
    </Avatar>
  );
}

/* -------------------------------------------------------------------------- */
/* Tipler                                                                      */
/* -------------------------------------------------------------------------- */

type VoteValue = -1 | 0 | 1;

type VoteSnapshot = {
  likes: number;
  dislikes: number;
  mine: VoteValue;
};

type VoteState = Record<number, VoteSnapshot>;

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

/* -------------------------------------------------------------------------- */
/* Ana Bileşen                                                                 */
/* -------------------------------------------------------------------------- */

export default function CommentList({
  comments,
  currentUserId,
  onDelete,
  onUpdate,
  onVote,
  canPin = false,
  pinnedId,
  onTogglePin,
}: Props) {

  // Menü yönetimi
  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);
  const [menuForId, setMenuForId] = React.useState<number | null>(null);
  const menuOpen = Boolean(menuAnchor) && menuForId !== null;

  // Düzenleme durumu
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [draft, setDraft] = React.useState<string>('');
  const [saving, setSaving] = React.useState<boolean>(false);

  // Oy durumu (optimistic)
  const [voteState, setVoteState] = React.useState<VoteState>({});
  const [votingId, setVotingId] = React.useState<number | null>(null);

  // Pin işlemi kilidi
  const [pinningId, setPinningId] = React.useState<number | null>(null);

  // Silme diyaloğu
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<number | null>(null);
  const [deleting, setDeleting] = React.useState<boolean>(false);

  // İlk yüklemede vote state’i doldur
  React.useEffect(() => {
    const init: VoteState = Object.fromEntries(
      comments.map(c => [
        c.id,
        {
          likes: c.like_count ?? 0,
          dislikes: c.dislike_count ?? 0,
          mine: (c.my_vote ?? 0) as VoteValue,
        },
      ])
    );
    setVoteState(init);
  }, [comments]);

  const canVote = currentUserId !== null;

  function applyOptimistic(id: number, nextMine: VoteValue) {
    setVoteState(prev => {
      const cur = prev[id] ?? { likes: 0, dislikes: 0, mine: 0 as VoteValue };
      // Mevcut oyu geri al
      let likes = cur.likes;
      let dislikes = cur.dislikes;
      if (cur.mine === 1) likes = Math.max(0, likes - 1);
      if (cur.mine === -1) dislikes = Math.max(0, dislikes - 1);

      // Yeni oyu uygula
      if (nextMine === 1) likes += 1;
      if (nextMine === -1) dislikes += 1;

      return { ...prev, [id]: { likes, dislikes, mine: nextMine } };
    });
  }

  async function toggleVote(id: number, dir: 1 | -1) {
    if (!canVote || votingId !== null) return;
    const curMine = voteState[id]?.mine ?? 0;
    const next: VoteValue = curMine === dir ? 0 : dir;
    applyOptimistic(id, next);
    setVotingId(id);
    try {
      await onVote(id, next);
    } catch {
      applyOptimistic(id, curMine);
    } finally {
      setVotingId(null);
    }
  }

  function openMenu(e: React.MouseEvent<HTMLElement>, id: number) {
    setMenuAnchor(e.currentTarget);
    setMenuForId(id);
  }

  function closeMenu() {
    setMenuAnchor(null);
    setMenuForId(null);
  }

  function startEdit(id: number, initial: string) {
    setEditingId(id);
    setDraft(initial);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft('');
  }

  async function saveEdit(id: number) {
    const trimmed = draft.trim();
    if (trimmed.length < 1 || trimmed.length > MAX_LEN) return;
    setSaving(true);
    try {
      await onUpdate(id, trimmed);
      setEditingId(null);
      setDraft('');
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(id: number) {
    setConfirmDeleteId(id);
  }

  async function confirmDelete() {
    const id = confirmDeleteId;
    if (id === null) return;
    setDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  }

  if (comments.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={theme => ({
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

  return (
    <>
      <List
        disablePadding
        sx={{
          display: 'grid',
          gap: 1, // Daha az dikey boşluk
          gridTemplateColumns: 'minmax(0, 1fr)', // ← önemli
        }}
      >
        {comments.map(c => {
          const mine = currentUserId !== null && c.author_id === currentUserId;
          const uname = c.author_username || c.author_name || 'Anonim';
          const avatarSrc = c.author_avatar_url ?? undefined;
          const isEditing = editingId === c.id;
          const v = voteState[c.id] ?? { likes: 0, dislikes: 0, mine: 0 as VoteValue };
          const isPinned = pinnedId === c.id;

          return (
            <Paper
              key={c.id}
              component="li"
              elevation={0} // Kenarlık yok, gölge yok
              sx={theme => ({
                listStyle: 'none',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
                px: 1.25,
                py: 1.25,
                // Hover'da parlaklık artmasın: hover stili yok
                // Kenarlık yok
                bgcolor: isPinned ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                transition: 'none',
                // Sol vurgulu şerit (sadece pinned)
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
                {/* Başlık satırı */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mr: 'auto', lineHeight: 1 }}
                    title={uname}
                  >
                    {uname}
                  </Typography>

                  {isPinned ? (
                    // Chip yerine sade metin etiketi
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontSize: 12,
                        lineHeight: 1,
                        color: "text.secondary",
                      }}
                      aria-label="Sabitlendi"
                      title="Sabitlendi"
                    >
                      <PushPinIcon sx={{ fontSize: 14 }} />
                      <Box component="span">Sabitlendi</Box>
                    </Box>
                  ) : null}

                  {/* Sadece "/" ayırıcı */}
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

                  {/* Sabitle */}
                  {canPin ? (
                    <Tooltip placement='bottom' title={isPinned ? 'Sabitliği kaldır' : 'Yorumu sabitle'} arrow>
                      <span>
                        <IconButton
                          size="small"
                          onClick={async () => {
                            if (pinningId !== null) return;
                            setPinningId(c.id);
                            try {
                              await onTogglePin(c.id);
                            } finally {
                              setPinningId(null);
                            }
                          }}
                          disabled={pinningId === c.id}
                          aria-label={isPinned ? 'Sabitliği kaldır' : 'Yorumu sabitle'}
                          sx={{ ml: 0.25 }}
                        >
                          {isPinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : null}

                  {/* Kendi yorumunsa menü */}
                  {mine && !isEditing ? (
                    <Tooltip placement='bottom' title="Seçenekler" arrow>
                      <IconButton
                        size="small"
                        onClick={e => openMenu(e, c.id)}
                        aria-label="Yorum menüsü"
                        sx={{ ml: 0.25 }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </Box>

                {/* İçerik */}
                {!isEditing ? (
                  <>
                    <Typography
                      variant="body2"
                      sx={theme => ({
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

                    {/* Oy satırı (compact) */}
                    <Box
                      sx={theme => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 1,
                        pt: 0.5,
                        borderTop: `1px dotted ${alpha(theme.palette.divider, 0.75)}`,
                      })}
                    >
                      <Tooltip placement='bottom' title={canVote ? 'Beğen' : 'Oy vermek için giriş yap'} arrow>
                        <span>
                          <IconButton
                            size="small"
                            aria-label="Beğen"
                            onClick={() => void toggleVote(c.id, 1)}
                            disabled={!canVote || votingId === c.id}
                            color="default"
                            sx={theme => ({
                              px: 0.5,
                              transition: 'background-color 120ms, color 120ms',
                              ...(v.mine === 1 && {
                                color: theme.palette.common.white,              // ikon beyaz
                              }),
                            })}
                          >
                            {v.mine === 1 ? <ThumbUpIcon fontSize="small" /> : <ThumbUpOffAltIcon fontSize="small" />}
                            <Box
                              component="span"
                              sx={({
                                ml: 0.25,
                                minWidth: 18,
                                height: 18,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 11,
                                lineHeight: 1,
                              })}
                            >
                              {clamp(v.likes, 0, Number.MAX_SAFE_INTEGER)}
                            </Box>
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip placement='bottom' title={canVote ? 'Beğenme' : 'Oy vermek için giriş yap'} arrow>
                        <span>
                          <IconButton
                            size="small"
                            aria-label="Beğenme"
                            onClick={() => void toggleVote(c.id, -1)}
                            disabled={!canVote || votingId === c.id}
                            color="default"
                            sx={theme => ({
                              px: 0.5,
                              transition: 'background-color 120ms, color 120ms',
                              ...(v.mine === -1 && {
                                color: theme.palette.common.white,              // ikon beyaz
                              }),
                            })}
                          >
                            {v.mine === -1 ? <ThumbDownIcon fontSize="small" /> : <ThumbDownOffAltIcon fontSize="small" />}
                            <Box
                              component="span"
                              sx={({
                                ml: 0.25,
                                px: 0.5,
                                minWidth: 18,
                                height: 18,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 11,
                                lineHeight: 1,
                              })}
                            >
                              {clamp(v.dislikes, 0, Number.MAX_SAFE_INTEGER)}
                            </Box>
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </>
                ) : (
                  // Düzenleme modu
                  <Box >
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      maxRows={10}
                      value={draft}
                      autoFocus
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => {
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

      {/* Silme onayı: ConfirmDialog kullanımı */}
      <ConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => void confirmDelete()}
        title="Yorumu sil"
        description="Bu yorumu silmek istediğine emin misin? Bu işlem geri alınamaz."
        confirmText={deleting ? 'Siliniyor...' : 'Sil'}
        cancelText="İptal"
        confirmColor="error"
        disableClose={deleting}
        confirmDisabled={deleting}
      >
        {confirmDeleteId !== null ? (
          <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
            {(comments.find(x => x.id === confirmDeleteId)?.content ?? '').slice(0, 300)}
            {(comments.find(x => x.id === confirmDeleteId)?.content ?? '').length > 300 ? '…' : ''}
          </Typography>
        ) : null}
      </ConfirmDialog>

      {/* Menü */}
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            const id = menuForId;
            closeMenu();
            if (id !== null) {
              const initial = comments.find(x => x.id === id)?.content ?? '';
              startEdit(id, initial);
            }
          }}
        >
          <EditOutlinedIcon fontSize="small" style={{ marginRight: 8 }} />
          Düzenle
        </MenuItem>

        <MenuItem
          onClick={() => {
            const id = menuForId;
            closeMenu();
            if (id !== null) requestDelete(id);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteOutlineIcon fontSize="small" style={{ marginRight: 8 }} />
          Sil
        </MenuItem>
      </Menu>

    </>
  );
}
