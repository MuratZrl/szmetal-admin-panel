"use client";
import { useState, useEffect, useCallback } from "react";

import { supabase } from "@/lib/supabase/supabaseClient";

import { AVATAR_ALLOWED_TYPES, AVATAR_MAX_SIZE } from "@/constants/account/upload";

import { useSnackbar } from "@/hooks/useSnackbar";

export type UserData = {
  image: string | null;
  username: string;
  email: string;
  role: string;
  phone?: string | null;
  company?: string | null;
  country?: string | null;
};

export function useAccount() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [uploading, setUploading] = useState(false);
  const { show } = useSnackbar();

  const fetchUser = useCallback(async () => {
    const { data: { user }, error: uErr } = await supabase.auth.getUser();
    if (!user) {
      console.error("No session:", uErr);
      return;
    }
    const { data, error } = await supabase
      .from("users")
      .select("image, username, email, role, phone, company, country")
      .eq("id", user.id)
      .single();
    if (error) {
      show("Kullanıcı bilgileri alınamadı", "error");
    } else {
      setUserData(data as UserData);
    }
  }, [show]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const uploadAvatar = useCallback(async (file: File | undefined) => {
    if (!file) return;

    if (!AVATAR_ALLOWED_TYPES.includes(file.type as typeof AVATAR_ALLOWED_TYPES[number])) {
      show("Sadece JPG, PNG veya WEBP yüklenebilir", "error");
      return;
    }

    if (file.size > AVATAR_MAX_SIZE) {
      show("Dosya boyutu 5MB'ı geçemez", "error");
      return;
    }

    setUploading(true);
    try {
    
      const ext = file.name.split(".").pop();
      const filePath = `avatars/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);

      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = publicData?.publicUrl;
      
      if (!publicUrl) throw new Error("Public url alınamadı");
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("users").update({ image: publicUrl }).eq("id", user?.id);
      setUserData(prev => prev ? { ...prev, image: publicUrl } : null);
      show("Resim başarıyla yüklendi!", "success");
    } 
    
    catch (err: unknown) {
      console.error(err);
      show("Resim yüklenemedi.", "error");
    } 
    
    finally {
      setUploading(false);
    }
  }, [show]);

  const removeAvatar = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { show("Oturum bulunamadı", "error"); return; }

      const { data: userDataRow } = await supabase.from("users").select("image").eq("id", user.id).single();
      const imageUrl: string | null = userDataRow?.image;
      if (!imageUrl) { show("Kullanıcının resmi yok", "info"); return; }

      const path = imageUrl.split("/storage/v1/object/public/")[1];
      if (path) {
        const { error } = await supabase.storage.from("avatars").remove([path]);
        if (error) throw error;
      }
      await supabase.from("users").update({ image: null }).eq("id", user.id);
      setUserData(prev => prev ? { ...prev, image: null } : null);
      show("Profil resmi kaldırıldı.", "success");
    } catch (err) {
      console.error(err);
      show("Resim silinemedi.", "error");
    }
  }, [show]);

  // email / password updates could be separate functions for clarity
  const changeEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: window.location.origin + '/account' });
    if (error) show("E-posta değiştirilemedi: " + (error.message ?? ""), "error");
    else show("Doğrulama e-postası gönderildi.", "info");
  }, [show]);

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
