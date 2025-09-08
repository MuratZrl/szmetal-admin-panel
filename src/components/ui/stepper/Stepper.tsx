'use client';

import * as React from 'react';
import {
  Box,
  Card,
  Stepper,
  Step,
  StepLabel,
  Typography,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import type { StepIconProps } from '@mui/material/StepIcon';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

type StepItem = { label: string; caption?: string };
type Props = { activeStep: number; steps?: ReadonlyArray<StepItem> };

const DEFAULT_STEPS: StepItem[] = [
  { label: 'Sistem Seçimi', caption: 'Adım 1' },
  { label: 'Sistem Bilgileri', caption: 'Adım 2' },
  { label: 'Sistem Özeti', caption: 'Adım 3' },
];

const IconRoot = styled('div')<{
  ownerState: { active: boolean; completed: boolean };
}>(({ theme, ownerState }) => ({
  zIndex: 1,
  width: 28,
  height: 28,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  color: theme.palette.common.white,
  position: 'relative',
  background: ownerState.completed
    ? theme.palette.success.main
    : ownerState.active
    ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
    : alpha(theme.palette.text.primary, 0.35),
  boxShadow: ownerState.active
    ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.18)}`
    : 'none',
  transition: 'box-shadow .25s ease, transform .25s ease, background .25s ease',
  '&:after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: `2px solid ${alpha(
      theme.palette.common.white,
      ownerState.completed ? 0.5 : 0.35
    )}`,
  },
}));

function CustomStepIcon(props: StepIconProps) {
  const { active = false, completed = false, className, icon } = props;
  return (
    <IconRoot ownerState={{ active, completed }} className={className}>
      {completed ? (
        <CheckRoundedIcon fontSize="small" />
      ) : (
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {String(icon)}
        </Typography>
      )}
    </IconRoot>
  );
}

export default function StepperComponent({
  activeStep,
  steps = DEFAULT_STEPS,
}: Props) {
  return (

    <Box sx={{ width: '100%', mx: 'auto', px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 } }}>

      <Card
        variant="outlined"
        sx={{
          px: { xs: 1.25, sm: 2 },
          py: { xs: 1.25, sm: 2 },
          borderRadius: 3,
          boxShadow: 0,
          backdropFilter: 'saturate(120%) blur(4px)',
        }}
      >

        {/* Connector prop'unu kaldır. Stil temadan gelecek. */}
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((s) => (
            <Step key={s.label}>
              <StepLabel
                StepIconComponent={CustomStepIcon}
                // NOT: label sx blocğunu sildik; renk/boyut temadan geliyor.
              >
                <Box textAlign="center">
                  <Typography component="span" variant="subtitle2">
                    {s.label}
                  </Typography>
                  {s.caption && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {s.caption}
                    </Typography>
                  )}
                </Box>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

      </Card>
    </Box>
  );
}
