'use client';

import { useState, useEffect } from 'react';
import { TextField, InputAdornment, Card, CardHeader, CardContent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useCategoryStore } from '../../../lib/stores/categoryStore';

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
      }}
    >

      <CardHeader 
        title="Ara" 
        titleTypographyProps={{ variant: 'body2', fontWeight: 600 }} 

        sx={{
          background: 'linear-gradient(75deg, orangered 0%, orangered 1%, darkred 100%)',
          color: 'white',
          py: { xs: 0.5, sm: 1 }, // mobilde daha az padding
        }}
      />

      <CardContent sx={{ py: 1.5 }} >
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
