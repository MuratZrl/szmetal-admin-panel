// app/(auth)/layout/AuthCard.tsx
'use client';

import { Card, CardProps } from '@mui/material';
import React from 'react';

const AuthCard = ({ children, ...props }: CardProps) => {
  return (
    <Card
      sx={{
        width: '100%',
        p: 3,
        borderRadius: 1,
        boxShadow: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        ...props.sx, // dışarıdan stil override için
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

export default AuthCard;
