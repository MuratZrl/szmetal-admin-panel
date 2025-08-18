// src/features/systems/components/SystemCard.tsx
'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { Card, Typography, Box, Button } from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import type { SystemCardType } from '@/types/systems';

type SystemsCardProps = Pick<
  SystemCardType,
  'id' | 'imageUrl' | 'title' | 'description' | 'tag' | 'buttonLabels'
> & {
  onRequestClick?: () => void;
};

const FALLBACK_IMAGE = '/images/fallback-system.jpg'; // add a fallback in /public

const SystemsCard = ({
  id,
  imageUrl,
  title,
  description,
  tag,
  buttonLabels,
  onRequestClick,
}: SystemsCardProps) => {
  return (
    <Card
      className="overflow-hidden"
      sx={{
        height: '100%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 2, // smaller numeric radius matches MUI scale
        boxShadow: 3,
      }}
      role="article"
      aria-label={title}
    >
      {/* Image container: next/image with fill needs parent relative + aspect ratio */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          pt: '56.25%', // 16:9 aspect ratio
          overflow: 'hidden',
          '& img': {
            transition: 'transform 0.3s ease',
          },
          '&:hover img': {
            transform: 'scale(1.05)',
          },
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {tag && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 16,
              boxShadow: 1,
              background: 'linear-gradient(135deg, #ef4444, #7f1d1d)',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              fontStyle: 'italic',
              textTransform: 'capitalize',
              zIndex: 1,
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
          style={{ objectFit: 'cover', pointerEvents: 'none' }}
          draggable={false}
          // NOTE: set priority only for hero images - avoid many priority images.
          // remove priority unless this is the only image on the page.
        />
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, px: { xs: 2, sm: 2.5 }, py: { xs: 1.5, sm: 2 } }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 0.5, fontWeight: 700 }}
        >
          {tag ?? ''}
        </Typography>

        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
          {title}
        </Typography>

        <Typography
          component="div"
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: 48,
            maxHeight: 48,
          }}
        >
          {description}
        </Typography>
      </Box>

      {/* Actions */}
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          pb: { xs: 2, sm: 2.5 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          justifyContent: 'flex-end',
          alignItems: { xs: 'stretch', sm: 'center' },
          width: '100%',
        }}
      >
        <Button
          variant="contained"
          endIcon={<FlashOnIcon />}
          size="small"
          onClick={onRequestClick}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #ef4444 0%, #7f1d1d 100%)',
            textTransform: 'capitalize',
          }}
          aria-label={`${buttonLabels.request} ${title}`}
        >
          {buttonLabels.request}
        </Button>
      </Box>
    </Card>
  );
};

export default memo(SystemsCard);
