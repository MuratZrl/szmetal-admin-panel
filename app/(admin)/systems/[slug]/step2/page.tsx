// app/(admin)/systems/step2/page.tsx
'use client';

import { useRouter, useParams } from 'next/navigation';

import { useState, useMemo } from 'react';

import {
  Box,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

import { commonTextFieldProps } from '../../../_constants_/formstyles';

import { systemForms } from '../../../_constants_/systems/step2/systemForms';

import StepperComponent from '../../../_components_/ui/stepper/Stepper';

export default function Step2Page() {

  const router = useRouter();
  const params = useParams(); // slug erişimi için
  const slug = params.slug as string;

  const formConfig = systemForms[slug];

  const [form, setForm] = useState(
    Object.fromEntries(formConfig?.fields.map((field) => [field.name, '']))
  );

  const adet = parseInt(form.sistem_adet || '0', 10);
  const yukseklik = parseInt(form.sistem_yukseklik || '0', 10);
  const genislik = parseInt(form.sistem_genislik || '0', 10);

  const isValidForm = useMemo(() => {
    return (
      adet > 0 &&
      yukseklik >= 1500 && yukseklik <= 4000 &&
      genislik >= 1500 && genislik <= 4000
    );
  }, [adet, yukseklik, genislik]);

  const handleNext = () => {
    // Burada form doğrulama yapabilirsin
    // Geçici olarak localStorage ile veri saklayalım (örnek amaçlı)
    localStorage.setItem('systemData', JSON.stringify(form));
    router.push(`/systems/${slug}/step3`);
  };

  const handleBack = () => {
    router.push('/systems');
  };

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>

        {/* Stepper */}
        <Box mb={{ xs: 2, sm: 3 }}>
          <StepperComponent activeStep={1} />
        </Box>

        {/* Form Card */}
        <Card
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 },
            maxWidth: 700,
            mx: 'auto',
            boxShadow: 2,
            borderRadius: 7,
          }}
        >
          <Typography variant="h6" px={1} gutterBottom>
            Lütfen Sistem Bilgilerini Giriniz
          </Typography>

          <Grid container spacing={2}>
            {formConfig?.fields.map((field) => {
              const value = form[field.name] || '';
              const error =
                field.required &&
                ((field.min !== undefined && Number(value) < field.min) ||
                  (field.max !== undefined && Number(value) > field.max));

              return (
                <Grid key={field.name} size={{ xs: 12 }} >
                  <TextField
                    fullWidth
                    label={field.label}
                    type={field.type || 'text'}
                    value={value}
                    placeholder={field.placeholder}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                    error={error}
                    helperText={error ? field.helperText : ''}
                    {...commonTextFieldProps}
                  />
                </Grid>
              );
            })}
          </Grid>

          {/* Butonlar */}
          <Box
            mt={4}
            px={1}
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            gap={2}
          >
            <Button
              variant="outlined"
              onClick={handleBack}
              sx={{
                px: 4,
                py: 1,
                color: 'darkred',
                borderColor: 'darkred',
                borderRadius: 7,
                textTransform: 'capitalize',
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              Geri
            </Button>

            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isValidForm}
              sx={{
                px: 4,
                py: 1,
                borderRadius: 7,
                backgroundColor: 'darkred',
                textTransform: 'capitalize',
                '&.Mui-disabled': {
                  backgroundColor: '#ffd2b3',
                  color: '#fff',
                },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              İleri
            </Button>
          </Box>
        </Card>

        {/* Uyarı Bilgileri */}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          py={4}
          px={{ xs: 2, sm: 3 }}
        >
          <Box sx={{ maxWidth: 700 }}>
            <Typography
              variant="h6"
              gutterBottom
              textAlign={{ xs: 'center', sm: 'left' }}
            >
              Dikkat Edilmesi Gerekenler
            </Typography>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <ArrowRightIcon />
                </ListItemIcon>
                <ListItemText primary="Sistem adedi pozitif bir sayı olmalıdır." />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <ArrowRightIcon />
                </ListItemIcon>
                <ListItemText primary="Yükseklik değeri 1500 mm ile 4000 mm arasında olmalıdır." />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <ArrowRightIcon />
                </ListItemIcon>
                <ListItemText primary="Genişlik değeri 1500 mm ile 4000 mm arasında olmalıdır." />
              </ListItem>
            </List>
          </Box>
        </Box>

    </Box>
  );

}
