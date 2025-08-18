// app/(admin)/types/addproductsTypes.ts

// Giyotin Sistem İçin
export type StaticFormValues = {
  id?: string; // 👈 düzenleme için gerekli
  profil_kodu: string;
  profil_adi: string;
  profil_resmi: string;
  birim_agirlik: number;
};

export type AddProductDialogProps = {
  open: boolean;
  onClose: () => void;
  slug: string;
  table: string;
  onSuccess: () => void;
  initialData?: StaticFormValues | null; // 👈 yeni eklendi
};
