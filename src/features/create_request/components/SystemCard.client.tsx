'use client';
// src/features/systems/components/SystemCard.client.tsx

import * as React from 'react';
import {
  Card,
  Box,
  CardMedia,
  CardContent,
  CardActions,
  CardActionArea,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';

import type { SystemCardType } from '@/features/create_request/types/card';

type Status = 'new' | 'updated' | 'beta' | 'deprecated';

export type SystemCardProps = SystemCardType & {
  onRequestClick: () => void;

  /** Kart üstünde badge gibi göstermek için */
  status?: Status;

  /** Küçük etiket çipleri */
  tags?: readonly string[];

  /** Kart linki tıklanınca Next.js ile yönlendir (detay butonu dışında) */
  href?: string;

  /** Favori ikonu ve kontrolü */
  favorite?: boolean;
  onFavoriteToggle?: (next: boolean) => void;

  /** İskelet görünüm (veri beklerken) */
  loading?: boolean;
};

function statusColor(
  status: Status | undefined
): 'default' | 'primary' | 'secondary' | 'warning' | 'error' | 'info' | 'success' {
  switch (status) {
    case 'new':
      return 'success';
    case 'updated':
      return 'info';
    case 'beta':
      return 'warning';
    case 'deprecated':
      return 'error';
    default:
      return 'default';
  }
}

export default function SystemCard({
  title,
  description,
  imageUrl,
  buttonLabels,
  onRequestClick,
  status,
  tags = [],
  favorite = false,
  onFavoriteToggle,
  loading = false,
}: SystemCardProps) {
  const canFavorite = typeof onFavoriteToggle === 'function';

  // Görsel üstünde sol üste tek bir "öne çıkan" tag göster.
  const prominentTag = tags.length > 0 ? tags[0] : null;
  const restTags = tags.length > 1 ? tags.slice(1) : [];

  return (
    <Card
      variant="outlined"
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
      }}
    >
      {/* Üst görsel alanı */}
      {loading ? (
        <Skeleton variant="rectangular" sx={{ width: '100%', height: { xs: 180, sm: 220, md: 240 } }} />
      ) : imageUrl ? (
        <CardActionArea onClick={onRequestClick} aria-label={`${title} için talep oluştur`}>
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ aspectRatio: { xs: '16 / 9', sm: '16 / 9' }, width: '100%' }}>
              <CardMedia
                component="img"
                src={imageUrl}
                alt={title}
                draggable={false}
                loading="lazy"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Box>

            {/* Sol üstte tag (varsa) */}
            {prominentTag && (
              <Chip
                size="small"
                label={prominentTag}
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  fontWeight: 700,
                  bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.85)'),
                  borderColor: 'divider',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  backdropFilter: 'blur(2px)',
                }}
              />
            )}

            {/* Sağ üstte favori */}
            {canFavorite && (
              <Tooltip title={favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}>
                <IconButton
                  aria-label="toggle favorite"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavoriteToggle?.(!favorite);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.6)'),
                    '&:hover': { bgcolor: (t) => t.palette.action.hover },
                  }}
                >
                  {favorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </CardActionArea>
      ) : null}

      {/* İçerik (başlık artık görselin içinde değil) */}
      <CardContent sx={{ flexGrow: 1 }}>
        {loading ? (
          <>
            <Skeleton width="60%" />
            <Skeleton width="90%" />
            <Skeleton width="75%" />
          </>
        ) : (
          <>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5, minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700} noWrap title={title} sx={{ flex: 1, minWidth: 0 }}>
                {title}
              </Typography>
              {status && (
                <Chip size="small" color={statusColor(status)} label={status.toUpperCase()} variant="filled" />
              )}
            </Stack>

            {description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {description}
              </Typography>
            )}

            {restTags.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mt: 1.25, flexWrap: 'wrap', rowGap: 0.5 }}>
                {restTags.map((tag) => (
                  <Chip key={tag} size="small" label={tag} variant="outlined" />
                ))}
              </Stack>
            )}
          </>
        )}
      </CardContent>

      {/* Aksiyonlar */}
      <CardActions sx={{ mt: 'auto', px: 2, pb: 2, pt: 0 }}>
        {loading ? (
          <Skeleton variant="rounded" width="100%" height={36} />
        ) : (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="flex-end"
            sx={{ width: '100%', alignItems: { xs: 'stretch', sm: 'center' } }}
          >
            <Button onClick={onRequestClick} variant="contained" endIcon={<AddShoppingCartOutlinedIcon />}>
              {buttonLabels.request}
            </Button>
          </Stack>
        )}
      </CardActions>
    </Card>
  );
}
