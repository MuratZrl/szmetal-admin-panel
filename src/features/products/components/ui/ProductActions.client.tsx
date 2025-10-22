// src/features/products/components/ui/ProductActions.client.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';

import {
  Box, Stack, Button, Checkbox,
} from '@mui/material';

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EditIcon from '@mui/icons-material/Edit';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

type ProductActionsProps = {
  canEdit: boolean;
  canSelect: boolean;
  selected: boolean;
  onToggle: () => void;
  editHref: string;
  detailHref: string;
};

export function ProductActions({
  canEdit,
  canSelect,
  selected,
  onToggle,
  editHref,
  detailHref,
}: ProductActionsProps) {
  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={{
          minHeight: 36,
          flexWrap: 'nowrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {canEdit && (
            <Button
              LinkComponent={Link}
              href={editHref}
              size="small"
              variant="outlined"
              endIcon={<EditIcon />}
              draggable={false}
              onClick={(e) => e.stopPropagation()}
              aria-label="Ürünü düzenle"
              sx={{ px: 1.5 }}
            >
              Hızlı Düzenle
            </Button>
          )}
        </Box>

        <Button
          LinkComponent={Link}
          href={detailHref}
          size="small"
          // MUI default: text
          endIcon={<ArrowForwardIosIcon fontSize="small" />}
          draggable={false}
          onClick={(e) => e.stopPropagation()}
          aria-label="Ürün profilini incele"
        >
          Profili İncele
        </Button>
      </Stack>

      {canSelect && (
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            minHeight: 28,
          }}
        >
          <Checkbox
            aria-label="Ürünü seç"
            size="small"
            checked={selected}
            onChange={onToggle}
            icon={<RadioButtonUncheckedIcon />}
            checkedIcon={<RadioButtonCheckedIcon />}
          />
        </Box>
      )}
    </>
  );
}
