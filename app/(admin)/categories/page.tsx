// app/(admin)/categories/page.tsx
'use client';

import React from 'react';
import Grid from '@mui/material/Grid';

import CategoryCard from '../_components_/ui/cards/CategoryCard';
import { categoryData } from '../_constants_/categories/data';

export default function CategoriesPage() {
  return (
    <Grid container spacing={2} p={2} >
      {categoryData.map((cat, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 2, }} key={index}>
          <CategoryCard
            title={cat.title}
            icon={cat.icon}
            imageUrl={cat.imageUrl}
            onClick={() => console.log(cat.title)}
          />
        </Grid>
      ))}
    </Grid>
  );
}
