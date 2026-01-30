'use client';
// src/features/products/comments/components/CommentForm.client.tsx

import * as React from 'react';
import { Box, Button, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

const DEFAULT_MAX_LEN = 2000;

const schema = (maxLen: number) =>
  yup
    .object({
      content: yup
        .string()
        .trim()
        .required('Boş yorum atılmaz.')
        .max(maxLen, `En fazla ${maxLen} karakter.`),
    })
    .required();

type FormValues = { content: string };

type Props = {
  disabled: boolean;
  currentUserId: string | null;
  onSubmitContent: (content: string) => Promise<void> | void;
  maxLen?: number;

  /** SSR/CSR hydration mismatch yaşamamak için sabit id üretmekte kullanılır */
  productId: string;
};

function safeIdSuffix(input: unknown): string {
  const s = typeof input === 'string' ? input : '';
  // boşsa bile stabil bir suffix dön, patlama yok
  return (s || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
}

export default function CommentForm({
  disabled,
  currentUserId,
  onSubmitContent,
  maxLen = DEFAULT_MAX_LEN,
  productId,
}: Props): React.JSX.Element {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema(maxLen)),
    defaultValues: { content: '' },
    mode: 'onChange',
  });

  // ✅ Stabil, deterministik id.
  // productId gelmezse bile çökmez, sadece "unknown" kullanır.
  const pid = safeIdSuffix(productId);
  const formId = `comment-form-${pid}`;
  const inputId = `comment-content-${pid}`;

  const contentVal = useWatch({ control, name: 'content' }) ?? '';
  const trimmed = contentVal.trim();
  const len = contentVal.length;

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const content = values.content.trim();
    if (content.length === 0) return;
    await onSubmitContent(content);
    reset({ content: '' });
  };

  const inputDisabled = disabled || isSubmitting || currentUserId === null;

  const canSubmit =
    !disabled &&
    !isSubmitting &&
    currentUserId !== null &&
    trimmed.length > 0 &&
    trimmed.length <= maxLen &&
    !errors.content;

  const tooltipTitle =
    currentUserId === null
      ? 'Giriş yapmalısınız'
      : trimmed.length === 0
        ? 'Önce yorum yazınız'
        : 'Gönder';

  return (
    <>
      <Box
        component="form"
        id={formId}
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        aria-disabled={inputDisabled ? 'true' : undefined}
        sx={{
          p: 1.75,
          borderRadius: 0.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: (t) =>
            t.palette.mode === 'dark' ? t.palette.background.default : t.palette.background.paper,
        }}
      >
        <Stack spacing={1}>
          <TextField
            id={inputId}
            variant="standard"
            fullWidth
            multiline
            minRows={2}
            maxRows={8}
            placeholder={currentUserId === null ? 'Yorum yazmak için giriş yapın' : 'Yorum yazın...'}
            disabled={inputDisabled}
            {...register('content')}
            sx={{ '& .MuiInputBase-root': { alignItems: 'flex-start' } }}
            inputProps={{ maxLength: maxLen }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (canSubmit) void handleSubmit(onSubmit)();
              }
            }}
          />

          <Typography
            variant="caption"
            sx={{ color: len > maxLen ? 'error.main' : 'text.secondary', textAlign: 'right' }}
          >
            {len}/{maxLen}
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Tooltip placement="left" title={tooltipTitle}>
          <span>
            <Button
              type="submit"
              form={formId}
              variant="contained"
              endIcon={<SendRoundedIcon />}
              disabled={!canSubmit}
              sx={{ fontWeight: 600, borderRadius: 1, minWidth: 120 }}
            >
              Gönder
            </Button>
          </span>
        </Tooltip>
      </Box>
    </>
  );
}
