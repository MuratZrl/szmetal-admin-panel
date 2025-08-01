// app/unauthorized/page.tsx
'use client'

import { Box, Typography, Button } from '@mui/material'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <Box className="text-center mt-20">
      <Typography variant="h4" color="error" fontWeight={600}>
        Erişim Reddedildi
      </Typography>
      <Typography mt={2}>
        Bu sayfaya yalnızca yetkili kullanıcılar erişebilir.
      </Typography>

      <Button 
        variant="contained" 
        color="error"
        onClick={() => router.push('/')}
        sx={{ mt: 4, px: 4, py: 1.5, borderRadius: 5 }}
      >
        Ana Sayfaya Git
      </Button>
    </Box>
  )
}
