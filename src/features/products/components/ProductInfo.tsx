import { Paper, Stack, Typography, Chip, Box, Divider } from '@mui/material';

type Maybe<T> = T | null | undefined;

export type LabelMaps = {
  category?: Record<string, string>;
  subCategory?: Record<string, string>;
  variant?: Record<string, string>;
};

export type ProductInfoProps = {
  // Temel alanlar (slug olabilir)
  variant: string;
  category: string;
  subCategory?: string;
  date: string;
  id: string;

  hasCustomerMold?: boolean | null;
  has_customer_mold?: boolean | null;

  // Opsiyonel teknik alanlar
  drawer?: Maybe<string>;
  control?: Maybe<string>;
  unit_weight_g_pm?: number;       // gr/m
  scale?: Maybe<string>;
  outerSizeMm?: Maybe<number>;
  sectionMm2?: Maybe<number>;
  tempCode?: Maybe<string>;
  profileCode?: Maybe<string>;
  manufacturerCode?: Maybe<string>;

  // Label map'leri (slug → görünen ad)
  labels?: LabelMaps;

  footerSlot?: React.ReactNode;    // buton vb.
};

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 1 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}

export default function ProductInfo({
  variant, category, subCategory, unit_weight_g_pm, date, id,
  drawer, control, scale, outerSizeMm, sectionMm2,
  tempCode, profileCode, manufacturerCode,
  labels, footerSlot,
  hasCustomerMold, has_customer_mold,
}: ProductInfoProps) {

  const fmt0 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const nf = (n?: number | null) => (typeof n === 'number' ? fmt0.format(n) : undefined);

  const mold =
    typeof hasCustomerMold === 'boolean' ? hasCustomerMold
    : typeof has_customer_mold === 'boolean' ? has_customer_mold
    : null;

  // Slug → label çöz
  const variantText = labels?.variant?.[variant] ?? variant;
  const catText     = category ? (labels?.category?.[category] ?? category) : '';
  const subText     = subCategory ? (labels?.subCategory?.[subCategory] ?? subCategory) : '';

  // "Kategori: X / Y" ama Y yoksa "X" olarak yaz, hiçbir şey yoksa "-"
  const categoryLine = [catText, subText].filter(Boolean).join(' / ') || '-';

  const hasTech =
    typeof unit_weight_g_pm === 'number' ||
    typeof mold === 'boolean' ||
    !!(tempCode || profileCode || manufacturerCode || drawer || control || scale ||
       typeof outerSizeMm === 'number' || typeof sectionMm2 === 'number');

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle2" color="text.secondary">Genel Bilgi</Typography>

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

        <Chip
          label={`ID: ${id}`}
          size="small"
          variant="outlined"
          sx={{ mt: 0.5, width: 'fit-content', pointerEvents: 'none' }}
        />
        {footerSlot ? <Box sx={{ pt: 1 }}>{footerSlot}</Box> : null}
      </Stack>
    </Paper>
  );
}
