'use client';

import { useState, useEffect } from 'react';
import { useCategoryStore } from '../../lib/stores/categoryStore';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Checkbox,
} from '@mui/material';

const PROPERTY_OPTIONS = ['Kasa', 'Kanat', 'Yan Dikme', 'Ara Çıta'];

export default function PropertyFilter() {
  const setSelectedProperties = useCategoryStore((s) => s.setSelectedProperties);
  const [selected, setSelected] = useState<string[]>([]);

  const handleToggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  useEffect(() => {
    setSelectedProperties(selected);
  }, [selected, setSelectedProperties]);

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        my: 1,
      }}
    >
      <CardHeader title="Özellik" titleTypographyProps={{ variant: 'body2', fontWeight: 600 }} 
        sx={{
          background: 'linear-gradient(75deg, orangered 0%, orangered 1%, darkred 100%)',
          color: 'white',
          py: { xs: 0.5, sm: 1 }, // mobilde daha az padding
        }}
      />
      <CardContent sx={{ pt: 0 }} >
        <List dense disablePadding>
          {PROPERTY_OPTIONS.map((prop) => (
            <ListItem
              key={prop}
              disablePadding
              sx={{ pl: 1 }}
              onClick={() => handleToggle(prop)}
            >
             <Checkbox
                size="small"
                checked={selected.includes(prop)}
                tabIndex={-1}
                sx={{
                  p: 0.5,
                  color: 'grey.500',
                  '&.Mui-checked': {
                    color: 'orangered',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 69, 0, 0.08)', // orangered hover efekti
                  },
                }}
              />
              <ListItemText primary={prop} primaryTypographyProps={{ variant: 'body2' }} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
