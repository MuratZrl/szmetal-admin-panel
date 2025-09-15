// src/features/systems/components/SystemCard.client.tsx
'use client';

import * as React from 'react';
import {
  Card, Box, CardMedia, CardContent, CardActions, CardActionArea,
  Typography, Button, Stack, Chip, IconButton, Tooltip, Skeleton
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

function statusColor(status: Status | undefined): 'default' | 'primary' | 'secondary' | 'warning' | 'error' | 'info' | 'success' {
  switch (status) {
    case 'new': return 'success';
    case 'updated': return 'info';
    case 'beta': return 'warning';
    case 'deprecated': return 'error';
    default: return 'default';
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

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'calc(var(--rs-radius) * 2)',
        bgcolor: 'var(--rs-surface-2)',
        border: theme => `1px solid ${theme.palette.surface.outline}`,
        overflow: 'hidden',
        transition: theme => theme.transitions.create(['transform', 'box-shadow']),
      }}
      variant="outlined"
      elevation={0}
    >
      {/* Üst görsel alanı: kart genel linki */}
      {loading ? (
        <Skeleton
          variant="rectangular"
          sx={{ width: '100%', height: { xs: 180, sm: 220, md: 240 } }}
        />
      ) : imageUrl ? (
        <CardActionArea
          onClick={onRequestClick}
          aria-label={`${title} için talep oluştur`}
        >
          <Box
            sx={{ position: 'relative', aspectRatio: { xs: '16 / 9', sm: '16 / 9' }, overflow: 'hidden' }}
          >
            <CardMedia
              component="img"
              src={imageUrl}
              alt={title}
              draggable={false}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transformOrigin: 'center',
                transition: 'transform .4s ease',
                '&:hover': { transform: 'scale(1.03)' },
              }}
              loading="lazy"
            />

            {/* Üst sol: status chip */}
            {status && (
              <Chip
                size="small"
                color={statusColor(status)}
                label={status.toUpperCase()}
                sx={{ position: 'absolute', top: 10, left: 10, fontWeight: 700 }}
              />
            )}

            {/* Üst sağ: favori - tıklamada bubbling'i durdur */}
            {canFavorite && (
              <Tooltip title={favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}>
                <IconButton
                  aria-label="toggle favorite"
                  onClick={(e) => {
                    e.stopPropagation(); // ← Step2’ye zıplamasın
                    onFavoriteToggle?.(!favorite);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(0,0,0,.35)'
                        : 'rgba(255,255,255,.6)',
                    '&:hover': { bgcolor: (theme) => theme.palette.action.hover },
                  }}
                >
                  {favorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
            )}

            {/* Alt gradient + başlık */}
            <Box
              sx={{
                position: 'absolute',
                insetInline: 0,
                bottom: 0,
                p: 2,
                background: (theme) =>
                  `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${
                    theme.palette.mode === 'dark' ? 'rgba(0,0,0,.65)' : 'rgba(0,0,0,.35)'
                  } 100%)`,
                color: '#fff',
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} noWrap title={title}>
                {title}
              </Typography>
            </Box>
          </Box>
        </CardActionArea>
      ) : null}

      {/* İçerik */}
      <CardContent sx={{ flexGrow: 1 }}>
        {loading ? (
          <>
            <Skeleton width="60%" />
            <Skeleton width="90%" />
            <Skeleton width="75%" />
          </>
        ) : (
          <>
            {/* Başlık (görselde overlay var diye burada daha küçük) */}
            {!imageUrl && (
              <Typography variant="h6" fontWeight={700} gutterBottom noWrap title={title}>
                {title}
              </Typography>
            )}
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
            {tags.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mt: 1.25, flexWrap: 'wrap', rowGap: 0.5 }}>
                {tags.map(tag => (
                  <Chip
                    key={tag}
                    size="small"
                    label={tag}
                    sx={{
                      bgcolor: 'var(--rs-surface-3)',
                      borderColor: theme => theme.palette.surface.outline,
                      borderWidth: 1,
                      borderStyle: 'solid',
                    }}
                  />
                ))}
              </Stack>
            )}
          </>
        )}
      </CardContent>

      {/* Aksiyonlar */}
      <CardActions sx={{ mt: 'auto', px: 2, pb: 2, pt: 0 }} >
        {loading ? (
          <Skeleton variant="rounded" width="100%" height={36} />
        ) : (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            display={'flex'}
            justifyContent={'flex-end'}
            alignItems={'center'}
            sx={{ width: '100%', alignItems: { xs: 'stretch', sm: 'center' } }}
          >
            {/* Talep Oluştur */}
            <Button
              onClick={onRequestClick}
              variant="contained"
              endIcon={<AddShoppingCartOutlinedIcon />}
            >
              {buttonLabels.request}
            </Button>
          </Stack>
        )}
      </CardActions>
    </Card>
  );
}
