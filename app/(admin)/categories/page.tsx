// app/(admin)/categories/page.tsx
'use client';

import { Grid } from '@mui/material';

import CategorySidebar from '../_components_/ui/sidebar/CategorySidebar';
import PropertyFilter from '../_components_/ui/sidebar/PropertyFilter';
import SearchFilter from '../_components_/ui/sidebar/SearchFilter';
import KgPerMRangeFilter from '../_components_/ui/sidebar/KgPerMRangeFilter';

import SubCategoryGrid from '../_components_/ui/sidebar/SubCategoryGrid';

export default function CategoriesPage() {
  return (
    <Grid container spacing={4} padding={4} >

      {/* Sol Sidebar */}
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <CategorySidebar />
        <PropertyFilter /> {/* burada sidebar’ın altına eklenmiş oluyor */}
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
