// app/(admin)/categories/page.tsx
'use client';

import { Grid } from '@mui/material';

import CategorySidebar from './CategorySidebar';
import PropertyFilter from './PropertyFilter';
import SearchFilter from './SearchFilter';
import KgPerMRangeFilter from './KgPerMRangeFilter';

import SubCategoryGrid from './SubCategoryGrid';

export default function CategoriesPage() {
  return (
    <Grid container spacing={4} padding={4} >

      {/* Sol Sidebar */}
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <CategorySidebar />
        <PropertyFilter />
        <SearchFilter />
        <KgPerMRangeFilter /> {/* ✅ En alta ekledik */}
      </Grid>

      {/* Sağ İçerik */}
      <Grid size={{ xs: 12, sm: 9, md: 10 }} >
        <SubCategoryGrid />
      </Grid>

    </Grid>
  );
}
