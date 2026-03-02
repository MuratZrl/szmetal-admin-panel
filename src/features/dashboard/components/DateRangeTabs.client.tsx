'use client';
// src/features/dashboard/components/DateRangeTabs.client.tsx

import { Tabs, Tab, Paper } from '@mui/material';
import type { DateRangeKey } from '../types/dashboardData';

const TAB_CONFIG: { key: DateRangeKey; label: string }[] = [
  { key: 'today',     label: 'Bugün' },
  { key: 'thisWeek',  label: 'Bu Hafta' },
  { key: 'thisMonth', label: 'Bu Ay' },
  { key: 'thisYear',  label: 'Bu Yıl' },
  { key: 'lastYear',  label: 'Geçen Yıl' },
  { key: 'allTime',   label: 'Tüm Zamanlar' },
];

type Props = {
  value: DateRangeKey;
  onChange: (key: DateRangeKey) => void;
  disabled?: boolean;
};

export default function DateRangeTabs({ value, onChange, disabled }: Props) {
  const idx = TAB_CONFIG.findIndex(t => t.key === value);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
      <Tabs
        value={idx}
        onChange={(_, newIdx: number) => onChange(TAB_CONFIG[newIdx].key)}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
      >
        {TAB_CONFIG.map(t => (
          <Tab
            key={t.key}
            label={t.label}
            disabled={disabled}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        ))}
      </Tabs>
    </Paper>
  );
}
