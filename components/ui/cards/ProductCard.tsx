'use client';

import { Card, CardContent, CardMedia, Typography, Button, Box, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from 'next/navigation'; // ✅

export type ProductCardProps = {
  id: string;
  name: string;
  image_url?: string;
  kg_per_m?: number;
  property?: string;
  created_at?: string;
  is_active?: boolean;
  onEdit?: (id: string) => void; // ✅ burayı ekledik
};

export default function ProductCard({
  id,
  name,
  image_url,
  kg_per_m,
  property,
  created_at,
  is_active,
  onEdit,
}: ProductCardProps) {
  const router = useRouter();

  const isActiveBool = typeof is_active === 'boolean'
    ? is_active
    : String(is_active).toLowerCase() === 'true';

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
    : null;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3, borderRadius: 5 }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={image_url || 'https://placehold.co/600x400/png'}
          alt={name}
          sx={{ objectFit: 'cover' }}
        />
        {property && (
          <Box sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'orangered', color: 'white', px: 1.5, py: 0.3, borderRadius: 5 }}>
            {property}
          </Box>
        )}
        <Tooltip title={isActiveBool ? 'Active' : 'Not Active'} arrow>
          <Box sx={{ position: 'absolute', bottom: 10, right: 10, width: 7, height: 7, borderRadius: '50%', bgcolor: isActiveBool ? 'green' : 'red' }} />
        </Tooltip>
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        {formattedDate && (
          <Box display="flex" justifyContent="space-between" alignItems={'center'}>
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
            onClick={() => {
              if (onEdit) {
                onEdit(id); // ✅ parent fonksiyonunu çağır
              } else {
                router.push(`/products/${id}`); // ✅ parent yoksa kendi yönlendir
              }
            }}
            sx={{
              px: 2.25,
              background: 'linear-gradient(75deg, orangered 0%, orangered 55%, darkred 100%)',
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
