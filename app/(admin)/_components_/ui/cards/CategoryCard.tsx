'use client';

import React from 'react';
import Image from 'next/image';

import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

export type CategoryCardProps = {
  title: string;
  description: string;
  imageUrl?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
};

const MotionCard = motion(Card);

const CategoryCard: React.FC<CategoryCardProps> = ({ title, imageUrl, icon, onClick }) => {
  return (
    <MotionCard
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 250, damping: 15 }}
      elevation={0}
      sx={{
        borderRadius: 7,
        minHeight: 180,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
        color: '#fff',
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: '100%', p: 2 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100%"
          textAlign="center"
        >
          
          {/* İkon veya görsel */}
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              width={64}
              height={64}
              className="mb-3 object-contain"
            />
          ) : (
            icon && <Box className="mb-3" sx={{ fontSize: 48, color: '#fff' }}>{icon}</Box>
          )}

          {/* Başlık */}
          <CardContent sx={{ p: 0 }}>
            <Typography variant="h6" fontWeight={600} sx={{ color: 'gray' }}>
              {title}
            </Typography>
          </CardContent>

        </Box>
      </CardActionArea>
    </MotionCard>
  );
};

export default CategoryCard;
