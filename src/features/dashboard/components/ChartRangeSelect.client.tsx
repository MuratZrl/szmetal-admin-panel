'use client';

import { Select, MenuItem } from '@mui/material';
import type { DateRangeKey } from '../types/dashboardData';

const RANGE_OPTIONS: { key: DateRangeKey; label: string }[] = [
  { key: 'today', label: 'Bugün' },
  { key: 'thisWeek', label: 'Bu Hafta' },
  { key: 'thisMonth', label: 'Bu Ay' },
  { key: 'thisYear', label: 'Bu Yıl' },
  { key: 'lastYear', label: 'Geçen Yıl' },
  { key: 'allTime', label: 'Tüm Zamanlar' },
];

type Props = {
  value: DateRangeKey;
  onChange: (key: DateRangeKey) => void;
  disabled?: boolean;
};

export default function ChartRangeSelect({ value, onChange, disabled }: Props) {
  return (
    <Select
      size="small"
      variant="standard"
      value={value}
      onChange={(e) => onChange(e.target.value as DateRangeKey)}
      disabled={disabled}
      disableUnderline
      sx={{
        fontSize: 12,
        fontStyle: 'italic',
        color: 'text.secondary',
        opacity: 0.75,
        '& .MuiSelect-select': { py: 0, pr: 2.5 },
        '& .MuiSelect-icon': { fontSize: 16, color: 'text.secondary' },
      }}
    >
      {RANGE_OPTIONS.map((opt) => (
        <MenuItem key={opt.key} value={opt.key} sx={{ fontSize: 13 }}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  );
}
