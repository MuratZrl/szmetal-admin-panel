// src/features/products/components/ProductInfo.tsx
import { Paper, Stack, Typography, Chip, Box, Divider } from '@mui/material';

type Maybe<T> = T | null | undefined;

export type ProductInfoProps = {
  // Temel alanlar
  variant: string;
  category: string;
  subCategory: string;
  date: string;
  id: string;
  
  // Yeni (detay sayfasına özel) alanlar — opsiyonel olsun (hepsi değil)
  drawer: Maybe<string>;             // Çizen
  control: Maybe<string>;            // Kontrol
  unit_weight_g_pm: number;           // Birim Ağırlık (gr)
  scale: Maybe<string>;              // Ölçek
  outerSizeMm: Maybe<number>;        // Dış Çevre (mm)
  sectionMm2: Maybe<number>;         // Kesit (mm²)
  tempCode?: Maybe<string>;           // Geçici Kod
  profileCode?: Maybe<string>;        // Profil Kodu
  manufacturerCode?: Maybe<string>;   // Üretici Kodu

  footerSlot: React.ReactNode;       // buton vb.
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
    footerSlot,
  } = props;

  const fmt0 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const nf = (n?: number | null) => (typeof n === 'number' ? fmt0.format(n) : undefined);
  
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle2" color="text.secondary">Genel Bilgi</Typography>

        <Stack spacing={0.5}>
          <InfoItem label="Variant:" value={variant} />
          <InfoItem label="Kategori:" value={`${category} / ${subCategory}`} />
          <InfoItem label="Tarih:" value={date} />
        </Stack>

        <Divider />

        {(drawer || control || scale || outerSizeMm || sectionMm2 || tempCode || profileCode || manufacturerCode) ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
              Teknik Bilgiler
            </Typography>
            <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              {unit_weight_g_pm !== undefined && (
                <InfoItem label="Birim Ağırlık (gr/m)" value={unit_weight_g_pm} />
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
