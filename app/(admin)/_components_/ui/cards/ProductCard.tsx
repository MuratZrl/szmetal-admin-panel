'use client';

import { Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';

export type ProductCardProps = {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
  property?: string;
  onEdit?: (id: string) => void;
};

export default function ProductCard({
  id,
  name,
  image_url,
  description,
  property,
  onEdit
}: ProductCardProps) {
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

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom noWrap>
          {name}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
        )}
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            size="small"
            onClick={() => onEdit?.(id)}
            sx={{
              px: 2.25,
              backgroundColor: 'orangered',
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
