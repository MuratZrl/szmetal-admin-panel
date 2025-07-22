'use client';

import Link from 'next/link';

import React from 'react';

import { Card, CardMedia, Typography, Box, ButtonBase } from '@mui/material';

type ProductCardProps = {
  imageSrc: string;
  title?: string;
  slug: string,
  onClick?: () => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ imageSrc, title, slug, onClick }) => {
  return (
    <Link href={`/products/${slug}`} style={{ textDecoration: 'none' }}>
      <ButtonBase
        onClick={onClick}
        sx={{
          display: 'block',
          width: '100%',
          height: '100%',
          textAlign: 'inherit', // typography hizası bozulmasın
          borderRadius: 10, // aynı radius olsun
          color: 'white',
        }}
      >
        <Card
          sx={{
            position: 'relative',
            width: '100%',
            height: 0,
            pt: '90%', // 16:9 oran
            overflow: 'hidden',
            borderRadius: 10,
            boxShadow: 5,
            transition: 'box-shadow 0.3s',
            '&:hover': {
              boxShadow: 10,
              '& .overlay': {
                opacity: 1,
              },
              '& .media': {
                transform: 'scale(1.03)',
              },
            },
          }}
        >
          <CardMedia
            component="img"
            image={imageSrc}
            alt={title ?? 'Product Image'}
            className="media"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
            }}
          />

          {title && (
            <Box
              className="overlay"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                bgcolor: 'rgba(0, 0, 0, 0.4)',
                color: '#fff',

                opacity: 0,
                transition: 'opacity 0.15s ease-in-out',
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            </Box>
          )}
        </Card>
      </ButtonBase>
    </Link>
  );
};

export default ProductCard;
