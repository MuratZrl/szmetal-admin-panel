// app/(auth)/reset-password/page.tsx

'use client';
// Bu dosya sadece SSR olmayan bir bileşeni yükler
import ResetPasswordClient from './ResetPasswordClient';

export default function Page() {
  return <ResetPasswordClient />;
}
