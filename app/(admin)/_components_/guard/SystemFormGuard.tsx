'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type Props = {
  children: React.ReactNode;
};

export default function FormGuard({ children }: Props) {
  const router = useRouter();
  const { slug } = useParams();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('systemData');
    if (!raw) {
      router.replace(`/systems/${slug}/step2`);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      // 🧠 Gerekli alanları kontrol et
      const hasRequiredFields =
        parsed &&
        typeof parsed === 'object' &&
        'description' in parsed &&
        'sistem_adet' in parsed &&
        'sistem_yukseklik' in parsed &&
        'sistem_genislik' in parsed;

      if (!hasRequiredFields) {
        router.replace(`/systems/${slug}/step2`);
        return;
      }

      // ✅ Tüm kontroller geçtiyse
      setIsValid(true);
    } catch (err) {
      console.error('JSON parse hatası:', err);
      router.replace(`/systems/${slug}/step2`);
    }
  }, [router, slug]);

  if (!isValid) return null;

  return <>{children}</>;
}
