import * as React from 'react';
import {
  Box,
  Divider,
  Grid,
  Stack,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material';

type FormSectionProps = {
  /** Bölüm başlığı (zorunlu) */
  title: string;
  /** Başlığın altında küçük açıklama (opsiyonel) */
  subtitle?: string;
  /** Sol tarafa küçük bir ikon bırakmak istersen */
  icon?: React.ReactNode;
  /** Sağ tarafa aksiyon alanı (buton vs.) */
  actions?: React.ReactNode;
  /** İçerik: Grid item’lar (size={{ xs, sm, md }} kullananlar) */
  children: React.ReactNode;

  /** <section id="..."> için anchor */
  id?: string;
  /** Başlıktan sonra Divider’ı gizle */
  hideDivider?: boolean;
  /** İçerik grid spacing */
  spacing?: number;

  /** Header düzeyi için sx */
  headerSx?: SxProps<Theme>;
  /** İçerik bölümü için sx */
  contentSx?: SxProps<Theme>;
};

/**
 * Tutarlı form bölümü:
 * - Üstte başlık (overline stili), opsiyonel ikon ve sağda aksiyonlar
 * - İsteğe bağlı alt başlık
 * - Divider
 * - Altında Grid container; child’lar Grid item olarak beklenir
 */
export default function FormSection({
  title,
  subtitle,
  icon,
  actions,
  children,
  id,
  hideDivider = false,
  spacing = 2,
  headerSx,
  contentSx,
}: FormSectionProps) {
  const titleId = React.useId();

  return (
    <Box id={id} component="section" aria-labelledby={titleId} sx={{ py: 1 }}>
      {/* Header */}
      <Grid container alignItems="center" spacing={1} sx={headerSx}>
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Stack direction="row" alignItems="center" gap={1.25} minWidth={0}>
              {icon ? <Box sx={{ display: 'inline-flex' }}>{icon}</Box> : null}
              <Typography
                id={titleId}
                variant="overline"
                fontStyle="italic"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </Typography>
            </Stack>

            {actions ? <Box sx={{ ml: 2, flexShrink: 0 }}>{actions}</Box> : null}
          </Stack>

          {subtitle ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Grid>

        {!hideDivider ? (
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1.5 }} />
          </Grid>
        ) : null}
      </Grid>

      {/* Content */}
      <Box sx={contentSx}>
        <Grid container spacing={spacing} aria-describedby={titleId}>
          {children}
        </Grid>
      </Box>
    </Box>
  );
}
