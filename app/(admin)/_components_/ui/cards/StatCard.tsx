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
    <Card sx={{ borderRadius: 4 }}>
      <CardContent>
        {/* Başlık + ikon aynı hizada */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>

          {/* İkon ve yüzde değişimi */}
          {percentage !== undefined && (
            <Box display="flex" alignItems="center" gap={0.5}>
              {trend === 'up' && <ArrowDropUpIcon fontSize="small" color="success" />}
              {trend === 'down' && <ArrowDropDownIcon fontSize="small" color="error" />}
              <Typography
                variant="body2"
                color={trend === 'up' ? 'success.main' : 'error.main'}
              >
                %{percentage}
              </Typography>
            </Box>
          )}
        </Box>

        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};


export default StatCard;
