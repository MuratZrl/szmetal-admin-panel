'use client';
// src/features/products/components/ui/ProductCard/ProductCardCheckbox.client.tsx

import * as React from 'react';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useCompare } from '@/features/products/contexts/CompareContext.client';

type Props = {
  id: string;
  label: string;
};

export default function ProductCardCheckbox({ id, label }: Props) {
  const { toggle, isSelected, isFull } = useCompare();

  const checked = isSelected(id);
  const disabled = isFull && !checked;

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!disabled) toggle({ id, label });
    },
    [disabled, toggle, id, label],
  );

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <Box
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      sx={(t) => ({
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 2,
        width: 24,
        height: 24,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        border: '2px solid',
        borderColor: checked
          ? t.palette.primary.main
          : alpha(t.palette.common.white, 0.7),
        bgcolor: checked
          ? t.palette.primary.main
          : alpha(t.palette.common.black, 0.25),
        backdropFilter: 'blur(4px)',
        opacity: disabled ? 0.35 : checked ? 1 : 0.6,
        boxShadow: checked
          ? `0 0 0 2px ${alpha(t.palette.primary.main, 0.3)}`
          : '0 1px 3px rgba(0,0,0,0.3)',
        '&:hover': {
          opacity: disabled ? 0.35 : 1,
          transform: disabled ? 'none' : 'scale(1.1)',
          bgcolor: checked
            ? t.palette.primary.dark
            : alpha(t.palette.common.black, 0.4),
        },
      })}
    >
      {checked && (
        <CheckRoundedIcon
          sx={{
            fontSize: 16,
            color: 'common.white',
            fontWeight: 700,
          }}
        />
      )}
    </Box>
  );
}
