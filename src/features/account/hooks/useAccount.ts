// src/features/account/useAccount.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { AVATAR_ALLOWED_TYPES, AVATAR_MAX_SIZE } from "@/constants/account/upload";
import { useSnackbar } from "@/components/ui/snackbar/useSnackbar.client";

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
  autoFetchIfMissing?: boolean;
};

// AVATAR_ALLOWED_TYPES büyük ihtimalle `as const`. Buna uygun type guard:
type AllowedMime = (typeof AVATAR_ALLOWED_TYPES)[number];
const isAllowedMime = (m: string): m is AllowedMime =>
  (AVATAR_ALLOWED_TYPES as readonly string[]).includes(m);

function pathFromPublicUrl(publicUrl: string) {
  const marker = "/storage/v1/object/public/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.substring(idx + marker.length); // bucket/path...
}

export function useAccount(opts: Options = {}) {
  const { initialUserData = null, autoFetchIfMissing = true } = opts;

  const [userData, setUserData] = useState<UserData | null>(initialUserData);
  const [uploading, setUploading] = useState(false);
  const { show } = useSnackbar();

  const showRef = useRef(show);
  useEffect(() => { showRef.current = show; }, [show]);

  const fetchUser = useCallback(async () => {
    const { data: { user }, error: uErr } = await supabase.auth.getUser();
    if (!user) {
      console.error("No session:", uErr);
      setUserData(null);
      return;
    }
    const { data, error } = await supabase
      .from("users")
      .select("image, username, email, role, phone, company, country")
      .eq("id", user.id)
      .single();

    if (error) {
      showRef.current("Kullanıcı bilgileri alınamadı", "error");
    } else {
      setUserData(data as UserData);
    }
  }, []);

  // initialUserData yoksa ve izin verdiysen fetch et
  useEffect(() => {
    if (!userData && autoFetchIfMissing) {
      void fetchUser(); // eslint sakin
    }
  }, [userData, autoFetchIfMissing, fetchUser]);

  const uploadAvatar = useCallback(async (file: File | undefined) => {
    if (!file) return;

    // MIME doğrulama (type guard)
    if (!isAllowedMime(file.type)) {
      showRef.current("Sadece JPG, PNG veya WEBP yüklenebilir", "error");
      return;
    }

    if (file.size > AVATAR_MAX_SIZE) {
      showRef.current("Dosya boyutu 5MB'ı geçemez", "error");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showRef.current("Oturum bulunamadı", "error");
        return;
      }

      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const filePath = `avatars/${user.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase
        .storage
        .from("avatars")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = publicData?.publicUrl;
      if (!publicUrl) throw new Error("Public url alınamadı");

      const { error: updateErr } = await supabase
        .from("users")
        .update({ image: publicUrl })
        .eq("id", user.id);

      if (updateErr) throw updateErr;

      setUserData(prev => prev ? { ...prev, image: publicUrl } : prev);
      showRef.current("Resim başarıyla yüklendi!", "success");
    } catch (err) {
      console.error(err);
      showRef.current("Resim yüklenemedi.", "error");
    } finally {
      setUploading(false);
    }
  }, []);

  const removeAvatar = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showRef.current("Oturum bulunamadı", "error");
        return;
      }

      const { data: row, error } = await supabase
        .from("users")
        .select("image")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const imageUrl: string | null = row?.image ?? null;
      if (!imageUrl) {
        showRef.current("Kullanıcının resmi yok", "info");
        return;
      }

      const path = pathFromPublicUrl(imageUrl);
      if (path) {
        const { error: delErr } = await supabase.storage.from("avatars").remove([path]);
        if (delErr) throw delErr;
      }

      const { error: updErr } = await supabase
        .from("users")
        .update({ image: null })
        .eq("id", user.id);

      if (updErr) throw updErr;

      setUserData(prev => prev ? { ...prev, image: null } : prev);
      showRef.current("Profil resmi kaldırıldı.", "success");
    } catch (err) {
      console.error(err);
      showRef.current("Resim silinemedi.", "error");
    }
  }, []);

  const changeEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: `${window.location.origin}/account` }
    );
    if (error) {
      showRef.current("E-posta değiştirilemedi: " + (error.message ?? ""), "error");
    } else {
      showRef.current("Doğrulama e-postası gönderildi.", "info");
    }
  }, []);

  return {
    userData,
    uploading,
    fetchUser,
    uploadAvatar,
    removeAvatar,
    changeEmail,
    setUserData,
  };
}
