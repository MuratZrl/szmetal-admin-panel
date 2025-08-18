// src/components/ui/SystemCard.tsx
'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import {
  Card,
  Box,
  Typography,
  Button,
  CardContent,
  CardActions,
} from '@mui/material';
import type { SystemCardType } from '@/types/systems';

type Props = Pick<
  SystemCardType,
  'id' | 'imageUrl' | 'title' | 'description' | 'tag' | 'buttonLabels'
> & {
  onRequestClick?: () => void;
  onDetailsClick?: () => void;
};

const FALLBACK_IMAGE = '/images/fallback-system.jpg';

export default memo(function SystemCard({
  imageUrl,
  title,
  description,
  tag,
  buttonLabels,
  onRequestClick,
  onDetailsClick,
}: Props) {
  return (
    <Card
      className="h-full flex flex-col"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: 3,
        overflow: 'hidden',
      }}
      role="group"
      aria-label={title}
    >
      {/* Image area */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          pt: '56.25%',
          overflow: 'hidden',
          '&:hover img': { transform: 'scale(1.03)' },
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {tag && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 12,
              zIndex: 2,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: 12,
              color: 'white',
              background: 'linear-gradient(135deg,#ef4444,#7f1d1d)',
              pointerEvents: 'none',
            }}
          >
            {tag}
          </Box>
        )}

        <Image
          src={imageUrl ?? FALLBACK_IMAGE}
          alt={title}
          fill
          style={{
            objectFit: 'cover',
            transition: 'transform 0.35s ease',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
      </Box>

      {/* Content (non-clickable) */}
      <CardContent
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.25, sm: 1.75 },
          flex: 1,
        }}
      >
        <Typography
          variant="h6"
          component="h3"
          sx={{ fontWeight: 700, mb: 0.5 }}
          noWrap
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
            minHeight: 40,
          }}
        >
          {description}
        </Typography>
      </CardContent>

      {/* Actions (only these are clickable) */}
      <CardActions
        sx={{
          px: { xs: 2, sm: 2.5 },
          pb: { xs: 2, sm: 2.5 },
          display: 'flex',
          gap: 1.25,
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 1,
        }}
      >
        {buttonLabels?.primary && (
          <Button
            size="small"
            variant="text"
            onClick={onDetailsClick}
            sx={{ textTransform: 'capitalize' }}
            aria-label={`${buttonLabels.primary} ${title}`}
          >
            {buttonLabels.primary}
          </Button>
        )}

        <Button
          variant="contained"
          endIcon={<FlashOnIcon />}
          onClick={onRequestClick}
          size="small"
          sx={{
            px: 2.8,
            py: 0.9,
            borderRadius: 2,
            background: 'linear-gradient(90deg,#ef4444 0%, #7f1d1d 100%)',
            textTransform: 'capitalize',
            boxShadow: 'none',
            '&:hover': { boxShadow: 4 },
          }}
          aria-label={`${buttonLabels?.request ?? 'Request'} ${title}`}
        >
          {buttonLabels?.request ?? 'Request'}
        </Button>
      </CardActions>
    </Card>
  );
});
