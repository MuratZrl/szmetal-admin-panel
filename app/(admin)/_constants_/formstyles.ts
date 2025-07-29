import { TextFieldProps } from '@mui/material';

export const commonTextFieldProps: Partial<TextFieldProps> = {
  variant: 'outlined',
  InputProps: {
    sx: {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#470000',
        borderRadius: 5,
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#A30000',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'darkred',
        borderWidth: 2,
      },
    },
  },
  InputLabelProps: {
    sx: {
      color: 'black',
      opacity: 0.65,
      '&.Mui-focused': {
        color: 'darkred',
        borderColor: 'darkred',
        fontWeight: 600,
        fontStyle: 'italic',
        opacity: 1,
      },
    },
  },
};
