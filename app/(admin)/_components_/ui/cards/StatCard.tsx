'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

type StatCardProps = {
  title: string;
  value: string | number;
  trend?: 'up' | 'down';
  percentage?: number;
};

const StatCard = ({ title, value, trend, percentage }: StatCardProps) => {
  return (
    <Card 
      sx={{ 
        borderRadius: 4, 
        minHeight: { xs: 120, sm: 125, md: 95 }
      }} 
    >
      <CardContent
        sx={{
          px: { xs: 1.5, sm: 2.5 },
          py: { xs: 1.5, sm: 2 },
        }}
      >
        {/* Başlık + ikon aynı hizada */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
          flexWrap="wrap"
          gap={0.5}
        >
          <Typography
            variant="subtitle2"
            color="text.secondary"
            fontSize={{ xs: '0.85rem', sm: '0.95rem' }}
          >
            {title}
          </Typography>

          {/* İkon ve yüzde değişimi */}
          {percentage !== undefined && (
            <Box
              display="flex"
              alignItems="center"
              gap={{ xs: 0.5, sm: 1 }}
            >
              {trend === 'up' && <ArrowDropUpIcon fontSize="small" color="success" />}
              {trend === 'down' && <ArrowDropDownIcon fontSize="small" color="error" />}
              <Typography
                variant="body2"
                color={trend === 'up' ? 'success.main' : 'error.main'}
                fontSize={{ xs: '0.85rem', sm: '0.95rem' }}
              >
                %{percentage}
              </Typography>
            </Box>
          )}
        </Box>

        <Typography
          variant="h5"
          fontWeight="bold"
          fontSize={{ xs: '1.5rem', sm: '1.75rem' }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

};


export default StatCard;
