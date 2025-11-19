// src/features/products/components/ui/Filter/sectionSx.ts
import { alpha, type Theme } from '@mui/material/styles';

export const sectionSx = (t: Theme) => ({
  p: 1.25,
  borderRadius: 1.25,
  border: '1px solid',
  borderColor: 'divider',
  backgroundColor: alpha(t.palette.background.paper, 0.6),
  backdropFilter: 'saturate(120%) blur(2px)',
});
