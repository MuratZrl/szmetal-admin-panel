// src/features/requests/components/id/RequestDetailHeader.tsx
'use client';

import * as React from 'react';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';

type RequestStatus = 'pending' | 'approved' | 'rejected';

type Props = {
  id: string;
  systemSlug?: string | null;
  status: RequestStatus;
  createdAt?: string | null;
};

function statusMeta(s: RequestStatus): { label: string; color: 'success' | 'error' | 'warning' } {
  if (s === 'approved') return { label: 'Onaylandı', color: 'success' };
  if (s === 'rejected') return { label: 'Reddedildi', color: 'error' };
  return { label: 'Bekliyor', color: 'warning' };
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
}

export default function RequestDetailHeader({ id, systemSlug, status, createdAt }: Props) {
  const [copied, setCopied] = React.useState(false);

  const shortId = id.replace(/-/g, '').toUpperCase().slice(0, 8); // RQ koduyla uyumlu kısaltma
  const meta = statusMeta(status);

  async function copyId() {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // eh, kullanıcı kopyalayamazsa da hayat devam ediyor
    }
  }

  return (
    <Box sx={{ mb: 1.5 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h5">
          Talep Detayı
        </Typography>

        <Chip
          size="small"
          color={meta.color}
          label={meta.label}
          sx={{
            fontWeight: 600,
            bgcolor: (t) => alpha(t.palette[meta.color].main, t.palette.mode === 'light' ? 0.16 : 0.22),
            color: (t) => t.palette[meta.color].main,
            border: '1px solid',
            borderColor: (t) => alpha(t.palette[meta.color].main, 0.32),
          }}
        />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center" flexWrap="wrap">
        <Chip
          size="small"
          variant="outlined"
          icon={<FingerprintOutlinedIcon fontSize="small" />}
          label={`ID: ${shortId}`}
          sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
        />
        <Tooltip title={copied ? 'Kopyalandı' : 'ID’yi kopyala'} arrow>
          <IconButton size="small" onClick={copyId} aria-label="Kopyala">
            {copied ? <DoneRoundedIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        {systemSlug ? (
          <Chip
            size="small"
            variant="outlined"
            icon={<TagOutlinedIcon fontSize="small" />}
            label={systemSlug}
          />
        ) : null}

        {createdAt ? (
          <Chip
            size="small"
            variant="outlined"
            icon={<ScheduleOutlinedIcon fontSize="small" />}
            label={fmtDate(createdAt)}
          />
        ) : null}
      </Stack>
    </Box>
  );
}
