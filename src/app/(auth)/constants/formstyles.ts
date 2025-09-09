// src/_constants_/glassTextFieldProps.ts
import { TextFieldProps } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const glassTextFieldProps: Partial<TextFieldProps> = {
  variant: 'outlined',
  fullWidth: true,
  InputLabelProps: {
    shrink: true,
    sx: (theme) => ({
      fontWeight: 600,
      color: theme.palette.text.secondary,
      '&.Mui-focused': { color: theme.palette.primary.light },
      '&.Mui-error': { color: theme.palette.error.main },
    }),
  },
  FormHelperTextProps: {
    sx: (theme) => ({
      marginLeft: 0,
      color: theme.palette.text.secondary,
      '&.Mui-error': { color: theme.palette.error.light },
    }),
  },
  InputProps: {
    sx: (theme) => {
      const isDark = theme.palette.mode === 'dark';
      const baseBg = isDark ? alpha('#ffffff', 0.06) : alpha('#000000', 0.06);
      const hoverBg = isDark ? alpha('#ffffff', 0.09) : alpha('#000000', 0.09);
      const focusBg = isDark ? alpha('#ffffff', 0.12) : alpha('#000000', 0.12);
      const outline = isDark ? alpha('#ffffff', 0.24) : alpha('#000000', 0.24);

      return {
        // cam efekti
        backgroundColor: baseBg,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        color: isDark ? theme.palette.common.white : theme.palette.text.primary,
        borderRadius: 12,
        transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow']),

        // kenarlıklar
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: outline,
          borderWidth: 1,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.light,
          borderWidth: 2,
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.error.main,
        },

        // placeholder
        '& input::placeholder': {
          color: isDark ? alpha('#ffffff', 0.6) : alpha('#000000', 0.6),
          opacity: 1,
        },

        // ikonlar
        '& .MuiInputAdornment-root .MuiIconButton-root': {
          color: isDark ? alpha('#ffffff', 0.9) : alpha('#000000', 0.7),
        },

        // hover/focus zemin tonlaması
        '&:hover': { backgroundColor: hoverBg },
        '&.Mui-focused': { backgroundColor: focusBg },

        // disabled
        '&.Mui-disabled': {
          backgroundColor: isDark ? alpha('#ffffff', 0.04) : alpha('#000000', 0.04),
          color: theme.palette.text.disabled,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.text.primary, 0.24),
          },
        },

        // Chrome autofill
        '& input:-webkit-autofill': {
          WebkitTextFillColor: isDark ? theme.palette.common.white : theme.palette.text.primary,
          WebkitBoxShadow: `0 0 0 1000px ${focusBg} inset`,
          caretColor: isDark ? theme.palette.common.white : theme.palette.text.primary,
          transition: 'background-color 9999s ease-out 0s',
        },

        // rahat okuma için hafif dikey padding (tema override’ın yoksa)
        '& .MuiOutlinedInput-input': { paddingTop: 1.5, paddingBottom: 1.5 },
      };
    },
  },
};
