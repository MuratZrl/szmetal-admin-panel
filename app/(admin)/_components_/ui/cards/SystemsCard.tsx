'use client';

import Image from 'next/image';

import { Card, Typography, Box, Button } from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';




type SystemsCardProps = {
  imageUrl: string;
  title: string;
  description: string;
  tag?: string;
  buttonLabels: {
    details: string;
    request: string;
  };
  onRequestClick: () => void; // 👈 yeni prop
};


const SystemsCard = ({ imageUrl, title, description, tag, buttonLabels, onRequestClick }: SystemsCardProps) => {
  return (

    <Card
      className="overflow-hidden"
      sx={{
        height: '100%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 10,
        boxShadow: 3,
      }}
    >

      {/* Image */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          pt: '56.25%',
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
              background: 'linear-gradient(135deg, red, darkorange)',
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
          src={imageUrl}
          alt={title}
          fill
          style={{ objectFit: 'cover', pointerEvents: 'none' }}
          draggable={false}
          priority
        />
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, px: 2.5, py: 2 }}>

        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>

        <Typography
          component={'div'}
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

      {/* Buttons */}
      <Box
        sx={{
          px: 2.5,
          pb: 2,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button
          disableRipple
          variant="text"
          color="primary"
          size="small"
          sx={{
            py: 1,
            borderRadius: 10,
            color: 'darkred',
            textTransform: 'capitalize',
          }}
        >
          {buttonLabels.details}
        </Button>

        <Button
          variant="contained"
          color="primary"
          size="small"
          endIcon={<FlashOnIcon />}
          onClick={onRequestClick}
          sx={{
            px: 2,
            py: 1,
            borderRadius: 10,
            background: 'linear-gradient(90deg, red 0%, red 75%, orangered 100%)',
            textTransform: 'capitalize',
          }}
        >
          {buttonLabels.request}
        </Button>
      </Box>
    </Card>
  );
};

export default SystemsCard;
