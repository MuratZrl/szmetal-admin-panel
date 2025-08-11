'use client';

import { useState, useEffect } from 'react';
import { TextField, InputAdornment, Card, CardHeader, CardContent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useCategoryStore } from '../../../../lib/stores/categoryStore';

export default function SearchFilter() {
  const [searchTerm, setSearchTerm] = useState('');
  const setSearchTermStore = useCategoryStore((s) => s.setSearchTerm);

  useEffect(() => {
    setSearchTermStore(searchTerm);
  }, [searchTerm, setSearchTermStore]);

  return (
    <Card 
      sx={{
        borderRadius: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >

      <CardHeader title="Ara" titleTypographyProps={{ variant: 'body2', fontWeight: 600 }} />

      <CardContent sx={{ pt: 0 }} >
        <TextField
          size="small"
          fullWidth
          placeholder="Ürün ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </CardContent>

    </Card>
  );
}
