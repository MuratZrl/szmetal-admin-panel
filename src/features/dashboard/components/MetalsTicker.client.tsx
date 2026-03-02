'use client';
// src/features/dashboard/components/MetalsTicker.client.tsx

import * as React from 'react';
import {
  Box, Chip, Stack, Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import ArrowDropUpRoundedIcon from '@mui/icons-material/ArrowDropUpRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';

type MetalItem = {
  symbol: string;
  name: string;
  priceUSD: number;
  previousCloseUSD: number;
  change: number;
  changePct: number;
  updatedAt: string;
  history: { labels: string[]; data: number[] };
};

type MetalsPayload = {
  available: true;
  metals: MetalItem[];
} | {
  available: false;
};

type Density = 'normal' | 'compact' | 'ultra';

type Props = {
  refreshMs?: number;
  density?: Density | 'auto';
  showMeta?: boolean;
};

function formatUSD(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(n);
}

export default function MetalsTicker({
  refreshMs = 300_000, // 5 minutes
  density = 'auto',
  showMeta = true,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const resolvedDensity: Density =
    density === 'auto' ? (isXs ? 'ultra' : 'compact') : density;

  const [metals, setMetals] = React.useState<MetalItem[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [hidden, setHidden] = React.useState(false);

  async function load() {
    try {
      const res = await fetch('/api/metals', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as MetalsPayload;
      if (!json.available) {
        setHidden(true);
        return;
      }
      setMetals(json.metals);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'fetch_error');
    }
  }

  React.useEffect(() => {
    void load();
    const id = setInterval(load, refreshMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshMs]);

  // If no API key configured, hide completely
  if (hidden) return null;

  // Error state — subtle tooltip
  if (error && !metals) {
    return (
      <Tooltip title={`Metal fiyat bilgisi alınamadı: ${error}`}>
        <Box sx={{ opacity: 0.6, fontSize: 11 }}>Metal —</Box>
      </Tooltip>
    );
  }

  // Loading state
  if (!metals) return null;

  return (
    <Stack direction="column" spacing={0.5} alignItems="center">
      {metals.map(metal => (
        <MetalChip
          key={metal.symbol}
          metal={metal}
          density={resolvedDensity}
          showMeta={showMeta}
        />
      ))}
    </Stack>
  );
}

/* ─── Single Metal Chip ──────────────────────────────────── */

type MetalChipProps = {
  metal: MetalItem;
  density: Density;
  showMeta: boolean;
};

function MetalChip({ metal, density, showMeta }: MetalChipProps) {
  const { symbol, name, priceUSD, change, changePct, updatedAt } = metal;

  const up = change > 0;
  const down = change < 0;
  const color: 'default' | 'success' | 'error' = up ? 'error' : down ? 'success' : 'default';
  const Icon = up ? ArrowDropUpRoundedIcon : down ? ArrowDropDownRoundedIcon : null;

  const dims =
    density === 'ultra'
      ? { h: 24, px: 0.5, fs: 12, gap: 0.25, maxW: 150 }
      : density === 'compact'
      ? { h: 28, px: 0.75, fs: 13, gap: 0.5, maxW: 180 }
      : { h: 32, px: 1, fs: 14, gap: 0.75, maxW: 210 };

  const metaText = showMeta
    ? `${name} • ${formatUSD(priceUSD)}/t • ${up ? '+' : ''}${changePct.toFixed(2)}% • ${new Date(updatedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
    : '';

  const chip = (
    <Chip
      size="small"
      variant="outlined"
      color={color}
      icon={density === 'ultra' ? undefined : Icon ? <Icon /> : undefined}
      aria-label={`${name} ${formatUSD(priceUSD)} per ton`}
      label={
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: dims.gap,
            whiteSpace: 'nowrap',
            fontSize: dims.fs,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: 0.1,
          }}
        >
          {symbol}
          <span>{formatUSD(priceUSD)}/t</span>
        </Box>
      }
      sx={{
        height: dims.h,
        px: dims.px,
        '& .MuiChip-icon': { mr: 0.25 },
        '& .MuiChip-label': { px: 0 },
        maxWidth: dims.maxW,
      }}
    />
  );

  return metaText ? (
    <Tooltip placement="right" title={metaText}>
      <Box>{chip}</Box>
    </Tooltip>
  ) : (
    chip
  );
}
