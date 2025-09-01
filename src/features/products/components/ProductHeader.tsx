import { Typography, Divider, Box } from '@mui/material';

export default function ProductHeader({ code, name }: { code: string; name: string }) {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        {code} — {name}
      </Typography>
      <Divider sx={{ mb: 2 }} />
    </Box>
  );
}
