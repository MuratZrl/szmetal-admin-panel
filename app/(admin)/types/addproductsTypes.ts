// app/(admin)/types/addproductsTypes.ts
export type FormValues = {
  profil_kodu: string;
  profil_adi: string;
  profil_resmi: string;
  birim_agirlik: number;
};

export type AddProductDialogProps = {
  open: boolean;
  onClose: () => void;
  slug: string;
  table: string,
  onSuccess: () => void;
};
