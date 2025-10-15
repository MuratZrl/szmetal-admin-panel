// src/features/products/forms/NotesField.tsx
'use client';

import * as React from 'react';

import { useFormContext } from 'react-hook-form';

import { Paper, Box, TextField } from '@mui/material';

type Props = { disabled?: boolean };

export default function NotesField({ disabled = false }: Props) {
  const { register, formState: { errors } } = useFormContext<{ description: string }>();

  return (
    <Paper
      sx={{
        borderRadius: 2,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <TextField
          label="Ek Notlar"
          multiline
          fullWidth
          {...register('description')}
          error={!!errors.description}
          helperText={
            typeof errors.description?.message === 'string'
              ? errors.description.message
              : undefined
          }
          sx={{
            flex: 1,
            display: 'flex',
            '& .MuiInputBase-root': {
              flex: 1,
              alignItems: 'stretch',
            },
            '& .MuiInputBase-inputMultiline': {
              height: '100%',
              boxSizing: 'border-box',
              resize: 'none',
            },
          }}
          disabled={disabled}
        />
      </Box>
    </Paper>
  );
}
