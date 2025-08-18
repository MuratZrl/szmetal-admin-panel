// app/(auth)/reset-password/page.tsx

'use client';
// Bu dosya sadece SSR olmayan bir bileşeni yükler
import { Suspense } from 'react'
import ResetPasswordClient from './ResetPasswordClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <ResetPasswordClient />
    </Suspense>
  )
}