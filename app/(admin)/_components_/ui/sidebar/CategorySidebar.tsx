'use client';

import { useEffect, useState } from 'react';
import { useCategoryStore } from '../../../../lib/stores/categoryStore';
import { supabase } from '../../../../lib/supabase/supabaseClient';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItemButton,
  ListItemText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type SubCategory = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
  sub_categories: SubCategory[];
};

export default function CategorySidebar() {
  const setSelectedSubCategoryId = useCategoryStore((s) => s.setSelectedSubCategoryId);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id, name,
          sub_categories (id, name)
        `);
      if (!error && data) setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <>
      <Typography variant="h6" gutterBottom>Kategoriler</Typography>
      {categories.map((cat) => (
        <Accordion key={cat.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{cat.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {cat.sub_categories.map((sub) => (
                <ListItemButton
                  key={sub.id}
                  onClick={() => setSelectedSubCategoryId(sub.id)}
                >
                  <ListItemText primary={sub.name} />
                </ListItemButton>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}
