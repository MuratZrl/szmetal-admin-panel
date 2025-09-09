export const dynamic = 'force-dynamic'; // ← server component’ta işe yarar

import { Suspense } from 'react';
import ResetPasswordClient from './ResetPasswordClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
