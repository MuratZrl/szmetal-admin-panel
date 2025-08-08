// app/(admin)/categories/page.tsx
'use client';

import { Grid } from '@mui/material';

import CategorySidebar from '../_components_/ui/sidebar/CategorySidebar';
import SubCategoryGrid from '../_components_/ui/sidebar/SubCategoryGrid';


export default function CategoriesPage() {
  return (
    <Grid container spacing={4} padding={4}>
      
      {/* Sol Sidebar */}
      <Grid size={{ xs: 12, sm: 4, md: 3 }} >
        <CategorySidebar />
      </Grid>

      {/* Sağ İçerik */}
      <Grid size={{ xs: 12, sm: 8, md: 9 }} >
        <SubCategoryGrid />
      </Grid>
    
    </Grid>
  );
}
