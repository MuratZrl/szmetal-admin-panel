// src/features/products/model.ts
import type { Database } from '@/types/supabase';

export type Row = Database['public']['Tables']['products']['Row'];

export type Product = {
  id: number;
  code: string;
  name: string;
  variant: Row['variant'];
  category: Row['category'];
  subCategory: string;
  date: string;                  // null ise '' veriyoruz
  image: string | null;          // ← ÖNEMLİ: null olabilir

  // teknik alanlar (hepsi nullable olabilir)
  drawer: string | null;
  control: string | null;
  unit_weight_g_pm: number | 0;
  scale: string | null;
  outerSizeMm: number | null;
  sectionMm2: number | null;
  tempCode: string | null;
  profileCode: string | null;
  manufacturerCode: string | null;

  // DWG/PDF vb. storage metadata (kartta işe yarıyor)
  fileBucket: string | null;
  filePath: string | null;
  fileName: string | null;
  fileExt: string | null;        // ← kartta bunu kullanacaksın
  fileMime: string | null;
  fileSize: number | null;

  filePublicUrl?: string | null; // server tarafında getPublicUrl ile doldur
};

// DB Row -> UI Product
export function mapRowToProduct(r: Row): Product {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    variant: r.variant,
    category: r.category,
    subCategory: r.sub_category,
    date: r.date ?? '',
    image: r.image ?? null,
    
    drawer: r.drawer ?? null,
    control: r.control ?? null,
    unit_weight_g_pm: r.unit_weight_g_pm,
    scale: r.scale ?? null,
    outerSizeMm: r.outer_size_mm ?? null,
    sectionMm2: r.section_mm2 ?? null,
    tempCode: r.temp_code ?? null,
    profileCode: r.profile_code ?? null,
    manufacturerCode: r.manufacturer_code ?? null,

    fileBucket: r.file_bucket ?? null,
    filePath: r.file_path ?? null,
    fileName: r.file_name ?? null,
    fileExt: r.file_ext ?? null,
    fileMime: r.file_mime ?? null,
    fileSize: r.file_size ?? null,
  };
}

// UI Product -> DB Row patch
export function mapProductPatchToRow(patch: Partial<Product>): Partial<Row> {
  return {
    code: patch.code,
    name: patch.name,
    variant: patch.variant,
    category: patch.category,
    sub_category: patch.subCategory,
    date: patch.date,
    image: patch.image,

    drawer: patch.drawer,
    control: patch.control,
    unit_weight_g_pm: patch.unit_weight_g_pm,
    scale: patch.scale,
    outer_size_mm: patch.outerSizeMm,
    section_mm2: patch.sectionMm2,
    temp_code: patch.tempCode,
    profile_code: patch.profileCode,
    manufacturer_code: patch.manufacturerCode,

    file_bucket: patch.fileBucket,
    file_path: patch.filePath,
    file_name: patch.fileName,
    file_ext: patch.fileExt,
    file_mime: patch.fileMime,
    file_size: patch.fileSize,
  };
}
