'use client';

import { Box, Typography, FormControl, Select, MenuItem, Button } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/Add';

type TopBarProps = {
  totalProducts: number;
  sortOrder: 'newest' | 'oldest';
  onSortChange: (value: 'newest' | 'oldest') => void;
  onAdd?: () => void; 
};

export default function TopBar({ totalProducts, sortOrder, onSortChange, onAdd }: TopBarProps) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={1} >
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Toplam ürün: {totalProducts}
      </Typography>

      <Box display="flex" alignItems="center" gap={2} >
        <FormControl size="small" sx={{ minWidth: 140 }} >
          <Select 
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest')}
            startAdornment={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <SortIcon fontSize="small" color="action" />
              </Box>
            }
            sx={{
              borderRadius: 3,
              '& .MuiSelect-select': {
                py: 1,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#a0a0a0ff', // normal durum
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'orangered', // focus olduğunda
                borderWidth: 2,
              },
            }}
          >
            <MenuItem value="newest">Yeniden eskiye</MenuItem>
            <MenuItem value="oldest">Eskiden yeniye</MenuItem>
          </Select>
        </FormControl>

        <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ backgroundColor: 'orangered', borderRadius: 5, textTransform: 'none' }}
            onClick={onAdd}
          >
            Ürün Ekle
        </Button>
      </Box>
    </Box>
  );
}
