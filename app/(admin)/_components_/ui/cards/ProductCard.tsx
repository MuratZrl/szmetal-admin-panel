'use client';

import { Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

export type ProductCardProps = {
  id: string;
  name: string;
  image_url?: string;
  kg_per_m?: number; // ✅ yeni
  property?: string;
  created_at?: string; // ✅ yeni eklendi
  onEdit?: (id: string) => void;
};

export default function ProductCard({
  id,
  name,
  image_url,
  kg_per_m,
  property,
  created_at,
  onEdit
}: ProductCardProps) {

  // ✅ Tarihi DD/MM formatına çevir
  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
    : null;
  
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 3,
        borderRadius: 5,
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >

      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={image_url || 'https://placehold.co/600x400/png'}
          alt={name}
          sx={{ objectFit: 'cover' }}
        />
        {property && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              bgcolor: 'orangered',
              color: 'white',
              px: 1.5,
              py: 0.3,
              borderRadius: 5,
              fontSize: '0.75rem',
              fontWeight: 600,
              boxShadow: 2,
            }}
          >
            {property}
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1 }} >

        {/* Başlığın üstünde sağ tarafa tarih */}
        {formattedDate && (
          <Box display="flex" justifyContent="space-between" alignItems={'center'} >

            <Typography variant="h6" gutterBottom noWrap>
              {name}
            </Typography>

            <Typography variant="caption" color="text.secondary" fontStyle={'italic'}>
              {formattedDate}
            </Typography>

          </Box>
        )}

        {kg_per_m !== undefined && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {kg_per_m} kg/m
          </Typography>
        )}

        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            size="small"
            endIcon={<EditIcon />}
            onClick={() => onEdit?.(id)}
            sx={{
              px: 2.25,
              background: 'linear-gradient(90deg, orangered, orange)',
              borderRadius: 7,
              textTransform: 'capitalize',
            }}
          >
            Düzenle
          </Button>
        </Box>

      </CardContent>
    </Card>
  );
}
