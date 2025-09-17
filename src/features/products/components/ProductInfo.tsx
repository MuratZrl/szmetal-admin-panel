// src/features/products/components/ProductInfo.tsx
import Link from 'next/link';
import { Paper, Stack, Typography, Chip, Box, Divider, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { detectMediaKind } from '@/features/products/utils/media';

type Maybe<T> = T | null | undefined;

export type LabelMaps = {
  category?: Record<string, string>;
  subCategory?: Record<string, string>;
  variant?: Record<string, string>;
};

export type ProductInfoProps = {
  variant: string;
  category: string;
  subCategory?: string;
  date: string;
  id: string;

  hasCustomerMold?: boolean | null;
  has_customer_mold?: boolean | null;

  drawer?: Maybe<string>;
  control?: Maybe<string>;
  unit_weight_g_pm?: number;
  scale?: Maybe<string>;
  outerSizeMm?: Maybe<number>;
  sectionMm2?: Maybe<number>;
  tempCode?: Maybe<string>;
  profileCode?: Maybe<string>;
  manufacturerCode?: Maybe<string>;

  labels?: LabelMaps;
  footerSlot?: React.ReactNode;

  /** Medya eylemleri için URL’ler */
  mediaSrc?: string | null;
  mediaFileUrl?: string | null;
  mediaExt?: 'pdf' | 'png' | 'webp' | 'jpg' | 'jpeg' | null;
  mediaMime?: string | null;
};

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 1 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}

export default function ProductInfo(props: ProductInfoProps) {
  const {
    variant, category, subCategory, unit_weight_g_pm, date, id,
    drawer, control, scale, outerSizeMm, sectionMm2,
    tempCode, profileCode, manufacturerCode,
    labels, footerSlot,
    hasCustomerMold, has_customer_mold,

    // medya
    mediaSrc, mediaFileUrl, mediaExt, mediaMime,
  } = props;

  const fmt0 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const nf = (n?: number | null) => (typeof n === 'number' ? fmt0.format(n) : undefined);

  const mold =
    typeof hasCustomerMold === 'boolean' ? hasCustomerMold
    : typeof has_customer_mold === 'boolean' ? has_customer_mold
    : null;

  const variantText = labels?.variant?.[variant] ?? variant;
  const catText     = category ? (labels?.category?.[category] ?? category) : '';
  const subText     = subCategory ? (labels?.subCategory?.[subCategory] ?? subCategory) : '';
  const categoryLine = [catText, subText].filter(Boolean).join(' / ') || '-';

  const hasTech =
    typeof unit_weight_g_pm === 'number' ||
    typeof mold === 'boolean' ||
    !!(tempCode || profileCode || manufacturerCode || drawer || control || scale ||
       typeof outerSizeMm === 'number' || typeof sectionMm2 === 'number');

  // Medya aksiyonları için "en mantıklı URL" seç
  const srcUrl = (mediaSrc ?? '').trim();
  const fbUrl  = (mediaFileUrl ?? '').trim();
  const srcKind = srcUrl ? detectMediaKind({ url: srcUrl, mime: mediaMime ?? undefined, extHint: mediaExt ?? undefined }) : 'unknown';
  const fbKind  = fbUrl  ? detectMediaKind({ url: fbUrl,  mime: mediaMime ?? undefined, extHint: mediaExt ?? undefined })  : 'unknown';

  const chosen =
    (srcUrl && srcKind !== 'unknown' && { url: srcUrl, kind: srcKind }) ||
    (fbUrl  && fbKind  !== 'unknown' && { url: fbUrl,  kind: fbKind  }) ||
    ({ url: '', kind: 'unknown' as const });

  const anyUrl = srcUrl || fbUrl;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">Genel Bilgi</Typography>

          {/* Medya eylemleri buraya taşındı */}
          {anyUrl ? (
            <Stack direction="row" spacing={0.5}>
              <IconButton
                LinkComponent={Link}
                href={(chosen.url || anyUrl) as string}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Yeni sekmede aç"
                size="small"
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
              <IconButton
                component="a"
                href={(chosen.url || anyUrl) as string}
                download
                aria-label="İndir"
                size="small"
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Stack>
          ) : null}
        </Box>

        <Stack spacing={0.5}>
          <InfoItem label="Varyant:" value={variantText} />
          <InfoItem label="Kategori:" value={categoryLine} />
          <InfoItem label="Tarih:" value={date} />
        </Stack>

        <Divider />

        {hasTech ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
              Teknik Bilgiler
            </Typography>
            <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              {typeof mold === 'boolean' && (
                <InfoItem label="Müşteri Kalıbı:" value={mold ? 'Evet' : 'Hayır'} />
              )}
              {typeof unit_weight_g_pm === 'number' && (
                <InfoItem label="Birim Ağırlık (gr/m):" value={nf(unit_weight_g_pm)} />
              )}
              {tempCode && <InfoItem label="Geçici Kod:" value={tempCode} />}
              {profileCode && <InfoItem label="Profil Kodu:" value={profileCode} />}
              {manufacturerCode && <InfoItem label="Üretici Kodu:" value={manufacturerCode} />}
              {drawer && <InfoItem label="Çizen:" value={drawer} />}
              {control && <InfoItem label="Kontrol:" value={control} />}
              {scale && <InfoItem label="Ölçek:" value={scale} />}
              {typeof outerSizeMm === 'number' && <InfoItem label="Dış Çevre (mm):" value={nf(outerSizeMm)} />}
              {typeof sectionMm2 === 'number' && <InfoItem label="Kesit (mm²):" value={nf(sectionMm2)} />}
            </Box>
          </Stack>
        ) : null}

        <Chip label={`ID: ${id}`} size="small" variant="outlined" sx={{ mt: 0.5, width: 'fit-content', pointerEvents: 'none' }} />
        {footerSlot ? <Box sx={{ pt: 1 }}>{footerSlot}</Box> : null}

      </Stack>
    </Paper>
  );
}
