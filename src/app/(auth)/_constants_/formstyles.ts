import { TextFieldProps } from '@mui/material';

export const commonTextFieldProps: Partial<TextFieldProps> = {
  variant: 'outlined',
  InputProps: {
    sx: {
      color: 'white',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'white',
        borderRadius: 5,
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'lightblue',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'lightcyan',
        borderWidth: 2,
      },
    },
  },
  InputLabelProps: {
    sx: {
      color: 'white',
      opacity: 0.65,
      '&.Mui-focused': {
        color: 'lightblue',
        borderColor: 'lightblue',
        fontWeight: 600,
        fontStyle: 'italic',
        opacity: 1,
      },
    },
  },
};
