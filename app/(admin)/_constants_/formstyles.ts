import { TextFieldProps } from '@mui/material';

export const commonTextFieldProps: Partial<TextFieldProps> = {
  variant: 'outlined',
  InputProps: {
    sx: {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'orangered',
        borderRadius: 5,
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'darkorange',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'red',
        borderWidth: 2,
      },
    },
  },
  InputLabelProps: {
    sx: {
      color: 'gray',
      '&.Mui-focused': {
        color: 'orangered',
        fontWeight: 600,
        fontStyle: 'italic',
      },
    },
  },
};
