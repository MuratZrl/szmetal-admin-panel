// src/features/dashboard/components/RatesTicker.client.tsx
'use client';

import * as React from 'react';
import {
  Box, Chip, Stack, Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import ArrowDropUpRoundedIcon from '@mui/icons-material/ArrowDropUpRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';

type RatesPayload = {
  updatedAt: string;
  provider: 'frankfurter' | 'tcmb';
  usdTry: number;
  eurTry: number;
};

type Density = 'normal' | 'compact' | 'ultra';
type Layout = 'two' | 'dual' | 'auto';

type Props = {
  refreshMs?: number;
  provider?: 'ecb' | 'tcmb';
  showMeta?: boolean;   // alt satır yerine tooltip kullanacağız; bu prop'u geriye dönük tutuyorum
  compact?: boolean;    // geriye dönük; density ile birleşiyor
  density?: Density | 'auto';
  layout?: Layout;      // two: iki ayrı chip, dual: tek chip; auto: ekrana göre
};

function formatTRYShort(n: number | null): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(n);
}

function formatTimeTR(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(d);
}

export default function RatesTicker({
  refreshMs = 60_000,
  provider = 'ecb',
  showMeta = true,
  compact = true,
  density = 'auto',
  layout = 'auto',
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const resolvedDensity: Density =
    density === 'auto' ? (isXs ? 'ultra' : compact ? 'compact' : 'normal') : density;

  const resolvedLayout: Exclude<Layout, 'auto'> =
    layout === 'auto' ? (isXs ? 'dual' : 'two') : layout;

  const [data, setData] = React.useState<RatesPayload | null>(null);
  const [prev, setPrev] = React.useState<RatesPayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const metaText = data
    ? `${data.provider === 'frankfurter' ? 'ECB (Frankfurter)' : 'TCMB'} • ${formatTimeTR(
        data.updatedAt
      )}`
    : '';

  async function load() {
    try {
      const url = provider === 'tcmb' ? '/api/rates?src=tcmb' : '/api/rates';
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as RatesPayload;
      setPrev(d => (json ? d : null));
      setData(json);
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
  }, [refreshMs, provider]);

  const usd = data?.usdTry ?? null;
  const eur = data?.eurTry ?? null;

  const dUsd = prev && data ? data.usdTry - prev.usdTry : 0;
  const dEur = prev && data ? data.eurTry - prev.eurTry : 0;

  if (error) {
    // Kırmızı alarm yerine sakin bir tooltip; yer kaplamasın
    return (
      <Tooltip title={`Kur bilgisi alınamadı: ${error}`}>
        <Box sx={{ opacity: 0.8, fontSize: 12 }}>Kur bilgisi yok</Box>
      </Tooltip>
    );
  }

  const content =
    resolvedLayout === 'dual' ? (
      <DualChip
        usd={usd}
        eur={eur}
        dUsd={dUsd}
        dEur={dEur}
        density={resolvedDensity}
        meta={showMeta ? metaText : ''}
      />
    ) : (
      <Stack direction="column" spacing={0.75} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        <RateChip label="USD" value={usd} delta={dUsd} density={resolvedDensity} meta={metaText} />
        <RateChip label="EUR" value={eur} delta={dEur} density={resolvedDensity} meta={metaText} />
      </Stack>
    );

  return content;
}

type RateChipProps = {
  label: 'USD' | 'EUR';
  value: number | null;
  delta: number;
  density: Density;
  meta?: string;
};

function RateChip({ label, value, delta, density, meta }: RateChipProps) {
  const up = delta > 0.0001;
  const down = delta < -0.0001;
  const color: 'default' | 'success' | 'error' = up ? 'error' : down ? 'success' : 'default';
  const Icon = up ? ArrowDropUpRoundedIcon : down ? ArrowDropDownRoundedIcon : null;

  const dims =
    density === 'ultra'
      ? { h: 24, px: 0.5, fs: 12, gap: 0.25, maxW: 132 }
      : density === 'compact'
      ? { h: 28, px: 0.75, fs: 13, gap: 0.5, maxW: 160 }
      : { h: 32, px: 1, fs: 14, gap: 0.75, maxW: 184 };

  const chip = (
    <Chip
      size="small"
      variant="outlined"
      color={color}
      icon={density === 'ultra' ? undefined : Icon ? <Icon /> : undefined}
      aria-label={`${label} ${value == null ? 'yok' : formatTRYShort(value)}`}
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
          {label}
          <span>{formatTRYShort(value)}</span>
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

  return meta ? (
    <Tooltip title={meta}>
      <Box>{chip}</Box>
    </Tooltip>
  ) : (
    chip
  );
}

type DualChipProps = {
  usd: number | null;
  eur: number | null;
  dUsd: number;
  dEur: number;
  density: Density;
  meta?: string;
};

function DualChip({ usd, eur, dUsd, dEur, density, meta }: DualChipProps) {
  const dims =
    density === 'ultra'
      ? { h: 24, px: 0.5, fs: 12, gap: 0.5, sepPx: 0.5, maxW: 260 }
      : density === 'compact'
      ? { h: 28, px: 0.75, fs: 13, gap: 0.75, sepPx: 0.75, maxW: 320 }
      : { h: 32, px: 1, fs: 14, gap: 1, sepPx: 1, maxW: 400 };

  const Up = ArrowDropUpRoundedIcon;
  const Down = ArrowDropDownRoundedIcon;

  const USDIcon = dUsd > 0.0001 ? Up : dUsd < -0.0001 ? Down : null;
  const EURIcon = dEur > 0.0001 ? Up : dEur < -0.0001 ? Down : null;

  const label = (
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
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
        <span>USD</span>
        {density === 'ultra' ? null : USDIcon ? <USDIcon fontSize="small" /> : null}
        <span>{formatTRYShort(usd)}</span>
      </Box>

      <Box component="span" sx={{ opacity: 0.6, px: dims.sepPx }}>•</Box>

      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
        <span>EUR</span>
        {density === 'ultra' ? null : EURIcon ? <EURIcon fontSize="small" /> : null}
        <span>{formatTRYShort(eur)}</span>
      </Box>
    </Box>
  );

  const chip = (
    <Chip
      size="small"
      variant="outlined"
      color="default"
      aria-label={`USD ${formatTRYShort(usd)} ve EUR ${formatTRYShort(eur)}`}
      label={label}
      sx={{ height: dims.h, px: dims.px, '& .MuiChip-label': { px: 0 }, maxWidth: dims.maxW }}
    />
  );

  return meta ? (
    <Tooltip title={meta}>
      <Box>{chip}</Box>
    </Tooltip>
  ) : (
    chip
  );
}
