// src/features/systems/components/SystemCard.client.tsx
'use client';

import * as React from 'react';
import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Button, Stack
} from '@mui/material';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';

import type { SystemCardType } from '@/features/create_request/types/card';

export type SystemCardProps = SystemCardType & {
  onRequestClick: () => void;
};

export default function SystemCard({
  title,
  description,
  imageUrl,
  buttonLabels,
  links,
  onRequestClick,
}: SystemCardProps) {
  // Label fallback: primary > secondary > 'Detaylar'
  const detailsLabel =
    buttonLabels.primary ??
    buttonLabels.secondary ??
    'Detaylar';

  // Link fallback: details > detailsPage > view > infoPage
  const detailsHref =
    links.details ??
    links['detailsPage'] ??
    links['view'] ??
    links['infoPage'];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {imageUrl && (
        <CardMedia component="img" src={imageUrl ?? ''} alt={title} sx={{ aspectRatio: '16/9' }} />
      )}

      <CardContent>
        <Typography variant="h6">{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ mt: 'auto' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
          
          {/* detailsHref varsa ikinci butonu göster */}
          {detailsHref && (
            <Button href={detailsHref} fullWidth variant="outlined">
              {detailsLabel}
            </Button>
          )}

          <Button 
            fullWidth 
            onClick={onRequestClick} 
            variant="contained"
            endIcon={<AddShoppingCartOutlinedIcon/> }
          >
            {buttonLabels.request}
          </Button>

        </Stack>
      </CardActions>
    </Card>
  );
}
