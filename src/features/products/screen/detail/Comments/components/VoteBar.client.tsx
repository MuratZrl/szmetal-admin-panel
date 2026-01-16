'use client';

import * as React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';

import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

import type { VoteValue } from '@/features/products/screen/detail/Comments/types';

export type VoteBarProps = {
  canVote: boolean;
  voting?: boolean; // ✅ CommentList bunu gönderiyor
  likes: number;
  dislikes: number;
  mine: VoteValue;
  onUp: () => void;
  onDown: () => void;
};

function clamp(n: number): number {
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

export default function VoteBar({
  canVote,
  voting = false,
  likes,
  dislikes,
  mine,
  onUp,
  onDown,
}: VoteBarProps): React.JSX.Element {
  const disabled = !canVote || voting;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={canVote ? 'Beğen' : 'Oy vermek için giriş yap'} placement="bottom" arrow>
        <span>
          <IconButton size="small" onClick={onUp} disabled={disabled} aria-label="Beğen">
            {mine === 1 ? <ThumbUpIcon fontSize="small" /> : <ThumbUpOffAltIcon fontSize="small" />}
            <Box component="span" sx={{ ml: 0.25, minWidth: 18, fontSize: 11, lineHeight: 1 }}>
              {clamp(likes)}
            </Box>
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={canVote ? 'Beğenme' : 'Oy vermek için giriş yap'} placement="bottom" arrow>
        <span>
          <IconButton size="small" onClick={onDown} disabled={disabled} aria-label="Beğenme">
            {mine === -1 ? <ThumbDownIcon fontSize="small" /> : <ThumbDownOffAltIcon fontSize="small" />}
            <Box component="span" sx={{ ml: 0.25, minWidth: 18, fontSize: 11, lineHeight: 1 }}>
              {clamp(dislikes)}
            </Box>
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
