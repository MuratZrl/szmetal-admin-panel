// app/(admin)/products/compare/loading.tsx
import { Box, Skeleton, Stack } from '@mui/material';

export default function CompareLoading() {
  return (
    <Box px={1} py={1}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
        <Skeleton variant="rounded" width={120} height={32} />
        <Skeleton variant="text" width={250} height={32} />
      </Stack>

      <Skeleton variant="rounded" width="100%" height={500} sx={{ borderRadius: 2 }} />
    </Box>
  );
}
