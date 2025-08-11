import React from 'react';
import { useState, useEffect } from 'react';
import { useCategoryStore } from '../../lib/stores/categoryStore';
import { supabase } from '../../lib/supabase/supabaseClient';
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
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
      return updated;
    });
  };

  // Local state değişince store’a yaz
  useEffect(() => {
    setSelectedSubCategoryIdsStore(selectedSubCategoryIdsState);
  }, [selectedSubCategoryIdsState, setSelectedSubCategoryIdsStore]);

  return (
    <Grid size={{ xs: 12 }}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          borderColor: 'divider',
        }}
      >
        <CardHeader
          title="Filtrele"
          fontWeight={600}
          sx={{
            background: 'linear-gradient(75deg, orangered 0%, orangered 1%, darkred 100%)',
            color: 'white',
            py: { xs: 0.5, sm: 1 }, // mobilde daha az padding
          }}
        />

        <CardContent sx={{ py: 0, px: 0 }}>
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
                  expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}
                  sx={{
                    minHeight: { xs: 48, sm: 52 },
                    '& .MuiAccordionSummary-content': { margin: 0, padding: 0 },
                    '&.Mui-expanded': { minHeight: { xs: 42, sm: 46 }, px: 1.75 },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.85rem', sm: '0.9rem' },
                    }}
                  >
                    {cat.name}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 0.75 }}>
                  <List disablePadding dense>
                    {cat.sub_categories.map((sub) => (
                      <ListItem
                        key={sub.id}
                        disablePadding
                        sx={{
                          pl: 1,
                          gap: 0.5,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={selectedSubCategoryIdsState.includes(sub.id)}
                          onChange={() => handleToggle(sub.id)}
                          sx={{
                            py: 1,
                            '&.Mui-checked': { color: 'orangered' },
                          }}
                        />
                        <ListItemText
                          primary={sub.name}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>

              {index < categories.length - 1 && (
                <Divider sx={{ borderColor: 'divider' }} />
              )}
            </React.Fragment>
          ))}
        </CardContent>
      </Card>
    </Grid>

  );
}
