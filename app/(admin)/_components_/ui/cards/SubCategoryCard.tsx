'use client';

import Link from 'next/link';

import { FC } from 'react';
import { Card, CardMedia, CardContent, Typography, Button, Box } from '@mui/material';

type Props = {
  image: string;
  title: string;
  description: string;
  buttonText: string;
  categorySlug: string;
  slug: string;
};

const SubCategoryCard: FC<Props> = ({ image, title, description, buttonText, categorySlug, slug }) => (
  <Card 
    className="h-full flex flex-col justify-between"
    sx={{ borderRadius: 7 }}
  >

    <Box className="overflow-hidden aspect-[16/9]">

      <CardMedia
        component="img"
        image={image}
        alt={title}
        className="transition-transform duration-300 hover:scale-105"
      />

    </Box>

    <CardContent className="flex flex-col flex-grow justify-between">

      <Typography 
        variant="h6"

        fontWeight={500}
      >
        {title}
      </Typography>

      <Typography 
        variant="body2" 
        
        color="text.secondary"
      >
        {description}
      </Typography>

      <Box className="flex justify-end mt-4">
        <Button
          variant="contained"
          component={Link}
          href={`/categories/${categorySlug}/${slug}`} // 👈 tam URL

          draggable={false}
          sx={{ px: 2.75, backgroundColor: 'orangered', borderRadius: 7, textTransform: 'capitalize' }}
        >
          {buttonText}
        </Button>

      </Box>
    </CardContent>
  
  </Card>
);

export default SubCategoryCard;
