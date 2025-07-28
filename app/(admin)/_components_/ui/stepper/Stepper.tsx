'use client';

import React from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Box,
  Card,
  StepIconProps,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type StepperProps = {
  activeStep: number;
};

const steps = ['Sistem Seçimi', 'Sistem Bilgileri', 'Sistem Özeti'];

// Özel ikon bileşeni
const CustomStepIcon = ({ active, completed, icon }: StepIconProps) => {
  let backgroundStyle = {};

  if (completed) {
    backgroundStyle = {
      backgroundColor: 'green',
    };
  } else if (active) {
    backgroundStyle = {
      backgroundImage: 'linear-gradient(45deg, orangered, red)', // gradient turuncu
    };
  } else {
    backgroundStyle = {
      backgroundColor: '#e0e0e0',
    };
  }

  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 600,
        fontSize: 14,
        ...backgroundStyle,
      }}
    >
      {completed ? <CheckCircleIcon fontSize="small" /> : icon}
    </Box>
  );
};

const StepperComponent: React.FC<StepperProps> = ({ activeStep }) => {
  return (
    <Box
      sx={{
        width: '100%',
        mx: 'auto',
        py: { xs: 2, sm: 3 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <Card
        sx={{
          px: { xs: 1, sm: 2 },
          py: { xs: 1.5, sm: 2 },
          borderRadius: 3,
          boxShadow: 0.25,
        }}
      >
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                StepIconComponent={CustomStepIcon}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                    fontWeight: 500,
                    color: 'gray',
                  },
                  '& .Mui-active .MuiStepLabel-label': {
                    color: 'orangered',
                  },
                  '& .Mui-completed .MuiStepLabel-label': {
                    color: 'green',
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Card>
    </Box>
  );
};

export default StepperComponent;
