// src/features/account/hooks/useAccount.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';
import { supabase } from '@/lib/supabase/supabaseClient';
import { AVATAR_ALLOWED_TYPES, AVATAR_MAX_SIZE } from '@/constants/account/upload';
import {
  updateProfileAction,
  createAvatarSignedUrlAction,
  finalizeAvatarAction,
  removeAvatarAction,
  changeEmailAction,
} from '@/features/account/actions';

export type UserData = {
  image: string | null;
  username: string;
  email: string;
  role: string;
  phone?: string | null;
  company?: string | null;
  country?: string | null;
};

type Options = {
  initialUserData?: UserData | null;
  /** Client tarafında hızlı dosya doğrulaması (mime/size). Server yine kontrol eder. */
  clientValidateUpload?: boolean;
};

type HookOk = { ok: true };
type HookFail = { ok: false };
type HookResult = HookOk | HookFail;

type AllowedMime = (typeof AVATAR_ALLOWED_TYPES)[number];

const isAllowedMime = (m: string): m is AllowedMime =>
  (AVATAR_ALLOWED_TYPES as readonly string[]).includes(m);

function extFromMime(mime: string): 'jpg' | 'png' | 'webp' {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  // Varsayılanı jpg yapıyoruz; server yine kontrol eder.
  return 'jpg';
}

/**
 * UI odaklı hesap hook'u.
 * Tüm auth/DB/Storage işlemleri server action veya signed url ile yapılır.
 */
export function useAccount(opts: Options = {}) {
  const { initialUserData = null, clientValidateUpload = true } = opts;

  const [userData, setUserData] = useState<UserData | null>(initialUserData);
  const [uploading, setUploading] = useState(false);

  const { show } = useSnackbar();
  const showRef = useRef(show);
  useEffect(() => {
    showRef.current = show;
  }, [show]);

  const updateProfile = useCallback(
    async (payload: Pick<UserData, 'username' | 'phone' | 'company' | 'country'>): Promise<HookResult> => {
      const res = await updateProfileAction({
        username: payload.username,
        phone: payload.phone ?? null,
        company: payload.company ?? null,
        country: payload.country ?? null,
      });

      if (!res.ok) {
        showRef.current(res.message ?? 'Güncelleme başarısız', 'error');
        return { ok: false };
      }

      setUserData((prev) =>
        prev
          ? {
              ...prev,
              username: payload.username,
              phone: payload.phone ?? null,
              company: payload.company ?? null,
              country: payload.country ?? null,
            }
          : prev
      );

      showRef.current(res.message ?? 'Bilgiler güncellendi', 'success');
      return { ok: true };
    },
    []
  );

  const uploadAvatar = useCallback(
    async (file?: File): Promise<HookResult> => {
      if (!file) return { ok: false };

      if (clientValidateUpload) {
        if (!isAllowedMime(file.type)) {
          showRef.current('Sadece JPG, PNG veya WEBP yüklenebilir', 'error');
          return { ok: false };
        }
        if (file.size > AVATAR_MAX_SIZE) {
          showRef.current("Dosya boyutu 5MB'ı geçemez", 'error');
          return { ok: false };
        }
      }

      // 1) Sunucudan imzalı upload bilgisi al
      const ext = extFromMime(file.type);
      const signed = await createAvatarSignedUrlAction({ extension: ext });
      if (!signed.ok || !signed.data) {
        showRef.current(signed.message ?? 'Yükleme başlatılamadı', 'error');
        return { ok: false };
      }

      setUploading(true);
      try {
        // 2) Dosyayı doğrudan Storage'a yükle (Next body limit'e takılmaz)
        const result = await supabase.storage
          .from('avatars')
          .uploadToSignedUrl(signed.data.path, signed.data.token, file);

        if (result.error) {
          showRef.current(result.error.message ?? 'Yükleme başarısız', 'error');
          return { ok: false };
        }

        // 3) DB'de image alanını güncelle ve public URL üret
        const fin = await finalizeAvatarAction(signed.data.path);
        if (!fin.ok || !fin.data?.publicUrl) {
          showRef.current(fin.message ?? 'Avatar güncellenemedi', 'error');
          return { ok: false };
        }

        setUserData((prev) => (prev ? { ...prev, image: fin.data!.publicUrl } : prev));
        showRef.current(fin.message ?? 'Avatar yüklendi', 'success');
        return { ok: true };
      } finally {
        setUploading(false);
      }
    },
    [clientValidateUpload]
  );

  const removeAvatar = useCallback(async (): Promise<HookResult> => {
    const res = await removeAvatarAction();
    if (!res.ok) {
      showRef.current(res.message ?? 'Resim silinemedi', 'error');
      return { ok: false };
    }
    setUserData((prev) => (prev ? { ...prev, image: null } : prev));
    showRef.current(res.message ?? 'Profil resmi kaldırıldı', 'success');
    return { ok: true };
  }, []);

  const changeEmail = useCallback(async (email: string): Promise<HookResult> => {
    const res = await changeEmailAction(email);
    if (!res.ok) {
      showRef.current(res.message ?? 'E-posta değiştirilemedi', 'error');
      return { ok: false };
    }
    showRef.current(res.message ?? 'Doğrulama e-postası gönderildi', 'info');
    return { ok: true };
  }, []);

  return {
    userData,
    setUserData,
    uploading,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    changeEmail,
  };
}
