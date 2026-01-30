'use client';
// src/features/requests/components/id/RequestDetailHeader.tsx

import * as React from 'react';
import { Box, Chip, Stack, Tooltip, Typography, Button } from '@mui/material';
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
  return { label: 'Bekleyen', color: 'warning' };
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
}

export default function RequestDetailHeader({ id, systemSlug, status, createdAt }: Props) {
  const [copied, setCopied] = React.useState(false);

  const shortId = id.replace(/-/g, '').toUpperCase().slice(0, 8);
  const meta = statusMeta(status);

  async function copyId() {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // kullanıcı kopyalayamazsa da dünya dönmeye devam ediyor
    }
  }

  return (
    <Box sx={{ mb: 1.5 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h5">Talep Detayı</Typography>

        <Chip
          size="small"
          color={meta.color}
          label={meta.label}
          sx={{
            fontWeight: 600,
            bgcolor: (t) =>
              alpha(t.palette[meta.color].main, t.palette.mode === 'light' ? 0.16 : 0.22),
            color: (t) => t.palette[meta.color].main,
            border: '1px solid',
            borderColor: (t) => alpha(t.palette[meta.color].main, 0.32),
          }}
        />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center" flexWrap="wrap">
        {/* ID: tek tıklanabilir buton içinde */}
        <Tooltip title={copied ? 'Kopyalandı' : 'ID’yi kopyala'} arrow>
          <Button
            variant="outlined"
            size="small"
            onClick={copyId}
            startIcon={<FingerprintOutlinedIcon fontSize="small" />}
            endIcon={
              copied ? <DoneRoundedIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />
            }
            sx={{
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              textTransform: 'none',
              borderRadius: 999,
              // kopyalandıysa görsel geri bildirim
              ...(copied && {
                color: (t) => t.palette.success.main,
                borderColor: (t) => alpha(t.palette.success.main, 0.5),
                bgcolor: (t) =>
                  alpha(t.palette.success.main, t.palette.mode === 'light' ? 0.08 : 0.12),
              }),
            }}
            aria-label="Talep ID’sini kopyala"
          >
            ID: {shortId}
          </Button>
        </Tooltip>

        {systemSlug ? (
          <Chip size="small" variant="outlined" icon={<TagOutlinedIcon fontSize="small" />} label={systemSlug} />
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
