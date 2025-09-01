// src/features/products/components/ProductInfo.tsx
import { Paper, Stack, Typography, Chip, Box, Divider } from '@mui/material';

type Maybe<T> = T | null | undefined;

export type ProductInfoProps = {
  // Temel alanlar
  variant: string;
  category: string;
  subCategory: string;
  unitWeightKg: number;
  date: string;
  id: string;

  // Yeni (detay sayfasına özel) alanlar — hepsi opsiyonel olsun
  drawer?: Maybe<string>;             // Çizen
  control?: Maybe<string>;            // Kontrol
  scale?: Maybe<string>;              // Ölçek
  outerSizeMm?: Maybe<number>;        // Dış Çevre (mm)
  sectionMm2?: Maybe<number>;         // Kesit (mm²)
  unitWeightGrPerM?: Maybe<number>;   // Birim Ağırlığı (gr/m)
  displayName?: Maybe<string>;        // İsim
  tempCode?: Maybe<string>;           // Geçici Kod
  profileCode?: Maybe<string>;        // Profil Kodu
  manufacturerCode?: Maybe<string>;   // Üretici Kodu

  footerSlot?: React.ReactNode;       // buton vb.
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
    variant, category, subCategory, unitWeightKg, date, id,
    drawer, control, scale, outerSizeMm, sectionMm2, unitWeightGrPerM,
    displayName, tempCode, profileCode, manufacturerCode,
    footerSlot,
  } = props;

  const nf = (n?: number | null) =>
    typeof n === 'number' ? n.toLocaleString('tr-TR') : undefined;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle2" color="text.secondary">Genel Bilgi</Typography>

        {/* Üst blok: temel bilgiler */}
        <Stack spacing={0.5}>
          <InfoItem label="Variant:" value={variant} />
          <InfoItem label="Kategori:" value={`${category} / ${subCategory}`} />
          <InfoItem label="Ağırlık:" value={`${unitWeightKg.toFixed(2)} kg`} />
          <InfoItem label="Tarih:" value={date} />
        </Stack>

        <Divider />

        {/* Ek teknik bilgiler: varsa göster */}
        {(drawer || control || scale || outerSizeMm || sectionMm2 || unitWeightGrPerM || displayName || tempCode || profileCode || manufacturerCode) ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
              Teknik Bilgiler
            </Typography>

            {/* İki sütunlu, responsive düzen */}
            <Box
              sx={{
                display: 'grid',
                gap: 1,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              }}
            >
              {displayName && <InfoItem label="İsim:" value={displayName} />}
              {tempCode && <InfoItem label="Geçici Kod:" value={tempCode} />}
              {profileCode && <InfoItem label="Profil Kodu:" value={profileCode} />}
              {manufacturerCode && <InfoItem label="Üretici Kodu:" value={manufacturerCode} />}
              {drawer && <InfoItem label="Çizen:" value={drawer} />}
              {control && <InfoItem label="Kontrol:" value={control} />}
              {scale && <InfoItem label="Ölçek:" value={scale} />}
              {typeof outerSizeMm === 'number' && (
                <InfoItem label="Dış Çevre (mm):" value={nf(outerSizeMm)} />
              )}
              {typeof sectionMm2 === 'number' && (
                <InfoItem label="Kesit (mm²):" value={nf(sectionMm2)} />
              )}
              {typeof unitWeightGrPerM === 'number' && (
                <InfoItem label="Birim Ağırlığı (gr/m):" value={nf(unitWeightGrPerM)} />
              )}
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
