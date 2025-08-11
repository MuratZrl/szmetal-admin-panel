// app/(admin)/categories/page.tsx
'use client';

import { Grid, useTheme, useMediaQuery, Box } from '@mui/material';

import CategorySidebar from './CategorySidebar';
import PropertyFilter from './PropertyFilter';
import SearchFilter from './SearchFilter';
import KgPerMRangeFilter from './KgPerMRangeFilter';
import SubCategoryGrid from './SubCategoryGrid';

export default function CategoriesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ px: isMobile ? 2 : 4, py: isMobile ? 2 : 4 }}>
      <Grid container spacing={isMobile ? 2 : 4}>
        
        {/* Sol Sidebar */}
        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }} >
          <Box sx={{ position: 'sticky', top: 16 }}>
            <CategorySidebar />
            <Box mt={2}><PropertyFilter /></Box>
            <Box mt={2}><SearchFilter /></Box>
            <Box mt={2}><KgPerMRangeFilter /></Box>
          </Box>
        </Grid>

        {/* Sağ İçerik */}
        <Grid size={{ xs: 12, sm: 8, md: 9, lg: 10 }} >
          <SubCategoryGrid />
        </Grid>

      </Grid>
    </Box>
  );
}
