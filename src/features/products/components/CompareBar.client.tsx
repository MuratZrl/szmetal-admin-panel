'use client';
// src/features/products/components/CompareBar.client.tsx

import * as React from 'react';
import { useRouter } from 'next/navigation';

import {
  Box,
  Button,
  Chip,
  Paper,
  Slide,
  Stack,
  Typography,
  Badge,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

import { useCompare } from '@/features/products/contexts/CompareContext.client';

export default function CompareBar() {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const router = useRouter();

  const { items, remove, clear, count, canCompare } = useCompare();

  const handleCompare = React.useCallback(() => {
    if (!canCompare) return;
    const ids = items.map((i) => i.id).join(',');
    router.push(`/products/compare?ids=${ids}` as `/products/compare?ids=${string}`);
  }, [canCompare, items, router]);

  return (
    <Slide direction="up" in={count > 0} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={(t) => ({
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: t.zIndex.appBar + 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          px: { xs: 1.5, sm: 2.5 },
          py: 1.25,
          borderRadius: 0,
        })}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ maxWidth: 1200, mx: 'auto' }}
        >
          {/* Sol: ikon + sayı */}
          <Badge badgeContent={count} color="primary">
            <CompareArrowsIcon color="action" />
          </Badge>

          {smUp && (
            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
              Karşılaştır
            </Typography>
          )}

          {/* Seçili ürünler chip'leri */}
          {smUp && (
            <Box
              sx={{
                display: 'flex',
                gap: 0.75,
                flex: '1 1 auto',
                overflow: 'hidden',
                minWidth: 0,
              }}
            >
              {items.map((item) => (
                <Chip
                  key={item.id}
                  label={item.label}
                  size="small"
                  variant="outlined"
                  onDelete={() => remove(item.id)}
                  sx={{
                    maxWidth: 180,
                    borderRadius: 1.5,
                    fontSize: 12,
                    '& .MuiChip-label': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    },
                  }}
                />
              ))}
            </Box>
          )}

          {/* Sağ: butonlar */}
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0, ml: 'auto' }}>
            <Button
              variant="text"
              size="small"
              onClick={clear}
              sx={{ textTransform: 'capitalize', fontSize: 13 }}
            >
              Temizle
            </Button>

            <Button
              variant="contained"
              size="small"
              disabled={!canCompare}
              onClick={handleCompare}
              disableElevation
              startIcon={<CompareArrowsIcon />}
              sx={{ textTransform: 'capitalize', fontSize: 13, px: 2 }}
            >
              Karşılaştır {canCompare ? `(${count})` : ''}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Slide>
  );
}
