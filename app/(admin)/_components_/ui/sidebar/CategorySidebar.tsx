import React from 'react';
import { useState, useEffect } from 'react';
import { useCategoryStore } from '../../../../lib/stores/categoryStore';
import { supabase } from '../../../../lib/supabase/supabaseClient';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  Checkbox,
  ListItemText,
  Divider,
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
  const setSelectedSubCategoryIdsStore = useCategoryStore((s) => s.setSelectedSubCategoryIds); // store setter
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedSubCategoryIdsState, setSelectedSubCategoryIdsState] = useState<string[]>([]); // local state

  // Kategorileri çek
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

  // Checkbox tıklama
  const handleToggle = (subId: string) => {
    setSelectedSubCategoryIdsState((prev: string[]) => {
      const updated = prev.includes(subId)
        ? prev.filter((id: string) => id !== subId)
        : [...prev, subId];
      console.log('Güncellenmiş seçim listesi:', updated);
      return updated;
    });
  };

  // Local state değişince store’a yaz
  useEffect(() => {
    setSelectedSubCategoryIdsStore(selectedSubCategoryIdsState);
  }, [selectedSubCategoryIdsState, setSelectedSubCategoryIdsStore]);

  return (
  <Box
    display={'flex'}
    justifyContent={'center'}
    alignItems={'stretch'}
    flexDirection={'column'}
  >
    <Typography variant="h6" gutterBottom sx={{ px: 1.25 }}>
      Filtrele
    </Typography>

    {categories.map((cat, index) => (
      <React.Fragment key={cat.id}>
        <Accordion
          disableGutters
          sx={{
            boxShadow: 'none',
            '&:before': { display: 'none' },
            '&.MuiAccordion-root': { margin: 0, padding: 0 },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              minHeight: 46,
              '& .MuiAccordionSummary-content': { margin: 0, padding: 0 },
              '&.Mui-expanded': { minHeight: 28, px: 1.5 },
            }}
          >
            <Typography variant="body2">{cat.name}</Typography>
          </AccordionSummary>

          <AccordionDetails sx={{ p: 0.5 }}>
            <List disablePadding dense>
              {cat.sub_categories.map((sub) => (
                <ListItem
                  key={sub.id}
                  disablePadding
                  sx={{ pl: 1.35 }}
                >
                  <Checkbox
                    size="small"
                    checked={selectedSubCategoryIdsState.includes(sub.id)}
                    onChange={() => handleToggle(sub.id)}
                  />
                  <ListItemText
                    primary={sub.name}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Kategori ile diğer kategori arasına çizgi */}
        {index < categories.length - 1 && (
          <Divider sx={{ borderColor: "rgba(0, 0, 0, 1)" }} />
        )}
      </React.Fragment>
    ))}
  </Box>
);
}
