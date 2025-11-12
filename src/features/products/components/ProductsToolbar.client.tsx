// src/features/products/components/ProductsToolbar.client.tsx
'use client';

import * as React from 'react';
import Link from '@/components/Link';

import {
  Grid,
  Stack,
  Button,
  Typography,
  IconButton,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CloseIcon from '@mui/icons-material/Close';

import { useProductsSelection } from '../selection/ProductsSelectionContext.client';
import BulkDeleteDialog from './BulkDeleteDialog.client';
import BulkDeleteAllDialog from './BulkDeleteAllDialog.client';

type Perms = { canCreate: boolean; canBulkDelete: boolean };

type Props = {
  perms: Perms;
  totalCount?: number | null;
};

export default function ProductsToolbar({ perms, totalCount }: Props) {
  const { count, clear } = useProductsSelection();
  const [open, setOpen] = React.useState(false);
  const [openAll, setOpenAll] = React.useState(false);

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const hasSelection = count > 0 && perms.canBulkDelete;

  const formattedTotal = React.useMemo(() => {
    const n = typeof totalCount === 'number' ? totalCount : Number(totalCount);
    return Number.isFinite(n) && n >= 0 ? new Intl.NumberFormat('tr-TR').format(n) : '0';
  }, [totalCount]);

  return (
    <>
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography variant="h5" component="h2">
              Profilleri Listele
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" aria-live="polite" aria-atomic>
              ({formattedTotal} ürün)
            </Typography>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          {smUp ? (
            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              sx={{ gap: 2, flexWrap: 'wrap', '& > *': { minWidth: 0 } }}
            >
              {/* {perms.canBulkDelete && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<CloseIcon />}
                    disabled={!hasSelection}
                    onClick={clear}
                    draggable={false}
                  >
                    Vazgeç
                  </Button>

                  <Button
                    color="error"
                    variant="contained"
                    startIcon={<DeleteOutlineIcon />}
                    disabled={!hasSelection}
                    onClick={() => setOpen(true)}
                    draggable={false}
                  >
                    Seçilenleri sil {hasSelection ? `(${count})` : ''}
                  </Button>

                  <Button
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteForeverIcon />}
                    onClick={() => setOpenAll(true)}
                    draggable={false}
                  >
                    Tümünü Sil
                  </Button>
                </>
              )} */}

              {perms.canCreate && (
                <Button 
                  component={Link} 
                  href="/products/new" 
                  variant="text" 
                  color='contrast' 
                  size='small'
                  startIcon={<AddIcon />}
                  draggable={false}
                >
                  Yeni Profil Ekle
                </Button>
              )}
            </Stack>
          ) : (
            <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
              {perms.canBulkDelete && (
                <>
                  <Tooltip title="Vazgeç">
                    <span>
                      <IconButton color="default" disabled={!hasSelection} onClick={clear} aria-label="Vazgeç">
                        <CloseIcon />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title={hasSelection ? `Seçilenleri sil (${count})` : 'Seçilenleri sil'}>
                    <span>
                      <IconButton color="error" disabled={!hasSelection} onClick={() => setOpen(true)} aria-label="Seçilenleri sil">
                        <DeleteOutlineIcon />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="Tümünü Sil">
                    <IconButton color="error" onClick={() => setOpenAll(true)} aria-label="Tümünü Sil">
                      <DeleteForeverIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              {perms.canCreate && (
                <Tooltip title="Profil Ekle">
                  <IconButton component={Link} href="/products/new" color="primary" aria-label="Profil Ekle">
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          )}
        </Grid>
      </Grid>

      {perms.canBulkDelete && (
        <>
          <BulkDeleteDialog open={open} onClose={() => setOpen(false)} />
          <BulkDeleteAllDialog open={openAll} onClose={() => setOpenAll(false)} />
        </>
      )}
    </>
  );
}
