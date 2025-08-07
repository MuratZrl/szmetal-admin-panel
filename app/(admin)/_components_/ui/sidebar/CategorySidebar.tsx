'use client';

import { useEffect, useState } from 'react';

import { useCategoryStore } from '../../../../lib/stores/categoryStore';

import { List, ListItemButton, ListItemText, Typography } from '@mui/material';

import { supabase } from '../../../../lib/supabase/supabaseClient';

type Category = {
  id: string;
  name: string;
};

export default function CategorySidebar() {
  const setSelectedCategoryId = useCategoryStore((s) => s.setSelectedCategoryId);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id, name');
      if (!error && data) setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <>
      <Typography variant="h6" gutterBottom>Kategoriler</Typography>
      <List>
        {categories.map((cat) => (
          <ListItemButton
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
          >
            <ListItemText primary={cat.name} />
          </ListItemButton>
        ))}
      </List>
    </>
  );
}
