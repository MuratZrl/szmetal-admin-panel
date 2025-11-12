// src/features/products/components/form/NumberField.tsx
'use client';

import { TextField, InputAdornment, type TextFieldProps } from '@mui/material';
import {
  Controller,
  useFormContext,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

type BaseProps = {
  /** Ekranda görünen label */
  label: string;
  /** Birim/sonek metni: ör. "gr/m", "mm²" */
  endAdornmentText?: string;
  /** Boş inputu null'a çevirme mantığı her zaman aktif. */
  integer?: boolean;             // true: tam sayıya yuvarlar
  min?: number;
  max?: number;
  step?: number;                 // default 1 (integer=true iken), yoksa "any"
} & Omit<TextFieldProps, 'name' | 'label' | 'type' | 'onChange' | 'value'>;

/**
 * RHF ile kullanılacak tip güvenli NumberField
 */
export type RHFNumberFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = BaseProps & {
  name: TName;
  control?: Control<TFieldValues>;   // verilmezse useFormContext kullanır
};

/**
 * RHF kullanmadan bağımsız kullanım için
 */
export type StandaloneNumberFieldProps = BaseProps & {
  value: number | null;
  onValueChange: (next: number | null) => void;
};

function parseNumber(raw: string, integer: boolean): number | null {
  const s = raw.replace(',', '.').trim();
  if (s === '') return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return integer ? Math.round(n) : n;
}

/* ---------------- Standalone ---------------- */
export function NumberFieldStandalone({
  value,
  onValueChange,
  label,
  endAdornmentText,
  integer = false,
  min,
  max,
  step,
  ...rest
}: StandaloneNumberFieldProps) {
  return (
    <TextField
      {...rest}
      label={label}
      type="number"
      inputMode="numeric"
      value={value ?? ''}
      onChange={(e) => {
        const next = parseNumber(e.target.value, integer);
        onValueChange(next);
      }}
      onBlur={(e) => {
        // blur’da normalize et
        const next = parseNumber(e.target.value, integer);
        onValueChange(next);
      }}
      InputProps={{
        endAdornment: endAdornmentText ? (
          <InputAdornment position="end" sx={{ opacity: 0.7 }}>
            {endAdornmentText}
          </InputAdornment>
        ) : undefined,
        inputProps: {
          min,
          max,
          step: step ?? (integer ? 1 : undefined),
        },
      }}
      helperText={rest.helperText}
    />
  );
}

/* ---------------- RHF entegrasyonlu ---------------- */
export default function NumberField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  name,
  control,
  label,
  endAdornmentText,
  integer = false,
  min,
  max,
  step,
  ...rest
}: RHFNumberFieldProps<TFieldValues, TName>) {
  const ctx = useFormContext<TFieldValues>();
  const usedControl = control ?? ctx?.control;
  if (!usedControl) {
    // RHF yoksa bile developer hatası yerine çalışır bir fallback verelim
    return (
      <NumberFieldStandalone
        label={label}
        endAdornmentText={endAdornmentText}
        integer={integer}
        min={min}
        max={max}
        step={step}
        value={null}
        onValueChange={() => { /* no-op */ }}
        {...rest}
      />
    );
  }

  return (
    <Controller
      control={usedControl}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...rest}
          label={label}
          type="number"
          inputMode="numeric"
          value={field.value ?? ''}
          onChange={(e) => {
            const next = parseNumber(e.target.value, integer);
            field.onChange(next);
          }}
          onBlur={(e) => {
            const next = parseNumber(e.target.value, integer);
            field.onChange(next);
            field.onBlur();
          }}
          error={!!fieldState.error}
          helperText={fieldState.error?.message ?? rest.helperText}
          InputProps={{
            endAdornment: endAdornmentText ? (
              <InputAdornment position="end" sx={{ opacity: 0.7 }}>
                {endAdornmentText}
              </InputAdornment>
            ) : undefined,
            inputProps: {
              min,
              max,
              step: step ?? (integer ? 1 : undefined),
            },
          }}
        />
      )}
    />
  );
}
