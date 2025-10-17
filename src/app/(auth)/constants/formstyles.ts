// app/(auth)/constants/formstyles.ts
import { TextFieldProps } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Daha görünür ve net form alanları:
 * - Etiket ve yardım metni kontrastı yükseltildi
 * - Focus durumunda belirgin halka (box-shadow) ve kalın outline
 * - Hata durumunda arka plan hafif kırmızı ton + kalın çerçeve
 * - Placeholder daha okunaklı
 */
export const glassTextFieldProps: Partial<TextFieldProps> = {
  variant: 'outlined',
  fullWidth: true,

  InputLabelProps: {
    shrink: true,
    sx: (theme) => ({
      fontWeight: 700,
      letterSpacing: 0.15,
      fontSize: { xs: '0.95rem', sm: '1rem' },
      color: theme.palette.text.primary,
      '&.Mui-focused': { color: theme.palette.primary.main },
      '&.Mui-error': { color: theme.palette.error.main },
      '& .MuiFormLabel-asterisk': { color: theme.palette.error.main, ml: 0.25 },
    }),
  },

  FormHelperTextProps: {
    sx: (theme) => ({
      marginLeft: 0,
      marginTop: 0.75,
      fontSize: '0.85rem',
      lineHeight: 1.5,
      color: theme.palette.text.secondary,
      '&.Mui-error': { color: theme.palette.error.main, fontWeight: 600 },
    }),
  },

  InputProps: {
    sx: (theme) => {
      const isDark = theme.palette.mode === 'dark';
      const baseBg = isDark ? alpha('#ffffff', 0.12) : alpha('#000000', 0.08);
      const hoverBg = isDark ? alpha('#ffffff', 0.16) : alpha('#000000', 0.12);
      const focusBg = isDark ? alpha('#ffffff', 0.20) : alpha('#000000', 0.16);
      const outline = isDark ? alpha('#ffffff', 0.35) : alpha('#000000', 0.40);

      return {
        borderRadius: 12,
        backgroundColor: baseBg,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: theme.palette.text.primary,
        fontSize: { xs: '0.95rem', sm: '1rem' },
        lineHeight: 1.6,
        letterSpacing: 0.2,
        transition: theme.transitions.create(
          ['background-color', 'border-color', 'box-shadow'],
          { duration: 160 }
        ),

        // Outline
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: outline,
          borderWidth: 1.5,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
          borderWidth: 1.8,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.light,
          borderWidth: 2.2,
        },

        // Zemin tonlaması
        '&:hover': { backgroundColor: hoverBg },
        '&.Mui-focused': {
          backgroundColor: focusBg,
          boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.28)}`,
        },

        // Hata durumu
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.error.main,
          borderWidth: 2,
        },
        '&.Mui-error': {
          backgroundColor: alpha(theme.palette.error.main, isDark ? 0.08 : 0.06),
          boxShadow: `0 0 0 3px ${alpha(theme.palette.error.main, 0.20)}`,
        },

        // Placeholder ve ikonlar
        '& input::placeholder': {
          color: isDark ? alpha('#ffffff', 0.82) : alpha('#000000', 0.68),
          opacity: 1,
          fontWeight: 500,
        },
        '& .MuiInputAdornment-root .MuiIconButton-root': {
          color: theme.palette.text.primary,
        },

        // İç padding
        '& .MuiOutlinedInput-input': { paddingTop: 1.1, paddingBottom: 1.1 },

        // Disabled
        '&.Mui-disabled': {
          backgroundColor: isDark ? alpha('#ffffff', 0.05) : alpha('#000000', 0.04),
          color: theme.palette.text.disabled,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.text.primary, 0.28),
          },
        },

        // Chrome autofill
        '& input:-webkit-autofill, & textarea:-webkit-autofill, & select:-webkit-autofill': {
          WebkitTextFillColor: theme.palette.text.primary,
          caretColor: theme.palette.text.primary,

          // Normal durumda diğer alanlarla aynı zemin
          boxShadow: `0 0 0 1000px ${baseBg} inset`,
          WebkitBoxShadow: `0 0 0 1000px ${baseBg} inset`,
        },
        '& input:-webkit-autofill:hover, & textarea:-webkit-autofill:hover, & select:-webkit-autofill:hover': {
          // Hover’da hafif aç
          boxShadow: `0 0 0 1000px ${hoverBg} inset`,
          WebkitBoxShadow: `0 0 0 1000px ${hoverBg} inset`,
        },
        '& input:-webkit-autofill:focus, & textarea:-webkit-autofill:focus, & select:-webkit-autofill:focus': {
          // Sadece focus’ta daha parlak
          boxShadow: `0 0 0 1000px ${focusBg} inset`,
          WebkitBoxShadow: `0 0 0 1000px ${focusBg} inset`,
        },
        
      };
    },
  },
};
